'use strict';

const path = require('path');
const fs = require('fs');
const tryRequire = require('try-require');
const _ = require('lodash');

const symbols = require('../config/symbols');
const CONSTANTS = require('../config/constants');

// 默认配置
const DEFAULT_CONFIG = JSON.parse(JSON.stringify(require('../config/default')));
const PACKAGE_JSON = 'package.json';
const INIT = Symbol('MicroAppConfig_INIT');

class MicroAppConfig {

    constructor(config) {
        this[INIT](config);
        this._config = config || DEFAULT_CONFIG;
        // 校验 config
        this.webpack = config.webpack || {};
    }

    [INIT](config) {
        if (config) {
            try {
                const packagePath = path.join(config[symbols.root], PACKAGE_JSON);
                if (fs.existsSync(packagePath)) {
                    this._packagePath = packagePath;
                    this._package = require(packagePath);
                }
            } catch (error) {
                this._packagePath = '';
                this._package = {};
            }
        }
    }

    get mode() {
        return CONSTANTS.NODE_ENV || 'production';
    }

    get isDev() {
        return this.mode === 'development';
    }

    get strict() {
        return this.config.strict !== false;
    }

    get config() {
        return this._config || {};
    }

    get packagePath() {
        return this._packagePath;
    }

    get package() {
        return Object.freeze(this._package);
    }

    get key() {
        return this.name.replace(`${CONSTANTS.SCOPE_NAME}/`, '');
    }

    get name() {
        const config = this.config;
        return config.name || this.package.name || '';
    }

    get aliasName() {
        const aliasName = this.name;
        return aliasName[0] !== '@' ? `@${aliasName}` : aliasName;
    }

    get version() {
        const config = this.config;
        return config.version || this.package.version || '';
    }

    get description() {
        const config = this.config;
        return config.description || this.package.description || '';
    }

    get type() {
        const config = this.config;
        return config.type || '';
    }

    get entry() {
        const config = this.config;
        const entry = config.entry || this.webpack.entry || {}; // 兼容
        // fix entry path
        if (typeof entry === 'object') {
            Object.keys(entry).forEach(key => {
                const _entrys = entry[key];
                if (Array.isArray(_entrys)) {
                    entry[key] = _entrys.map(item => {
                        if (!tryRequire.resolve(item)) {
                            return path.resolve(this.root, item);
                        }
                        return item;
                    });
                } else if (typeof _entrys === 'string') {
                    if (!tryRequire.resolve(_entrys)) {
                        entry[key] = [ path.resolve(this.root, _entrys) ];
                    }
                }
            });
        } else if (Array.isArray(entry)) {
            return {
                main: entry.map(item => {
                    if (!tryRequire.resolve(item)) {
                        return path.resolve(this.root, item);
                    }
                    return item;
                }),
            };
        } else if (typeof entry === 'string') {
            if (!tryRequire.resolve(entry)) {
                return {
                    main: [ path.resolve(this.root, entry) ],
                };
            }
        }
        return entry;
    }

    get html() {
        const htmls = this.htmls;
        return htmls[0] || {};
    }

    get htmls() { // 支持 array
        const config = this.config;
        const htmls = config.htmls || (!config.html && this.webpack.plugins && Array.isArray(this.webpack.plugins) && this.webpack.plugins.filter(item => {
            const constru = item.constructor;
            if (constru && constru.name) {
                const constructorName = constru.name;
                if (constructorName === 'HtmlWebpackPlugin') {
                    return true;
                }
            }
            return false;
        }).map(item => item.options)) || []; // 兼容
        const _html = config.html; // 兼容
        if (_html && typeof _html === 'object') {
            htmls.unshift(_html);
        }
        htmls.forEach(item => {
            if (item && item.template) {
                const template = item.template;
                if (!tryRequire.resolve(template)) {
                    item.template = path.resolve(this.root, template);
                }
            }
        });
        return htmls;
    }

    get dll() {
        const dlls = this.dlls;
        return dlls[0] || {};
    }

    get dlls() { // 支持 array
        const config = this.config;
        const dlls = config.dlls || [];
        const _dll = config.dll; // 兼容
        if (_dll && typeof _dll === 'object') {
            dlls.unshift(_dll);
        }
        dlls.forEach(item => {
            if (item && item.context) {
                const context = item.context;
                if (!tryRequire.resolve(context)) {
                    item.context = path.resolve(this.root, context);
                }
            }
            if (item && item.manifest) {
                const manifest = item.manifest;
                if (!tryRequire.resolve(manifest)) {
                    item.manifest = path.resolve(this.root, manifest);
                }
            }
            if (item && item.filepath) {
                const filepath = item.filepath;
                if (!tryRequire.resolve(filepath)) {
                    item.filepath = path.resolve(this.root, filepath);
                }
            }
        });
        return dlls;
    }

    get staticPaths() { // String | Array
        const config = this.config;
        const staticPath = config.staticPath || [];
        const staticPaths = [];
        if (staticPath && typeof staticPath === 'string') {
            staticPaths.push(staticPath);
        } else if (Array.isArray(staticPath)) {
            staticPaths.push(...staticPath);
        }
        return staticPaths.filter(item => {
            return !!item;
        }).map(item => {
            if (!tryRequire.resolve(item)) {
                return path.resolve(this.root, item);
            }
            return item;
        });
    }

    get micros() {
        const config = this.config;
        if (config.micros && Array.isArray(config.micros)) {
            return [ ...new Set(config.micros) ];
        }
        return [];
    }

    get microsExtral() {
        const config = this.config;
        const result = {};
        this.micros.forEach(micro => {
            result[micro] = Object.assign({}, config[`micros$$${micro}`] || {
                disabled: false, // 禁用入口
                disable: false,
            });
        });
        return result;
    }

    get root() {
        const config = this.config;
        return config[symbols.root] || '';
    }

    get path() {
        const config = this.config;
        return config[symbols.path] || '';
    }

    get nodeModules() {
        if (this.root) {
            const nodeModules = CONSTANTS.NODE_MODULES_NAME || 'node_modules';
            return path.join(this.root, nodeModules);
        }
        return '';
    }

    get subModulesRoot() {
        const scopeName = CONSTANTS.SCOPE_NAME || '';
        return path.join(this.nodeModules, scopeName);
    }

    // 后端共享
    get shared() {
        const config = this.config;
        const currShared = config.shared || config.share;
        if (currShared) { // 兼容旧版
            return currShared;
        }
        const currAlias = config.alias || {};
        return Object.keys(currAlias).reduce((obj, key) => {
            const aliasObj = currAlias[key];
            if (typeof aliasObj === 'string') {
                obj[key] = aliasObj;
            } else if (typeof aliasObj === 'object') {
                const link = aliasObj.link;
                if (link && typeof link === 'string') {
                    obj[key] = link;
                }
            }
            return obj;
        }, {});
    }

    get resolveShared() {
        const alias = {};
        const aliasName = this.aliasName;
        if (aliasName) {
            const currShared = this.shared;
            Object.keys(currShared).forEach(k => {
                const p = currShared[k];
                const aliasKey = `${aliasName}/${k}`;
                if (p && typeof p === 'string' && !alias[aliasKey]) {
                    const filePath = path.resolve(this.root, p);
                    alias[aliasKey] = filePath;
                }
            });
        }
        return alias;
    }

    // 前端共享
    get alias() {
        const config = this.config;
        const currAlias = config.alias || {};
        return Object.keys(currAlias).reduce((obj, key) => {
            const aliasObj = currAlias[key];
            if (typeof aliasObj === 'string') {
                obj[key] = aliasObj;
            } else if (typeof aliasObj === 'object') {
                if (aliasObj.server === true || typeof aliasObj.type === 'string' && aliasObj.type.toUpperCase() === 'SERVER') {
                    // server ?
                    return obj;
                }
                const link = aliasObj.link;
                if (link && typeof link === 'string') {
                    obj[key] = link;
                }
            }
            return obj;
        }, {});
    }

    get resolveAlias() {
        const alias = {};
        const aliasName = this.aliasName;
        if (aliasName) {
            const currAlias = this.alias;
            Object.keys(currAlias).forEach(key => {
                const p = currAlias[key];
                const aliasKey = `${aliasName}/${key}`;
                if (p && typeof p === 'string' && !alias[aliasKey]) {
                    const filePath = path.resolve(this.root, p);
                    alias[aliasKey] = filePath;
                }
            });
        }
        return alias;
    }

    get deploy() {
        const config = this.config;
        return config.deploy;
    }

    // server
    get server() {
        const config = this.config;
        return config.server || {};
    }

    get host() {
        const server = this.server;
        return server.host;
    }

    get port() {
        const server = this.server;
        return server.port;
    }

    get contentBase() {
        const server = this.server;
        if (server.contentBase) {
            return path.resolve(this.root, server.contentBase);
        } else if (server.staticBase) {
            return path.resolve(this.root, server.staticBase);
        }
        return '.';
    }

    // 服务代理
    get proxy() {
        const server = this.server;
        return server.proxy || {};
    }

    get proxyGlobal() {
        const server = this.server;
        return server.proxyGlobal || false;
    }

    get plugin() { // 弃用
        const config = this.config;
        return config.plugin || {};
    }

    get plugins() {
        const config = this.config;
        const _plugins = config.plugins || [];
        return _plugins.map(p => {
            let opts;
            let id;
            let others;
            if (Array.isArray(p)) {
                opts = p[1];
                if (_.isPlainObject(p[0])) {
                    others = p[0];
                    id = p[0].id;
                    p = p[0].link;
                } else {
                    p = id = p[0];
                }
            } else if (_.isPlainObject(p)) {
                others = p;
                id = p.id;
                p = p.link;
            }
            id = id || p;
            if (!tryRequire.resolve(p)) {
                p = path.resolve(this.root, p);
            }
            return {
                ...(others || {}),
                id,
                link: p,
                opts: opts || {},
            };
        });
    }

    toJSON(notSimple = false) {
        const json = {
            key: this.key,
            name: this.name,
            version: this.version,
            type: this.type,
            description: this.description,
            root: this.root,
            nodeModules: this.nodeModules,
        };
        if (notSimple) {
            json.micros = this.micros;
        }
        return json;
    }

    toConfig(notSimple = false) {
        const json = {
            ...this.toJSON(),
            aliasName: this.aliasName,
            entry: this.entry,
            htmls: this.htmls,
            dlls: this.dlls,
            alias: this.alias,
            resolveAlias: this.resolveAlias,
            shared: this.shared,
            resolveShared: this.resolveShared,
            staticPaths: this.staticPaths,
        };
        if (notSimple) {
            json.plugins = this.plugins;
            json.webpack = this.webpack;
        }
        return json;
    }

    toServerConfig() {
        const _serverConfig = this.server;
        const { entry, options = {}, hooks } = _serverConfig;
        const json = {
            ...this.toJSON(),
            entry,
            hooks,
            options,
            info: this.toJSON(),
            shared: this.shared,
            resolveShared: this.resolveShared,
            contentBase: this.contentBase,
            port: this.port,
            host: this.host,
            proxy: this.proxy,
        };
        return json;
    }
}

module.exports = MicroAppConfig;
