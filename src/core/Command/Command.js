'use strict';

const { logger } = require('@micro-app/shared-utils');

const API = Symbol('Command#api');
const OPTIONS = Symbol('Command#options');

class Command {

    static get __isMicroAppCommand() {
        return true;
    }

    constructor(api, opts) {
        this[OPTIONS] = opts;
        this[API] = api;
    }

    get api() {
        return this[API];
    }

    get options() {
        return this[OPTIONS];
    }

    initialize(/* api, opts */) {
        logger.throw(this.name, 'initialize(api, opts) needs to be implemented.');
        return Promise.resolve();
    }
}

module.exports = Command;
