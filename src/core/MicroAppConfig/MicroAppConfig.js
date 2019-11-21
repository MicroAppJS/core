'use strict';

const path = require('path');
const { globby, logger, loadFile, _ } = require('@micro-app/shared-utils');

const CONSTANTS = require('../Constants');
const BaseConfig = require('./libs/BaseConfig');
const Package = require('../Package');

class MicroAppConfig extends BaseConfig {

    static createInstance(rootPath = process.cwd(), { originalRootPath = rootPath, key } = {}) {
        const { CONFIG_NAME, PACKAGE_JSON, SCOPE_NAME } = CONSTANTS;
        let microConfig = loadFile(rootPath, CONFIG_NAME);
        if (microConfig) {
            const filePath = path.resolve(rootPath, CONFIG_NAME);
            const _microAppConfig = new MicroAppConfig(microConfig, {
                key,
                filePath,
                originalRoot: originalRootPath,
                loadSuccess: true,
            });
            return _microAppConfig;
        }
        microConfig = loadFile(rootPath, PACKAGE_JSON);
        if (microConfig && _.isPlainObject(microConfig[SCOPE_NAME])) {
            // 文件未加载成功.
            logger.warn(`second load "${PACKAGE_JSON}"`);
            const filePath = path.resolve(rootPath, PACKAGE_JSON);
            const _microAppConfig = new MicroAppConfig(microConfig[SCOPE_NAME], {
                key: microConfig.name,
                filePath,
                originalRoot: originalRootPath,
                loadSuccess: false,
            });
            return _microAppConfig;
        }
        return null;
    }

    static get LICENSE_GLOB() {
        return 'LICEN{S,C}E{,.*}';
    }

    get __isMicroAppConfig() {
        return true;
    }

    get manifest() {
        let manifest;

        try {
            const packageJson = this.package;
            // Encapsulate raw JSON in Package instance
            manifest = new Package(packageJson, this.root);

            // redefine getter to lazy-loaded value
            Object.defineProperty(this, 'manifest', {
                value: manifest,
            });
        } catch (err) {
            // try again next time
        }

        return manifest;
    }

    get licensePath() {
        let licensePath;

        try {
            const search = globby.sync(MicroAppConfig.LICENSE_GLOB, {
                cwd: this.root,
                absolute: true,
                case: false,
                // Project license is always a sibling of the root manifest
                deep: false,
                // POSIX results always need to be normalized
                transform: fp => {
                    return path.normalize(fp);
                },
            });

            licensePath = search.shift();

            if (licensePath) {
            // redefine getter to lazy-loaded value
                Object.defineProperty(this, 'licensePath', {
                    value: licensePath,
                });
            }
        } catch (err) {
            throw err;
        }

        return licensePath;
    }
}

module.exports = MicroAppConfig;
