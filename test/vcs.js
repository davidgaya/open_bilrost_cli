/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const should = require('should');

const config = require('../config/am.json');
const vcs = require('../model/vcs')(config);
const stub = require('./util/stub')();

describe('vcs model', function () {

    it('#stage -> ok', function (done) {
        const body = 'Ok';
        stub.request('post', null, 200, body);
        vcs.stage('test', '/assets/test.level')
            .then(output => {
                should.deepEqual({
                    message: '/assets/test.level successfully staged'
                }, output);
                stub.restore_request('post');
                done();
            }).catch(done);
    });

    it('#stage -> wrong status code', function (done) {
        const status_code = 300;
        stub.request('post', null, status_code, {});
        vcs.stage('test', '/assets/test.level')
            .then(done).catch(err => {
                should.equal(err.message.indexOf(status_code.toString()), 0);
                stub.restore_request('post');
                done();
            });
    });

    it('#stage -> spawn error', function (done) {
        const error = new Error('failure');
        stub.request('post', error, {}, {});
        vcs.stage('test', '/assets/test.level')
            .then(done).catch(err => {
                should.deepEqual(err.message, error);
                stub.restore_request('post');
                done();
            });
    });

    it('#subscribe -> ok', function (done) {
        const body = { test: true };
        stub.request('post', null, 200, body);
        vcs.subscribe('test', {})
            .then(output => {
                should.deepEqual({
                    message: 'Successfully subscribed',
                    body: body
                }, output);
                stub.restore_request('post');
                done();
            }).catch(done);
    });

    it('#subscribe -> wrong status code', function (done) {
        const status_code = 300;
        stub.request('post', null, status_code, {});
        vcs.subscribe('test', {})
            .then(done).catch(err => {
                should.equal(err.message.indexOf(status_code.toString()), 0);
                stub.restore_request('post');
                done();
            });
    });

    it('#subscribe -> spawn error', function (done) {
        const error = new Error('failure');
        stub.request('post', error, {}, {});
        vcs.subscribe('test', {})
            .then(done).catch(err => {
                should.deepEqual(err.message, error);
                stub.restore_request('post');
                done();
            });
    });

    it('#unsubscribe -> ok', function (done) {
        const body = 'Ok';
        stub.request('delete', null, 200, body);
        vcs.unsubscribe('test', '#1')
            .then(output => {
                should.deepEqual({
                    message: 'Successfully unsubscribed'
                }, output);
                stub.restore_request('delete');
                done();
            }).catch(done);
    });

    it('#unsubscribe -> wrong status code', function (done) {
        const status_code = 300;
        stub.request('delete', null, status_code, {});
        vcs.unsubscribe('test', '#1')
            .then(done).catch(err => {
                should.equal(err.message.indexOf(status_code.toString()), 0);
                stub.restore_request('delete');
                done();
            });
    });

    it('#unsubscribe -> spawn error', function (done) {
        const error = new Error('failure');
        stub.request('delete', error, {}, {});
        vcs.unsubscribe('test', '#1')
            .then(done).catch(err => {
                should.deepEqual(err.message, error);
                stub.restore_request('delete');
                done();
            });
    });

    it('#push -> ok', function (done) {
        const body = '#1';
        stub.request('post', null, 200, body);
        vcs.push('test', '#1')
            .then(output => {
                should.deepEqual({
                    message: 'Successfully pushed',
                    body: body
                }, output);
                stub.restore_request('post');
                done();
            }).catch(done);
    });

    it('#push -> wrong status code', function (done) {
        const status_code = 300;
        stub.request('post', null, status_code, {});
        vcs.push('test', '#1')
            .then(done).catch(err => {
                should.equal(err.message.indexOf(status_code.toString()), 0);
                stub.restore_request('post');
                done();
            });
    });

    it('#push -> spawn error', function (done) {
        const error = new Error('failure');
        stub.request('post', error, {}, {});
        vcs.push('test', '#1')
            .then(done).catch(err => {
                should.deepEqual(err.message, error);
                stub.restore_request('post');
                done();
            });
    });

    it('#get_status -> ok', function (done) {
        const body = { debug: true };
        stub.request('get', null, 200, body);
        vcs.get_status('test')
            .then(output => {
                should.deepEqual({
                    body: body
                }, output);
                stub.restore_request('get');
                done();
            }).catch(done);
    });

    it('#get_status -> wrong status code', function (done) {
        const status_code = 300;
        stub.request('get', null, status_code, {});
        vcs.get_status('test')
            .then(done).catch(err => {
                should.equal(err.message.indexOf(status_code.toString()), 0);
                stub.restore_request('get');
                done();
            });
    });

    it('#get_status -> spawn error', function (done) {
        const error = new Error('failure');
        stub.request('get', error, {}, {});
        vcs.get_status('test')
            .then(done).catch(err => {
                should.deepEqual(err.message, error);
                stub.restore_request('get');
                done();
            });
    });

    it('#get_subscription_list -> ok', function (done) {
        const body = { debug: true };
        stub.request('get', null, 200, body);
        vcs.get_subscription_list('test')
            .then(output => {
                should.deepEqual({
                    body: body
                }, output);
                stub.restore_request('get');
                done();
            }).catch(done);
    });

    it('#get_subscription_list -> wrong status code', function (done) {
        const status_code = 300;
        stub.request('get', null, status_code, {});
        vcs.get_subscription_list('test')
            .then(done).catch(err => {
                should.equal(err.message.indexOf(status_code.toString()), 0);
                stub.restore_request('get');
                done();
            });
    });

    it('#get_subscription_list -> spawn error', function (done) {
        const error = new Error('failure');
        stub.request('get', error, {}, {});
        vcs.get_subscription_list('test')
            .then(done).catch(err => {
                should.deepEqual(err.message, error);
                stub.restore_request('get');
                done();
            });
    });

    it('#get_status -> ok', function (done) {
        const body = { debug: true };
        stub.request('get', null, 200, body);
        vcs.get_status('test')
            .then(output => {
                should.deepEqual({
                    body: body
                }, output);
                stub.restore_request('get');
                done();
            }).catch(done);
    });

    it('#get_status -> wrong status code', function (done) {
        const status_code = 300;
        stub.request('get', null, status_code, {});
        vcs.get_status('test')
            .then(done).catch(err => {
                should.equal(err.message.indexOf(status_code.toString()), 0);
                stub.restore_request('get');
                done();
            });
    });

    it('#get_status -> spawn error', function (done) {
        const error = new Error('failure');
        stub.request('get', error, {}, {});
        vcs.get_status('test')
            .then(done).catch(err => {
                should.deepEqual(err.message, error);
                stub.restore_request('get');
                done();
            });
    });

});
