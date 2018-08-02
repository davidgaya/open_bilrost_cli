/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const config = require('../config/am.json');
const cb_model = require('../model/cb')(config);
const log = require('../util/log');
 
const list_workspace = name => cb_model.list_workspace(name)
    .then(log.spawn_success)
    .catch(log.spawn_error);

const get_branch = name => cb_model.get_branch(name)
    .then(log.spawn_success)
    .catch(log.spawn_error);

const list_branches = (name, verbose) => cb_model.list_branches(name)
	.then(response => {
		if (!verbose) {
			response.body = {
				locals: response.body.locals.map(local => `${local.name}   <${local.status}>`),
				remotes: response.body.remotes.map(remote => remote.name)
			};
		}
		return response;
	})
    .then(log.spawn_success)
    .catch(log.spawn_error);

module.exports = {
    list_workspace: list_workspace,
    get_branch: get_branch,
    list_branches: list_branches
};
