'use strict';

const path = require('path');
const fs = require('fs');

const CONSTANTS = require('../config/constants');
const loadFile = require('./loadFile');
const MicroAppConfig = require('../libs/MicroAppConfig');
const symbols = require('../config/symbols');

const SELF_CONFIG = Symbol('@MicroAppConfig#SELF_CONFIG');
const configCache = {};

const self = function() {
    const { ROOT, CONFIG_NAME } = CONSTANTS;
    if (configCache[SELF_CONFIG]) {
        return configCache[SELF_CONFIG];
    }
    const microConfig = loadFile(ROOT, CONFIG_NAME);
    if (microConfig) {
        const _microAppConfig = new MicroAppConfig(microConfig);
        configCache[SELF_CONFIG] = _microAppConfig;
        return _microAppConfig;
    }
    return null;
};

const isExists = function(p) {
    try {
        return fs.existsSync(p) && fs.statSync(p).isDirectory();
    } catch (error) {
        return false;
    }
};

// @custom 开发模式软链接
// 当 global.MicroAppConfig.microsExtralConfig 存在时, 才会开启软链功能
const fixedDevLink = function(id, micPath) {
    const MicroAppConfig = global.MicroAppConfig || {};
    const microsExtralConfig = MicroAppConfig.microsExtralConfig || {};
    const extralConfig = microsExtralConfig[id];
    if (extralConfig && extralConfig.link && fs.existsSync(extralConfig.link)) {
        return extralConfig.link;
    }
    return micPath;
};

const requireMicro = function(id) {
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
        if (originalMicPath) {
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
};

requireMicro.self = self;

module.exports = requireMicro;
