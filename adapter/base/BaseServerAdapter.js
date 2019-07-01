'use strict';

const path = require('path');
const merge = require('merge');
const tryRequire = require('try-require');

const BaseAdapter = require('./BaseAdapter');
const logger = require('../../utils/logger');
const HookEvent = require('../../libs/HookEvent');
const CONSTANTS = require('../../config/constants');
const serverHooksMerger = require('../../utils/merge-server-hooks');
const serverMerger = require('../../utils/merge-server');

class BaseServerAdapter extends BaseAdapter {

    mergeRouter() {
        throw new Error('Not Implemented!');
    }

    mergeMiddleware() {
        throw new Error('Not Implemented!');
    }

    runServer() {
        throw new Error('Not Implemented!');
    }

    _initDotenv() {
        const dotenv = tryRequire('dotenv');
        if (dotenv) {
            const result = dotenv.config();
            if (result.error) {
                throw new Error(result.error, 'dotevn parse error');
            } else if (result.parsed) {
                const config = result.parsed;
                if (config.HOSTNAME) { // fixed
                    process.env.HOSTNAME = config.HOSTNAME;
                }
                logger.info('dotevn parsed envs:\n', JSON.stringify(result.parsed, null, 4));
            }
        } else {
            logger.warn('maybe not install dotenv');
        }
    }

    _hooks(name) {
        const { SCOPE_NAME } = CONSTANTS;
        const _HookEvent = this._HookEvent;
        if (_HookEvent && name) {
            const args = Array.prototype.splice.call(arguments, 0, 1);
            const app = _HookEvent.app;
            _HookEvent.emit(`${SCOPE_NAME}:${name}`, app, ...args);
        }
    }

    _initHooks(app) {
        const selfConfig = this.self;
        const serverConfig = selfConfig.server;
        const { options = {} } = serverConfig;
        const _options = [];

        this._HookEvent = new HookEvent(app);

        // init hooks
        const micros = selfConfig.micros;
        if (micros && Array.isArray(micros)) {
            const microServerHooks = serverHooksMerger(...micros);
            const _hooks = [];
            microServerHooks.forEach(({ hooks, options, info }) => {
                if (hooks) {
                    _hooks.push({
                        hooks, info,
                    });
                }
                if (options) {
                    _options.push(options);
                }
            });
            const injectOptions = merge.recursive(true, ..._options, options);
            _hooks.forEach(({ hooks, info }) => {
                if (typeof hooks === 'function') {
                    hooks(this._HookEvent, injectOptions, info);
                } else if (typeof hooks === 'object') {
                    Object.keys(hooks).forEach(key => {
                        const func = hooks[key];
                        this._HookEvent.hooks(key, func.bind({ info, options: injectOptions }));
                        logger.info(`【 ${info.name} 】Hook inject ${key}`);
                    });
                }
                logger.info(`【 ${info.name} 】Hooked`);
            });
        }

        const microServerHooks = serverHooksMerger.adapter(selfConfig);
        const injectOptions = merge.recursive(true, ..._options, options);
        microServerHooks.forEach(({ hooks, info }) => {
            if (typeof hooks === 'function') {
                hooks(this._HookEvent, injectOptions, info);
            } else if (typeof hooks === 'object') {
                Object.keys(hooks).forEach(key => {
                    const func = hooks[key];
                    this._HookEvent.hooks(key, func.bind({ info, options: injectOptions }));
                    logger.info(`【 ${info.name} 】Hook inject ${key}`);
                });
            }
            logger.info(`【 ${info.name} 】Hooked`);
        });
    }

    _initEntry(app) {
        // 读取配置文件
        const selfConfig = this.self;
        const serverConfig = selfConfig.server;
        const { entry, options = {} } = serverConfig;
        const _options = [];

        // micro server
        const micros = selfConfig.micros;
        if (micros && Array.isArray(micros)) {
            const microServers = serverMerger(...micros);
            const _entrys = [];
            microServers.forEach(({ entry, options, info }) => {
                if (entry) {
                    _entrys.push({
                        entry, info,
                    });
                }
                if (options) {
                    _options.push(options);
                }
            });
            _entrys.forEach(({ entry, info }) => {
                entry(app, merge.recursive(true, ..._options, options), info);
                logger.info(`【 ${info.name} 】Inserted`);

            });
        }
        if (entry) {
            const entryFile = path.resolve(selfConfig.root, entry);
            const entryCallback = tryRequire(entryFile);
            if (entryCallback && typeof entryCallback === 'function') {
                const info = selfConfig.toJSON(true);
                entryCallback(app, merge.recursive(true, ..._options, options), info);
                logger.info(`【 ${info.name} 】Inserted`);
            }
        }
    }
}

module.exports = BaseServerAdapter;
