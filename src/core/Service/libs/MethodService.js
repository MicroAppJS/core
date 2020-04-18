'use strict';

const { logger, _, fs, assert, loadFile, tryRequire, path } = require('@micro-app/shared-utils');

const BaseService = require('./BaseService');
const { parsePackageInfo } = require('./PackageInfo');
const ExtraConfig = require('../../ExtraConfig');

const MicroAppConfig = require('../../MicroAppConfig');
const Package = require('../../Package');
const PackageGraph = require('../../PackageGraph');
const CONSTANTS = require('../../Constants');
const makeFileFinder = require('../../../utils/makeFileFinder');

const loadConfig = require('../../../utils/loadConfig');
const validateSchema = require('../../../utils/validateSchema');

// 全局状态集
const GLOBAL_STATE = {};
const G_TEMP_CACHE = new Map();

class MethodService extends BaseService {

    constructor(context) {
        super(context);

        this.extendConfigs = {};
        this.extendMethods = {};
        this.commands = {};
        this.commandOptions = {};

        this.state = GLOBAL_STATE; // 状态集
    }

    get configDir() {
        const configDir = this.resolveWorkspace(CONSTANTS.MICRO_APP_CONFIG_NAME);

        Object.defineProperty(this, 'configDir', {
            value: configDir,
        });
        return configDir;
    }

    get tempDir() { // {{ root }}/.temp
        const tempDir = path.resolve(__dirname, '../../../', CONSTANTS.MICRO_APP_TEMP_DIR);

        Object.defineProperty(this, 'tempDir', {
            value: tempDir,
        });
        return tempDir;
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

        // [兼容] 在 context 中增加变量判断是否要加 scope，后期可去除
        const autoPrefixScope = this.context.autoPrefixScope || false;
        // 已优化
        this.micros.forEach(key => {
            if (autoPrefixScope) {
                // 这里可以对 key 做 scope 兼容
                if (!key.startsWith(`${CONSTANTS.SCOPE_NAME}/`)) {
                    key = `${CONSTANTS.SCOPE_NAME}/${key}`;
                }
            }
            // @custom 开发模式软链接
            const extralConfig = microsExtraConfig[key];
            let originalRootPath = tryRequire.resolve(path.join(key, CONSTANTS.PACKAGE_JSON));
            originalRootPath = originalRootPath && path.parse(originalRootPath).dir || path.join(this.root, CONSTANTS.NODE_MODULES_NAME, key);
            let _rootPath = originalRootPath;
            if (extralConfig && extralConfig.link && fs.existsSync(extralConfig.link)) {
                _rootPath = extralConfig.link;
            }
            let microConfig = null;
            if (_rootPath) { // 子模块不应该不存在路径
                microConfig = MicroAppConfig.createInstance(_rootPath, { originalRootPath });
            }
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
        config[selfKey] = this.self;

        Object.defineProperty(this, 'microsConfig', {
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

    get fileFinder() {
        const finder = makeFileFinder(this.root, [ '*', '*/*' ]);

        // redefine getter to lazy-loaded value
        Object.defineProperty(this, 'fileFinder', {
            value: finder,
        });

        return finder;
    }

    /**
     * @private
     */
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
        return value;
    }

    getState(key, value) {
        const v = this.state[key];
        if (_.isUndefined(v)) {
            return value;
        }
        return v;
    }

    resolve(..._paths) {
        return path.resolve(this.root, ..._paths);
    }

    resolveWorkspace(..._paths) {
        return this.resolve(CONSTANTS.MICRO_APP_DIR, ..._paths);
    }

    resolveTemp(..._paths) {
        return this.resolve(this.tempDir, ..._paths);
    }

    assertExtendOptions(name, opts, fn) {
        assert(typeof name === 'string', 'name must be string.');
        assert(name || /^_/i.test(name), `${name} cannot begin with '_'.`);
        let override = false;
        if (typeof opts === 'function') {
            fn = opts;
            opts = null;
        } else if (opts && opts.override === true) {
            override = true;
        }
        if (!override) { // 强制覆盖
            assert(!this.hasKey(name), `api.${name} exists.`);
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

    // 扩充 or 更改 Command Option
    changeCommandOption(name, newOpts) {
        assert(name, 'name must supplied');
        assert(_.isPlainObject(newOpts) || _.isFunction(newOpts), 'newOpts must be object or function');
        if (!Array.isArray(this.commandOptions[name])) {
            this.commandOptions[name] = [];
        }
        this.commandOptions[name].push(newOpts);
        logger.debug('[Plugin]', `changeCommandOption( ${name} ); Success!`);
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
            // 单独配置文件
            let _config = loadConfig(root, name);
            if (_.isFunction(_config)) {
                _config = _config();
            }
            if (!_.isEmpty(_config)) {
                return _config;
            }
            // 附加配置文件中
            const _extraConfig = this.extraConfig || {};
            if (!_.isEmpty(_extraConfig[name])) {
                return _extraConfig[name];
            }
        }
        return null;
    }

    getTempDirPackageGraph() {
        const pkgInfos = this.fileFinderTempDirNodeModules(CONSTANTS.PACKAGE_JSON, filePaths => {
            return filePaths.map(filePath => {
                const packageJson = loadFile(filePath);
                try {
                    return new Package(packageJson, path.dirname(filePath), this.root);
                } catch (error) {
                    return false;
                }
            }).filter(item => !!item);
        });
        logger.debug('[core > fileFinderTempDirNodeModules]', `packages length: '${pkgInfos.length}'`);
        const tempDirPackageGraph = new PackageGraph(pkgInfos, 'dependencies');
        return tempDirPackageGraph;
    }

    /**
     * 异步写临时文件
     * @param {String} file 文件名
     * @param {String} content 内容
     * @return {Promise<String>} destPath
     */
    async writeTempFile(file, content) {
        const destPath = path.join(this.tempDir, file);
        await fs.ensureDir(path.parse(destPath).dir);
        // cache write to avoid hitting the dist if it didn't change
        const cached = G_TEMP_CACHE.get(file);
        if (cached !== content) {
            await fs.writeFile(destPath, content);
            G_TEMP_CACHE.set(file, content);
        }
        return destPath;
    }

    /**
     * 同步写临时文件
     * @param {String} file 文件名
     * @param {String} content 内容
     * @return {String} destPath
     */
    writeTempFileSync(file, content) {
        const destPath = path.join(this.tempDir, file);
        fs.ensureDirSync(path.parse(destPath).dir);
        // cache write to avoid hitting the dist if it didn't change
        const cached = G_TEMP_CACHE.get(file);
        if (cached !== content) {
            fs.writeFileSync(destPath, content);
            G_TEMP_CACHE.set(file, content);
        }
        return destPath;
    }

    /**
     * @override
     * @param {String} name key
     */
    hasKey(name) {
        return super.hasKey(name) || !!this.extendConfigs[name] || !!this.extendMethods[name];
    }

    validateSchema(schema, config) {
        return validateSchema(schema, config);
    }
}

module.exports = MethodService;
