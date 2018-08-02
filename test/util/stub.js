/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const sinon = require('sinon');
const request = require('request');

module.exports = () => {
    const restore_request = method => {
        request[method].restore();
    };
    const req = (method, err, status_code, body) => {
        sinon
            .stub(request, method)
            .yields(err, { statusCode: status_code }, body);
    };
    return {
        restore_request: restore_request,
        request: req
    };
};
