#!/usr/bin/env node

/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const program = require('commander');
const path = require('path').posix;
const os = require('os');

const custom_actions = require('./controller/custom');
const log = require('./util/log');
const bilrost_starter = require('./util/bilrost_starter');

const is_win = /^win/.test(process.platform);

// Create server setting directories if they don't exist
const settings_base_path = (is_win ? path.join(process.env.APPDATA,'/Bilrost') : path.join(os.homedir(), '/Library/Bilrost')).replace(/\\/g, '/');

const deploy_path = path.join(settings_base_path, 'Deploy');
const cache_path = path.join(settings_base_path, 'Cache');

function help() {
    console.info('Bilrost CLI v', program.version());
    program.help();
}

program
    .version('0.0.1')
    .option('-B, --bilrost-output', 'Display bilrost output');

program
    .command('install')
    .description('Install asset')
    .option('-c, --copy', 'copy content')
    .action(options => {
        bilrost_starter.start_if_not_running(9224, () => custom_actions.install_assets('bilrost.json', process.cwd().replace(/\\/g, '/'), deploy_path, options.copy), program.bilrostOutput)
            .catch(err => {
                log.spawn_error(err);
                process.exit();
            });
    });

program.command(' -- ');

program
    .command('repair-cache')
    .description('Repair cache')
    .option('-p, --path', 'Cache path since this is customizable in bilrost configurations')
    .action(options => {
        bilrost_starter.start_if_not_running(9224, () => custom_actions.repair_cache(options.path ? options.path : cache_path), program.bilrostOutput)
            .catch(err => {
                log.spawn_error(err);
                process.exit();
            });
    });

program
    .command('clean')
    .description('Clean previously installed assets')
    .action(options => {
        bilrost_starter.start_if_not_running(9224, () => custom_actions.clean_installed_assets('bilrost.json', process.cwd().replace(/\\/g, '/'), deploy_path), program.bilrostOutput)
            .catch(err => {
                log.spawn_error(err);
                process.exit();

            });
    });

program.command(' -- ');

program
    .command('help')
    .description("display this help.")
    .action(help);

program.parse(process.argv);

if (!program.args.length) {
    help();
}

if (program.output) {
    const winston = require('winston');
    winston.add(winston.transports.File, {
        filename: program.output + '.log'
    });
    console.info = function () {
        winston.info.apply(null, arguments);
    };
    console.error = function () {
        winston.error.apply(null, arguments);
    };
    console.warn = function () {
        winston.warn.apply(null, arguments);
    };
}
