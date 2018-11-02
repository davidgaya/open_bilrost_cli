/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';
const open = require("open");
const log = require('../util/log');

module.exports = config => {
    const req = require('../util/req')(config.url);

    const whoami = () => req(
        'get',
        '/auth/whoami'
    ).then(body => {
        if (body) {
            return {
                body: JSON.parse(body)
            };
        } else {
            throw {
                message: 'Unexpected body answer',
                body: body
            };
        }
    });

    const login = () => whoami()
        .catch(err => new Promise((resolve, reject) => {
            if (err.body.includes("We don't like you here")) {
                log.spawn_warning('Proceed to github signin or close the confirmation page. The command terminates in 60 secs if no successfull login is detected.');
                open(config.url + '/auth/access_token');
                let interval;
                const timer = setTimeout(() => {
                    clearInterval(interval);
                    reject(new Error('Timeout'));
                }, 60 * 1000);
                interval = setInterval(() => {
                    whoami()
                        .then(obj => {
                            clearTimeout(timer);
                            clearInterval(interval);
                            resolve(obj);
                        }, () => {});
                }, 1000);
            } else {
                reject({
                    message: 'Unexpected body answer',
                    body: err.toString()
                });
            }
        }));

    const session = id => req(
        'put',
        '/auth/session',
        {
            body: {
                id: id
            }
        }
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

    const logout = () => req(
        'delete',
        '/auth/access_token'
    ).then(body => {
        if (body && body.ok === 'Logget out') {
            return {
                message: "Successfully logged out"
            };
        } else {
            throw {
                message: 'Unexpected body answer',
                body: body
            };
        }
    });

    return {
        login: login,
        session: session,
        logout: logout,
        whoami: whoami
    };
};
