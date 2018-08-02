/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

var uri2path = require('file-uri-to-path');

const cb = require('./cb');

const ifs = require('../util/ifs');
const log = require('../util/log');
const file_uri = require('../util/file_uri');

const am_config = require('../config/am.json');
const am_models = require('../model/am')(am_config);

const update_asset_usecase = require('../usecases/update_asset');

const add_workspace_to_favorite = path => am_models.add_workspace_to_favorite(file_uri(path))
    .then(log.spawn_success)
    .catch(log.spawn_error);

const forget_workspace_in_favorite = identifier => am_models.forget_workspace_in_favorite(identifier)
    .then(log.spawn_success)
    .catch(log.spawn_error);

const forget_workspaces_in_favorite = () => am_models.forget_workspaces_in_favorite()
    .then(log.spawn_success)
    .catch(log.spawn_error);

const create_workspace = input => {
    input.file_uri = input.path ? file_uri(input.path) : input.file_uri;
    delete input.path;
    input.description = typeof input.description === "string" ? input.description : "";
    return am_models.create_workspace(input)
        .then(log.spawn_success)
        .catch(log.spawn_error);
};

const reset_workspace = identifier => {
    return am_models.reset_workspace(identifier)
        .then(log.spawn_success)
        .catch(log.spawn_error);
};

const populate_workspace = input => {
    input.file_uri = input.path ? file_uri(input.path) : input.file_uri;
    delete input.path;
    input.description = typeof input.description === "string" ? input.description : "";
    return am_models.populate_workspace(input)
        .then(log.spawn_success)
        .catch(log.spawn_error);
};

const delete_workspace = identifier => am_models.delete_workspace(identifier)
    .then(log.spawn_success)
    .catch(log.spawn_error);

const create_asset = (identifier, asset_ref, asset_definition_path) => (asset_definition_path ? ifs.readJson(asset_definition_path) : Promise.resolve({}))
    .then(asset_definition => am_models.create_asset(identifier, asset_ref, asset_definition))
    .then(log.spawn_success)
    .catch(log.spawn_error);

const list_asset = (identifier, reference, verbose) => am_models.list_asset(identifier, reference)
    .then(response => {
        if (response.body.items) {
            if (!verbose) {
                response.body = {
                    assets: response.body.items.map(item => item.meta.ref),
                    namespaces: response.body.namespaces.map(item => item.ref)
                };
            }
        }
        return response;
    })
    .then(log.spawn_success)
    .catch(log.spawn_error);

const rename_asset = (identifier, ref, new_ref) => am_models.rename_asset(identifier)
    .then(log.spawn_success)
    .catch(log.spawn_error);

const delete_asset = (identifier, reference) => am_models.delete_asset(identifier, reference)
    .then(log.spawn_success)
    .catch(log.spawn_error);

const update_asset = (identifier, asset_ref, options) => cb.list_workspace(identifier)
    .then(res => {
        let workspace_path;
        try {
            const file_uri = res.body.items[0].file_uri;
            workspace_path = uri2path(file_uri).replace(/\\/g, '/');
        } catch (err) {
            throw "Workspace is not found within favorite list!";
        }
        return am_models.list_asset(identifier, asset_ref)
            .then(res => update_asset_usecase(res.body, workspace_path, options));
    })
    .then(asset => {
        const modified = asset.meta.modified || asset.meta.created;
        delete asset.meta;
        return am_models.update_asset(identifier, asset_ref, asset, modified);
    })
    .then(log.spawn_success)
    .catch(log.spawn_error);

const create_branch = (identifier, name) => am_models.create_branch(identifier, name)
    .then(log.spawn_success)
    .catch(log.spawn_error);

const change_branch = (identifier, name) => am_models.change_branch(identifier, name)
    .then(log.spawn_success)
    .catch(log.spawn_error);

const remove_branch = (identifier, name) => am_models.remove_branch(identifier, name)
    .then(log.spawn_success)
    .catch(log.spawn_error);

module.exports = {
    add_workspace_to_favorite,
    forget_workspace_in_favorite,
    forget_workspaces_in_favorite,
    create_workspace,
    populate_workspace,
    delete_workspace,
    create_asset,
    delete_asset,
    list_asset,
    rename_asset,
    update_asset,
    create_branch,
    change_branch,
    remove_branch,
    reset_workspace
};
