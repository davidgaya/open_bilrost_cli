/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const should = require('should');

const file_uri = require('../util/file_uri');

const check = (is_win, path, expected_file_uri, done) => {
    const uri = file_uri(path, is_win);
    should.equal(uri, expected_file_uri);
    done();
};

describe('File uri util', function () {

    it('/Users/test -> file:///Users/test', done => check(false, '/Users/test', 'file:///Users/test', done));

    it('C:\\test -> file:///C:/test', done => check(true, 'C:\\test', 'file:///C:/test', done));

    it('c:\\test -> file:///C:/test', done => check(true, 'c:\\test', 'file:///C:/test', done));

});
