/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const crypto = require('crypto');
const file_uri = require('../util/file_uri');
const Path = require('path').posix;
const chalk = require('chalk');

const utilities = require('open_bilrost/assetmanager/utilities');
const workspace_utilities = require('open_bilrost/assetmanager/workspace_utilities')(path => Path.join('.bilrost', path ? path : '/'));

// TODO replace all controllers to models
const vcs = require('./vcs');
const am = require('./am');
const cb = require('./cb');

const am_config = require('../config/am.json');
const am_model = require('../model/am')(am_config);

const log = require('../util/log');
const ifs = require('../util/ifs');
const elapsed_time = require('../util/elapsed_time');

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

const remove_all_empty_directories = (deploy_path, resource_path) => {
    const remove_if_not_empty = path => ifs.readdir(path)
        .then(files => {
            if (!files.length) {
                return ifs.remove(path);
            }
        })
        .catch(err => err && err.code === 1 ? Promise.resolve() : Promise.reject(err));
    const create_removal_promise = path => () => remove_if_not_empty(path);
    const removal_promises = [];
    resource_path = Path.relative(deploy_path, resource_path);
    while (resource_path.split('/').length > 1) {
        removal_promises.push(create_removal_promise(resource_path));
        resource_path = resource_path
            .split('/')
            .filter((basename, index, array) => index !== array.length - (basename === '' ? 2 : 1))
            .join('/');
    }
    removal_promises.push(create_removal_promise(resource_path));
    return removal_promises.reduce((sequence, promise) => sequence.then(promise), Promise.resolve());
};

const clean = (origin, cwd) => Promise.all(origin.deploys.map(deployed_asset => get_asset_resources(origin.file_uri, deployed_asset.ref, origin.workspace_path)
    .then(resources => Promise.all(resources.map(resource => {
        const base_deploy_directory = Path.join(cwd, deployed_asset.dest ? deployed_asset.dest : "");
        const workspace_base = Path.join(origin.workspace_path, deployed_asset.base ? deployed_asset.base : "");
        const asset_relative = Path.relative(workspace_base, resource);
        const deployed_asset_path = Path.join(base_deploy_directory, asset_relative);
        return ifs.remove(deployed_asset_path)
            .then(() => remove_all_empty_directories(base_deploy_directory, deployed_asset_path))
            .catch(pass_enoent_error);
    })))
));

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
                //TODO cleaning for deployed assets from projects
                .then(() => origin.workspace ? clean(origin, cwd) : Promise.resolve())
                .then(() => origin.workspace ? install_from_workspace(origin) : install_from_project(origin))
                .then(() => origin.workspace ? Promise.resolve() : am.delete_workspace(origin.file_uri)),
            Promise.resolve()))
        .then(() => {
            console.info(chalk.green(`Deployment done within ${get_time()}`));
        })
        .catch(log.spawn_error);
};

const tmp_asset_definition_filename = "tmp_directory_asset.json";

const commit_folder_asset = (identifier, asset_name, directory_relative_path) => cb.list_workspace(identifier)
    .then(output => {
        const items = output.body.items;
        if (!items.length) {
            throw "Identifier is not recognized";
        }
        if (items.length > 1) {
            throw "More than one workspace shouldnt match the given identifier";
        }
        let subscription_id;
        const workspace = items[0];
        const workspace_absolute = utilities.convert_file_uri_to_path(workspace.file_uri);
        const target_path = Path.join(workspace_absolute, directory_relative_path ? directory_relative_path : "");
        const ignored_filenames = [".git", ".svn", ".bilrost", tmp_asset_definition_filename];
        const tmp_def_file_absolute = Path.join(workspace_absolute, tmp_asset_definition_filename);
        return ifs.get_files_recursively(target_path, ignored_filenames)
            .then(resource_absolutes => {
                const refs = resource_absolutes.map(resource_absolute => workspace_utilities.absolute_path_to_ref(resource_absolute, workspace_absolute));
                const content = { dependencies: refs };
                return ifs.outputJson(tmp_def_file_absolute, content);
            })
            .then(() => am.create_asset(identifier, asset_name, tmp_def_file_absolute))
            .then(() => vcs.subscribe(identifier, 'ASSET', asset_name))
            .then(sub => {
                subscription_id = sub.body.id;
            })
            .then(() => vcs.stage(identifier, asset_name))
            .then(() => vcs.commit(identifier, asset_name + " folder asset"))
            .then(() => vcs.unsubscribe(identifier, subscription_id))
            .then(() => ifs.remove(tmp_def_file_absolute));
    });

const repair_cache_resource = path => new Promise((resolve, reject) => {
    const fd_hash = ifs.createReadStream(path);
    const cache_key = Path.basename(path);
    const hash = crypto.createHash('sha256');
    hash.setEncoding('hex');
    hash.on('error', reject);
    hash.on('finish', () => {
        const read_hash = hash.read();
        resolve(read_hash === cache_key);
    });
    fd_hash.on('error', reject);
    fd_hash.pipe(hash);
})
    .then(is_valid => {
        if (!is_valid) {
            console.info(chalk.yellow(`Removed ${Path.basename(path)} invalid cache resource`));
            return ifs.remove(path)
                .then(() => is_valid);
        } else {
            return is_valid;
        }
    });

const repair_cache = cache_path => ifs.get_files_recursively(cache_path, [])
    .then(files => Promise.all(files.map(repair_cache_resource)))
    .then(res => {
        console.info(chalk.green(`Repair done with ${res.filter(is_valid => !is_valid).length}/${res.length} corrupted entrie(s)`));
    });

module.exports = {
    install_assets,
    commit_folder_asset,
    clean_installed_assets,
    repair_cache
};
