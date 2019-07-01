'use strict';

const noop = new Proxy({}, {
    get() {
        console.warn('[Micro-APP]: <<##HINT##>>');
        return {};
    },
});

module.exports = noop;
