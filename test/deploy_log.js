/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const Path = require('path');
const should = require('should');
const fs = require('fs-extra');

const deploy_log = require('../controller/custom/deploy_log');

const base_path = 'tmp/.bilrost';
const deploy_log_path = Path.join(base_path, deploy_log.FILE_NAME);

const log = deploy_log.format();
log.resources = [
    {
        path: 'foo'
    },
    {
        path: 'bar'
    }
];

describe('deploy log', function () {

    before(function (done) {
        deploy_log.create(base_path, log)
            .then(() => {
                should.equal(fs.readFileSync(deploy_log_path).toString(), JSON.stringify(log) + '\n');
                done();
            })
            .catch(done);
    });

    after(function (done) {
        deploy_log.del(base_path)
            .then(() => {
                try {
                    fs.accessSync(deploy_log_path);
                    done('Shouldn\'t be accessible!');
                } catch (err) {
                    if (err.toString().includes('ENOENT')) {
                        done();
                    } else {
                        done(err);
                    }
                }
            })
            .catch(done);
    });

    it('Read deployment log', function (done) {
        deploy_log.read('tmp')
            .then(deployment_file => {
                should.deepEqual(log, deployment_file);
                done();
            })
            .catch(done);
    });

    it('Dont read deployment log', function (done) {
        deploy_log.read(process.cwd())
            .then(() => {
                done('Shouldn\'t pass!');
            })
            .catch(err => {
                if (err.toString().includes('not found!')) {
                    done();
                } else {
                    done(err);
                }
            });
    });

    it('List deployed resources', function (done) {
        deploy_log.list_resources('tmp')
            .then(resources => {
                should.deepEqual(resources, log.resources.map(resource => resource.path));
                done();
            })
            .catch(done);
    });


    it('Update deployment log by adding resources', function (done) {
        const resources_to_push = [
            {
                path: 'bar/foo'
            },
            {
                path: 'foo/bar'
            }
        ];
        log.resources.concat(resources_to_push);
        deploy_log.update('tmp')
            .then(deploy_log => {
                should.deepEqual(deploy_log.resources, log.resources);
                should.equal(fs.readFileSync(deploy_log_path).toString(), JSON.stringify(log) + '\n');
                done();
            })
            .catch(done);
    });

});
