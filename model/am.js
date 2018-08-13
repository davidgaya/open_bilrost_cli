/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

module.exports = config => {

    const req = require('../util/req')(config.url);

    const add_workspace_to_favorite = uri => req(
        'post',
        '/assetmanager/workspaces/favorites',
        {
            body: { file_uri: uri }
        }
    ).then(body => {
        if (body && body.name) {
            return {
                message: body.name + ' successfully added',
                body: body
            };
        } else {
            throw {
                message: 'Unexpected body answer',
                body: body
            };
        }
    });

    const forget_workspace_in_favorite = identifier => req(
        'delete',
        '/assetmanager/workspaces/' + encodeURIComponent(identifier) + '/favorites'
    ).then(body => {
        if (body === 'Ok') {
            return { message: 'Successfully forgotten' };
        } else {
            throw {
                message: 'Unexpected body answer',
                body: body
            };
        }
    });

    const forget_workspaces_in_favorite = () => req(
        'post',
        '/assetmanager/workspaces/favorites/reset'
    ).then(body => {
        if (body === 'Ok') {
            return { message: 'Successfully forgotten' };
        } else {
            throw {
                message: 'Unexpected body answer',
                body: body
            };
        }
    });

    const create_workspace = input => req(
        'post',
        '/assetmanager/workspaces',
        {
            body: input
        }
    ).then(body => {
        if (body && body.name) {
            return {
                message: body.name + ' successfully created',
                body: body
            };
        } else {
            throw {
                message: 'Unexpected body answer',
                body: body
            };
        }
    });

   const reset_workspace = file_uri => req(
        'post',
        '/assetmanager/workspaces/' + encodeURIComponent(file_uri) + '/reset'
    ).then(body => {
        if (body === 'Ok') {
            return { message: 'Successfully reset' };
        } else {
            throw {
                message: 'Unexpected body answer',
                body: body
            };
        }
    });

    const populate_workspace = input => req(
        'post',
        '/assetmanager/workspaces/populate',
        {
            body: input
        }
    ).then(body => {
        if (body && body.name) {
            return {
                message: body.name + ' successfully populated',
                body: body
            };
        } else {
            throw {
                message: 'Unexpected body answer',
                body: body
            };
        }
    });

    const delete_workspace = identifier => req(
        'delete',
        '/assetmanager/workspaces/' + encodeURIComponent(identifier)
    ).then(body => {
        if (body === 'Ok') {
            return {
                message: 'Successfully deleted'
            };
        } else {
            throw {
                message: 'Unexpected body answer',
                body: body
            };
        }
    });

    const create_asset = (identifier, asset_ref, input) => req(
        'put',
        '/assetmanager/workspaces/' + encodeURIComponent(identifier) + asset_ref,
        {
            body: input
        }
    ).then(body => {
        if (body) {
            return {
                message: asset_ref + ' successfully created',
                body: body
            };
        } else {
            throw {
                message: 'Unexpected body answer',
                body: body
            };
        }
    });

    const delete_asset = (identifier, asset_ref) => req(
        'delete',
        '/assetmanager/workspaces/' + encodeURIComponent(identifier) + asset_ref
    ).then(() => {
        return {
            message: 'Successfully deleted'
        };
    });

    const list_asset = (identifier, asset_ref) => req(
        'get',
        '/contentbrowser/workspaces/' + encodeURIComponent(identifier) + asset_ref
    ).then(body => {
        if (body) {
            return {
                body: body
            };
        } else {
            throw {
                message: 'Unexpected body answer',
                body: body
            };
        }
    });

    const rename_asset = (identifier, ref, new_ref) => req(
        'post',
        '/assetmanager/workspaces/' + encodeURIComponent(identifier) + '/rename' + ref,
        {
            body: {
                new: new_ref
            }
        }
    ).then(body => {
        if (body) {
            return {
                message: ref + ' successfully renamed',
                body: body
            };
        } else {
            throw {
                message: 'Unexpected body answer',
                body: body
            };
        }
    });

    const update_asset = (identifier, asset_ref, input, modified) => req(
        'put',
        '/assetmanager/workspaces/' + encodeURIComponent(identifier) + asset_ref,
        {
            body: input,
            headers: {
                'Last-Modified': modified
            }
        }
    ).then(body => {
        if (body) {
            return {
                message: asset_ref + ' successfully updated',
                body: body
            };
        } else {
            throw {
                message: 'Unexpected body answer',
                body: body
            };
        }
    });

    const create_branch = (identifier, branch_name) => req(
        'put',
        '/assetmanager/workspaces/' + encodeURIComponent(identifier) + '/branch/' + branch_name
    ).then(body => {
        if (body) {
            return {
                message: branch_name + ' successfully created',
                body: body
            };
        } else {
            throw {
                message: 'Unexpected body answer',
                body: body
            };
        }
    });

    const change_branch = (identifier, branch_name) => req(
        'post',
        '/assetmanager/workspaces/' + encodeURIComponent(identifier) + '/branch/' + branch_name + '/change'
    ).then(body => {
        if (body) {
            return {
                message: branch_name + ' successfully operational',
                body: body
            };
        } else {
            throw {
                message: 'Unexpected body answer',
                body: body
           };
        }
    });

    const remove_branch = (identifier, branch_name) => req(
        'delete',
        '/assetmanager/workspaces/' + encodeURIComponent(identifier) + '/branch/' + branch_name
    ).then(body => {
        if (body) {
            return {
                message: branch_name + ' successfully operational',
                body: body
            };
        } else {
            throw {
                message: 'Unexpected body answer',
                body: body
           };
        }
    });

    return {
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
};
