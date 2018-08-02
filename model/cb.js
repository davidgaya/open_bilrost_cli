/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

module.exports = config => {
    
    const req = require('../util/req')(config.url);

    const list_workspace = name => req(
        'get',
        '/contentbrowser/workspaces/' + (name ? encodeURIComponent(name) : "")
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

    const get_branch = name => req(
        'get',
        '/contentbrowser/workspaces/' + encodeURIComponent(name) + '/branch'
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

    const list_branches = name => req(
        'get',
        '/contentbrowser/workspaces/' + encodeURIComponent(name) + '/branches'
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

    return {
        list_workspace: list_workspace,
        get_branch: get_branch,
        list_branches: list_branches
    };
};
