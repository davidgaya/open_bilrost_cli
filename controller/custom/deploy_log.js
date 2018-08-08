/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

// create read update delete

'use strict';

const Path = require('path');

const ifs = require('../../util/ifs');

const VERSION = '1.0.0';
const NOT_FOUND_ERROR_MESSAGE = 'deploy log not found!';
const FOLDER_NAME = '.bilrost';
const FILE_NAME = 'deployed.json';

const format = () => ({
    time: new Date().toISOString(),
    version: VERSION,
    resources: []
});

const stringify = log => JSON.stringify(log, null, 4);

const create = (base_path, log) => ifs.outputFile(Path.join(base_path, FOLDER_NAME, FILE_NAME), stringify(log));

const access = (base_path, log) => ifs.access(Path.join(base_path, FOLDER_NAME, FILE_NAME), log);

const read = base_path => {
    const deploy_log_path = Path.join(base_path, FOLDER_NAME, FILE_NAME);
    return ifs.readJson(deploy_log_path)
        .catch(err => {
            if (err.toString().includes('ENOENT')) {
                throw new Error(NOT_FOUND_ERROR_MESSAGE);
            } else {
                throw err;
            }
        });
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
        deploy_log.resources = deploy_log.resources.concat(resources);
        return create(base_path, deploy_log)
            .then(() => deploy_log);
    });

const del = base_path => ifs.remove(Path.join(base_path, FOLDER_NAME, FILE_NAME));

const list_resources = base_path => read(base_path)
    .then(deploy_log => deploy_log.resources.map(resource => resource.path));

module.exports = {
    FOLDER_NAME,
    FILE_NAME,
    stringify,
    access,
    create,
    read,
    update,
    del,
    format,
    list_resources
};
