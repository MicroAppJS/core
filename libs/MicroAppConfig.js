'use strict';

const path = require('path');
const fs = require('fs');
const symbols = require('../config/symbols');
const CONSTANTS = require('../config/constants');

// 默认配置
const DEFAULT_CONFIG = JSON.parse(JSON.stringify(require('../config/default')));
const PACKAGE_JSON = 'package.json';
const INIT = Symbol('MicroAppConfig_INIT');

class MicroAppConfig {

    constructor(config) {
        this[INIT](config);
        this._config = config || {};
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
        return this.config.mode === 'development';
    }

    get strict() {
        return this.config.strict !== false;
    }

    get config() {
        return this._config || DEFAULT_CONFIG;
    }

    get packagePath() {
        return this._packagePath;
    }

    get package() {
        return Object.freeze(this._package);
    }

    get name() {
        const config = this.config;
        return config.name || this.package.name || '';
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

    get webpack() {
        const config = this.config;
        return config.webpack || {};
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

    // server
    get server() {
        const config = this.config;
        return config.server || {};
    }

    get plugin() {
        const config = this.config;
        return config.plugin || {};
    }

    toJSON(simple = false) {
        const json = {
            name: this.name,
            version: this.version,
            type: this.type,
            description: this.description,
            root: this.root,
        };
        if (!simple) {
            json.micros = this.micros;
        }
        return json;
    }
}

module.exports = MicroAppConfig;
