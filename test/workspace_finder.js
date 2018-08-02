/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const path = require('path');
const should = require('should');
const fs = require('fs-extra');

const promisify = require('../util/promisify');
const workspace_finder = require('../util/workspace_finder');

const is_win = /^win/.test(process.platform);
const workspace_folder_name = 'tmp';
const base_path = '/tmp/.bilrost';
const workspace_resource_path = path.join(base_path, 'workspace');

describe('workspace finder', function () {

    before(function (done) {
        promisify(fs.outputJson)(workspace_resource_path, {})
            .then(() => {
                done();
            })
            .catch(done);
    });

    after(function (done) {
        promisify(fs.unlink)(workspace_resource_path)
            .then(() => {
                done();
            })
            .catch(done);
    });

    it('Find workspace', function (done) {
        const url = workspace_finder(base_path);
        should.equal(url, `file:///${is_win ? 'C:/' : ''}${workspace_folder_name}`);
        done();
    });

    it('Dont find workspace', function (done) {
        const name = workspace_finder(process.cwd());
        should.equal(name, undefined);
        done();
    });

});
