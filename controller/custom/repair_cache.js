/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const crypto = require('crypto');

const Path = require('path').posix;
const chalk = require('chalk');
const ifs = require('../../util/ifs');

const repair_cache_resource = path => new Promise((resolve, reject) => {
    const fd_hash = ifs.createReadStream(path);
    const cache_key = Path.basename(path);
    const hash = crypto.createHash('sha256');
    hash.setEncoding('hex');
    hash.on('error', reject);
    hash.on('finish', () => {
        const read_hash = hash.read();
        resolve(read_hash === cache_key);
    });
    fd_hash.on('error', reject);
    fd_hash.pipe(hash);
})
    .then(is_valid => {
        if (!is_valid) {
            console.info(chalk.yellow(`Removed ${Path.basename(path)} invalid cache resource`));
            return ifs.remove(path)
                .then(() => is_valid);
        } else {
            return is_valid;
        }
    });

module.exports = cache_path => ifs.get_files_recursively(cache_path, [])
    .then(files => Promise.all(files.map(repair_cache_resource)))
    .then(res => {
        console.info(chalk.green(`Repair done with ${res.filter(is_valid => !is_valid).length}/${res.length} corrupted entrie(s)`));
    });
