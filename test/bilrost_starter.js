/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

const should = require('should');

const starter = require('../util/bilrost_starter');
const find = require('find-process');

describe('Bilrost starter', function () {

    it('#Start/Stop', function (done) {
        this.timeout(3000);
        starter.start()
            .then(bilrost => {
                return find('name', 'node')
                    .then(tasks => {
                        const process_already_running = tasks.find(task => starter.is_bilrost_command_line(task.cmd));
                        should.exist(process_already_running);
                        bilrost.stop();
                        return find('name', 'node')
                            .then(tasks => {
                                const process_already_running = tasks.find(task => starter.is_bilrost_command_line(task.cmd));
                                should.not.exist(process_already_running);
                                done();
                            });
                    });
            }).catch(done);
    });

    it('#Timeout', done => {
        starter.start(1)
            .then(() => {
                done('Shouldnt pass!');
            })
            .catch(err => {
                if (err === 'Bilrost start timeout') {
                    done();
                } else {
                    done(err);
                }
            });

    });

    it('#Is running', done => {
        starter.start()
            .then(bilrost => {
                return find('name', 'node')
                    .then(tasks => {
                        const process_already_running = tasks.find(task => starter.is_bilrost_command_line(task.cmd));
                        should.exist(process_already_running);
                        return starter.is_running(9224)
                            .then(is_running => {
                                should.equal(is_running, true);
                                bilrost.stop();
                                setTimeout(() => {
                                    starter.is_running(9224)
                                        .then(is_running => {
                                            should.equal(is_running, false);
                                            done();
                                        });
                                }, 5);
                            });
                    });
            }).catch(done);
    });

});
