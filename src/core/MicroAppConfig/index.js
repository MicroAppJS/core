'use strict';

const path = require('path');
const { logger, loadFile, _ } = require('@micro-app/shared-utils');

const CONSTANTS = require('../Constants');
const MicroAppConfig = require('./MicroAppConfig');

module.exports = MicroAppConfig;

function loadConfigFile(rootPath) {
    const { CONFIG_NAME, SUPPOER_CONFIG_FILE_EXTS } = CONSTANTS;
    const exts = [ ].concat(SUPPOER_CONFIG_FILE_EXTS);

    let microConfig;
    let filePath;
    while (!microConfig && exts.length > 0) {
        filePath = path.resolve(rootPath, `${CONFIG_NAME}${exts.shift()}`);
        microConfig = loadFile(filePath);
    }

    if (!microConfig) {
        filePath = undefined;
    }

    return [ microConfig, filePath ];
}

module.exports.createInstance = (rootPath = process.cwd(), { originalRootPath = rootPath, key } = {}) => {
    const { PACKAGE_JSON, SCOPE_NAME } = CONSTANTS;
    let [ microConfig, filePath ] = loadConfigFile(rootPath);
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
    if (microConfig && _.isPlainObject(microConfig[SCOPE_NAME])) {
        // 文件未加载成功.
        logger.warn('load', `second load "${PACKAGE_JSON}"`);
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
};
