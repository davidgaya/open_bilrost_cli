/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const chalk = require('chalk');
const prettyjson = require('prettyjson');
const Prettyerror = require('pretty-error');
const pe = new Prettyerror();

const output_json = data => {
    const options = {
        noColor: true
    };
    console.info(chalk.white(prettyjson.render(data, options)));
};

const spawn_error = error => {
    console.error(chalk.red(pe.render(error.body || error)));
};

const spawn_warning = message => {
    console.warn(chalk.yellow(message));
    return message;
};

const spawn_log = entry => {
    console.info(chalk.white(entry));
};

const spawn_success = output => {
    if (output.message) {
        console.info(chalk.green(output.message));
    }
    if (output.body) {
        output_json(output.body);
    }
    return output;
};

module.exports = {
    spawn_error: spawn_error,
    spawn_success: spawn_success,
    spawn_warning: spawn_warning,
    spawn_log: spawn_log
};
