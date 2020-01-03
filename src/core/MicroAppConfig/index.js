'use strict';

const path = require('path');
const { logger, loadFile, _ } = require('@micro-app/shared-utils');

const CONSTANTS = require('../Constants');
const MicroAppConfig = require('./MicroAppConfig');

const loadConfigFile = require('../../utils/loadConfigFile').path;

module.exports = MicroAppConfig;

module.exports.createInstance = (rootPath = process.cwd(), { originalRootPath = rootPath, key } = {}) => {
    const { CONFIG_NAME, PACKAGE_JSON, SCOPE_NAME } = CONSTANTS;
    let [ microConfig, filePath ] = loadConfigFile(rootPath, CONFIG_NAME);
    if (microConfig) {
        const _microAppConfig = new MicroAppConfig(microConfig, {
            key,
            filePath,
            originalRoot: originalRootPath,
            loadSuccess: true,
        });
        return _microAppConfig;
    }
    microConfig = loadFile(rootPath, PACKAGE_JSON);
    if (microConfig) {
        // 文件未加载成功. 二次加载 package.json
        logger.warn('[loadFile]', `try load "${PACKAGE_JSON}"`);
        const filePath = path.resolve(rootPath, PACKAGE_JSON);
        const _microAppConfig = new MicroAppConfig(microConfig[SCOPE_NAME] || {}, {
            key: microConfig.name,
            filePath,
            originalRoot: originalRootPath,
            loadSuccess: false,
        });
        return _microAppConfig;
    }
    return null;
};
