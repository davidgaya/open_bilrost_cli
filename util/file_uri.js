/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const file_url = require('file-url');

module.exports = (path, is_win = /^win/.test(process.platform)) => {
    if (is_win) {
        const disk_letter = path[0];
        if (disk_letter === disk_letter.toLowerCase()) {
            path = disk_letter.toUpperCase() + path.substr(1, path.length - 1);
        }
    }
    return file_url(path, { resolve: false });
};
