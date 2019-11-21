'use strict';

const { logger, _, fs, assert, globParent, loadFile } = require('@micro-app/shared-utils');

const BaseService = require('./BaseService');
const { parsePackageInfo } = require('./PackageInfo');
const ExtraConfig = require('./ExtraConfig');

const PackageGraph = require('../../PackageGraph');
const CONSTANTS = require('../../Constants');
const makeFileFinder = require('../../../utils/makeFileFinder');

const requireMicro = require('../../../utils/requireMicro');

class MethodService extends BaseService {

    static get MICROS_GLOB() {
        // return [ '*' ];
        return [ `${CONSTANTS.NODE_MODULES_NAME}/.micros/*` ];
    }

    get microsGlobs() {
        return MethodService.MICROS_GLOB;
    }

    get microsGlobParents() {
        return this.microsGlobs.map(glob => {
            const scope = globParent(glob);
            return scope;
        });
    }

    get packages() {
        const pkgInfos = this.fileFinder(CONSTANTS.PACKAGE_JSON, filePaths => {
            return filePaths.map(filePath => {
                return loadFile(filePath);
            });
        });
        logger.debug('packages', `length: '${pkgInfos.length}'`);

        const packages = (this.self.micros || []).map(name => {
            // ZAP 处理解析
            return parsePackageInfo(name, this.root, pkgInfos);
        }).filter(pkg => !!pkg);

        Object.defineProperty(this, 'packages', {
            value: packages,
        });

        return packages;
    }

    // TODO 重构， 支持 OBJECT， key : value
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

    get microsConfig() {
        const config = {};
        const microsExtraConfig = this.microsExtraConfig || {};

        // ZAP 应该去找到正真的package.json, 并且拿到名称
        const packages = this.packages || [];

        // 暂时已被优化
        // @custom 开发模式软链接
        function changeRootPath(id) {
            const extralConfig = microsExtraConfig[id];
            if (extralConfig && extralConfig.link && fs.existsSync(extralConfig.link)) {
                return extralConfig.link;
            }
            // ZAP 从 packages 中获取
            const pkg = packages.find(pkg => pkg.name === id);
            if (pkg && pkg.location && fs.existsSync(pkg.location)) {
                return pkg.location;
            }
            return null;
        }

        this.micros.forEach(key => {
            for (const scope of this.microsGlobParents) {
                const microConfig = requireMicro(key, scope, changeRootPath(key));
                if (microConfig) {
                    config[key] = _.cloneDeep(microConfig);
                }
            }
            if (!config[key]) {
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
    get extraConfig() {
        // 加载高级附加配置
        const extraConfig = new ExtraConfig(this.root);

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

        Object.defineProperty(this, 'microsConfig', {
            writable: true,
            value: microsPackageGraph,
        });

        return microsPackageGraph;
    }

    get fileFinder() {
        const finder = makeFileFinder(this.root, this.microsGlobs);

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
