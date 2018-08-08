/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

"use strict";

const path = require('path');
const recursive = require('recursive-readdir');
const fs = require('fs-extra');

const promisify = require('./promisify');

const get_files_recursively = (path, ignore = []) => promisify(recursive)(path, ignore)
    .then(paths => paths ? paths.map(path => path.replace(/\\/g, '/')) : []);

const pass_not_found = err => err.toString().includes('ENOENT') ? Promise.reject({ code: 1, message: `${path} is not found` }) : Promise.reject(err);

const readdir = path => promisify(fs.readdir)(path)
    .catch(pass_not_found);

const access = path => promisify(fs.access)(path);

const mkdirs = path => promisify(fs.mkdirs)(path);

const remove = path => promisify(fs.remove)(path);

const readJson = path => promisify(fs.readJson)(path);

const createReadStream = path => fs.createReadStream(path);

const outputJson = (path, content) => promisify(fs.outputJson)(path, content);

const outputFile = (path, content) => promisify(fs.outputFile)(path, content);

const is_directory_sync = path => {
    const stats = fs.lstatSync(path);
    return stats.isDirectory();
};

const copy = (origin, dest) => promisify(fs.copy)(origin, dest);

const link = (origin, dest) => promisify(fs.ensureSymlink)(origin, dest);

module.exports = {
    get_files_recursively,
    readdir,
    createReadStream,
    access,
    readJson,
    mkdirs,
    remove,
    copy,
    outputJson,
    outputFile,
    is_directory_sync,
    link
};
