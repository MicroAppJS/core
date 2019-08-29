'use strict';

const tryRequire = require('try-require');
const assert = require('assert');
const merge = require('webpack-merge');
const _ = require('lodash');

const CONSTANTS = require('../../config/constants');

const requireMicro = require('../../utils/requireMicro');
const logger = require('../../utils/logger');

const serverMerge = require('../../utils/merge-server');
const serverHooksMerge = require('../../utils/merge-server-hooks');
const { injectAliasModule, injectAliasModulePath } = require('../../utils/injectAliasModule');

const PluginAPI = require('./PluginAPI');

const { PreLoadPlugins, SharedProps } = require('./Constants');

// 全局状态集
const GLOBAL_STATE = {};

class Service {
    constructor() {
        // 当前服务
        this.pluginHooks = {};
        this.pluginMethods = {};
        this.commands = {};

        this.selfConfig = this.self.toConfig(true);
        this.selfServerConfig = this.self.toServerConfig(true);
        this.micros = new Set((this.self.micros || []));
        this.microsConfig = this._initMicrosConfig();
        this.microsServerConfig = this._initMicrosServerConfig();

        this.env = {}; // 环境变量
        this.config = {};
        this.serverConfig = {};
        this.state = GLOBAL_STATE; // 状态集

        this.plugins = PreLoadPlugins.map(this.resolvePlugin).filter(item => !!item);
    }

    get version() {
        return CONSTANTS.VERSION;
    }

    get self() {
        const _self = requireMicro.self();
        assert(_self, logger.toString.error('not found "micro-app.config.js"'));
        return _self;
    }

    _initMicrosConfig() {
        const config = {};
        const micros = _.cloneDeep([ ...this.micros ]);
        micros.forEach(key => {
            const microConfig = requireMicro(key);
            if (microConfig) {
                config[key] = microConfig.toConfig(true);
            } else {
                this.micros.delete(key);
                logger.error(`not found micros: "${key}"`);
            }
        });
        config[this.self.key] = this.selfConfig || this.self.toConfig(true);
        return config;
    }

    _initMicrosServerConfig() {
        const config = {};
        const micros = _.cloneDeep([ ...this.micros ]);
        micros.forEach(key => {
            const microConfig = requireMicro(key);
            if (microConfig) {
                config[key] = microConfig.toServerConfig(true);
            } else {
                this.micros.delete(key);
                logger.error(`not found micros: "${key}"`);
            }
        });
        config[this.self.key] = this.selfServerConfig || this.self.toServerConfig(true);
        return config;
    }

    _initDotEnv() {
        const env = process.env.NODE_ENV;
        const dotenv = tryRequire('dotenv');
        if (dotenv) {
            const result = dotenv.config();
            if (result.error) {
                logger.error(result.error);
            } else if (result.parsed) {
                const config = result.parsed;
                if (config.HOSTNAME) { // fixed
                    process.env.HOSTNAME = config.HOSTNAME;
                }
                Object.assign(this.env, config);
                logger.debug('dotenv parsed envs:\n', JSON.stringify(this.env, null, 4));
            }
        } else {
            logger.warn('not found "dotenv"');
        }
        if (env === 'production') { // fixed
            this.env.NODE_ENV = env;
            process.env.NODE_ENV = env;
        }
    }

    registerPlugin(opts) {
        assert(_.isPlainObject(opts), `opts should be plain object, but got ${opts}`);
        assert(opts.link, 'link must supplied');
        assert(typeof opts.link === 'string', 'link must be string');
        opts = this.resolvePlugin(opts);
        const { id, apply } = opts;
        assert(id && apply, 'id and apply must supplied');
        assert(typeof id === 'string', 'id must be string');
        assert(typeof apply === 'function', 'apply must be function');
        assert(
            id.indexOf('built-in:') !== 0,
            'service.registerPlugin() should not register plugin prefixed with "built-in:"'
        );
        this.plugins.push(opts);
        logger.debug(`[Plugin] registerPlugin( ${id} ); Success!`);
    }

    resolvePlugin(item) {
        const { id, link, opts = {} } = item;
        const apply = tryRequire(link);
        if (apply) {
            return {
                ...item,
                apply: apply.default || apply,
                opts,
            };
        }
        logger.warn(`[Plugin] not found plugin: "${id || item}"\n   --> link: "${link}"`);
        return false;
    }

    applyPluginHooks(key, opts = {}) {
        logger.debug(`[Plugin] applyPluginHooks( ${key} )`);
        let defaultOpts = opts;
        try {
            defaultOpts = _.cloneDeep(opts);
        } catch (error) {
            logger.debug(`[Plugin] Plugin: ${key}, _.cloneDeep() error`);
        }
        return (this.pluginHooks[key] || []).reduce((last, { fn }) => {
            try {
                return fn({
                    last,
                    args: defaultOpts,
                });
            } catch (e) {
                logger.error(`[Plugin] Plugin apply failed: ${e.message}`);
                throw e;
            }
        }, opts);
    }

    async applyPluginHooksAsync(key, opts = {}) {
        logger.debug(`[Plugin] applyPluginHooksAsync( ${key} )`);
        let defaultOpts = opts;
        try {
            defaultOpts = _.cloneDeep(opts);
        } catch (error) {
            logger.debug(`[Plugin] Plugin: ${key}, _.cloneDeep() error`);
        }
        const hooks = this.pluginHooks[key] || [];
        let last = opts;
        for (const hook of hooks) {
            const { fn } = hook;
            // eslint-disable-next-line no-await-in-loop
            last = await fn({
                last,
                args: defaultOpts,
            });
        }
        return last;
    }

    _getPlugins() {
        const micros = Array.from(this.micros);
        const plugins = this.selfConfig.plugins || [];
        const allplugins = micros.map(key => {
            return this.microsConfig[key].plugins || [];
        }).concat(plugins);
        const pluginsObj = allplugins.reduce((arr, item) => {
            if (Array.isArray(item)) {
                return arr.concat(item.map(_item => {
                    return this.resolvePlugin(_item);
                }));
            }
            return arr.concat(this.resolvePlugin(item));
        }, []).filter(item => !!item);
        return pluginsObj;
    }

    _initPlugins() {
        this.plugins.push(...this._getPlugins());

        this.plugins.forEach(plugin => {
            this._initPlugin(plugin);
        });

        // Throw error for methods that can't be called after plugins is initialized
        this.plugins.forEach(plugin => {
            Object.keys(plugin._api).forEach(method => {
                if (/^register/i.test(method) || [
                    'onOptionChange',
                ].includes(method)) {
                    plugin._api[method] = () => {
                        throw logger.toString.error(`api.${method}() should not be called after plugin is initialized.`);
                    };
                }
            });
        });

        logger.debug('[Plugin] _initPlugins() End!');
    }

    _initPlugin(plugin) {
        const { id, apply, opts = {} } = plugin;
        assert(typeof apply === 'function',
            logger.toString.error('\n' + `
plugin "${id}" must export a function,
e.g.
    export default function(api) {
        // Implement functions via api
    }`.trim())
        );
        const api = new Proxy(new PluginAPI(id, this), {
            get: (target, prop) => {
                if (typeof prop === 'string' && /^_/i.test(prop)) {
                    return; // ban private
                }
                if (this.pluginMethods[prop]) {
                    return this.pluginMethods[prop].fn;
                }
                if (SharedProps.includes(prop)) {
                    if (typeof this[prop] === 'function') {
                        return this[prop].bind(this);
                    }
                    if (prop === 'micros') {
                        return [ ...this[prop] ];
                    }
                    return this[prop];
                }
                if (prop === 'service') {
                    return new Proxy(target[prop], {
                        get: (_target, _prop) => {
                            if (typeof _prop === 'string' && /^_/i.test(_prop)) {
                                return; // ban private
                            }
                            return _target[_prop];
                        },
                    });
                }
                return target[prop];
            },
        });
        api.onOptionChange = fn => {
            logger.info('onOptionChange...');
            assert(
                typeof fn === 'function',
                `The first argument for api.onOptionChange should be function in ${id}.`
            );
            plugin._onOptionChange = fn;
        };

        apply(api, opts);
        plugin._api = api;
    }

    changePluginOption(id, newOpts = {}) {
        assert(id, 'id must supplied');
        const plugins = this.plugins.filter(p => p.id === id);
        assert(plugins.length > 0, `plugin ${id} not found`);
        plugins.forEach(plugin => {
            const oldOpts = plugin.opts;
            plugin.opts = newOpts;
            if (plugin._onOptionChange) {
                plugin._onOptionChange(newOpts, oldOpts);
            } else {
                logger.warn(`plugin ${id}'s option changed, \n      nV: ${JSON.stringify(newOpts)}, \n      oV: ${JSON.stringify(oldOpts)}`);
            }
        });
        logger.debug(`[Plugin] changePluginOption( ${id}, ${JSON.stringify(newOpts)} ); Success!`);
    }

    registerCommand(name, opts, fn) {
        assert(!this.commands[name], `Command ${name} exists, please select another one.`);
        if (typeof opts === 'function') {
            fn = opts;
            opts = null;
        }
        opts = opts || {};
        this.commands[name] = { fn, opts };
        logger.debug(`[Plugin] registerCommand( ${name} ); Success!`);
    }

    _mergeConfig() {
        const selfConfig = this.selfConfig;
        const micros = Array.from(this.micros);
        const microsConfig = this.microsConfig;
        const finalConfig = merge.smart({}, ...micros.map(key => {
            if (!microsConfig[key]) return {};
            return _.pick(microsConfig[key], [
                'entry',
                'htmls',
                'dlls',
                'alias',
                'resolveAlias',
                'shared',
                'resolveShared',
                'staticPaths',
            ]);
        }), selfConfig);
        Object.assign(this.config, _.cloneDeep(finalConfig));
    }

    _mergeServerConfig() {
        const selfServerConfig = this.selfServerConfig;
        const microsServerConfig = this.microsServerConfig;
        const serverEntrys = serverMerge(...Object.values(microsServerConfig), selfServerConfig);
        const serverHooks = serverHooksMerge(...Object.values(microsServerConfig), selfServerConfig);
        Object.assign(this.serverConfig, {
            ..._.pick(selfServerConfig, [
                'host',
                'port',
            ]),
            contentBase: selfServerConfig.contentBase || selfServerConfig.staticBase,
            entrys: serverEntrys,
            hooks: serverHooks,
        });
    }

    init() {
        this._initDotEnv();
        this._initPlugins();
        this.applyPluginHooks('onPluginInitDone');
        // merge config
        this.applyPluginHooks('beforeMergeConfig', this.config);
        this._mergeConfig();
        this.applyPluginHooks('afterMergeConfig', this.config);

        // 注入全局的别名
        injectAliasModule(this.config.resolveShared);
        injectAliasModulePath(Array.from(this.micros)
            .map(key => this.microsConfig[key])
            .filter(item => item.isOpenSoftLink)
            .map(item => item.nodeModules));

        // merge server
        this.applyPluginHooks('beforeMergeServerConfig', this.serverConfig);
        this._mergeServerConfig();
        this.applyPluginHooks('afterMergeServerConfig', this.serverConfig);

        this.applyPluginHooks('onInitWillDone');
        this.applyPluginHooks('onInitDone');

        logger.debug('[Plugin] init(); Done!');
    }

    run(name = 'help', args) {
        this.init();
        return this.runCommand(name, args);
    }

    runCommand(rawName, rawArgs) {
        logger.debug(`[Plugin] raw command name: ${rawName}, args: `, rawArgs);
        const { name = rawName, args } = this.applyPluginHooks('modifyCommand', {
            name: rawName,
            args: rawArgs,
        });
        logger.debug(`[Plugin] run ${name} with args: `, args);

        const command = this.commands[name];
        if (!command) {
            logger.error(`Command "${name}" does not exists`);
            process.exit(1);
        }

        const { fn, opts } = command;
        this.applyPluginHooks('onRunCommand', {
            name,
            opts,
        });

        return fn(args);
    }

    hasPlugin(id) {
        assert(id, 'id must supplied');
        return this.plugins.some(p => id === p.id);
    }

    findPlugin(id) {
        assert(id, 'id must supplied');
        return this.plugins.find(p => id === p.id);
    }
}

module.exports = Service;
