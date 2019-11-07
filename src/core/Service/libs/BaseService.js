'use strict';

const os = require('os');
const { logger, _, semverRegex } = require('@micro-app/shared-utils');

const CONSTANTS = require('../../Constants');

const requireMicro = require('../../../utils/requireMicro');

const { SharedProps } = require('../constants');

const INIT_DEFAULT_ENV = Symbol('INIT_DEFAULT_ENV');
const INIT_ENV = Symbol('INIT_ENV');
const INIT_PARAMS = Symbol('INIT_PARAMS');

// 全局状态集
const GLOBAL_STATE = {};

class BaseService {

    constructor() {
        // 初始化
        this[INIT_PARAMS]();
        this[INIT_ENV]();
        this[INIT_DEFAULT_ENV]();
    }

    /**
     * @private
     *
     * @memberof BaseService
     */
    [INIT_PARAMS]() {
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

        this.env = {}; // 环境变量
        this.config = {};

        this.state = GLOBAL_STATE; // 状态集
    }

    /**
     * @private
     *
     * @memberof BaseService
     */
    [INIT_ENV]() {
        // 可增加对模式的解析
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
            logger.debug('dotenv', `dotenv parsed envs:${os.EOL}`, JSON.stringify(this.env, null, 4));
        }

        if (env === 'production') { // fixed
            this.env.NODE_ENV = env;
            process.env.NODE_ENV = env;
        }
    }

    /**
     * @private
     *
     * @memberof BaseService
     */
    [INIT_DEFAULT_ENV]() {
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

    get root() {
        return CONSTANTS.ROOT;
    }

    get version() {
        return CONSTANTS.VERSION;
    }

    get mode() {
        return process.env.NODE_ENV || 'production'; // "production" | "development"
    }

    get self() {
        const _self = requireMicro.self();
        if (!_self) {
            logger.throw(`Not Found "${CONSTANTS.CONFIG_NAME}"`);
        }
        // redefine getter to lazy-loaded value
        Object.defineProperty(this, 'self', {
            value: _self,
        });
        return _self;
    }

    get selfConfig() {
        return _.cloneDeep(this.self) || {};
    }

    get pkg() {
        return this.selfConfig.package || {};
    }

    get strictMode() {
        return this.selfConfig.strict;
    }

    get selfKey() {
        return this.selfConfig.key;
    }

    get nodeModulesPath() {
        return this.selfConfig.nodeModules;
    }

    get micros() {
        return this.selfConfig.micros;
    }

    setState(key, value) {
        this.state[key] = value;
    }

    getState(key, value) {
        return this.state[key] || value;
    }
}

module.exports = BaseService;
