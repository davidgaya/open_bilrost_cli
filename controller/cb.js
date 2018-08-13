/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const config = require('../config/am.json');
const cb_model = require('../model/cb')(config);
const log = require('../util/log');

const list_workspace = (name, verbose) => cb_model.list_workspace(name)
    .then(response => {
        if (!verbose) {
            response.body = {
                workspaces: response.body.items.map(({ name, project, created_at, file_uri }) => ({ name, project: project.full_name, file_uri, created_at: new Date(created_at).toString() }))
            };
        }
        return response;
    })
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
