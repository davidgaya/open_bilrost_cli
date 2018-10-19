/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const request = require('request');
const Url = require('url');

module.exports = base_url => (method, url, options) => new Promise((resolve, reject) => {
    options = options || {};
    options.headers = options.headers || {};
    options.headers.accept = 'application/json';
    options.url = Url.resolve(base_url, url);
    options.json = true;
    request[method](options, function (err, res, body) {
        const statusCode = res && res.statusCode || 500;
        const isStatusCodeValid = statusCode >= 200 && statusCode < 300;
        if (err || !isStatusCodeValid) {
            reject({
                statusCode,
                message: err || statusCode + ' unexpected status code.',
                body
            });
        } else {
            resolve(body);
        }
    });
});
