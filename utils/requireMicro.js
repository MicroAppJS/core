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

// 开发模式软链接
const fixedDevLink = function(id, micPath) {
    const _selfConfig = self();
    if (!_selfConfig) throw new Error('Not Found "micro-app.config.js"');
    // extral config
    const microsExtral = _selfConfig.microsExtral || {};
    const extralConfig = microsExtral[id];
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
    let originalMicPath = path.join(ROOT, NODE_MODULES_NAME, name);
    if (originalMicPath) {
        const micPath = fixedDevLink(id, originalMicPath);
        const microConfig = loadFile(micPath, CONFIG_NAME);
        if (microConfig) {
            microConfig[symbols.ORIGINAL_ROOT] = originalMicPath;
            const _microAppConfig = new MicroAppConfig(microConfig);
            configCache[name] = _microAppConfig;
            return _microAppConfig;
        }
        // 兼容 id
        originalMicPath = path.join(ROOT, NODE_MODULES_NAME, id);
        if (originalMicPath) {
            const micPath = fixedDevLink(id, originalMicPath);
            const microConfig = loadFile(micPath, CONFIG_NAME);
            if (microConfig) {
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
