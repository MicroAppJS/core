'use strict';

const os = require('os');
const path = require('path');
const { logger, _, fs, assert, npa, parseGitUrl, globParent } = require('@micro-app/shared-utils');

const BaseService = require('./BaseService');

const CONSTANTS = require('../../Constants');
const makeFileFinder = require('../../../utils/makeFileFinder');

const requireMicro = require('../../../utils/requireMicro');
const loadFile = require('../../../utils/loadFile');

const INIT_TEMP_FILES = Symbol('INIT_TEMP_FILES');
const INIT_SYMLINKS = Symbol('INIT_SYMLINKS');

class MethodService extends BaseService {

    static get MICROS_GLOB() {
        // return [ '*' ];
        return [ '.micros/*' ];
    }

    constructor() {
        super();

        // 初始化临时文件夹
        this[INIT_TEMP_FILES]();
        // 初始化软链
        this[INIT_SYMLINKS]();
    }

    /**
     * @private
     *
     * @memberof BaseService
     */
    [INIT_TEMP_FILES]() {
        // TODO 初始化临时文件
        // 1. 有没有这个文件夹?
        const tempDir = path.resolve(this.nodeModulesPath, '.micros');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirpSync(tempDir);
        }
        // 2.

    }

    /**
     * @private
     *
     * @memberof BaseService
     */
    [INIT_SYMLINKS]() {
        // TODO 初始化链接, 依赖 packages
        // console.warn(this.packages);
    }


    get packages() {
        const pkgInfos = this.fileFinder(CONSTANTS.PACKAGE_JSON, filePaths => {
            return filePaths.map(filePath => {
                return loadFile(filePath);
            });
        });
        logger.debug('packages', `length: '${pkgInfos.length}'`);

        const packages = (this.self.micros || []).map(item => {
            if (!_.isString(item)) return null; // TODO 处理解析
            const pkgInfo = npa(item, this.root);
            // git, remote, file, directory, tag, version, range
            if ([ 'git', 'remote' ].includes(pkgInfo.type)) {
                const gitInfo = parseGitUrl(item);
                pkgInfo.source = pkgInfo.source || gitInfo.resource || undefined;
                pkgInfo.gitCommittish = pkgInfo.gitCommittish || gitInfo.hash || undefined;
                if (!pkgInfo.name) {
                    pkgInfo.setName(gitInfo.name);
                    pkgInfo.fullName = gitInfo.full_name;
                }
                pkgInfo.scope = pkgInfo.scope || gitInfo.organization || undefined;
            }
            pkgInfo.fullName = pkgInfo.fullName || pkgInfo.name;
            return pkgInfo;
        }).filter(item => {
            if (!item) return false;
            const pkgInfo = pkgInfos.find(info => info[CONSTANTS.Symbols.DIRNAME] === item.name);
            if (pkgInfo && pkgInfo.name) {
                item.setName(pkgInfo.name);
                item.location = pkgInfo[CONSTANTS.Symbols.ROOT];
            }
            return true;
        }).map(pkg => {
            if (pkg.location) { // 存在的重组
                const rootPath = this.root;
                const newPkg = npa.resolve(pkg.name, `file:${path.relative(rootPath, pkg.location)}`, rootPath);
                newPkg.fullName = newPkg.fullName || newPkg.name;
                return _.merge(pkg, newPkg);
            }
            return pkg;
        });

        Object.defineProperty(this, 'packages', {
            value: packages,
        });

        return packages;
    }

    get micros() {
        // 当前可用服务
        const microsSet = new Set(this.packages.map(pkg => pkg.name));
        const micros = [ ...microsSet ];
        // redefine getter to lazy-loaded value
        Object.defineProperty(this, 'micros', {
            writable: true,
            value: micros,
        });
        return micros;
    }

    get extraConfig() {
        // 加载高级附加配置
        const extraConfig = loadFile(this.root, CONSTANTS.EXTRAL_CONFIG_NAME);

        if (extraConfig && _.isPlainObject(extraConfig)) {
            Object.keys(extraConfig).forEach(key => {
                const item = extraConfig[key];
                logger.debug(`【 Extra Config 】${key}: ${os.EOL}${JSON.stringify(item, false, 4)}`);
            });
        }

        Object.defineProperty(this, 'extraConfig', {
            value: extraConfig,
        });

        return extraConfig || {};
    }

    get microsConfig() {
        const config = {};
        const microsExtraConfig = this.microsExtraConfig || {};

        // TODO 应该去找到正真的package.json, 并且拿到名称
        const packages = this.packages || [];

        // 暂时已被优化
        // @custom 开发模式软链接
        function changeRootPath(id, originalMicPath) {
            const extralConfig = microsExtraConfig[id];
            if (extralConfig && extralConfig.link && fs.existsSync(extralConfig.link)) {
                return [ extralConfig.link, originalMicPath ];
            }
            // TODO 从 packages 中获取
            const pkg = packages.find(pkg => pkg.name === id);
            if (pkg && pkg.location && fs.existsSync(pkg.location)) {
                return [ pkg.location, pkg.location ];
            }
            return null;
        }

        const scope = globParent(MethodService.MICROS_GLOB[0]);
        this.micros.forEach(key => {
            const microConfig = requireMicro(key, changeRootPath, scope);
            if (microConfig) {
                config[key] = _.cloneDeep(microConfig);
            } else {
                logger.warn(`Not Found micros: "${key}"`);
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
            writable: true,
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
    get microsExtraConfig() {
        const extraConfig = this.extraConfig || {};
        // 兼容旧版本
        const microsExtra = extraConfig.micro || extraConfig || {};
        const result = {};
        Object.keys(microsExtra).forEach(key => {
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

    get fileFinder() {
        const finder = makeFileFinder(this.nodeModulesPath, MethodService.MICROS_GLOB);

        // redefine getter to lazy-loaded value
        Object.defineProperty(this, 'fileFinder', {
            value: finder,
        });

        return finder;
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

module.exports = MethodService;
