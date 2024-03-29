'use strict';

const { logger, _, assert, tryRequire, virtualFile, dedent, yUnParser } = require('@micro-app/shared-utils');

const MethodService = require('./MethodService');
const PluginAPI = require('../../PluginAPI');
const DEFAULT_METHODS = require('../methods');
const PreLoadPlugins = require('../../../plugins/register');
const { API_TYPE, SHARED_PROPS: { BEFORE_INIT_METHODS } } = require('../../Constants');
const parsePlugin = require('../../../utils/parsePlugin');

const SYMBOL_BEFORE_INIT_METHODS = Symbol('$$beforeInitMethods$$');

class PluginService extends MethodService {
    constructor(context) {
        super(context);
        this.API_TYPE = API_TYPE;

        // plugin methods
        this.pluginMethods = {};
        // plugin hooks
        this.pluginHooks = {};

        this.plugins = PreLoadPlugins.reduce((arr, item) => {
            return arr.concat(this.resolvePlugin(item));
        }, []).filter(item => !!item);
        this.extraPlugins = []; // 临时存储扩展模块
    }

    _getPlugins() {
        const micros = this.micros;
        const plugins = this.selfConfig.plugins || [];
        const allplugins = micros.map(key => {
            return this.microsConfig[key].plugins || [];
        }).concat(plugins);
        const pluginsObj = [];
        while (allplugins.length) {
            const item = allplugins.shift();
            if (Array.isArray(item)) { // presets
                allplugins.unshift(...item);
            } else {
                const res = this.resolvePlugin(item);
                if (res) {
                    pluginsObj.push(...[].concat(res));
                }
            }
        }
        const collection = new Set();
        const result = pluginsObj.filter(item => {
            // 去除已经注册的插件
            const id = item.id;
            if (this.hasPlugin(id)) {
                collection.add(id);
                return false;
            }
            return true;
        });
        collection.forEach(id => {
            logger.warn('[Plugin]', `"${id}" has registered!`);
        });
        return result;
    }

    _initPreloadPlugins() {
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

    /**
     * 检测插件有效性
     * @param {Object} plugin info
     * @return {Boolean} true-enabled, false-disabled
     */
    _checkPluginEnabled(plugin) {
        const { id, alias, mode, target, skipTarget, dependencies, skipContext } = plugin;
        const key = `${id}${alias ? ' (' + alias + ')' : ''}`;

        const params = { // function params
            id, alias,
            mode: this.mode,
            target: this.target,
            context: this.context,
        };

        // 判断依赖插件库是否存在
        if (dependencies) {
            let _dependencies = dependencies;
            if (_.isFunction(_dependencies)) { // 支持方法判断
                _dependencies = _dependencies(params);
            }
            _dependencies = [].concat(_dependencies);
            if (!_dependencies.some(_id => !!tryRequire.resolve(_id))) {
                // 当前模式与插件不匹配
                logger.warn('[Plugin]', `Not Found dependencies - initPlugin() skip "${key}".`, `must be depend on: { ${_dependencies.join(', ')} }`);
                return false;
            }
        }

        if (mode) { // 默认为全支持
            let _mode = mode;
            if (_.isFunction(_mode)) { // 支持方法判断
                _mode = _mode(params);
            }
            _mode = [].concat(_mode);
            if (!_mode.some(item => item === this.mode)) {
                // 当前模式与插件不匹配
                logger.info('[Plugin]', `current mode: { ${this.mode} } - initPlugin() skip "${key}".`, `only support modes: { ${_mode.join(', ')} }`);
                return false;
            }
        }

        if (target) { // 仅支持的目标类型
            let _target = target;
            if (_.isFunction(_target)) { // 支持方法判断
                _target = _target(params);
            }
            _target = [].concat(_target);
            if (!_target.some(item => item === this.target)) {
                // 当前 target 与插件不匹配
                logger.debug('[Plugin]', `current target: { ${this.target} } - initPlugin() skip "${key}".`, `only support targets: { ${_target.join(', ')} }`);
                return false;
            }
        }

        // 用一种方式去跳过不需要的配置插件！！！
        if (skipTarget) {
            let _skipTarget = skipTarget;
            if (_.isFunction(_skipTarget)) { // 支持方法判断
                _skipTarget = _skipTarget(params);
            }
            _skipTarget = [].concat(_skipTarget);
            if (_skipTarget.some(item => item === this.target)) {
                // 当前 target 与插件不匹配，需要跳过
                logger.info('[Plugin]', `current target: { ${this.target} } - initPlugin() skip "${key}".`, `not support targets: { ${_skipTarget.join(', ')} }`);
                return false;
            }
        }

        // 某个 context 为 true 时，跳过此插件
        if (skipContext) {
            let _skipContext = skipContext;
            if (_.isFunction(_skipContext)) { // 支持方法判断
                _skipContext = _skipContext(params);
            }
            _skipContext = [].concat(_skipContext);
            const unCtx = yUnParser(this.context); // 解压
            const args = _skipContext.find(item => unCtx.includes(item));
            if (args) {
                // 当前 target 与插件不匹配，需要跳过
                logger.info('[Plugin]', `has args: { ${args} } - initPlugin() skip "${key}".`);
                return false;
            }
        }

        return true; // OK
    }

    _initPluginAPI(plugin) {
        const { id, apply, alias } = plugin;

        // --skip-plugins
        const skipPlugins = this.context.skipPlugins;
        if (skipPlugins) {
            if ([].concat(skipPlugins).includes(id)) {
                // 跳过此插件
                logger.warn('[Plugin]', `--skip-plugins, initPlugin() skip "${id}${alias ? ' (' + alias + ')' : ''}".`);
                return;
            }
        }

        if (!this._checkPluginEnabled(plugin)) {
            return;
        }

        // 收集提前注册的内容
        const _register = {};
        BEFORE_INIT_METHODS.forEach(method => {
            _register[method] = _register[method] || [];
            const item = plugin[SYMBOL_BEFORE_INIT_METHODS][method];
            if (item) {
                if (_.isPlainObject(item)) {
                    Object.keys(item).forEach(key => {
                        const opts = Object.assign({}, item[key] || {});
                        // 参数依次为：name,opts
                        _register[method].push([ key, opts ]);
                    });
                } else if (_.isFunction(item)) {
                    // not support
                }
            }
        });

        assert(typeof apply === 'function',
            dedent`plugin "${id}" must export a function,
                e.g.
                    export default function(api) {
                        // Implement functions via api
                    }`
        );

        const api = this._createPluginAPIProxy(id);
        api.onOptionChange = fn => {
            logger.info('[core]', 'onOptionChange...');
            assert(
                typeof fn === 'function',
                `The first argument for api.onOptionChange should be function in ${id}.`
            );
            plugin._onOptionChange = fn;
        };

        // 将收集的内容进行分销
        Object.keys(_register).forEach(method => {
            const _argss = _register[method];
            _argss.forEach(args => {
                api[method].apply(api, args);
            });
        });

        return api;
    }

    /**
     * create api proxy
     * @param {string} id plugin id
     * @return {PluginAPI} api
     */
    _createPluginAPIProxy(id) {
        const api = new Proxy(new PluginAPI(id, this), {
            get: (target, name, property) => {
                if (typeof name === 'string' && /^_/i.test(name)) {
                    return; // ban private
                }
                if (name in this.pluginMethods) {
                    const obj = this.pluginMethods[name];
                    if (obj.$$configFlag$$ === true) { // 立即执行, 返回结果(支持 cache 缓存).
                        if (obj.cache === true && !_.isUndefined(obj.__cache__)) {
                            return obj.__cache__;
                        }
                        const _result = obj.fn.call(this);
                        if (obj.cache === true) {
                            obj.__cache__ = _result;
                        }
                        return _result;
                    }
                    // return this.pluginMethods[name].fn;
                    return Reflect.get(obj, 'fn', property);
                }
                if (this.initialized) { // 已经初始化
                    if (_.isString(name) && /^register/i.test(name) || [
                        'onOptionChange',
                    ].includes(name)) {
                        return () => {
                            logger.throw('[Plugin]', `api.${name}() should not be called after plugin is initialized.`);
                        };
                    }
                }
                return Reflect.get(target, name, property);
            },
            set: (target, name, value, property) => {
                if (typeof name === 'string' && /^_/i.test(name)) {
                    return; // ban private
                }
                return Reflect.set(target, name, value, property);
            },
        });
        return api;
    }

    async _initPlugin(plugin) {
        const api = this._initPluginAPI(plugin);
        if (!api) return;

        const { apply, opts = {} } = plugin;

        await apply(api, opts);

        plugin[Symbol.for('api')] = api;
    }

    _initPluginSync(plugin) {
        const api = this._initPluginAPI(plugin);
        if (!api) return;

        const { apply, opts = {} } = plugin;

        apply(api, opts);

        plugin[Symbol.for('api')] = api;
    }

    _sortPlugins() {
        this.plugins.push(...this._getPlugins());
        const BUILT_IN = Symbol.for('built-in');

        // 去除重复注册的插件，从设计的角度上，不该有重复的插件出现
        const alreadyPlugins = {};
        const duplicatePlugins = [];
        this.plugins = this.plugins.filter(plugin => {
            const id = plugin.id;
            const alias = plugin.alias;
            const link = plugin.link;
            const key = `${id}+${alias}+${link}`;
            if (alreadyPlugins[key]) {
                duplicatePlugins.push(plugin);
                return false;
            }
            alreadyPlugins[key] = true;
            return true;
        });
        if (duplicatePlugins.length) {
            logger.debug('[Plugin]', '_sortPlugins() duplicatePlugins:', duplicatePlugins);
        }

        const builtInPlugins = [];
        const prePlugins = [];
        const normalPlugins = [];
        const postPlugins = [];
        this.plugins.forEach(plugin => {
            if (plugin[BUILT_IN]) {
                builtInPlugins.push(plugin);
                return;
            }
            switch (plugin.enforce) {
                case 'pre':
                    prePlugins.push(plugin);
                    break;
                case 'post':
                    postPlugins.push(plugin);
                    break;
                default:
                    normalPlugins.push(plugin);
                    break;
            }
        });

        // sort
        this.plugins = [].concat(
            // builtIn
            builtInPlugins,
            // enforce: pre
            prePlugins,
            // normal
            normalPlugins,
            // enforce: post
            postPlugins
        );
    }

    _filterPlugins() {
        this.plugins = this.plugins.filter(plugin => !!plugin[Symbol.for('api')]);
    }

    /**
     * 异步
     */
    async _initPlugins() {
        this._sortPlugins();

        await this.plugins.reduce((_chain, plugin) => _chain.then(() => this._initPlugin(plugin)), Promise.resolve());

        let count = 0;
        while (this.extraPlugins.length) {
            const extraPlugins = _.cloneDeep(this.extraPlugins);
            this.extraPlugins = [];
            await Promise.all(extraPlugins.map(async plugin => {
                await this._initPlugin(plugin);
                this.plugins.push(plugin);
            }));
            count += 1;
            assert(count <= 10, '插件注册死循环？');
        }

        // TODO 排序重组, reload();

        // 过滤掉没有初始化的 plugin
        this._filterPlugins();

        logger.debug('[Plugin]', '_initPlugins() End!');
    }

    /**
     * 同步
     */
    _initPluginsSync() {
        this._sortPlugins();

        this.plugins.forEach(plugin => {
            this._initPluginSync(plugin);
        });

        let count = 0;
        while (this.extraPlugins.length) {
            const extraPlugins = _.cloneDeep(this.extraPlugins);
            this.extraPlugins = [];
            extraPlugins.forEach(plugin => {
                this._initPluginSync(plugin);
                this.plugins.push(plugin);
            });
            count += 1;
            assert(count <= 10, '插件注册死循环？');
        }

        // TODO 排序重组, reload();

        // 过滤掉没有初始化的 plugin
        this._filterPlugins();

        logger.debug('[Plugin]', '_initPluginsSync() End!');
    }

    /**
     * plugin options to object
     * @param {*} item opt
     * @param {*} param apply, link, opts
     * @return {Object} obj
     * @private
     */
    _resolvePluginResult(item, { apply, link, opts }) {
        const _apply = apply.default || apply;
        const defaultConfig = apply.configuration || {};
        const beforeInitMethods = _.pick(apply, BEFORE_INIT_METHODS) || {};
        // load config merge opts
        if (item.configName && _.isString(item.configName)) {
            const config = this.parseConfig(item.configName); // 这个操作只加载当前环境下的配置，用于二次更改内置配置
            if (config) {
                opts = Object.assign({}, opts || {}, config);
            }
        }
        return Object.assign({}, defaultConfig, {
            ...item,
            [SYMBOL_BEFORE_INIT_METHODS]: beforeInitMethods, // 内部方法提前
            link: link ? require.resolve(link) : null,
            apply: _apply,
            opts,
        });
    }

    register(hook, fn, opts) {
        assert(
            typeof hook === 'string',
            `The first argument of api.register() must be string, but got ${hook}`
        );
        assert(
            typeof fn === 'function',
            `The second argument of api.register() must be function, but got ${fn}`
        );
        const pluginHooks = this.pluginHooks;
        pluginHooks[hook] = pluginHooks[hook] || [];
        pluginHooks[hook].push({
            ...opts,
            fn,
        });
    }

    registerMethod(name, opts = {}) {
        this.assertExtendOptions(name, opts, function() { /* none */ });
        let { type, apply } = opts;
        assert(!(type && apply), 'Only be one for type and apply.');
        assert(type || apply, 'One of type and apply must supplied.');

        if (type && _.isString(type)) {
            const _type = this.API_TYPE[type.toUpperCase()];
            assert(_type, `Not Support api type: ${type}.`);
            type = _type;
        }

        const params = Object.keys(opts).reduce((obj, key) => {
            if (key === 'apply' || key === 'fn') return obj;
            obj[key] = opts[key];
            return obj;
        }, {});

        this.pluginMethods[name] = {
            fn: (...args) => {
                if (apply) {
                    this.register(name, opts => {
                        return apply(opts, ...args);
                    }, { type });
                } else if (type === this.API_TYPE.ADD) {
                    this.register(name, opts => {
                        let last = opts.last || [];
                        if (!Array.isArray(last)) {
                            last = [ last ];
                        }
                        return last.concat(
                            typeof args[0] === 'function' ? args[0](last, opts.args) : args[0]
                        );
                    }, { type });
                } else if (type === this.API_TYPE.MODIFY) {
                    this.register(name, opts => {
                        return typeof args[0] === 'function' ? args[0](opts.last, opts.args) : args[0];
                    }, { type });
                } else if (type === this.API_TYPE.EVENT) {
                    this.register(name, opts => {
                        return args[0](opts.args);
                    }, { type });
                } else if (type === this.API_TYPE.EXTEND) {
                    if (_.isFunction(opts.fn)) {
                        return opts.fn.apply(this, args);
                    }
                    return opts.fn;
                } else {
                    throw new Error(`unexpected api type ${type}`);
                }
            },
            ...params,
        };
    }

    extendConfig(name, opts, fn) {
        const extendObj = this.assertExtendOptions(name, opts, fn);
        this.registerMethod(extendObj.name, Object.assign({}, extendObj.opts, {
            fn: extendObj.fn,
            type: this.API_TYPE.EXTEND,
            $$configFlag$$: true,
        }));
        logger.debug('[Plugin]', `extendConfig( ${extendObj.name} ); Success!`);
    }

    extendMethod(name, opts, fn) {
        const extendObj = this.assertExtendOptions(name, opts, fn);
        this.registerMethod(extendObj.name, Object.assign({}, extendObj.opts, {
            fn: extendObj.fn,
            type: this.API_TYPE.EXTEND,
        }));
        logger.debug('[Plugin]', `extendMethod( ${extendObj.name} ); Success!`);
    }

    /**
     * 注册插件
     * @param {Object | Array} opts options
     * @return {boolean} success flag
     */
    registerPlugin(opts) {
        assert(_.isPlainObject(opts), `opts should be plain object, but got ${opts}`);
        opts = this.resolvePlugin(opts);
        if (!opts) return false; // error
        if (Array.isArray(opts)) {
            return opts.map(opt => { // 这个插件是多层的，需要通过一些手段进一步区分 id
                return this.registerPlugin(opt);
            });
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
        logger.debug('[Plugin]', `service.registerPlugin( ${id} ); Success!`);
        return true;
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
        let apply = item.apply; // 提供给特殊需求
        let link = item.link;
        if (!link) {
            link = tryRequire.resolve(id);
        }
        if (link) { // 先尝试从模拟缓存中找文件
            apply = apply || virtualFile.require(link) || tryRequire(link);
        }
        if (apply) {
            const _apply = apply.default || apply;
            if (Array.isArray(_apply)) { // 支持数组模式
                return _apply.reduce((arr, _applyItem) => {
                    if (_.isFunction(_applyItem)) {
                        const res = this._resolvePluginResult(item, { apply: _applyItem, link, opts });
                        return arr.concat(res || []);
                    } else if (_applyItem) {
                        const _parsePlugin = parsePlugin(_applyItem);
                        const res = this.resolvePlugin(Object.assign(item, _parsePlugin));
                        return arr.concat(res || []);
                    }
                    return arr;
                }, []).filter(_it => !!_it);
            }
            return this._resolvePluginResult(item, { apply, link, opts });
        }
        logger.warn('[Plugin]', `Not Found plugin: "${id || item}"\n   --> link: "${link}"`);
        return false;
    }

    applyPluginHooks(key, opts = {}, ctx) {
        logger.debug('[Plugin]', `applyPluginHooks( ${key} )`);
        const defaultOpts = ctx || opts;
        return (this.pluginHooks[key] || []).reduce((last, { fn }) => {
            try {
                return fn({
                    last,
                    args: defaultOpts,
                });
            } catch (e) {
                logger.throw(e, '[Plugin]', `Plugin apply ${key} failed: ${e.message}`);
            }
            return last;
        }, opts);
    }

    // Notice: 对 ADD 模式无异步效果
    async applyPluginHooksAsync(key, opts = {}, ctx) {
        logger.debug('[Plugin]', `applyPluginHooksAsync( ${key} )`);
        const defaultOpts = ctx || opts;
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

    // ZAP 需要设计
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
                logger.warn('[Plugin]', `plugin ${id}'s option changed, \n      nV: ${JSON.stringify(newOpts)}, \n      oV: ${JSON.stringify(oldOpts)}`);
            }
        });
        logger.debug('[Plugin]', `changePluginOption( ${id}, ${JSON.stringify(newOpts)} ); Success!`);
    }

    hasPlugin(id) {
        assert(id, 'id must supplied');
        return this.plugins.some(p => id === p.id);
    }

    findPlugin(id) {
        assert(id, 'id must supplied');
        return this.plugins.find(p => id === p.id);
    }

    hasKey(name) {
        return super.hasKey(name) || !!this.pluginMethods[name];
    }
}

module.exports = PluginService;
