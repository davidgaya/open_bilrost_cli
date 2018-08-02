/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const Path = require('path');
const utilities = require('open_bilrost/assetmanager/workspace_utilities')(path => Path.join('.bilrost', path ? path : '/'));
const ifs = require('../util/ifs');
const log = require('../util/log');

module.exports = (asset, workspace_path, options) => {
    const parse_dependencies = [];
    const add_dep_opt = options.add;
    const rm_dep_opt = options.remove;
    const comment_opt = options.comment;
    const main_opt = options.main;
    if (add_dep_opt && add_dep_opt.length) {
        const add_dep = path => {
            const ref = utilities.absolute_path_to_ref(path, workspace_path);
            if (!~asset.dependencies.indexOf(ref)) {
                asset.dependencies.push(ref);
            }
        };
        add_dep_opt.forEach(dep => {
            const absolute_path = utilities.ref_to_absolute_path(dep, workspace_path);
            try {
                var is_directory = ifs.is_directory_sync(absolute_path);
            } catch(err) {
                if (err.toString().includes('ENOENT')) {
                    log.spawn_error('Resource ' + absolute_path + ' is not found!');
                    return;
                } else {
                    throw err;
                }
            }

            if (is_directory) {
                const get_deps_from_found_files = ifs.get_files_recursively(absolute_path, ['.git'])
                    .then(files => files.forEach(add_dep));
                parse_dependencies.push(get_deps_from_found_files);
            } else {
                add_dep(dep);
            }
        });
    }
    if (rm_dep_opt && rm_dep_opt.length) {
        rm_dep_opt.forEach(dep_opt => {
            asset.dependencies = asset.dependencies.filter(dep => !dep.includes(dep_opt));
        });
    }
    if (main_opt) {
        asset.main = main_opt;
    }
    if (comment_opt) {
        asset.comment = comment_opt;
    }
    return Promise.all(parse_dependencies)
        .then(() => asset);
};
