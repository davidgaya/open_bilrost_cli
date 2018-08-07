/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const crypto = require('crypto');
const Path = require('path').posix;
const chalk = require('chalk');

const workspace_utilities = require('open_bilrost/assetmanager/workspace_utilities')(path => Path.join('.bilrost', path ? path : '/'));

// TODO replace all controllers to models
const vcs = require('../vcs');
const am = require('../am');

const am_config = require('../config/am.json');
const am_model = require('../model/am')(am_config);

const log = require('../../util/log');
const ifs = require('../../util/ifs');
const elapsed_time = require('../../util/elapsed_time');
const file_uri = require('../../util/file_uri');

const generate_random_name = () => crypto.randomBytes(6).toString('hex');

const map_definition_to_create_origin_inputs = (def, deploy_tmp_directory, cwd) => {
    return def.origins.map(origin => {
        const name = generate_random_name();
        const path = origin.workspace ? Path.join(cwd, origin.workspace) : Path.join(deploy_tmp_directory, name);
        const url = file_uri(path);
        const description = name + " deployment workspace";
        return {
            file_uri: url,
            workspace_path: path,
            name,
            organization: origin.organization,
            project_name: origin.project_name,
            branch: origin.branch,
            description,
            deploys: origin.deploys,
            workspace: origin.workspace
        };
    });
};

const ignored_files_when_moving = ['.git', '.svn', '.gitignore', '.bilrost'];

const ifs_service = {
    copy (resources, cwd, origin_base_path, origin_name, dest_base_relative_path, dest_relative_path) {
        const origin_path = Path.join(origin_base_path, origin_name).replace(/\\/g, '/');
        const dest_path = Path.join(cwd, dest_relative_path ? dest_relative_path :  "").replace(/\\/g, '/');
        return ifs.copyContent(resources, origin_path, dest_path, dest_base_relative_path, ignored_files_when_moving);
    },

    link (resources, cwd, origin_base_path, origin_name, dest_base_relative_path, dest_relative_path) {
        const origin_path = Path.join(origin_base_path, origin_name).replace(/\\/g, '/');
        const dest_path = Path.join(cwd, dest_relative_path ? dest_relative_path :  "").replace(/\\/g, '/');
        return ifs.createLink(resources, origin_path, dest_path, dest_base_relative_path, ignored_files_when_moving);
    }
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

const clean_installed_assets = (deploy_file_name, cwd, deploy_tmp_directory) => {
    return ifs.readJson(Path.join(cwd, deploy_file_name))
        .then(def => map_definition_to_create_origin_inputs(def, deploy_tmp_directory, cwd)
            .reduce((origin_sequence, origin) => origin_sequence
                .then(() => clean(origin, cwd)),
            Promise.resolve()))
        .then(() => {
            console.info(chalk.green('Cleaning done'));
        });
};

const install_assets = (deploy_file_name, cwd, deploy_tmp_directory, is_copy) => {
    let sub_id = '';
    const get_time = start_timer();

    const install_from_project = origin => origin.deploys.reduce((deploy_sequence, deploy) => deploy_sequence
        .then(() => vcs.subscribe(origin.file_uri, 'ASSET', deploy.ref))
        .then(sub => {
            sub_id = sub.body.id;
            console.info(chalk.green(`${get_time()}: Checked out ${deploy.ref} asset`));
        })
        .then(() => get_asset_resources(origin.file_uri, deploy.ref, origin.workspace_path))
        .then(resources => ifs_service[is_copy ? 'copy' : 'link'](resources, cwd, deploy_tmp_directory, origin.name, deploy.base, deploy.dest))
        .then(() => vcs.unsubscribe(origin.file_uri, sub_id))
        .then(() => {
            console.info(chalk.green(`${get_time()}: Installed ${deploy.ref} asset content to ${deploy.dest ? deploy.dest : './'}`));
        }),
    Promise.resolve());

    const install_from_workspace = origin => origin.deploys.reduce((deploy_sequence, deploy) => deploy_sequence
        .then(() => vcs.subscribe(origin.file_uri, 'ASSET', deploy.ref))
        .then(() => get_asset_resources(origin.file_uri, deploy.ref, origin.workspace_path))
        .then(resources => ifs_service[is_copy ? 'copy' : 'link'](resources, cwd, Path.join(cwd, origin.workspace), '', deploy.base, deploy.dest))
        .then(() => {
            console.info(chalk.green(`${get_time()}: Installed ${deploy.ref} asset content to ${deploy.dest ? deploy.dest : './'}`));
        }),
    Promise.resolve());

    const init = origin => origin.workspace ? am_model.populate_workspace(origin)
        .catch(res => {
            if (res.statusCode !== 403) {
                throw res.body;
            }
        })
        .then(() => am_model.add_workspace_to_favorite(origin.file_uri))
        .catch(res => {
            if (res.statusCode !== 403) {
                throw res.body;
            }
        }) : am.create_workspace(origin);

    return ifs.mkdirs(deploy_tmp_directory)
        .catch(pass_enoent_error)
        .then(() => ifs.readJson(Path.join(cwd, deploy_file_name)))
        .then(def => map_definition_to_create_origin_inputs(def, deploy_tmp_directory, cwd)
            .reduce((origin_sequence, origin) => origin_sequence
                .then(() => init(origin))
                .then(() => origin.workspace ? install_from_workspace(origin) : install_from_project(origin))
                .then(() => origin.workspace ? Promise.resolve() : am.delete_workspace(origin.file_uri)),
            Promise.resolve()))
        .then(() => {
            console.info(chalk.green(`Deployment done within ${get_time()}`));
        })
        .catch(log.spawn_error);
};

module.exports = {
    install_assets,
    clean_installed_assets
};
