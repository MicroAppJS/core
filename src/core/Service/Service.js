'use strict';

const { _, logger, moduleAlias, smartMerge } = require('@micro-app/shared-utils');

const PluginService = require('./libs/PluginService');
const PackageGraph = require('../PackageGraph');

class Service extends PluginService {
    constructor(context) {
        super(context);

        this.initialized = false;

        // fixed soft link - node_modules 不统一
        this.__initInjectAliasModule__();
    }

    get __isMicroAppService() {
        return true;
    }

    __initInjectAliasModule__() {
        moduleAlias.addPath(this.self.nodeModules);
        // 注入 custom node_modules
        const microsExtraConfig = this.microsExtraConfig;
        const microsConfig = this.microsConfig;
        const micros = this.micros;

        // TODO 可优化, 则不需要走 alias, 直接 symlinks
        // 先判断是否存在 symlink, 如果存在则不需要走这个.
        const microsPaths = micros
            .map(key => microsConfig[key])
            .filter(item => item.hasSoftLink && microsExtraConfig[item.key] && !!microsExtraConfig[item.key].link)
            .map(item => item.nodeModules);
        moduleAlias.addPaths(microsPaths);
    }

    _mergeConfig() {
        const selfConfig = this.selfConfig;
        const micros = this.micros;
        const microsConfig = this.microsConfig;
        const finalConfig = smartMerge({}, ...micros.map(key => {
            if (!microsConfig[key]) return {};
            return _.pick(microsConfig[key], [
                'alias',
                'aliasObj',
                'resolveAlias',
                'shared',
                'sharedObj',
                'resolveShared',
            ]);
        }), selfConfig);
        return Object.assign({}, _.cloneDeep(finalConfig));
    }

    init() {
        if (this.initialized) {
            return Promise.resolve();
        }

        let chain = Promise.resolve();

        chain = chain.then(() => this._initPlugins());

        chain = chain.then(() => {

            this.initialized = true; // 再此之前可重新 init

            this.applyPluginHooks('onPluginInitDone');

        });

        chain = chain.then(() => {
            // modify  freeze!!!
            Object.defineProperty(this, 'microsConfig', {
                value: this.applyPluginHooks('modifyMicrosConfig', this.microsConfig),
            });
            Object.defineProperty(this, 'microsPackageGraph', {
                value: new PackageGraph(this.microsPackages),
            });
        });

        chain = chain.then(() => {
            // merge config
            this.applyPluginHooks('beforeMergeConfig', this.config);
            Object.defineProperty(this, 'config', {
                value: this.applyPluginHooks('modifyDefaultConfig', this._mergeConfig()),
            });
            this.applyPluginHooks('afterMergeConfig', this.config);
        });

        chain = chain.then(() => {
            // 注入全局的别名
            moduleAlias.add(this.config.resolveShared);
        });

        chain = chain.then(() => {
            this.applyPluginHooks('onInitWillDone');
        });

        chain = chain.then(() => {
            this.applyPluginHooks('onInitDone');
            logger.debug('[Plugin]', 'init(); Done!');
        });

        return chain;
    }

    initSync() {
        if (this.initialized) {
            return;
        }

        this._initPluginsSync();

        this.initialized = true; // 再此之前可重新 init

        this.applyPluginHooks('onPluginInitDone');

        // modify  freeze!!!
        Object.defineProperty(this, 'microsConfig', {
            value: this.applyPluginHooks('modifyMicrosConfig', this.microsConfig),
        });
        Object.defineProperty(this, 'microsPackageGraph', {
            value: new PackageGraph(this.microsPackages),
        });

        // merge config
        this.applyPluginHooks('beforeMergeConfig', this.config);
        Object.defineProperty(this, 'config', {
            value: this.applyPluginHooks('modifyDefaultConfig', this._mergeConfig()),
        });
        this.applyPluginHooks('afterMergeConfig', this.config);

        // 注入全局的别名
        moduleAlias.add(this.config.resolveShared);

        this.applyPluginHooks('onInitWillDone');

        this.applyPluginHooks('onInitDone');
        logger.debug('[Plugin]', 'init(); Done!');
    }

    runCommand(rawName, rawArgs = {}) {
        rawArgs._ = rawArgs._ || [];
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

        // TODO 分发引用，带优化
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
