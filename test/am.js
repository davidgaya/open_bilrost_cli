/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const should = require('should');

const config = require('../config/am.json');
const am = require('../model/am')(config);
const stub = require('./util/stub')();

describe('Am model', function () {

    it('#add_workspace_to_favorite -> ok', function (done) {
        const body = { name: 'test'};
        stub.request('post', null, 200, body);
        am.add_workspace_to_favorite('test')
            .then(output => {
                should.deepEqual({
                    body: body,
                    message: 'test successfully added'
                }, output);
                stub.restore_request('post');
                done();
            }).catch(done);
    });

    it('#add_workspace_to_favorite -> wrong status code', function (done) {
        const status_code = 300;
        stub.request('post', null, status_code, {});
        am.add_workspace_to_favorite('test')
            .then(done).catch(err => {
                should.equal(err.message.indexOf(status_code.toString()), 0);
                stub.restore_request('post');
                done();
            });
    });

    it('#add_workspace_to_favorite -> spawn error', function (done) {
        const error = new Error('failure');
        stub.request('post', error, {}, {});
        am.add_workspace_to_favorite('test')
            .then(done).catch(err => {
                should.deepEqual(err.message, error);
                stub.restore_request('post');
                done();
            });
    });

    it('#forget_workspace_in_favorite -> ok', function (done) {
        const body = 'Ok';
        stub.request('delete', null, 200, body);
        am.forget_workspace_in_favorite('test')
            .then(output => {
                should.deepEqual({
                    message: 'Successfully forgotten'
                }, output);
                stub.restore_request('delete');
                done();
            }).catch(done);
    });

    it('#forget_workspace_in_favorite -> wrong status code', function (done) {
        const status_code = 300;
        stub.request('delete', null, status_code, {});
        am.forget_workspace_in_favorite('test')
            .then(done).catch(err => {
                should.equal(err.message.indexOf(status_code.toString()), 0);
                stub.restore_request('delete');
                done();
            });
    });

    it('#forget_workspace_in_favorite -> spawn error', function (done) {
        const error = new Error('failure');
        stub.request('delete', error, {}, {});
        am.forget_workspace_in_favorite('test')
            .then(done).catch(err => {
                should.deepEqual(err.message, error);
                stub.restore_request('delete');
                done();
            });
    });

    it('#create_workspace -> ok', function (done) {
        const body = { name: 'test' };
        stub.request('post', null, 200, body);
        am.create_workspace({})
            .then(output => {
                should.deepEqual({
                    message: 'test successfully created',
                    body: body
                }, output);
                stub.restore_request('post');
                done();
            }).catch(done);
    });

    it('#create_workspace -> wrong status code', function (done) {
        const status_code = 300;
        stub.request('post', null, status_code, {});
        am.create_workspace('test')
            .then(done).catch(err => {
                should.equal(err.message.indexOf(status_code.toString()), 0);
                stub.restore_request('post');
                done();
            });
    });

    it('#create_workspace -> spawn error', function (done) {
        const error = new Error('failure');
        stub.request('post', error, {}, {});
        am.create_workspace('test')
            .then(done).catch(err => {
                should.deepEqual(err.message, error);
                stub.restore_request('post');
                done();
            });
    });

    it('#delete_workspace -> ok', function (done) {
        const body = 'Ok';
        stub.request('delete', null, 200, body);
        am.delete_workspace({})
            .then(output => {
                should.deepEqual({
                    message: 'Successfully deleted'
                }, output);
                stub.restore_request('delete');
                done();
            }).catch(done);
    });

    it('#delete_workspace -> wrong status code', function (done) {
        const status_code = 300;
        stub.request('delete', null, status_code, {});
        am.delete_workspace('test')
            .then(done).catch(err => {
                should.equal(err.message.indexOf(status_code.toString()), 0);
                stub.restore_request('delete');
                done();
            });
    });

    it('#delete_workspace -> spawn error', function (done) {
        const error = new Error('failure');
        stub.request('delete', error, {}, {});
        am.delete_workspace('test')
            .then(done).catch(err => {
                should.deepEqual(err.message, error);
                stub.restore_request('delete');
                done();
            });
    });

    it('#create_asset -> ok', function (done) {
        const asset_ref = '/assets/test';
        const body = { test: true };
        stub.request('put', null, 200, body);
        am.create_asset('test', asset_ref, {})
            .then(output => {
                should.deepEqual({
                    message: asset_ref + ' successfully created',
                    body: body
                }, output);
                stub.restore_request('put');
                done();
            }).catch(done);
    });

    it('#create_asset -> wrong status code', function (done) {
        const asset_ref = '/assets/test';
        const status_code = 300;
        stub.request('put', null, status_code, {});
        am.create_asset('test', asset_ref, {})
            .then(done).catch(err => {
                should.equal(err.message.indexOf(status_code.toString()), 0);
                stub.restore_request('put');
                done();
            });
    });

    it('#create_asset -> spawn error', function (done) {
        const asset_ref = '/assets/test';
        const error = new Error('failure');
        stub.request('put', error, {}, {});
        am.create_asset('test', asset_ref, {})
            .then(done).catch(err => {
                should.deepEqual(err.message, error);
                stub.restore_request('put');
                done();
            });
    });

    it('#rename_asset -> ok', function (done) {
        const body = { new: '/assets/new' };
        stub.request('post', null, 200, body);
        am.rename_asset({})
            .then(output => {
                should.deepEqual(output.body, body);
                stub.restore_request('post');
                done();
            }).catch(done);
    });

    it('#rename_asset -> wrong status code', function (done) {
        const status_code = 300;
        stub.request('post', null, status_code, {});
        am.rename_asset('test')
            .then(done).catch(err => {
                should.equal(err.message.indexOf(status_code.toString()), 0);
                stub.restore_request('post');
                done();
            });
    });

    it('#rename_asset -> spawn error', function (done) {
        const error = new Error('failure');
        stub.request('post', error, {}, {});
        am.rename_asset('test')
            .then(done).catch(err => {
                should.deepEqual(err.message, error);
                stub.restore_request('post');
                done();
            });
    });

    it('#delete_asset -> ok', function (done) {
        const body = 'Ok';
        stub.request('delete', null, 200, body);
        am.delete_asset({})
            .then(output => {
                should.deepEqual({
                    message: 'Successfully deleted'
                }, output);
                stub.restore_request('delete');
                done();
            }).catch(done);
    });

    it('#delete_asset -> wrong status code', function (done) {
        const status_code = 300;
        stub.request('delete', null, status_code, {});
        am.delete_asset('test')
            .then(done).catch(err => {
                should.equal(err.message.indexOf(status_code.toString()), 0);
                stub.restore_request('delete');
                done();
            });
    });

    it('#delete_asset -> spawn error', function (done) {
        const error = new Error('failure');
        stub.request('delete', error, {}, {});
        am.delete_asset('test')
            .then(done).catch(err => {
                should.deepEqual(err.message, error);
                stub.restore_request('delete');
                done();
            });
    });

    it('#list_asset -> ok', function (done) {
        const body = { debug: true };
        stub.request('get', null, 200, body);
        am.list_asset(body)
            .then(output => {
                should.deepEqual(body, output.body);
                stub.restore_request('get');
                done();
            }).catch(done);
    });

    it('#list_asset -> wrong status code', function (done) {
        const status_code = 300;
        stub.request('get', null, status_code, {});
        am.list_asset('test')
            .then(done).catch(err => {
                should.equal(err.message.indexOf(status_code.toString()), 0);
                stub.restore_request('get');
                done();
            });
    });

    it('#list_asset -> spawn error', function (done) {
        const error = new Error('failure');
        stub.request('get', error, {}, {});
        am.list_asset('test')
            .then(done).catch(err => {
                should.deepEqual(err.message, error);
                stub.restore_request('get');
                done();
            });
    });

    it('#update_asset -> ok', function (done) {
        const asset_ref = '/assets/test';
        const body = {
            meta: {
                modified: '12:03:2016'
            }
        };
        stub.request('get', null, 200, body);
        stub.request('put', null, 200, body);
        am.update_asset('test', asset_ref, {})
            .then(output => {
                should.deepEqual({
                    message: asset_ref + ' successfully updated',
                    body: body
                }, output);
                stub.restore_request('put');
                stub.restore_request('get');
                done();
            }).catch(done);
    });

    it('#update_asset -> wrong status code', function (done) {
        const asset_ref = '/assets/test';
        const body = {
            meta: {
                modified: '12:03:2016'
            }
        };
        stub.request('get', null, 200, body);
        const status_code = 300;
        stub.request('put', null, status_code, {});
        am.update_asset('test', asset_ref, {})
            .then(done).catch(err => {
                should.equal(err.message.indexOf(status_code.toString()), 0);
                stub.restore_request('put');
                stub.restore_request('get');
                done();
            });
    });

    it('#update_asset -> spawn error', function (done) {
        const asset_ref = '/assets/test';
        const error = new Error('failure');
        const body = {
            meta: {
                modified: '12:03:2016'
            }
        };
        stub.request('get', null, 200, body);
        stub.request('put', error, {}, {});
        am.update_asset('test', asset_ref, {})
            .then(done).catch(err => {
                should.deepEqual(err.message, error);
                stub.restore_request('put');
                stub.restore_request('get');
                done();
            });
    });

});
