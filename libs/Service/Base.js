'use strict';

const tryRequire = require('try-require');
const assert = require('assert');
const _ = require('lodash');
const semverRegex = require('semver-regex');

const CONSTANTS = require('../../config/constants');

const requireMicro = require('../../utils/requireMicro');
const loadFile = require('../../utils/loadFile');
const logger = require('../../utils/logger');

const { SharedProps } = require('./Constants');
const MICROS_EXTRAL_CONFIG_KEY = Symbol('MICROS_EXTRAL_CONFIG_KEY');

// 全局状态集
const GLOBAL_STATE = {};

class BaseService {
    constructor() {
        // 当前服务
        this.extendMethods = {};
        this.pluginHooks = {};
        this.pluginMethods = {};
        this.commands = {};

        // 当前服务
        this.selfConfig = this.self.toConfig(true);
        this.selfServerConfig = this.self.toServerConfig(true);
        this.micros = new Set((this.self.micros || []));

        this.__initDefaultEnv__();
        this.__initGlobalMicroAppConfig__();

        this.microsConfig = this._initMicrosConfig();
        this.microsServerConfig = this._initMicrosServerConfig();

        this.env = {}; // 环境变量
        this.config = {};
        this.serverConfig = {};
        this.state = GLOBAL_STATE; // 状态集
    }

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

    __initGlobalMicroAppConfig__() {
        // 加载高级配置
        this[MICROS_EXTRAL_CONFIG_KEY] = loadFile(this.root, CONSTANTS.EXTRAL_CONFIG_NAME);

        // 全局指令, 不可靠配置
        if (!global.MicroAppConfig) {
            global.MicroAppConfig = {};
        }
        const MicroAppConfig = global.MicroAppConfig;
        MicroAppConfig.microsExtralConfig = this.microsExtralConfig;
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
            logger.error(`Not Found "${CONSTANTS.CONFIG_NAME}"`);
            logger.warn(`must be to create "${CONSTANTS.CONFIG_NAME}" in "${this.root}"`);
            process.exit(1);
        }
        return _self;
    }

    get microsExtralConfig() {
        const microsExtral = this[MICROS_EXTRAL_CONFIG_KEY] || {};
        const result = {};
        Array.from(this.micros).forEach(key => {
            result[key] = Object.assign({}, microsExtral[key] || {
                disabled: false, // 禁用入口
                disable: false,
                link: false,
            });

            // 附加内容需要参考全局配置
            if (!process.env.MICRO_APP_OPEN_SOFT_LINK) { // 强制禁止使用 软链接
                result[key].link = false;
            }
            if (!process.env.MICRO_APP_OPEN_DISABLED_ENTRY) { // 强制禁止使用 开启禁用指定模块入口, 优化开发速度
                result[key].disabled = false;
                result[key].disable = false;
            }
        });
        return Object.assign({}, microsExtral, result);
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
                logger.error(`Not Found micros: "${key}"`);
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
            logger.warn('Not Found "dotenv"');
        }
        if (env === 'production') { // fixed
            this.env.NODE_ENV = env;
            process.env.NODE_ENV = env;
        }
    }

    extendMethod(name, fn) {
        assert(typeof name === 'string', 'name must be string.');
        assert(name || /^_/i.test(name), `${name} cannot begin with '_'.`);
        assert(!this[name] || !this.extendMethods[name] || !this.pluginMethods[name] || !SharedProps.includes(name), `api.${name} exists.`);
        assert(typeof fn === 'function', 'opts must be function.');
        this.extendMethods[name] = fn;
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
}

module.exports = BaseService;
