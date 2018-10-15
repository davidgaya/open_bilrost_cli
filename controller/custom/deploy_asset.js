/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const crypto = require('crypto');
const Path = require('path').posix;
const chalk = require('chalk');

const workspace_utilities = require('open_bilrost/assetmanager/workspace_utilities')(path => Path.join('.bilrost', path ? path : '/'));

const deploy_log = require('./deploy_log');

// TODO replace all controllers to models
const vcs = require('../vcs');
const am = require('../am');

const am_config = require('../../config/am.json');
const am_model = require('../../model/am')(am_config);

const log = require('../../util/log');
const ifs = require('../../util/ifs');
const elapsed_time = require('../../util/elapsed_time');
const file_url = require('../../util/file_uri');

const generate_random_name = () => crypto.randomBytes(6).toString('hex');

const map_definition_to_create_origin_inputs = (def, deploy_tmp_directory, cwd) => {
    return def.origins.map(({ deploys, workspace, organization, project_name, branch }) => {
        const name = generate_random_name();
        const is_workspace = workspace !== undefined;
        const workspace_path = is_workspace ? Path.join(cwd, workspace) : Path.join(deploy_tmp_directory, name);
        const file_uri = file_url(workspace_path);
        const description = name + " deployment workspace";
        return {
            is_workspace,
            file_uri,
            workspace_path,
            organization,
            project_name,
            branch,
            description,
            deploys
        };
    });
};

const start_timer = () => {
    const instance = elapsed_time();
    return instance;
};

const get_asset_resources = (identifier, ref, workspace_path) => {
    return am_model.list_asset(identifier, ref)
    .then(response => {
        const dependencies = response.body.dependencies;
        const main = response.body.main;
        const paths_to_move = dependencies.concat(main);
        return paths_to_move
            .filter(ref => ref)
            .map(ref => workspace_utilities.ref_to_absolute_path(ref, workspace_path));
    });
};

const pass_enoent_error = err => {
    if (err.toString().includes('ENOENT')) {
        return Promise.resolve();
    } else {
        throw err;
    }
};

const remove_all_empty_directories = resource_relative_path => {
    const remove_if_not_empty = path => ifs.readdir(path)
        .then(files => {
            if (!files.length) {
                return ifs.remove(path);
            }
        })
        .catch(err => err && err.code === 1 ? Promise.resolve() : Promise.reject(err));
    const create_removal_promise = path => () => remove_if_not_empty(path);
    const removal_promises = [];
    while (resource_relative_path.split('/').length > 1) {
        removal_promises.push(create_removal_promise(resource_relative_path));
        resource_relative_path = resource_relative_path
            .split('/')
            .filter((basename, index, array) => index !== array.length - (basename === '' ? 2 : 1))
            .join('/');
    }
    removal_promises.push(create_removal_promise(resource_relative_path));
    return removal_promises.reduce((sequence, promise) => sequence.then(promise), Promise.resolve());
};

const clean = cwd => deploy_log.list_resources(cwd)
    .then(resources => Promise.all(resources.map(relative_path => {
        const absolute_path = Path.join(cwd, relative_path);
        return ifs.remove(absolute_path)
            .then(() => remove_all_empty_directories(relative_path));
    })))
    .then(() => deploy_log.del(cwd))
    .then(() => remove_all_empty_directories(deploy_log.FOLDER_NAME));

const install = (deploy_file_name, cwd, deploy_tmp_directory, is_copy) => {
    let sub_id = '';
    const get_time = start_timer();

    const copy_or_link_content = (resources, workspace_path, base, dest) => Promise.all(resources.map(resource_absolute_path => {
        const origin_absolute_path_with_base = Path.join(workspace_path, base);
        const dest_absolute_path_without_base = Path.join(cwd, dest);
        const dest_absolute_path_with_base = Path.join(dest_absolute_path_without_base, Path.relative(origin_absolute_path_with_base, resource_absolute_path));
        return ifs[is_copy ? 'copy' : 'link'](resource_absolute_path, dest_absolute_path_with_base)
            .then(() => dest_absolute_path_with_base);
    }));

    const update_log = resources => deploy_log.update(cwd, resources.map(absolute_path => ({ path: Path.relative(cwd, absolute_path) })));

    const install_from_project = origin => origin.deploys.reduce((deploy_sequence, { ref, base = './', dest = './'}) => deploy_sequence
        .then(() => vcs.subscribe(origin.file_uri, 'ASSET', ref))
        .then(sub => {
            sub_id = sub.body.id;
            console.info(chalk.green(`${get_time()}: Checked out ${ref} asset`));
        })
        .then(() => get_asset_resources(origin.file_uri, ref, origin.workspace_path))
        .then(resources => copy_or_link_content(resources, origin.workspace_path, base, dest))
        .then(update_log)
        .then(() => vcs.unsubscribe(origin.file_uri, sub_id))
        .then(() => {
            console.info(chalk.green(`${get_time()}: Installed ${ref} asset content to ${dest}`));
        }),
    Promise.resolve());

    const install_from_workspace = origin => origin.deploys.reduce((deploy_sequence, { workspace_path, ref, base = './' , dest = './' }) => deploy_sequence
        .then(() => vcs.subscribe(origin.file_uri, 'ASSET', ref))
        .then(() => get_asset_resources(origin.file_uri, ref, origin.workspace_path))
        .then(resources => copy_or_link_content(resources, origin.workspace_path, base, dest))
        .then(update_log)
        .then(() => {
            console.info(chalk.green(`${get_time()}: Installed ${ref} asset content to ${dest}`));
        }),
    Promise.resolve());

    const init_assets = origin => origin.is_workspace ? am_model.populate_workspace(origin)
        .catch(res => {
            if (res.statusCode !== 403) {
                throw res;
            }
        }) : am.create_workspace(origin);

    const init_deploy = () => deploy_log.access(cwd)
        .then(() => clean(cwd), pass_enoent_error)
        .then(() => deploy_log.create(cwd, deploy_log.format()));

    return ifs.mkdirs(deploy_tmp_directory)
        .catch(pass_enoent_error)
        .then(() => init_deploy())
        .then(() => ifs.readJson(Path.join(cwd, deploy_file_name)))
        .then(def => map_definition_to_create_origin_inputs(def, deploy_tmp_directory, cwd)
            .reduce((origin_sequence, origin) => origin_sequence
                .then(() => init_assets(origin))
                .then(() => origin.is_workspace ? install_from_workspace(origin) : install_from_project(origin))
                .then(() => origin.is_workspace ? Promise.resolve() : am.delete_workspace(origin.file_uri)),
            Promise.resolve()))
        .then(() => {
            console.info(chalk.green(`Deployment done within ${get_time()}`));
        })
        .catch(log.spawn_error);
};

module.exports = {
    install,
    clean
};
