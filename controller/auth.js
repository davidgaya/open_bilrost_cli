/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const config = require('../config/am.json');
const auth = require('../model/auth')(config);
const log = require('../util/log');

const login = () => {
    return auth.login()
        .then(obj => {
            log.spawn_success({ message: obj.body.displayName });
            log.spawn_success({ message: obj.body.email });
        })
        .catch(log.spawn_error);
};

const session = id => auth.session(id)
    .then(log.spawn_success)
    .catch(log.spawn_error);

const logout = () => auth.logout()
    .then(log.spawn_success)
    .catch(log.spawn_error);

const whoami = () => auth.whoami()
    .then(obj => {
        log.spawn_success({ message: obj.body.displayName });
        log.spawn_success({ message: obj.body.email });
    })
    .catch(log.spawn_error);

module.exports = {
    login: login,
    session: session,
    logout: logout,
    whoami: whoami
};
