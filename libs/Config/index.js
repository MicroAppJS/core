'use strict';

const path = require('path');
const tryRequire = require('try-require');

const BaseConfig = require('./base/BaseConfig');

class MicroAppConfig extends BaseConfig {

    constructor(config /* , opts = {} */) {
        super(config);
        this.webpack = config.webpack || {}; // deprecated
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

    // 服务代理
    get proxy() {
        const server = this.server;
        return server.proxy || {};
    }

    toConfig(notSimple = false) {
        const json = {
            ...super.toConfig(notSimple),
            entry: this.entry,
            htmls: this.htmls,
            dlls: this.dlls,
            staticPaths: this.staticPaths,
        };
        if (notSimple) {
            json.webpack = this.webpack; // deprecated
        }
        return json;
    }

    toServerConfig(notSimple = false) {
        const _serverConfig = this.server;
        const { entry, options = {}, hooks } = _serverConfig;
        const json = {
            entry,
            hooks,
            options,
            info: this.toJSON(),
            shared: this.shared,
            sharedObj: this.sharedObj,
            resolveShared: this.resolveShared,
            port: this.port,
            host: this.host,
            proxy: this.proxy,
        };
        if (notSimple) {
            Object.assign(json, this.toJSON(notSimple)); //  不能去除. 外部有引用
        }
        return json;
    }
}

module.exports = MicroAppConfig;
