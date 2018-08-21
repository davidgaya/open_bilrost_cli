/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const client_config = require('../config/am.json');
const config = require('../model/config')(client_config);
const log = require('../util/log');

const get_all = () => config.get_all()
    .then(log.spawn_success)
    .catch(log.spawn_error);

const get = config_name => config.get(config_name)
    .then(log.spawn_success)
    .catch(log.spawn_error);

const set = (config_name, new_value) => config.set(config_name, new_value)
    .then(log.spawn_success)
    .catch(log.spawn_error);

const del = config_name => config.del(config_name)
    .then(log.spawn_success)
    .catch(log.spawn_error);

module.exports = {
    get,
    get_all,
    set,
    del
};
