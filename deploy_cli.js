#!/usr/bin/env node

/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const program = require('commander');
const path = require('path');

const deploy_actions = require('./controller/custom/deploy_asset');
const repair_cache = require('./controller/custom/repair_cache');
const logger = require('./util/log');
const bilrost_starter = require('./util/bilrost_starter');

const config_models = require('./controller/config');

function help() {
    console.info('Bilrost CLI v', program.version());
    program.help();
}

let cache_path, deploy_path, folder_name;

const get_paths = async () => {
    try {
        cache_path = (await config_models.get('CACHE_PATH')).body.replace(/\\/g, '/');
    } catch (err) {
        logger.spawn_error(err);
        process.exit();
    }
    folder_name = path.basename(cache_path);
    deploy_path = cache_path.split(folder_name).join('Deploy');
};

const start_bilrost_if_not_running = callback => {
    return function () {
        const args = Array.from(arguments);
        return bilrost_starter.start_if_not_running(9224, async () => {
            await get_paths();
            return callback.apply(null, args);
        }, program.bilrostOutput)
            .catch(err => {
                if (err) {
                    logger.spawn_error(err);
                }
                process.exit();
            });
    };
};

program
    .version('0.0.1')
    .option('-B, --bilrost-output', 'Display bilrost output');

program
    .command('install')
    .description('Install asset')
    .option('-c, --copy', 'copy content')
    .action(start_bilrost_if_not_running(options => deploy_actions.install('bilrost.json', process.cwd(), deploy_path, options.copy), program.bilrostOutput));

program
    .command('clean')
    .description('Clean previously installed assets')
    .action(start_bilrost_if_not_running(() => deploy_actions.clean(process.cwd()), program.bilrostOutput));

program.command(' -- ');

program
    .command('repair-cache')
    .description('Repair cache')
    .option('-p, --path', 'Cache path since this is customizable in bilrost configurations')
    .action(start_bilrost_if_not_running(options => repair_cache(options.path ? options.path : cache_path), program.bilrostOutput));

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
