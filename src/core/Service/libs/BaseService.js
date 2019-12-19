'use strict';

const os = require('os');
const { logger, _, semverRegex } = require('@micro-app/shared-utils');
const path = require('path');

const CONSTANTS = require('../../Constants');

const requireMicro = require('../../../utils/requireMicro');

const { SharedProps } = require('../constants');

const INIT_DEFAULT_ENV = Symbol('INIT_DEFAULT_ENV');
const INIT_ENV = Symbol('INIT_ENV');
const INIT_PARAMS = Symbol('INIT_PARAMS');

// 全局状态集
const GLOBAL_STATE = {};

class BaseService {

    constructor(context) {
        this.context = context || {};

        // 初始化
        this[INIT_PARAMS]();
        this[INIT_ENV]();
        this[INIT_DEFAULT_ENV]();

        // reset logger level
        if (process.env.MICRO_APP_LOGGER_LEVEL) {
            logger.level = process.env.MICRO_APP_LOGGER_LEVEL;
        }
    }

    /**
     * @private
     *
     * @memberof BaseService
     */
    [INIT_PARAMS]() {
        this.extendConfigs = {};
        this.extendMethods = {};
        this.pluginMethods = {};

        this.sharedProps = SharedProps.reduce((obj, key) => {
            obj[key] = {
                key,
            };
            return obj;
        }, {});

        this.config = {};

        this.state = GLOBAL_STATE; // 状态集
    }

    /**
     * @private
     *
     * @memberof BaseService
     */
    [INIT_ENV]() { // 支持对模式解析
        const dotenv = require('dotenv');
        const dotenvExpand = require('dotenv-expand');

        const load = envFileName => {
            const envPath = path.resolve(this.root, envFileName);
            const result = dotenv.config({ path: envPath });
            if (result.error) {
                // only ignore error if file is not found
                if (result.error.toString().indexOf('ENOENT') < 0) {
                    logger.error(result.error);
                }
            } else {
                dotenvExpand(result);
                if (result.parsed) {
                    const config = result.parsed;
                    if (config.HOSTNAME) { // fixed
                        process.env.HOSTNAME = config.HOSTNAME;
                    }
                }
            }
        };

        load('.env');
        load('.env.local');

        // default env
        const context = this.context;
        // 全局环境模式 production, development
        process.env.NODE_ENV = context.mode || this.mode || 'development';

        const mode = this.mode;
        if (mode) {
            load(`.env.${mode}`);
            load(`.env.${mode}.local`);
        }

        logger.debug('[dotenv]', `dotenv parsed envs:${os.EOL}`, JSON.stringify(this.env, null, 4));
    }

    /**
     * 注入默认环境变量
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
        if (this.mode === 'test') {
            env.TEST = {
                value: true,
            };
        }
        Object.keys(env).forEach(key => {
            const _k = `${CONSTANTS.ENV_PREFIX}${key.toUpperCase()}`;
            const item = env[key];
            if (item.force || _.isUndefined(process.env[_k])) {
                process.env[_k] = item.value;
            }
        });
    }

    get env() { // 环境变量
        return process.env;
    }

    get root() {
        return CONSTANTS.ROOT;
    }

    get version() {
        return CONSTANTS.VERSION;
    }

    get mode() {
        return process.env.NODE_ENV || 'development'; // "production" | "development"
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

    get type() {
        return this.selfConfig.type || '';
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
