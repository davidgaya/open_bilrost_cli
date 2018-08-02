/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const should = require('should');
const fs = require('fs-extra');
const Path = require('path').posix;

const tmp_workpsace_path = Path.join(process.cwd().replace(/\\/g, '/'), 'tmp');

const update_asset = require('../../usecases/update_asset');

describe('Update asset use case', function () {
    
    before('Create fake workspace', done => {
        fs.outputFileSync(Path.join(tmp_workpsace_path, 'foo'), '');
        fs.outputFileSync(Path.join(tmp_workpsace_path, 'bar'), '');
        fs.outputFileSync(Path.join(tmp_workpsace_path, 'directory', 'foo'), '');
        fs.outputFileSync(Path.join(tmp_workpsace_path, 'directory', 'bar'), '');
        done();
    });

    after('Remove fake workspace', done => {
        fs.removeSync(tmp_workpsace_path);
        done();
    });

    it('#add deps from directory given by ref without ending slash', function (done) {
        const asset = {
            dependencies: []
        };
        const options = {
            "add": ['/resources/directory']
        };
        update_asset(asset, tmp_workpsace_path, options)
            .then(new_asset => {
                should(new_asset.dependencies.sort()).be.eql([
                    '/resources/directory/bar',
                    '/resources/directory/foo'
                ]);
                done();
            })
            .catch(done);
    });

    it('#add deps from directory given by ref with ending slash', function (done) {
        const asset = {
            dependencies: []
        };
        const options = {
            "add": ['/resources/directory/']
        };
        update_asset(asset, tmp_workpsace_path, options)
            .then(new_asset => {
                should(new_asset.dependencies.sort()).be.eql([
                    '/resources/directory/bar',
                    '/resources/directory/foo'
                ]);
                done();
            })
            .catch(done);
    });

    it('#add mix file and directory', function (done) {
        const asset = {
            dependencies: []
        };
        const options = {
            "add": [
                '/resources/directory',
                '/resources/foo',
                '/resources/bar'
            ]
        };
        update_asset(asset, tmp_workpsace_path, options)
            .then(new_asset => {
                should(new_asset.dependencies.sort()).be.eql([
                    '/resources/bar',
                    '/resources/directory/bar',
                    '/resources/directory/foo',
                    '/resources/foo'
                ]);
                done();
            })
            .catch(done);
    });

    it('#add unknown deps', function (done) {
        const asset = {
            dependencies: [
                '/resources/directory/bar',
                '/resources/directory/foo'
            ]
        };
        const options = {
            "add": ['/resources/test']
        };
        update_asset(asset, tmp_workpsace_path, options)
            .then(new_asset => {
                should(new_asset.dependencies).be.eql(asset.dependencies);
                done();
            })
            .catch(done);
    });

    it('#remove deps from directory given by ref without ending slash', function (done) {
        const asset = {
            dependencies: [
                '/resources/directory/bar',
                '/resources/directory/foo'
            ]
        };
        const options = {
            "remove": ['/resources/directory']
        };
        update_asset(asset, tmp_workpsace_path, options)
            .then(new_asset => {
                should(new_asset.dependencies).be.eql([]);
                done();
            })
            .catch(done);
    });

    it('#remove deps from directory given by ref with ending slash', function (done) {
        const asset = {
            dependencies: [
                '/resources/directory/bar',
                '/resources/directory/foo'
            ]
        };
        const options = {
            "remove": ['/resources/directory/']
        };
        update_asset(asset, tmp_workpsace_path, options)
            .then(new_asset => {
                should(new_asset.dependencies).be.eql([]);
                done();
            })
            .catch(done);
    });

    it('#remove mix file and directory', function (done) {
        const asset = {
            dependencies: [
                '/resources/bar',
                '/resources/directory/bar',
                '/resources/directory/foo',
                '/resources/foo'
            ]
        };
        const options = {
            "remove": [
                '/resources/directory',
                '/resources/foo',
                '/resources/bar'
            ]
        };
        update_asset(asset, tmp_workpsace_path, options)
            .then(new_asset => {
                should(new_asset.dependencies.sort()).be.eql([]);
                done();
            })
            .catch(done);
    });

    it('#remove unknown deps', function (done) {
        const asset = {
            dependencies: [
                '/resources/directory/bar',
                '/resources/directory/foo'
            ]
        };
        const options = {
            "remove": ['/resources/test']
        };
        update_asset(asset, tmp_workpsace_path, options)
            .then(new_asset => {
                should(new_asset.dependencies).be.eql(asset.dependencies);
                done();
            })
            .catch(done);
    });

});
