/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

module.exports = config => {

    const req = require('../util/req')(config.url);

    const get_status = (identifier, reference) => req(
        'get',
        '/assetmanager/workspaces/' + encodeURIComponent(identifier) + '/status' + (reference ? reference : '')
    ).then(body => {
        if (body) {
            return {
                body: body
            };
        } else {
            throw { 
                message: 'Undefined body answer'
            };
        }
    });

    const get_stage_list = identifier => req(
        'get',
        '/assetmanager/workspaces/' + encodeURIComponent(identifier) + '/stage'
    ).then(body => {
        if (body) {
            return {
                body: body
            };
        } else {
            throw { 
                message: 'Undefined body answer'
            };
        }
    });

    const stage = (identifier, reference) => req(
        'post',
        '/assetmanager/workspaces/' + encodeURIComponent(identifier) + '/stage' + reference
    ).then(body => {
        if (body === 'Ok') {
            return {
                message: reference + ' successfully staged'
            };
        } else {
            throw { 
                message: 'Undefined body answer',
                body: body
            };
        }
    });

    const unstage = (identifier, reference) => req(
        'delete',
        '/assetmanager/workspaces/' + encodeURIComponent(identifier) + '/stage' + reference
    ).then(body => {
        if (body === 'Ok') {
            return {
                message: reference + ' successfully unstaged'
            };
        } else {
            throw { 
                message: 'Undefined body answer',
                body: body
            };
        }
    });

    const reset_stage_list = identifier => req(
        'delete',
        '/assetmanager/workspaces/' + encodeURIComponent(identifier) + '/stage'
    ).then(body => {
        if (body === 'Ok') {
            return {
                message: 'successfully reset'
            };
        } else {
            throw { 
                message: 'Undefined body answer',
                body: body
            };
        }
    });

    const commit = (identifier, comment) => req(
        'post',
        '/assetmanager/workspaces/' + encodeURIComponent(identifier) + '/commits',
        {
            body: {
                message: comment
            }
        }
    ).then(body => {
        if (body) {
            return {
                message: 'Successfully commited',
                body: body
            };
        } else {
            throw { 
                message: 'Undefined body answer'
            };
        }
    });

    const get_commit_log = (identifier, reference) => req(
        'get',
        '/assetmanager/workspaces/' + encodeURIComponent(identifier) + '/commits' + reference
    );

    const get_subscription_list = identifier => req(
        'get',
        '/assetmanager/workspaces/' + encodeURIComponent(identifier) + '/subscriptions'
    ).then(body => {
        if (body) {
            return {
                body: body
            };
        } else {
            throw { 
                message: 'Undefined body answer'
            };
        }
    });

    const subscribe = (identifier, input) => req(
        'post',
        '/assetmanager/workspaces/' + encodeURIComponent(identifier) + '/subscriptions',
        {
            body: input
        }
    ).then(body => {
        if (body) {
            return {
                message: 'Successfully subscribed',
                body: body
            };
        } else {
            throw { 
                message: 'Undefined body answer'
            };
        }
    });

    const unsubscribe = (identifier, subscription_id) => req(
        'delete',
        '/assetmanager/workspaces/' + encodeURIComponent(identifier) + '/subscriptions/' + subscription_id
    ).then(body => {
        if (body === 'Ok') {
            return {
                message: 'Successfully unsubscribed'
            };
        } else {
            throw { 
                message: 'Undefined body answer',
                body: body
            };
        }
    });

    const reset_subscription_list = identifier => req(
        'delete',
        '/assetmanager/workspaces/' + encodeURIComponent(identifier) + '/subscriptions'
    ).then(body => {
        if (body === 'Ok') {
            return {
                message: 'Successfully reset'
            };
        } else {
            throw { 
                message: 'Undefined body answer',
                body: body
            };
        }
    });

    return {
        get_status,
        get_stage_list,
        stage,
        unstage,
        reset_stage_list,
        commit,
        get_commit_log,
        get_subscription_list,
        reset_subscription_list,
        subscribe,
        unsubscribe
    };
};
