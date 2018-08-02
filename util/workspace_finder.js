/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const walkback = require('walk-back');
//const fs = require('fs-extra');
const _path = require('path');
const file_uri = require('./file_uri');

module.exports = base_path => {
    const internal_path = walkback(base_path, '.bilrost');
    if (internal_path) {
        const workspace_path = _path.resolve(internal_path, '..');
        return file_uri(workspace_path);
    }
};
