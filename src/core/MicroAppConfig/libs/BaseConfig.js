'use strict';

const path = require('path');
const { getPadLength, _, validateSchema, loadFile, logger } = require('@micro-app/shared-utils');

const CONSTANTS = require('../../Constants');

// 默认配置
// const DEFAULT_CONFIG = require('../../Constants/default');

const SCHEMA = require('./configSchema');

const INIT = Symbol('@BaseConfig#INIT');
const KEY_ORIGNAL_CONFIG = Symbol('@BaseConfig#KEY_ORIGNAL_CONFIG');
const KEY_PACKAGE = Symbol('@BaseConfig#KEY_PACKAGE');
const KEY_PACKAGE_PATH = Symbol('@BaseConfig#KEY_PACKAGE_PATH');

const OPTION_KEY = Symbol('@MicroAppConfig#KEY');
const OPTION_ROOT = Symbol('@MicroAppConfig#ROOT');
const OPTION_FILEPATH = Symbol('@MicroAppConfig#FILEPATH');
const OPTION_FILENAME = Symbol('@MicroAppConfig#FILENAME');
const OPTION_DIRNAME = Symbol('@MicroAppConfig#DIRNAME');
const OPTION_ORIGINAL_ROOT = Symbol('@MicroAppConfig#ORIGINAL_ROOT');
const OPTION_LOAD_SUCCESS = Symbol('@MicroAppConfig#LOAD_SUCCESS');

class BaseConfig {

    /**
     * Creates an instance of BaseConfig.
     * @param {DEFAULT_CONFIG} config config
     * @param {Object} opts opts
     * @memberof BaseConfig
     */
    constructor(config, opts = {}) {
        this[OPTION_KEY] = opts.key;
        this[OPTION_FILEPATH] = opts.filePath;
        this[OPTION_ORIGINAL_ROOT] = opts.originalRoot;
        // 以上必须有
        this[OPTION_ROOT] = opts.root || path.dirname(opts.filePath);
        this[OPTION_FILENAME] = opts.filename || path.basename(opts.filePath);
        this[OPTION_DIRNAME] = opts.dirname || path.basename(this.root);

        this[OPTION_LOAD_SUCCESS] = opts.loadSuccess || false;

        // 校验 config
        this._validateSchema(config);
        this[KEY_ORIGNAL_CONFIG] = config;
        this[INIT]();
    }

    _validateSchema(config) {
        const result = validateSchema(SCHEMA, config);
        const padLength = getPadLength(result.map(item => {
            return { name: item.keyword };
        }));
        if (!result.length) return;

        result.forEach(item => {
            logger.warn(`${_.padEnd(item.keyword, padLength)} [ ${item.dataPath} ${item.message} ]`);
        });
        logger.throw('illegal configuration !!!');
    }

    [INIT]() {
        if (!this[OPTION_LOAD_SUCCESS]) {
            // 文件未加载成功.
            logger.warn(`Not Found "${CONSTANTS.CONFIG_NAME}"`);
            logger.warn(`You must be to create "${CONSTANTS.CONFIG_NAME}" in "${this.root}"`);
        }
        if (this.root) {
            try {
                this[KEY_PACKAGE_PATH] = path.resolve(this.root, CONSTANTS.PACKAGE_JSON);
                this[KEY_PACKAGE] = loadFile(this.root, CONSTANTS.PACKAGE_JSON);
                if (!this[OPTION_LOAD_SUCCESS]) {
                    // 文件未加载成功. 可以从 package.json 中查询配置文件
                    if (this[KEY_PACKAGE] && this[KEY_PACKAGE]['micro-app'] && _.isPlainObject(this[KEY_PACKAGE]['micro-app'])) {
                        Object.assign(this[KEY_ORIGNAL_CONFIG], this[KEY_PACKAGE]['micro-app']);
                    }
                }
            } catch (error) {
                this[KEY_PACKAGE_PATH] = '';
                this[KEY_PACKAGE] = {};
                logger.warn(`Not Fount "${CONSTANTS.PACKAGE_JSON}" !`);
            }
        }
    }

    get filename() {
        return this[OPTION_FILENAME] || '';
    }

    get dirname() {
        return this[OPTION_DIRNAME] || '';
    }

    get config() {
        return this[KEY_ORIGNAL_CONFIG] || {};
    }

    get originalConfig() {
        return this.config;
    }

    get root() {
        return this[OPTION_ROOT] || '';
    }

    get originalRoot() {
        return this[OPTION_ORIGINAL_ROOT] || this.root || '';
    }

    get hasSoftLink() {
        return this.root !== this.originalRoot;
    }

    get path() {
        return this[OPTION_FILEPATH] || '';
    }

    get nodeModules() {
        if (this.root) {
            const nodeModules = CONSTANTS.NODE_MODULES_NAME || 'node_modules';
            return path.join(this.root, nodeModules);
        }
        return '';
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
        return this[KEY_PACKAGE_PATH] || '';
    }

    get package() {
        return _.cloneDeep(this[KEY_PACKAGE] || {});
    }

    // 唯一标识
    get key() {
        return this[OPTION_KEY] || this.packageName || path.basename(path.dirname(this.root)) || '';
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
        if (!aliasName.startsWith(CONSTANTS.SCOPE_NAME)) { // 加入作用域，并去除原 scope 的 @ 开头符
            aliasName = `${CONSTANTS.SCOPE_NAME}/${aliasName.replace(/^@/ig, '')}`;
        }
        return aliasName.startsWith('@') ? aliasName : `@${aliasName}`;
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
        return config.type || ''; // 默认类型为空
    }

    get packages() {
        const config = this.config;
        const _micros = config.micros;
        if (_micros && Array.isArray(_micros)) {
            return [ ...new Set(_micros) ].map(item => {
                if (_.isString(item)) {
                    return {
                        name: item,
                        spec: false,
                    };
                }
                return item;
            });
        } else if (_micros && _.isPlainObject(_micros)) {
            return Object.keys(_micros).map(key => {
                const pkg = _micros[key];
                if (_.isString(pkg)) {
                    return {
                        name: key,
                        spec: pkg,
                    };
                }
                return {
                    name: key,
                    ...pkg,
                };
            });
        }
        return [];
    }

    get micros() {
        const packages = this.packages;
        if (packages && Array.isArray(packages)) {
            return [ ...new Set(packages.map(item => item.name).filter(name => !!name)) ];
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
                if (aliasObj && _.isString(aliasObj)) {
                    obj[key] = {
                        link: aliasObj,
                    };
                } else if (aliasObj && _.isPlainObject(aliasObj)) {
                    const link = aliasObj.link;
                    if (link && _.isString(link)) {
                        obj[key] = aliasObj;
                    }
                }
                return obj;
            }, {});
        }
        const currAlias = config.alias || {};
        return Object.keys(currAlias).reduce((obj, key) => {
            const aliasObj = currAlias[key];
            if (aliasObj && _.isString(aliasObj)) {
                obj[key] = {
                    link: aliasObj,
                };
            } else if (aliasObj && _.isPlainObject(aliasObj)) {
                const link = aliasObj.link;
                if (link && _.isString(link)) {
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
                if (!alias[aliasKey] && _.isString(p)) {
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
            if (aliasObj && _.isString(aliasObj)) {
                obj[key] = {
                    link: aliasObj,
                };
            } else if (aliasObj && _.isPlainObject(aliasObj)) {
                if (aliasObj.server === true || _.isString(aliasObj.type) && aliasObj.type.toUpperCase() === 'SERVER') {
                    // server ?
                    return obj;
                }
                const link = aliasObj.link;
                if (link && _.isString(link)) {
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
                if (!alias[aliasKey] && _.isString(p)) {
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
            if (p && id === p) {
                p = null; // 不希望相等
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
        return this.toJSON();
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
            strict: this.strict,
        };
        if (notSimple) {
            json.path = this.path;
            json.micros = this.micros;
            json.packagePath = this.packagePath;
            json.package = this.package;
        }
        return json;
    }
}

module.exports = BaseConfig;
