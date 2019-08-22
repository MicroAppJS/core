'use strict';

const logger = require('../../utils/logger');

class BaseAPI {

    constructor() {
        this.logger = logger;

        this.API_TYPE = {
            ADD: Symbol('add'),
            MODIFY: Symbol('modify'),
            EVENT: Symbol('event'),
        };
    }
}

module.exports = BaseAPI;
