/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const should = require('should');

const config = require('../config/am.json');
const cb = require('../model/cb')(config);
const stub = require('./util/stub')();

describe('Cb model', function () {

    it('#get_status -> ok', function (done) {
        const body = { debug: true };
        stub.request('get', null, 200, body);
        cb.list_workspace('test')
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
        cb.list_workspace('test')
            .then(done).catch(err => {
                should.equal(err.message.indexOf(status_code.toString()), 0);
                stub.restore_request('get');
                done();
            });
    });

    it('#get_status -> spawn error', function (done) {
        const error = new Error('failure');
        stub.request('get', error, {}, {});
        cb.list_workspace('test')
            .then(done)
            .catch(err => {
                should.deepEqual(err.message, error);
                stub.restore_request('get');
                done();
            });
    });

});
