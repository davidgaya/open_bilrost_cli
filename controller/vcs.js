/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const am_config = require('../config/am.json');
const vcs = require('../model/vcs')(am_config);
const log = require('../util/log');

const subscribe = (identifier, type, descriptor) => vcs.subscribe(identifier, {
        type: type,
        descriptor: descriptor
    })
    .then(log.spawn_success).catch(log.spawn_error);

const unsubscribe = (identifier, subscription_id) => vcs.unsubscribe(identifier, subscription_id)
    .then(log.spawn_success).catch(log.spawn_error);

const stage = (identifier, reference) => vcs.stage(identifier, reference)
    .then(log.spawn_success).catch(log.spawn_error);

const commit = (identifier, comment) => vcs.commit(identifier, comment)
    .then(log.spawn_success).catch(log.spawn_error);

const get_stage_list = identifier => vcs.get_stage_list(identifier)
    .then(log.spawn_success).catch(log.spawn_error);

const get_subscription_list = identifier => vcs.get_subscription_list(identifier)
    .then(log.spawn_success).catch(log.spawn_error);

const get_status = (identifier, reference) => vcs.get_status(identifier, reference)
    .then(log.spawn_success).catch(log.spawn_error);

const unstage = (identifier, reference) => vcs.unstage(identifier, reference)
    .then(log.spawn_success).catch(log.spawn_error);

module.exports = {
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    stage: stage,
    commit: commit,
    get_subscription_list: get_subscription_list,
    get_status: get_status,
    get_stage_list: get_stage_list,
    unstage: unstage
};
