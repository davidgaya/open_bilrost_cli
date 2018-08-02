/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const path = require('path');
const detect = require('detect-port');
const spawn = require('child_process').spawn;

const log = require('../util/log');
const promisify = require('../util/promisify');

const proxy_absolute_path = path.join(__dirname, '..', 'node_modules', 'open_bilrost', 'bin', 'start.js');

const is_bilrost_command_line = cmdline => {
    const trimed_cmdline = cmdline.trim();
    const is_node = !!+~trimed_cmdline.indexOf('node'); // jshint ignore:line
    const is_proxy = !!+~trimed_cmdline.indexOf('start.js'); // jshint ignore:line
    return is_node && is_proxy;
};

const external_service = {
    start: (script_absolute_path, verbose) => {
        const stream = spawn("node", [script_absolute_path]);
        if (verbose) {
            stream.stdout.on('data', data => {
                let line = data.toString();
                try {
                    line = JSON.parse(line).msg;
                } catch(err) {}
                log.spawn_log(line);

            });
        }
        return {
            stdout: stream.stdout,
            stderr: stream.stderr,
            stop: () => {
                stream.stdin.pause();
                stream.stdout.pause();
                stream.stderr.pause();
                stream.kill();
            }
        };
    }
};

const default_timeout = 3000;
const log_done_start_trigger = 'Bilrost started';

const starter = {
    is_running: (port, verbose) => promisify(detect)(port)
        .then(_port => {
            if (port === _port) {
                return false;
            } else {
                if (verbose) {
                    log.spawn_warning('Bilrost on port ' + port + ' is already running');
                }
                return true;
            }
        }),
    start: (timeout, verbose) => new Promise((resolve, reject) => {
        const external = external_service.start(proxy_absolute_path, verbose);
        const stop = () => {
            external.stop();
        };
        const timer = setTimeout(() => {
            stop();
            reject('Bilrost start timeout');
        }, timeout ? timeout : default_timeout);
        external.stdout.on('data', data => {
            const output = data.toString('utf8');
            const is_done = ~output.indexOf(log_done_start_trigger);
            if (is_done) {
                clearTimeout(timer);
                resolve({
                    stop: stop
                });
            }
        });
    }),
    start_if_not_running: (port, lazy_prom, verbose) => starter.is_running(port, verbose)
        .then(is_running => {
            if (is_running) {
                return lazy_prom();
            } else {
                let external;
                return starter.start(port, verbose)
                    .then(ext => {
                        external = ext;
                        return lazy_prom();
                    })
                    .then(() => {
                        external.stop();
                    });
            }
        }),
    is_bilrost_command_line: is_bilrost_command_line
};

module.exports = starter;
