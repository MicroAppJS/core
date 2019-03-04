'use strict';

const path = require('path');

const { ROOT, SCOPE_NAME, CONFIG_NAME, NODE_MODULES_NAME } = require('../config/constants');
const loadFile = require('./loadFile');
const MicroAppConfig = require('../libs/MicroAppConfig');

const SELF_CONFIG = Symbol('#self_config');
const configCache = {};

const requireMicro = function(id) {
    const name = `${SCOPE_NAME}/${id}`;
    if (configCache[name]) {
        return configCache[name];
    }
    const micPath = path.join(ROOT, NODE_MODULES_NAME, name);
    // TODO 兼容 id
    if (micPath) {
        const microConfig = loadFile(micPath, CONFIG_NAME);
        if (microConfig) {
            const _microAppConfig = new MicroAppConfig(microConfig);
            configCache[name] = _microAppConfig;
            return _microAppConfig;
        }
    }
    return null;
};

requireMicro.self = function() {
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

module.exports = requireMicro;
