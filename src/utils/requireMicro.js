'use strict';

const path = require('path');

const CONSTANTS = require('../core/Constants');
const MicroAppConfig = require('../core/MicroAppConfig');

const SELF_CONFIG = Symbol('@MicroAppConfig#SELF_CONFIG');
const configCache = {};

function self() {
    const { ROOT } = CONSTANTS;
    if (configCache[SELF_CONFIG]) {
        return configCache[SELF_CONFIG];
    }
    const microConfig = loadMicroAppConfig(ROOT);
    if (microConfig) {
        configCache[SELF_CONFIG] = microConfig;
    }
    return microConfig;
}

function loadMicroAppConfig(rootPath, { originalRootPath = rootPath, key } = {}) {
    return MicroAppConfig.createInstance(rootPath, { originalRootPath, key });
}

function requireMicro(id, scope = CONSTANTS.NODE_MODULES_NAME, changeRootPath) {
    const { ROOT, SCOPE_NAME } = CONSTANTS;
    if (configCache[id]) {
        return configCache[id];
    }
    let key = id;
    let result = null;
    // 兼容 id
    let originalRootPath = path.resolve(ROOT, scope, key);
    result = loadMicroAppConfig(originalRootPath, { key, originalRootPath });
    if (!result) {
        key = `${SCOPE_NAME}/${id}`;
        originalRootPath = path.resolve(ROOT, scope, key);
        result = loadMicroAppConfig(originalRootPath, { key, originalRootPath });
    }
    if (result) { // cache
        if (changeRootPath) {
            result = loadMicroAppConfig(changeRootPath, { key, originalRootPath });
        }
        configCache[id] = result;
    }
    return result;
}

module.exports = requireMicro;
module.exports.self = self;

module.exports._cache = configCache;
module.exports._selfKey = SELF_CONFIG;
