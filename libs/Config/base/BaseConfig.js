'use strict';

const path = require('path');
const fs = require('fs-extra');
const tryRequire = require('try-require');
const _ = require('lodash');

const symbols = require('../../../config/symbols');
const CONSTANTS = require('../../../config/constants');
const logger = require('../../../src/utils/logger');
const getPadLength = require('../../../src/utils/getPadLength');

// 默认配置
const DEFAULT_CONFIG = require('../../../config/default');

const validate = require('../schema');
const SCHEMA = require('../schema/configSchema');

const INIT = Symbol('@BaseConfig#INIT');
const ORIGNAL_CONFIG = Symbol('@BaseConfig#ORIGNAL_CONFIG');

class BaseConfig {

    constructor(config /* , opts = {} */) {
        // 校验 config
        this._validateSchema(config);
        this[INIT](config);
        this[ORIGNAL_CONFIG] = config || DEFAULT_CONFIG;
    }

    _validateSchema(config) {
        const result = validate(SCHEMA, config);
        const padLength = getPadLength(result.map(item => {
            return { name: item.keyword };
        }));
        result.forEach(item => {
            logger.error(`[${_.padStart(item.keyword, padLength)}] ${item.dataPath} ${item.message}`);
        });
        if (result.length > 0) {
            logger.throw('illegal configuration !!!');
        }
    }

    [INIT](config) {
        if (config) {
            try {
                const packagePath = path.join(config[symbols.ROOT], CONSTANTS.PACKAGE_JSON);
                if (fs.existsSync(packagePath)) {
                    this._packagePath = packagePath;
                    this._package = require(packagePath);
                }
            } catch (error) {
                this._packagePath = '';
                this._package = {};
                logger.warn('Not Fount "package.json" !');
            }
        }
    }

    get config() {
        return this[ORIGNAL_CONFIG] || {};
    }

    get root() {
        const config = this.config;
        return config[symbols.ROOT] || '';
    }

    get originalRoot() {
        const config = this.config;
        return config[symbols.ORIGINAL_ROOT] || this.root || '';
    }

    get hasSoftLink() {
        return this.root !== this.originalRoot;
    }

    get path() {
        const config = this.config;
        return config[symbols.PATH] || '';
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

    get mode() {
        return process.env.NODE_ENV || 'production'; // "production" | "development"
    }

    get isDev() {
        return this.mode === 'development';
    }

    get strict() {
        return this.config.strict !== false;
    }

    get packagePath() {
        return this._packagePath;
    }

    get package() {
        return Object.freeze(JSON.parse(JSON.stringify(this._package || {})));
    }

    get key() {
        const config = this.config;
        return config[symbols.KEY] || this.packageName.replace(new RegExp(`^${CONSTANTS.SCOPE_NAME}\/?`, 'ig'), '') || '';
    }

    get name() {
        const config = this.config;
        return config.name || this.packageName || '';
    }

    get packageName() {
        return this.package.name || '';
    }

    get aliasName() {
        let aliasName = this.name || '';
        if (!aliasName.startsWith(CONSTANTS.SCOPE_NAME)) {
            aliasName = `${CONSTANTS.SCOPE_NAME}/${aliasName}`;
        }
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
    get micros() {
        const config = this.config;
        if (config.micros && Array.isArray(config.micros)) {
            return [ ...new Set(config.micros) ];
        }
        return [];
    }

    // 后端共享
    get sharedObj() {
        const config = this.config;
        const currShared = config.shared || config.share;
        if (currShared) { // 兼容旧版
            return Object.keys(currShared).reduce((obj, key) => {
                const aliasObj = currShared[key];
                if (aliasObj && typeof aliasObj === 'string') {
                    obj[key] = {
                        link: aliasObj,
                    };
                } else if (aliasObj && typeof aliasObj === 'object') {
                    const link = aliasObj.link;
                    if (link && typeof link === 'string') {
                        obj[key] = aliasObj;
                    }
                }
                return obj;
            }, {});
        }
        const currAlias = config.alias || {};
        return Object.keys(currAlias).reduce((obj, key) => {
            const aliasObj = currAlias[key];
            if (aliasObj && typeof aliasObj === 'string') {
                obj[key] = {
                    link: aliasObj,
                };
            } else if (aliasObj && typeof aliasObj === 'object') {
                const link = aliasObj.link;
                if (link && typeof link === 'string') {
                    obj[key] = aliasObj;
                }
            }
            return obj;
        }, {});
    }

    // 后端共享
    get shared() {
        const currAlias = this.sharedObj || {};
        return Object.keys(currAlias).reduce((obj, key) => {
            const aliasObj = currAlias[key];
            obj[key] = aliasObj.link;
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
                if (!alias[aliasKey] && typeof p === 'string') {
                    const filePath = path.resolve(this.root, p);
                    alias[aliasKey] = filePath;
                }
            });
        }
        return alias;
    }

    // 前端共享
    get aliasObj() {
        const config = this.config;
        const currAlias = config.alias || {};
        return Object.keys(currAlias).reduce((obj, key) => {
            const aliasObj = currAlias[key];
            if (aliasObj && typeof aliasObj === 'string') {
                obj[key] = {
                    link: aliasObj,
                };
            } else if (aliasObj && _.isPlainObject(aliasObj)) {
                if (aliasObj.server === true || typeof aliasObj.type === 'string' && aliasObj.type.toUpperCase() === 'SERVER') {
                    // server ?
                    return obj;
                }
                const link = aliasObj.link;
                if (link && typeof link === 'string') {
                    obj[key] = aliasObj;
                }
            }
            return obj;
        }, {});
    }

    get alias() {
        const currAlias = this.aliasObj || {};
        return Object.keys(currAlias).reduce((obj, key) => {
            const aliasObj = currAlias[key];
            obj[key] = aliasObj.link;
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
                if (!alias[aliasKey] && typeof p === 'string') {
                    const filePath = path.resolve(this.root, p);
                    alias[aliasKey] = filePath;
                }
            });
        }
        return alias;
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
            if (p && !tryRequire.resolve(p)) {
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

    inspect() {
        return this.toConfig(true);
    }

    toJSON(notSimple = false) {
        const json = {
            key: this.key,
            name: this.name,
            packageName: this.packageName,
            aliasName: this.aliasName,
            version: this.version,
            type: this.type,
            description: this.description,
            mode: this.mode,
            root: this.root,
            originalRoot: this.originalRoot,
            hasSoftLink: this.hasSoftLink,
            nodeModules: this.nodeModules,
        };
        if (notSimple) {
            json.strict = this.strict;
            json.path = this.path;
            json.micros = this.micros;
            json.packagePath = this.packagePath;
            json.subModulesRoot = this.subModulesRoot;
            json.package = this.package;
        }
        return json;
    }

    toConfig(notSimple = false) {
        const json = {
            ...this.toJSON(notSimple),
            alias: this.alias,
            aliasObj: this.aliasObj,
            resolveAlias: this.resolveAlias,
            shared: this.shared,
            sharedObj: this.sharedObj,
            resolveShared: this.resolveShared,
        };
        if (notSimple) {
            json.plugins = this.plugins;
            json.originalConfig = this.config;
        }
        return json;
    }
}

module.exports = BaseConfig;
