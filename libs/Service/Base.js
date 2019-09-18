'use strict';

const tryRequire = require('try-require');
const assert = require('assert');
const _ = require('lodash');

const CONSTANTS = require('../../config/constants');

const requireMicro = require('../../utils/requireMicro');
const logger = require('../../utils/logger');

const { SharedProps } = require('./Constants');

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
        this.microsConfig = this._initMicrosConfig();
        this.microsServerConfig = this._initMicrosServerConfig();

        this.env = {}; // 环境变量
        this.config = {};
        this.serverConfig = {};
        this.state = GLOBAL_STATE; // 状态集
    }

    get root() {
        return CONSTANTS.ROOT;
    }

    get version() {
        return CONSTANTS.VERSION;
    }

    get mode() {
        return CONSTANTS.NODE_ENV || 'production';
    }

    get self() {
        const _self = requireMicro.self();
        assert(_self, logger.toString.error('not found "micro-app.config.js"'));
        return _self;
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
                logger.error(`not found micros: "${key}"`);
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
                logger.error(`not found micros: "${key}"`);
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
            logger.warn('not found "dotenv"');
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
