/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

"use strict";

const pretty_ms = require('pretty-ms');

const timestamp = () => new Date().getTime();

module.exports = start => {
    const time = start ? start : timestamp();
    return () => pretty_ms(timestamp() - time);
};
