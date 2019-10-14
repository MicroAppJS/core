'use strict';

const tryRequire = require('try-require');
const assert = require('assert');
const _ = require('lodash');

const BaseService = require('./base/BaseService');

const logger = require('../../src/utils/logger');
const virtualFile = require('../../src/utils/virtualFile');
const smartMerge = require('../../src/utils/smartMerge');

const moduleAlias = require('../../src/utils/injectModuleAlias');

const PluginAPI = require('./PluginAPI');

const { PreLoadPlugins } = require('./constants');

class Service extends BaseService {
    constructor() {
        super();
        this.initialized = false;

        // fixed soft link - node_modules 不统一
        this.__initInjectAliasModule__();

        this.plugins = PreLoadPlugins.reduce((arr, item) => {
            return arr.concat(this.resolvePlugin(item));
        }, []).filter(item => !!item);
        this.extraPlugins = []; // 临时存储扩展模块
    }

    __initInjectAliasModule__() {
        moduleAlias.addPath(this.self.nodeModules);
        // 注入 custom node_modules
        const microsExtraConfig = this.microsExtraConfig;
        moduleAlias.addPaths(Array.from(this.micros)
            .map(key => this.microsConfig[key])
            .filter(item => item.hasSoftLink && !!microsExtraConfig[item.key].link)
            .map(item => item.nodeModules));
    }

    _getPlugins() {
        const micros = Array.from(this.micros);
        const plugins = this.selfConfig.plugins || [];
        const allplugins = micros.map(key => {
            return this.microsConfig[key].plugins || [];
        }).concat(plugins);
        const pluginsObj = allplugins.reduce((arr, item) => {
            if (Array.isArray(item)) {
                return arr.concat(item.reduce((_arr, _item) => {
                    return _arr.concat(this.resolvePlugin(_item));
                }, []));
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

        let count = 0;
        while (this.extraPlugins.length) {
            const extraPlugins = _.cloneDeep(this.extraPlugins);
            this.extraPlugins = [];
            extraPlugins.forEach(plugin => {
                this._initPlugin(plugin);
                this.plugins.push(plugin);
            });
            count += 1;
            assert(count <= 10, '插件注册死循环？');
        }

        // TODO 排序重组, reload();


        // 过滤掉没有初始化的 plugin
        this.plugins = this.plugins.filter(plugin => !!plugin._api);

        // Throw error for methods that can't be called after plugins is initialized
        this.plugins.forEach(plugin => {
            Object.keys(plugin._api).forEach(method => {
                if (/^register/i.test(method) || [
                    'onOptionChange',
                ].includes(method)) {
                    plugin._api[method] = () => {
                        logger.throw(`api.${method}() should not be called after plugin is initialized.`);
                    };
                }
            });
        });

        logger.debug('[Plugin] _initPlugins() End!');
    }

    _initPlugin(plugin) {
        const { id, apply, opts = {}, mode } = plugin;
        if (mode) { // 默认为全支持
            let _mode = mode;
            if (_.isFunction(_mode)) { // 支持方法判断
                _mode = _mode(this.mode);
            }
            if (Array.isArray(_mode)) {
                if (!_mode.some(item => item === this.mode)) {
                    // 当前模式与插件不匹配
                    logger.warn(`[Plugin] { ${this.mode} } - initPlugin() skip "${id}".  support modes: { ${_mode.join(', ')} }`);
                    return;
                }
            } else if (_mode !== this.mode) {
                // 当前模式与插件不匹配
                logger.warn(`[Plugin] { ${this.mode} } - initPlugin() skip "${id}". support mode: { ${_mode} }`);
                return;
            }
        }
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
                if (this.extendConfigs[prop]) { // 立即执行, 返回结果(支持 cache 缓存).
                    const obj = this.extendConfigs[prop];
                    if (obj.cache === true && !_.isUndefined(obj.__cache__)) {
                        return obj.__cache__;
                    }
                    const _result = obj.fn.call(this);
                    if (obj.cache === true) {
                        obj.__cache__ = _result;
                    }
                    return _result;
                }
                if (this.extendMethods[prop]) {
                    return this.extendMethods[prop].fn;
                }
                if (this.pluginMethods[prop]) {
                    return this.pluginMethods[prop].fn;
                }
                if (this.sharedProps[prop]) {
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

    _mergeConfig() {
        const selfConfig = this.selfConfig;
        const micros = Array.from(this.micros);
        const microsConfig = this.microsConfig;
        const finalConfig = smartMerge({}, ...micros.map(key => {
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

    registerPlugin(opts) {
        assert(_.isPlainObject(opts), `opts should be plain object, but got ${opts}`);
        opts = this.resolvePlugin(opts);
        if (!opts) return; // error
        if (Array.isArray(opts)) {
            return opts.map(this.registerPlugin);
        }
        const { id, apply } = opts;
        assert(id && apply, 'id and apply must supplied');
        assert(typeof id === 'string', 'id must be string');
        assert(typeof apply === 'function', 'apply must be function');
        assert(
            id.indexOf('built-in:') !== 0,
            'service.registerPlugin() should not register plugin prefixed with "built-in:"'
        );
        assert(
            [ 'id', 'apply', 'opts' ].every(key => Object.keys(opts).includes(key)),
            'Only id, apply and opts is valid plugin properties'
        );
        this.plugins.push(opts);
        logger.debug(`[Plugin] registerPlugin( ${id} ); Success!`);
    }

    /**
     * 分解插件参数
     *
     * @param {Object} item 参数
     * @return {Boolean|Object|Array<Object>} false-失效的
     * @memberof Service
     */
    resolvePlugin(item) {
        const { id, opts = {} } = item;
        assert(id, 'id must supplied');
        assert(typeof id === 'string', 'id must be string');
        if (item.apply && _.isFunction(item.apply)) {
            return {
                ...item,
                opts,
            };
        }
        let link = item.link;
        if (!link) {
            link = tryRequire.resolve(id);
        }
        if (link) {
            // 先尝试从模拟缓存中找文件
            const apply = virtualFile.require(link) || tryRequire(link);
            if (apply) {
                const _apply = apply.default || apply;
                if (Array.isArray(_apply)) { // 支持数组模式
                    return _apply.map(_applyItem => {
                        if (_applyItem) {
                            const defaultConfig = _applyItem.configuration || {};
                            return Object.assign({}, defaultConfig, {
                                ...item,
                                link: require.resolve(link),
                                apply: _applyItem,
                                opts,
                            });
                        }
                        return false;
                    }).filter(_it => !!_it);
                }
                const defaultConfig = apply.configuration || {};
                return Object.assign({}, defaultConfig, {
                    ...item,
                    link: require.resolve(link),
                    apply: _apply,
                    opts,
                });
            }
        }
        logger.warn(`[Plugin] not found plugin: "${id || item}"\n   --> link: "${link}"`);
        return false;
    }

    applyPluginHooks(key, opts = {}) {
        logger.debug(`[Plugin] applyPluginHooks( ${key} )`);
        const defaultOpts = opts;
        // try {
        //     defaultOpts = _.cloneDeep(opts);
        // } catch (error) {
        //     logger.debug(`[Plugin] Plugin: ${key}, _.cloneDeep() error`);
        // }
        return (this.pluginHooks[key] || []).reduce((last, { fn }) => {
            try {
                return fn({
                    last,
                    args: defaultOpts,
                });
            } catch (e) {
                logger.throw(`[Plugin] Plugin apply failed: ${e.message}`);
            }
            return last;
        }, opts);
    }

    async applyPluginHooksAsync(key, opts = {}) {
        logger.debug(`[Plugin] applyPluginHooksAsync( ${key} )`);
        const defaultOpts = opts;
        // try {
        //     defaultOpts = _.cloneDeep(opts);
        // } catch (error) {
        //     logger.debug(`[Plugin] Plugin: ${key}, _.cloneDeep() error`);
        // }
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

    init() {
        if (this.initialized) {
            return;
        }

        this._initDotEnv();
        this._initPlugins();

        this.initialized = true; // 再此之前可重新 init

        this.applyPluginHooks('onPluginInitDone');
        // merge config
        this.applyPluginHooks('beforeMergeConfig', this.config);
        this._mergeConfig();
        this.applyPluginHooks('afterMergeConfig', this.config);
        this.config = this.applyPluginHooks('modifyDefaultConfig', this.config);

        // 注入全局的别名
        moduleAlias.add(this.config.resolveShared);

        this.applyPluginHooks('onInitWillDone');
        this.applyPluginHooks('onInitDone');

        logger.debug('[Plugin] init(); Done!');
    }

    run(name = 'help', args) {
        this.init();
        return this.runCommand(name, args);
    }

    runCommand(rawName, rawArgs = { _: [] }) {
        logger.debug(`[Plugin] raw command name: ${rawName}, args: `, rawArgs);
        const { name = rawName, args } = this.applyPluginHooks('modifyCommand', {
            name: rawName,
            args: rawArgs,
        });
        logger.debug(`[Plugin] run ${name} with args: `, args);

        const command = this.commands[name];
        if (!command) {
            logger.error(`Command "${name}" does not exists`);
            return this.runCommand('help', { _: [] });
        }

        const { fn, opts } = command;
        this.applyPluginHooks('onRunCommand', {
            name,
            args,
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
