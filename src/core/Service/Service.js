'use strict';

const { _, logger, moduleAlias, smartMerge } = require('@micro-app/shared-utils');

const PluginService = require('./libs/PluginService');

class Service extends PluginService {
    constructor(context) {
        super(context);

        // fixed soft link - node_modules 不统一
        this.__initInjectAliasModule__();
    }

    get __isMicroAppService() {
        return true;
    }

    __initInjectAliasModule__() {
        moduleAlias.addPath(this.nodeModulesPath);
        // 注入 custom node_modules
        const microsExtraConfig = this.microsExtraConfig;
        const microsConfig = this.microsConfig;

        // TODO 可优化, 则不需要走 alias, 直接 symlinks
        // 先判断是否存在 symlink, 如果存在则不需要走这个.
        const microsPaths = Object.values(microsConfig)
            .filter(item => item.hasSoftLink && microsExtraConfig[item.key] && !!microsExtraConfig[item.key].link)
            .map(item => item.nodeModulesPath);
        moduleAlias.addPaths(microsPaths);
    }

    // 合并基本信息，以及 options 中的信息
    _mergeConfig() {
        const selfConfig = this.selfConfig;
        const microsConfig = this.microsConfig;
        const finalConfig = smartMerge({}, ... Object.values(microsConfig).map(item => {
            if (!item) return {};
            return _.pick(item, [
                'alias',
                'aliasObj',
                'resolveAlias',
                'shared',
                'sharedObj',
                'resolveShared',
                'options',
            ]);
        }), selfConfig.toJSON());
        return Object.assign({}, finalConfig);
    }

    init(sync = false) {
        if (this.initialized) {
            return sync ? true : Promise.resolve();
        }

        const fns = [];

        // init config，已提前，后面所有配置都在 this.config 上
        fns.push(() => {
            this.config = this._mergeConfig();
            // 注入全局的别名
            moduleAlias.add(this.config.resolveShared);
        });

        // preload
        fns.push(() => this._initPreloadPlugins());

        fns.push(() => {
            if (sync) {
                return this._initPluginsSync();
            }
            return this._initPlugins();
        });

        fns.push(() => {

            this.applyPluginHooks('onPluginInitWillDone');

            this.initialized = true; // 再此之前可重新 init

            this.applyPluginHooks('onPluginInitDone');

        });

        // changeCommandOption
        fns.push(() => {
            const commandOptions = this.commandOptions || {};
            Object.keys(commandOptions).forEach(name => {
                const command = this.commands[name];
                if (!command) {
                    logger.warn('[Plugin]', `changeCommandOption( ${name} ); ${name} not found`);
                    return;
                }
                const newOpts = commandOptions[name];
                let nV = newOpts;
                if (_.isFunction(nV)) {
                    const oldOpts = command.opts;
                    nV = newOpts(oldOpts);
                }
                if (nV && _.isPlainObject(nV)) {
                    command.opts = nV;
                    logger.debug('[Plugin]', `changeCommandOption( ${name} ); Success!`);
                    return true;
                }
            });
        });

        fns.push(() => {
            return this.applyPluginHooks('onInitWillDone');
        });

        fns.push(() => {
            return this.applyPluginHooks('onInitDone');
        });

        fns.push(() => {
            logger.debug('[Plugin]', 'init(); Done!');
        });

        return sync ? fns.map(fn => fn()) : fns.reduce((chain, fn) => {
            return chain.then(() => fn());
        }, Promise.resolve());
    }

    initSync() {
        return this.init(true);
    }

    runCommand(rawName, rawArgs = {}) {
        rawArgs._ = Array.isArray(rawArgs._) && rawArgs._ || []; // fixed args
        logger.debug('[Plugin]', `raw command name: ${rawName}, args: `, rawArgs);

        // TODO 获取配置中的 options
        const commandOpts = this.extraConfig.command[rawName] || {};
        if (_.isPlainObject(commandOpts)) {
            rawArgs = smartMerge({}, commandOpts, rawArgs);
        }

        const { name = rawName, args = rawArgs } = this.applyPluginHooks('modifyCommand', {
            name: rawName,
            args: rawArgs,
        });
        logger.debug('[Plugin]', `run ${name} with args: `, args);

        const command = this.commands[name];
        if (!command) {
            logger.throw('[core]', `Command "${name}" does not exists!`);
        }

        // 补充覆盖全局参数
        for (const key of [ 'mode', 'target' ]) {
            if (args[key] == null) {
                args[key] = this[key];
            }
        }

        const { fn, opts } = command;

        // TODO 分发引用，待优化
        this.applyPluginHooks('onRunCommand', {
            name,
            args,
            opts,
        });

        return fn(args);
    }

    async run(name = 'help', args = { _: [] }) {
        await this.init();
        return this.runCommand(name, args);
    }

    runSync(name = 'help', args = { _: [] }) {
        this.initSync();
        return this.runCommand(name, args);
    }
}

module.exports = Service;
