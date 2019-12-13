'use strict';

const { logger, _, assert, tryRequire, virtualFile, dedent } = require('@micro-app/shared-utils');

const MethodService = require('./MethodService');
const PluginAPI = require('../../PluginAPI');
const { PreLoadPlugins } = require('../constants');

class PluginService extends MethodService {
    constructor(context) {
        super(context);

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

    async _initPlugins() {
        this.plugins.push(...this._getPlugins());

        await Promise.all(this.plugins.map(async plugin => await this._initPlugin(plugin)));

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
        this.plugins = this.plugins.filter(plugin => !!plugin[Symbol.for('api')]);

        // Throw error for methods that can't be called after plugins is initialized
        this.plugins.forEach(plugin => {
            Object.keys(plugin[Symbol.for('api')]).forEach(method => {
                if (/^register/i.test(method) || [
                    'onOptionChange',
                ].includes(method)) {
                    plugin[Symbol.for('api')][method] = () => {
                        logger.throw('[Plugin]', `api.${method}() should not be called after plugin is initialized.`);
                    };
                }
            });
        });

        logger.debug('[Plugin]', '_initPlugins() End!');
    }

    async _initPlugin(plugin) {
        const { id, apply, opts = {}, mode, alias } = plugin;
        if (mode) { // 默认为全支持
            let _mode = mode;
            if (_.isFunction(_mode)) { // 支持方法判断
                _mode = _mode(this.mode);
            }
            if (Array.isArray(_mode)) {
                if (!_mode.some(item => item === this.mode)) {
                    // 当前模式与插件不匹配
                    logger.warn('[Plugin]', `{ ${this.mode} } - initPlugin() skip "${id}${alias ? ' (' + alias + ')' : ''}".`, `support modes: { ${_mode.join(', ')} }`);
                    return;
                }
            } else if (_mode !== this.mode) {
                // 当前模式与插件不匹配
                logger.warn('[Plugin]', `{ ${this.mode} } - initPlugin() skip "${id}${alias ? ' (' + alias + ')' : ''}".`, `support mode: { ${_mode} }`);
                return;
            }
        }

        assert(typeof apply === 'function',
            dedent`plugin "${id}" must export a function,
                e.g.
                    export default function(api) {
                        // Implement functions via api
                    }`
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
                    const val = this[prop];
                    if (typeof val === 'function') {
                        return val.bind(this);
                    }
                    if (prop === 'micros') {
                        return [ ...val ];
                    }
                    return val;
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

        if (apply.__isMicroAppCommand) {
            const _apply = new apply(api, opts);
            await _apply.initialize(api, opts);
        } else {
            await apply(api, opts);
        }

        plugin[Symbol.for('api')] = api;
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
        logger.debug('[Plugin]', `registerPlugin( ${id} ); Success!`);
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
        if (!link) { // TODO 这里需要优化
            link = tryRequire.resolve(require('path').resolve(this.root, this.tempDirNodeModules, id));
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
        logger.warn('[Plugin]', `Not Found plugin: "${id || item}"\n   --> link: "${link}"`);
        return false;
    }

    applyPluginHooks(key, opts = {}) {
        logger.debug('[Plugin]', `applyPluginHooks( ${key} )`);
        const defaultOpts = opts;
        // try {
        //     defaultOpts = _.cloneDeep(opts);
        // } catch (error) {
        //     logger.debug('[Plugin]', ` Plugin: ${key}, _.cloneDeep() error`);
        // }
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

    async applyPluginHooksAsync(key, opts = {}) {
        logger.debug('[Plugin]', `applyPluginHooksAsync( ${key} )`);
        const defaultOpts = opts;
        // try {
        //     defaultOpts = _.cloneDeep(opts);
        // } catch (error) {
        //     logger.debug('[Plugin]', ` Plugin: ${key}, _.cloneDeep() error`);
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
}

module.exports = PluginService;
