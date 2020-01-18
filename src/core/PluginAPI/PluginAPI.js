'use strict';

const assert = require('assert');
const _ = require('lodash');

const BaseAPI = require('./libs/BaseAPI');
const DEFAULT_METHODS = require('../Service/methods');

class PluginAPI extends BaseAPI {

    constructor(id, service) {
        super(id, service);

        this._addMethods();
    }

    get __isMicroAppPluginAPI() {
        return true;
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
                this.registerMethod(method, {
                    type,
                    description: 'System Build-in',
                });
            }
        });
    }

    register(hook, fn, type) {
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
            type,
        });
    }

    registerMethod(name, opts) {
        assert(typeof name === 'string', 'name must be string.');
        assert(name || /^_/i.test(name), `${name} cannot begin with '_'.`);
        assert(!this[name] || !this.service.extendMethods[name] || !this.service.pluginMethods[name] || !this.service.sharedProps[name], `api.${name} exists.`);
        assert(opts, 'opts must supplied');
        const {
            type,
            apply,
        } = opts;
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
                    }, type);
                } else if (type === this.API_TYPE.ADD) {
                    this.register(name, opts => {
                        return (opts.last || []).concat(
                            typeof args[0] === 'function' ? args[0](opts.last, opts.args) : args[0]
                        );
                    }, type);
                } else if (type === this.API_TYPE.MODIFY) {
                    this.register(name, opts => {
                        return typeof args[0] === 'function' ? args[0](opts.last, opts.args) : args[0];
                    }, type);
                } else if (type === this.API_TYPE.EVENT) {
                    this.register(name, opts => {
                        return args[0](opts.args);
                    }, type);
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

    changeCommandOption(name, newOpts) {
        assert(name, 'name must supplied');
        const command = this.service.commands[name];
        assert(command, `command ${name} not found`);
        let nV = newOpts;
        if (_.isFunction(nV)) {
            const oldOpts = command.opts;
            nV = newOpts(oldOpts);
        }
        if (nV && _.isPlainObject(nV)) {
            command.opts = nV;
            this.logger.debug('[Plugin]', `changeCommandOption( ${name} ); Success!`);
            return true;
        }
        return false;
    }

    extendConfig(name, opts, fn) {
        return this.service.extendConfig(name, opts, fn);
    }

    extendMethod(name, opts, fn) {
        return this.service.extendMethod(name, opts, fn);
    }

    registerPlugin(opts) {
        assert(_.isPlainObject(opts), `opts should be plain object, but got ${opts}`);
        opts = this.service.resolvePlugin(opts);
        if (!opts) return; // error
        const {
            id,
            apply,
        } = opts;
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
        this.logger.debug('[Plugin]', `registerPlugin( ${id} ); Success!`);
    }
}

module.exports = PluginAPI;
