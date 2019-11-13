'use strict';

const { logger } = require('@micro-app/shared-utils');

class Command {

    static get __isMicroAppCommand() {
        return true;
    }

    constructor(api, opts) {
        this.api = api;
        this.opts = opts;
    }

    execute(api, opts) {
        logger.throw(this.name, 'execute() needs to be implemented.');
    }
}

module.exports = Command;
