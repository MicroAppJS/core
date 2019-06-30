'use strict';

const EventEmitter = require('events').EventEmitter;
const CONSTANTS = require('../config/constants');

class HookEvent extends EventEmitter {
    constructor(app) {
        super();
        this.app = app;
    }

    hooks(name, listener) {
        const { SCOPE_NAME } = CONSTANTS;
        return this.on(`${SCOPE_NAME}:${name}`, listener);
    }
}

module.exports = HookEvent;

