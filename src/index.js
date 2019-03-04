'use strict';

const adapter = require('../adapter');
const logger = require('../utils/logger');
const requireMicro = require('../utils/requireMicro');
const constants = require('../config/constants');
const tryRequire = require('try-require');
const commonAdater = require('../adapter/common');

let _configCache = null;

const microApp = function() {
    return requireMicro.apply(requireMicro, arguments);
};

module.exports = Object.assign(microApp, requireMicro, adapter, {
    CONSTANT: constants,
    logger,
    config() {
        if (!_configCache) {
            const cfg = tryRequire('config') || {};
            _configCache = commonAdater.mergeConfig(cfg);
        }
        return _configCache;
    },
});
