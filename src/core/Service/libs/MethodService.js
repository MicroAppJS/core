'use strict';

const path = require('path');
const { logger, _, fs, assert, loadFile } = require('@micro-app/shared-utils');

const BaseService = require('./BaseService');
const { parsePackageInfo } = require('./PackageInfo');
const ExtraConfig = require('../../ExtraConfig');

const MicroAppConfig = require('../../MicroAppConfig');
const Package = require('../../Package');
const PackageGraph = require('../../PackageGraph');
const CONSTANTS = require('../../Constants');
const makeFileFinder = require('../../../utils/makeFileFinder');

const loadConfig = require('../../../utils/loadConfig');

// 全局状态集
const GLOBAL_STATE = {};

class MethodService extends BaseService {

    constructor(context) {
        super(context);

        this.commands = {};

        this.state = GLOBAL_STATE; // 状态集
    }

    get tempDir() {
        return this.resolveWorkspace(CONSTANTS.MICRO_APP_TEMP_DIR);
    }

    get tempDirPackageGraph() {
        const pkgInfos = this.fileFinderTempDirNodeModules(CONSTANTS.PACKAGE_JSON, filePaths => {
            return filePaths.map(filePath => {
                const packageJson = loadFile(filePath);
                return new Package(packageJson, path.dirname(filePath), this.root);
            });
        });
        logger.debug('[core > fileFinderTempDirNodeModules]', `packages length: '${pkgInfos.length}'`);
        const tempDirPackageGraph = new PackageGraph(pkgInfos, 'dependencies');
        return tempDirPackageGraph;
    }

    /**
     * micros 配置
     *
     * @readonly
     * @memberof MethodService
     *
     * eg. [
     *     { name: 'a', spec: 'git@....a.git'},
     *     { name: 'b', spec: 'git@....b.git'},
     * ]
     */
    get packages() {
        const packages = (this.self.packages || []).map(item => {
            const name = item.name;
            const spec = item.spec || false;
            // ZAP 处理解析
            return parsePackageInfo(name, this.root, spec);
        }).filter(pkg => !!pkg);

        Object.defineProperty(this, 'packages', {
            value: packages,
        });

        return packages;
    }

    /**
     * micros 依赖
     *
     * @readonly
     * @memberof MethodService
     *
     * eg. [ 'a', 'b' ]
     */
    get micros() {
        const selfMicros = this.self.micros || [];
        const microsSet = new Set(selfMicros);
        // 当前可用服务
        const micros = [ ...microsSet ];
        // redefine getter to lazy-loaded value
        Object.defineProperty(this, 'micros', {
            writable: true,
            value: micros,
        });
        return micros;
    }

    get microsConfig() {
        const config = {};
        const microsExtraConfig = this.microsExtraConfig || {};

        // 已优化
        this.micros.forEach(key => {
            // @custom 开发模式软链接
            const extralConfig = microsExtraConfig[key];
            const originalRootPath = path.join(this.root, CONSTANTS.NODE_MODULES_NAME, key);
            let _rootPath = originalRootPath;
            if (extralConfig && extralConfig.link && fs.existsSync(extralConfig.link)) {
                _rootPath = extralConfig.link;
            }
            const microConfig = MicroAppConfig.createInstance(_rootPath, { originalRootPath });
            if (!microConfig) {
                logger.warn('[core]', '[Micros]', `Not Found micros: "${key}"`);
            } else {
                config[key] = microConfig;
            }
        });

        const microsSet = new Set(Object.keys(config));
        // refresh enable micros, freeze
        Object.defineProperty(this, 'micros', {
            value: [ ...microsSet ],
        });

        const selfKey = this.selfKey;
        config[selfKey] = _.cloneDeep(this.self);

        Object.defineProperty(this, 'microsConfig', {
            writable: true, // 提供修改
            value: config,
        });

        // redirect
        Object.defineProperty(this, 'selfConfig', {
            get() {
                return this.microsConfig[selfKey] || {};
            },
        });

        return config;
    }

    // 扩增配置
    get extraConfig() {
        // 加载高级附加配置
        const extraConfig = new ExtraConfig(this.root, this.context);

        Object.defineProperty(this, 'extraConfig', {
            value: extraConfig,
        });

        return extraConfig || {};
    }

    // 扩增配置中的 micros
    get microsExtraConfig() {
        const extraConfig = this.extraConfig || {};
        return extraConfig.micros || {};
    }

    get microsPackages() {
        return Object.values(this.microsConfig).map(config => config.manifest);
    }

    get microsPackageGraph() {
        const microsPackageGraph = new PackageGraph(this.microsPackages);

        Object.defineProperty(this, 'microsPackageGraph', {
            writable: true,
            value: microsPackageGraph,
        });

        return microsPackageGraph;
    }

    get fileFinder() {
        const finder = makeFileFinder(this.root, [ '*', '*/*' ]);

        // redefine getter to lazy-loaded value
        Object.defineProperty(this, 'fileFinder', {
            value: finder,
        });

        return finder;
    }

    get fileFinderTempDirNodeModules() {
        const tempDirNodeModules = path.resolve(this.tempDir, CONSTANTS.NODE_MODULES_NAME);
        const finder = makeFileFinder(tempDirNodeModules, [ '*', '*/*' ]);

        // redefine getter to lazy-loaded value
        Object.defineProperty(this, 'fileFinderTempDirNodeModules', {
            value: finder,
        });

        return finder;
    }

    setState(key, value) {
        this.state[key] = value;
    }

    getState(key, value) {
        return this.state[key] || value;
    }

    resolve(_path) {
        return path.resolve(this.root, _path);
    }

    resolveWorkspace(_path) {
        return path.resolve(this.root, CONSTANTS.MICRO_APP_DIR, _path);
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
        logger.debug('[Plugin]', `extendConfig( ${extendObj.name} ); Success!`);
    }

    extendMethod(name, opts, fn) {
        const extendObj = this.assertExtendOptions(name, opts, fn);
        this.extendMethods[extendObj.name] = {
            ...extendObj.opts,
            fn: extendObj.fn,
        };
        logger.debug('[Plugin]', `extendMethod( ${extendObj.name} ); Success!`);
    }

    registerCommand(name, opts, fn) {
        assert(!this.commands[name], `Command ${name} exists, please select another one.`);
        if (typeof opts === 'function') {
            fn = opts;
            opts = null;
        }
        opts = opts || {};
        this.commands[name] = { fn, opts };
        logger.debug('[Plugin]', `registerCommand( ${name} ); Success!`);
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
        assert(typeof key === 'string', 'key must be string.');
        const microsConfig = this.microsConfig;
        const microConfig = microsConfig[key];
        if (microConfig && microConfig.__isMicroAppConfig) {
            const root = microConfig.root;
            const _config = loadConfig(root, name);
            if (!_.isEmpty(_config)) {
                return _config;
            }
            // 附加配置中
            const _extraConfig = this.extraConfig || {};
            if (!_.isEmpty(_extraConfig[name])) {
                return _extraConfig[name];
            }
            // 以下可能会冲突，不考虑
            // const _originalConfig = microConfig.originalConfig || {};
            // if (!_.isEmpty(_originalConfig[name])) {
            //     return _originalConfig[name];
            // }
        }
        return null;
    }
}

module.exports = MethodService;
