/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const chalk = require('chalk');
const prettyjson = require('prettyjson');

const no_color_options = {
    noColor: true
};

const output_json = data => {
    console.info(chalk.white(prettyjson.render(data, no_color_options)));
};

const spawn_error = error => {
    if (error.statusCode) {
        delete error.statusCode;
    }
    console.error(chalk.red(prettyjson.render(error, no_color_options)));
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
