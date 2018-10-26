/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const Path = require('path').posix;

const vcs = require('../vcs');
const cb = require('../cb');
const am = require('../am');
const ifs = require('../../util/ifs');

const utilities = require('open_bilrost/assetmanager/utilities');
const workspace_utilities = require('open_bilrost/assetmanager/workspace_utilities')(path => Path.join('.bilrost', path ? path : '/'));

const TMP_ASSET_DEFINITION = "tmp_directory_asset.json";

module.exports = (identifier, asset_name, directory_relative_path) => cb.list_workspace(identifier, true)
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
        const ignored_filenames = [".git", ".svn", ".bilrost", TMP_ASSET_DEFINITION];
        const tmp_def_file_absolute = Path.join(workspace_absolute, TMP_ASSET_DEFINITION);
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
            .then(() => vcs.push(identifier, asset_name + " folder asset"))
            .then(() => vcs.unsubscribe(identifier, asset_name))
            .then(() => ifs.remove(tmp_def_file_absolute));
    });
