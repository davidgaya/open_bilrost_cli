/**
* Copyright (C) 2015-2018 Starbreeze AB All Rights Reserved.
*/

'use strict';

module.exports = config => {
    const req = require('../util/req')(config.url);

    const get_all = () => req(
        'get',
        '/config'
    ).then(body => ({ body }));

    const get = name => req(
        'get',
        `/config/${encodeURIComponent(name)}`
    ).then(body => ({ body }));

    const set = (name, value) => req(
        'put',
        `/config/${encodeURIComponent(name)}`,
        {
            body: {
                value
            }
        }
    ).then(() => ({
        message: `${name} config successfully set to ${value}`
    }));

    const del = name => req(
        'del',
        `/config/${encodeURIComponent(name)}`
    ).then(() => ({
        message: `${name} config successfully reset`
    }));

    return {
        get,
        get_all,
        set,
        del
    };
};
