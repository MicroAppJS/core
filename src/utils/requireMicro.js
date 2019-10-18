'use strict';

const path = require('path');
const fs = require('fs-extra');

const CONSTANTS = require('../../libs/Constants');
const MicroAppConfig = require('../../libs/Config');
const symbols = require('../../libs/Constants/symbols');
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

function isExists(p) {
    try {
        return fs.existsSync(p) && fs.statSync(p).isDirectory();
    } catch (error) {
        return false;
    }
}

// TODO global 可优化
// @custom 开发模式软链接
// 当 global.MicroAppConfig.microsExtraConfig 存在时, 才会开启软链功能
function fixedDevLink(id, micPath) {
    const MicroAppConfig = global.MicroAppConfig || {};
    const microsExtraConfig = MicroAppConfig.microsExtraConfig || {};
    const extralConfig = microsExtraConfig[id];
    if (extralConfig && extralConfig.link && fs.existsSync(extralConfig.link)) {
        return extralConfig.link;
    }
    return micPath;
}

function requireMicro(id) {
    const { ROOT, SCOPE_NAME, CONFIG_NAME, NODE_MODULES_NAME } = CONSTANTS;
    const name = `${SCOPE_NAME}/${id}`;
    if (configCache[name]) {
        return configCache[name];
    }
    // 兼容 id
    let originalMicPath = path.join(ROOT, NODE_MODULES_NAME, id);
    if (isExists(originalMicPath)) {
        const micPath = fixedDevLink(id, originalMicPath);
        const microConfig = loadFile(micPath, CONFIG_NAME);
        if (microConfig) {
            microConfig[symbols.KEY] = id;
            microConfig[symbols.ORIGINAL_ROOT] = originalMicPath;
            const _microAppConfig = new MicroAppConfig(microConfig);
            configCache[name] = _microAppConfig;
            return _microAppConfig;
        }
    } else {
        originalMicPath = path.join(ROOT, NODE_MODULES_NAME, name);
        if (isExists(originalMicPath)) {
            const micPath = fixedDevLink(id, originalMicPath);
            const microConfig = loadFile(micPath, CONFIG_NAME);
            if (microConfig) {
                microConfig[symbols.KEY] = id;
                microConfig[symbols.ORIGINAL_ROOT] = originalMicPath;
                const _microAppConfig = new MicroAppConfig(microConfig);
                configCache[name] = _microAppConfig;
                return _microAppConfig;
            }
        }
    }
    return null;
}


module.exports = requireMicro;

module.exports.self = self;

module.exports._cache = configCache;
module.exports._selfKey = SELF_CONFIG;
