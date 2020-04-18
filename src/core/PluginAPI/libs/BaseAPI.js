'use strict';

const { _, semver, logger, debug, tryRequire } = require('@micro-app/shared-utils');

const validateSchema = require('../../../utils/validateSchema');
const CONSTANTS = require('../../Constants');

const { SHARED_PROPS } = CONSTANTS;
const PRIVATE_SERVICE = Symbol.for('PluginAPI#service');

/** @typedef {import("../../Service")} Service */

class BaseAPI {

    /**
     * @param {string} id plugin id
     * @param {Service} service service
     */
    constructor(id, service = {}) {
        this[PRIVATE_SERVICE] = service;

        this.id = id;

        SHARED_PROPS.forEach(key => {
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
            get: (_target, name, property) => {
                return Reflect.get(_target, name, property);
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
        return this[PRIVATE_SERVICE].setState(key, value);
    }

    getState(key, value) {
        return this[PRIVATE_SERVICE].getState(key, value);
    }

    validateSchema(schema, config) {
        return validateSchema(schema, config);
    }

    assertVersion(range, pkgName) {
        if (typeof range === 'number') {
            if (!Number.isInteger(range)) {
                this.logger.throw('[assertVersion]', 'Expected string or integer value.');
            }
            range = `^${range}.0.0-0`;
        }
        if (typeof range !== 'string') {
            this.logger.throw('[assertVersion] ', 'Expected string or integer value.');
        }

        let version = this.version;
        if (pkgName && typeof pkgName === 'string') {
            const pkg = tryRequire(`${pkgName}/${CONSTANTS.PACKAGE_JSON}`);
            if (!pkg) {
                this.logger.throw('[assertVersion]', `Not Found ${pkgName}.`);
            }
            version = pkg.version;
        }
        // 忽略 alpha、next、rc
        [ /-alpha.*/i, /-next.*/i, /-rc.*/i ].forEach(regex => {
            version = version.replace(regex, '');
        });

        if (semver.satisfies(version, range)) return;

        if (process.env.MICRO_APP_TEST) {
            this.logger.warn('[test]', `skip assertVersion( ${range} ) !`);
            return;
        }

        this.logger.throw('[assertVersion]', `Require ${pkgName} "${range}", but was loaded with "${version}".`);
    }
}

module.exports = BaseAPI;
