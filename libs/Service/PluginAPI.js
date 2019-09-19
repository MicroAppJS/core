'use strict';

const assert = require('assert');
const _ = require('lodash');
const semver = require('semver');

const BaseAPI = require('./BaseAPI');
const DEFAULT_METHODS = require('./methods');
const { SharedProps } = require('./Constants');

const logger = require('../../utils/logger');

class PluginAPI extends BaseAPI {

    constructor(id, service) {
        super();
        this.id = id;
        this.service = service;

        this._addMethods();
    }

    _addMethods() {
        DEFAULT_METHODS.forEach(method => {
            if (Array.isArray(method)) {
                this.registerMethod(...method);
            } else {
                let type;
                const isPrivate = /^_/i.test(method);
                const slicedMethod = isPrivate ? method.slice(1) : method;
                if (slicedMethod.indexOf('modify') === 0) {
                    type = this.API_TYPE.MODIFY;
                } else if (slicedMethod.indexOf('add') === 0) {
                    type = this.API_TYPE.ADD;
                } else if (
                    slicedMethod.indexOf('on') === 0 ||
                  slicedMethod.indexOf('before') === 0 ||
                  slicedMethod.indexOf('after') === 0
                ) {
                    type = this.API_TYPE.EVENT;
                } else {
                    throw new Error(`unexpected method name ${method}`);
                }
                this.registerMethod(method, { type, description: 'System Build-in' });
            }
        });
    }

    assertVersion(range) {
        const version = this.service.version;
        if (typeof range === 'number') {
            if (!Number.isInteger(range)) {
                throw new Error('Expected string or integer value.');
            }
            range = `^${range}.0.0-0`;
        }
        if (typeof range !== 'string') {
            throw new Error('Expected string or integer value.');
        }

        if (semver.satisfies(version, range)) return;

        throw new Error(
            `Require @micro-app/core "${range}", but was loaded with "${version}".`
        );
    }

    setState(key, value) {
        this.service.state[key] = value;
    }

    getState(key, value) {
        return this.service.state[key] || value;
    }

    register(hook, fn) {
        assert(
            typeof hook === 'string',
            `The first argument of api.register() must be string, but got ${hook}`
        );
        assert(
            typeof fn === 'function',
            `The second argument of api.register() must be function, but got ${fn}`
        );
        const { pluginHooks } = this.service;
        pluginHooks[hook] = pluginHooks[hook] || [];
        pluginHooks[hook].push({
            fn,
        });
    }

    registerMethod(name, opts) {
        assert(typeof name === 'string', 'name must be string.');
        assert(name || /^_/i.test(name), `${name} cannot begin with '_'.`);
        assert(!this[name] || !this.service.extendMethods[name] || !this.service.pluginMethods[name] || !SharedProps.includes(name), `api.${name} exists.`);
        assert(opts, 'opts must supplied');
        const { type, apply } = opts;
        assert(!(type && apply), 'Only be one for type and apply.');
        assert(type || apply, 'One of type and apply must supplied.');

        const params = Object.keys(opts).reduce((obj, key) => {
            if (key === 'apply' || key === 'fn') return obj;
            obj[key] = opts[key];
            return obj;
        }, {});

        this.service.pluginMethods[name] = {
            fn: (...args) => {
                if (apply) {
                    this.register(name, opts => {
                        return apply(opts, ...args);
                    });
                } else if (type === this.API_TYPE.ADD) {
                    this.register(name, opts => {
                        return (opts.last || []).concat(
                            typeof args[0] === 'function' ? args[0](opts.last, opts.args) : args[0]
                        );
                    });
                } else if (type === this.API_TYPE.MODIFY) {
                    this.register(name, opts => {
                        return typeof args[0] === 'function' ? args[0](opts.last, opts.args) : args[0];
                    });
                } else if (type === this.API_TYPE.EVENT) {
                    this.register(name, opts => {
                        return args[0](opts.args);
                    });
                } else {
                    throw new Error(`unexpected api type ${type}`);
                }
            },
            ...params,
        };
    }

    registerCommand(name, opts, fn) {
        return this.service.registerCommand(name, opts, fn);
    }

    extendMethod(name, fn) {
        return this.service.extendMethod(name, fn);
    }

    registerPlugin(opts) {
        assert(_.isPlainObject(opts), `opts should be plain object, but got ${opts}`);
        opts = this.service.resolvePlugin(opts);
        if (!opts) return; // error
        const { id, apply } = opts;
        assert(id && apply, 'id and apply must supplied');
        assert(typeof id === 'string', 'id must be string');
        assert(typeof apply === 'function', 'apply must be function');
        assert(
            id.indexOf('built-in:') !== 0,
            'api.registerPlugin() should not register plugin prefixed with built-in:'
        );
        assert(
            [ 'id', 'apply', 'opts' ].every(key => Object.keys(opts).includes(key)),
            'Only id, apply and opts is valid plugin properties'
        );
        this.service.extraPlugins.push(opts);
        logger.debug(`[Plugin] registerPlugin( ${id} ); Success!`);
    }
}

module.exports = PluginAPI;
