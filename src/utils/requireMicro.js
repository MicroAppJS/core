'use strict';

const path = require('path');
const { _, fs } = require('@micro-app/shared-utils');

const CONSTANTS = require('../core/Constants');
const MicroAppConfig = require('../core/Config');
const symbols = require('../core/Constants/symbols');
const loadFile = require('./loadFile');

const SELF_CONFIG = Symbol('@MicroAppConfig#SELF_CONFIG');
const configCache = {};

function self() {
    const { ROOT, CONFIG_NAME } = CONSTANTS;
    if (configCache[SELF_CONFIG]) {
        return configCache[SELF_CONFIG];
    }
    let microConfig = loadFile(ROOT, CONFIG_NAME);
    if (!microConfig) { // 可忽略配置文件.
        microConfig = loadFile.extraConfig({}, ROOT, CONFIG_NAME);
    }
    if (microConfig) {
        const _microAppConfig = new MicroAppConfig(microConfig);
        configCache[SELF_CONFIG] = _microAppConfig;
        return _microAppConfig;
    }
    return null;
}

function loadMicroAppConfig(id, [ rootPath, originalMicPath ]) {
    const { CONFIG_NAME } = CONSTANTS;
    const microConfig = loadFile(rootPath, CONFIG_NAME);
    if (microConfig) {
        microConfig[symbols.KEY] = id;
        microConfig[symbols.ORIGINAL_ROOT] = originalMicPath;
        const _microAppConfig = new MicroAppConfig(microConfig);
        configCache[name] = _microAppConfig;
        return _microAppConfig;
    }
    return null;
}

function requireMicro(id, changeRootPath, scope = '') {
    const { ROOT, SCOPE_NAME, NODE_MODULES_NAME } = CONSTANTS;
    const name = `${SCOPE_NAME}/${id}`;
    if (configCache[name]) {
        return configCache[name];
    }
    let result = null;
    // 兼容 id
    let originalMicPath = path.resolve(ROOT, NODE_MODULES_NAME, scope, id);
    const ps = _.isFunction(changeRootPath) && changeRootPath(id, originalMicPath) || [ originalMicPath, originalMicPath ];
    result = loadMicroAppConfig(id, ps);
    if (!result) {
        originalMicPath = path.resolve(ROOT, NODE_MODULES_NAME, scope, name);
        const ps = _.isFunction(changeRootPath) && changeRootPath(id, originalMicPath) || [ originalMicPath, originalMicPath ];
        result = loadMicroAppConfig(id, ps);
    }
    return result;
}


module.exports = requireMicro;
module.exports.self = self;

module.exports._cache = configCache;
module.exports._selfKey = SELF_CONFIG;
