'use strict';

const { _, semver, logger, validateSchema, getPadLength, debug } = require('@micro-app/shared-utils');

const CONSTANTS = require('../../Constants');
const PRIVATE_SERVICE = Symbol.for('PluginAPI#service');

/** @typedef {import("../../Service")} Service */

class BaseAPI {

    /**
     * @param {string} id plugin id
     * @param {Service} service service
     */
    constructor(id, service = {}) {
        this.API_TYPE = _.cloneDeep(CONSTANTS.API_TYPE);
        this[PRIVATE_SERVICE] = service;

        this.id = id;

        CONSTANTS.SHARED_PROPS.forEach(key => {
            Object.defineProperty(this, key, {
                get: () => {
                    if ([ 'micros' ].includes(key)) {
                        return _.cloneDeep(service[key]);
                    }
                    const val = service[key];
                    if (_.isFunction(val)) {
                        return val.bind(service);
                    }
                    return val;
                },
                enumerable: true,
            });
        });
    }

    get service() {
        const target = this[PRIVATE_SERVICE];
        return new Proxy(target, {
            get: (_target, _prop) => {
                if (typeof _prop === 'string' && /^_/i.test(_prop)) {
                    return; // ban private
                }
                return _target[_prop];
            },
        });
    }

    get context() { // cmd
        return this[PRIVATE_SERVICE].context;
    }

    get version() {
        return this[PRIVATE_SERVICE].version || CONSTANTS.VERSION;
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

    setState(key, value) {
        this[PRIVATE_SERVICE].setState(key, value);
    }

    getState(key, value) {
        return this[PRIVATE_SERVICE].getState(key, value);
    }

    validateSchema(schema, config) {
        const result = validateSchema(schema, config);
        const padLength = getPadLength(result.map(item => {
            return { name: item.keyword };
        }));
        if (!result.length) return;

        result.forEach(item => {
            this.logger.warn('[core]', `${_.padEnd(item.keyword, padLength)} [ ${item.dataPath} ${item.message} ]`);
        });
        this.logger.throw('[core]', 'illegal configuration !!!');
    }

    assertVersion(range) {
        if (typeof range === 'number') {
            if (!Number.isInteger(range)) {
                this.logger.throw('[core]', 'Expected string or integer value.');
            }
            range = `^${range}.0.0-0`;
        }
        if (typeof range !== 'string') {
            this.logger.throw('[core] ', 'Expected string or integer value.');
        }

        let version = this.version;
        // 忽略 alpha、next、rc
        [ /-alpha.*/i, /-next.*/i, /-rc.*/i ].forEach(regex => {
            version = version.replace(regex, '');
        });

        if (semver.satisfies(version, range)) return;

        if (process.env.MICRO_APP_TEST) {
            this.logger.warn('[test]', `skip assertVersion( ${range} ) !`);
            return;
        }

        this.logger.throw('[core]', `Require ${CONSTANTS.SCOPE_NAME}/core "${range}", but was loaded with "${version}".`);
    }
}

module.exports = BaseAPI;
