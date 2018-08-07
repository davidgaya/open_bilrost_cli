/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

// create read update delete

'use strict';

const walkback = require('walk-back');
const Path = require('path');

const ifs = require('../../util/ifs');

const VERSION = '1.0.0';
const NOT_FOUND_ERROR_MESSAGE = 'deploy log not found!';
const FILE_NAME = 'deployed.json';

const format = () => ({
    time: new Date().toISOString(),
    version: VERSION,
    resources: []
});

const create = (base_path, log) => ifs.outputJson(Path.join(base_path, FILE_NAME), log);

const read = base_path => {
    const internal_path = walkback(base_path, '.bilrost');
    if (internal_path) {
        const deploy_log_path = Path.join(internal_path, FILE_NAME);
        return ifs.readJson(deploy_log_path)
            .catch(err => {
                if (err.includes('ENOENT')) {
                    throw new Error(NOT_FOUND_ERROR_MESSAGE);
                } else {
                    throw err;
                }
            });
    } else {
        return Promise.reject(new Error(NOT_FOUND_ERROR_MESSAGE));
    }
};

const update = (base_path, resources) => read(base_path)
    .then(deploy_log => deploy_log, err => {
        if (err === NOT_FOUND_ERROR_MESSAGE) {
            return format();
        } else {
            throw err;
        }
    })
    .then(deploy_log => {
        deploy_log.resources.concat(resources);
        return create(base_path, deploy_log)
            .then(() => deploy_log);
    });

const del = base_path => ifs.remove(Path.join(base_path, FILE_NAME));

const list_resources = base_path => read(base_path)
    .then(deploy_log => deploy_log.resources.map(resource => resource.path));

module.exports = {
    FILE_NAME,
    create,
    read,
    update,
    del,
    format,
    list_resources
};
