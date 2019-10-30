'use strict';

const assert = require('assert');
const _ = require('lodash');
const semverRegex = require('semver-regex');
const os = require('os');

const CONSTANTS = require('../../Constants');

const requireMicro = require('../../../utils/requireMicro');
const loadFile = require('../../../utils/loadFile');
const logger = require('../../../utils/logger');

const { SharedProps } = require('../constants');
const MICROS_EXTRA_CONFIG_KEY = Symbol('MICROS_EXTRA_CONFIG_KEY');

// 全局状态集
const GLOBAL_STATE = {};

class BaseService {
    constructor() {
        this.extendConfigs = {};
        this.extendMethods = {};
        this.pluginHooks = {};
        this.pluginMethods = {};
        this.commands = {};

        this.sharedProps = SharedProps.reduce((obj, key) => {
            obj[key] = {
                key,
            };
            return obj;
        }, {});

        // 当前服务
        this.micros = new Set((this.self.micros || []));

        this.__initDefaultEnv__();
        this.__initGlobalMicroAppConfig__();

        this.microsConfig = this._initMicrosConfig();

        this.env = {}; // 环境变量
        this.config = {};

        this.state = GLOBAL_STATE; // 状态集
    }

    /**
     * @private
     *
     * @memberof BaseService
     */
    __initDefaultEnv__() {
        const env = {
            VERSION: {
                force: true,
                value: semverRegex().exec(this.version)[0],
            },
        };
        Object.keys(env).forEach(key => {
            const _k = `MICRO_APP_${key.toUpperCase()}`;
            const item = env[key];
            if (item.force || _.isUndefined(process.env[_k])) {
                process.env[_k] = item.value;
            }
        });
    }

    /**
     * @private
     *
     * @memberof BaseService
     */
    __initGlobalMicroAppConfig__() {
        // 加载高级配置
        const extraConfig = this[MICROS_EXTRA_CONFIG_KEY] = loadFile(this.root, CONSTANTS.EXTRAL_CONFIG_NAME);

        if (extraConfig && _.isPlainObject(extraConfig)) {
            Object.keys(extraConfig).forEach(key => {
                const item = extraConfig[key];
                logger.debug(`【 Extra Config 】${key}: ${os.EOL}${JSON.stringify(item, false, 4)}`);
            });
        }

        // 全局指令, 不可靠配置
        if (!global.MicroAppConfig) {
            global.MicroAppConfig = {};
        }
        const MicroAppConfig = global.MicroAppConfig;
        MicroAppConfig.microsExtraConfig = this.microsExtraConfig;
    }

    get root() {
        return CONSTANTS.ROOT;
    }

    get version() {
        return CONSTANTS.VERSION;
    }

    get pkg() {
        return this.self.package || {};
    }

    get mode() {
        return process.env.NODE_ENV || 'production'; // "production" | "development"
    }

    get strictMode() {
        return this.self.strict;
    }

    get self() {
        const _self = requireMicro.self();
        if (!_self) {
            logger.throw(`Not Found "${CONSTANTS.CONFIG_NAME}"`);
        }
        return _self;
    }

    get selfKey() {
        return this.self.key;
    }

    get selfConfig() {
        return this.microsConfig[this.selfKey] || this.self.toConfig(true) || {};
    }

    get extraConfig() {
        return this[MICROS_EXTRA_CONFIG_KEY] || {};
    }

    get microsExtraConfig() {
        const extraConfig = this.extraConfig || {};
        // 兼容旧版本
        const microsExtra = extraConfig.micro || extraConfig || {};
        const result = {};
        Array.from(this.micros).forEach(key => {
            result[key] = Object.assign({}, microsExtra[key] || {
                disabled: false, // 禁用入口
                disable: false,
                link: false,
            });

            // 附加内容需要参考全局配置
            if (process.env.MICRO_APP_OPEN_SOFT_LINK !== 'true') { // 强制禁止使用 软链接
                result[key].link = false;
            }
            if (process.env.MICRO_APP_OPEN_DISABLED_ENTRY !== 'true') { // 强制禁止使用 开启禁用指定模块入口, 优化开发速度
                result[key].disabled = false;
                result[key].disable = false;
            }
        });
        return Object.assign({}, microsExtra, result);
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
                logger.error(`Not Found micros: "${key}"`);
            }
        });
        config[this.selfKey] = this.self.toConfig(true);
        return config;
    }

    // 可增加对模式的解析
    _initDotEnv() {
        const env = process.env.NODE_ENV;
        const dotenv = require('dotenv');
        const result = dotenv.config();
        if (result.error) {
            logger.error(result.error);
        } else if (result.parsed) {
            const config = result.parsed;
            if (config.HOSTNAME) { // fixed
                process.env.HOSTNAME = config.HOSTNAME;
            }
            Object.assign(this.env, config);
            logger.debug(`dotenv parsed envs:${os.EOL}`, JSON.stringify(this.env, null, 4));
        }

        if (env === 'production') { // fixed
            this.env.NODE_ENV = env;
            process.env.NODE_ENV = env;
        }
    }

    assertExtendOptions(name, opts, fn) {
        assert(typeof name === 'string', 'name must be string.');
        assert(name || /^_/i.test(name), `${name} cannot begin with '_'.`);
        assert(!this[name] || !this.extendConfigs[name] || !this.extendMethods[name] || !this.pluginMethods[name] || !this.sharedProps[name], `api.${name} exists.`);
        if (typeof opts === 'function') {
            fn = opts;
            opts = null;
        }
        assert(typeof fn === 'function', 'fn must be function.');
        opts = opts || {};
        assert(_.isPlainObject(opts), 'opts must be object.');
        return { name, opts, fn };
    }

    extendConfig(name, opts, fn) {
        const extendObj = this.assertExtendOptions(name, opts, fn);
        this.extendConfigs[extendObj.name] = {
            ...extendObj.opts,
            fn: extendObj.fn,
        };
        logger.debug(`[Plugin] extendConfig( ${extendObj.name} ); Success!`);
    }

    extendMethod(name, opts, fn) {
        const extendObj = this.assertExtendOptions(name, opts, fn);
        this.extendMethods[extendObj.name] = {
            ...extendObj.opts,
            fn: extendObj.fn,
        };
        logger.debug(`[Plugin] extendMethod( ${extendObj.name} ); Success!`);
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

    /**
     * 解析指定key的其它name的配置信息
     *
     * @param {string} name config name
     * @param {string} key micro key
     * @return {Object} config
     * @memberof BaseService
     */
    parseConfig(name, key = this.selfKey) {
        assert(typeof name === 'string', 'name must be string.');
        const microsConfig = this.microsConfig;
        const microConfig = microsConfig[key];
        if (!_.isEmpty(microConfig)) {
            const root = microConfig.root;
            const filename = CONSTANTS.EXTRAL_CONFIG_NAME.replace('extra', name);
            const _config = loadFile(root, filename);
            if (!_.isEmpty(_config)) {
                return _config;
            }
            const _extraConfig = this.extraConfig || {};
            if (!_.isEmpty(_extraConfig[name])) {
                return _extraConfig[name];
            }
            const _originalConfig = microConfig.originalConfig || {};
            if (!_.isEmpty(_originalConfig[name])) {
                return _originalConfig[name];
            }
        }
        return null;
    }
}

module.exports = BaseService;
