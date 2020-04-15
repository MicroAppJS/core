'use strict';

const path = require('path');
const { logger, loadFile } = require('@micro-app/shared-utils');

const CONSTANTS = require('../Constants');
const MicroAppConfig = require('./MicroAppConfig');
const loadConfig = require('../../utils/loadConfig').carryPath;

module.exports = MicroAppConfig;
module.exports.createInstance = createInstance;

/**
 * createInstance
 * @param {string} rootPath root
 * @param {Object} param param
 * @return {MicroAppConfig} config
 */
function createInstance(rootPath = process.cwd(), { originalRootPath = rootPath } = {}) {
    const { MICRO_APP_CONFIG_NAME, PACKAGE_JSON, SCOPE_NAME } = CONSTANTS;
    let [ microConfig, filePath ] = loadConfig(rootPath, MICRO_APP_CONFIG_NAME);
    if (microConfig) {
        const _microAppConfig = new MicroAppConfig(microConfig, {
            root: rootPath,
            filePath,
            originalRoot: originalRootPath,
            loadSuccess: true,
        });
        return _microAppConfig;
    }
    // 文件未加载成功. 二次加载 package.json
    microConfig = loadFile(rootPath, PACKAGE_JSON);
    if (microConfig) {
        logger.debug('[loadFile]', `try load "${PACKAGE_JSON}"`);
        const filePath = path.resolve(rootPath, PACKAGE_JSON);
        const _microAppConfig = new MicroAppConfig(microConfig[SCOPE_NAME] || {}, {
            root: rootPath,
            filePath,
            originalRoot: originalRootPath,
            loadSuccess: true,
        });
        return _microAppConfig;
    }
    return null;
}
