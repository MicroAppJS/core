'use strict';

const { _, semver, logger, validateSchema, getPadLength, debug } = require('@micro-app/shared-utils');

const CONSTANTS = require('../../Constants');

class BaseAPI {

    constructor(id, service) {
        this.id = id;
        this.service = service || {};

        this.API_TYPE = {
            ADD: Symbol('add'),
            MODIFY: Symbol('modify'),
            EVENT: Symbol('event'),
        };
    }

    get debug() {
        const _debug = debug(`microapp:plugin:${this.id}`);
        Object.defineProperty(this, 'debug', { value: _debug });
        return _debug;
    }

    get logger() {
        const log = logger.newGroup(this.id);
        // create logger that subclasses use
        Object.defineProperty(this, 'logger', {
            value: log,
        });
        return log;
    }

    get version() {
        return this.service.version || CONSTANTS.VERSION;
    }

    setState(key, value) {
        this.service.setState(key, value);
    }

    getState(key, value) {
        return this.service.getState(key, value);
    }

    validateSchema(schema, config) {
        const result = validateSchema(schema, config);
        const padLength = getPadLength(result.map(item => {
            return { name: item.keyword };
        }));
        if (!result.length) return;

        result.forEach(item => {
            this.logger.warn(`${_.padEnd(item.keyword, padLength)} [ ${item.dataPath} ${item.message} ]`);
        });
        this.logger.throw('illegal configuration !!!');
    }

    assertVersion(range) {
        if (typeof range === 'number') {
            if (!Number.isInteger(range)) {
                this.logger.throw('Expected string or integer value.');
            }
            range = `^${range}.0.0-0`;
        }
        if (typeof range !== 'string') {
            this.logger.throw('Expected string or integer value.');
        }

        const version = this.version;

        if (semver.satisfies(version, range)) return;

        if (process.env.MICRO_APP_TEST) {
            this.logger.warn('[test]', `skip assertVersion( ${range} ) !`);
            return;
        }

        this.logger.throw(`Require ${CONSTANTS.SCOPE_NAME}/core "${range}", but was loaded with "${version}".`);
    }
}

module.exports = BaseAPI;
