'use strict';

const tryRequire = require('try-require');
const adapter = require('../adapter');
const logger = require('../utils/logger');
const requireMicro = require('../utils/requireMicro');
const injectHtml = require('../utils/injectHtml');
const constants = require('../config/constants');

let _configCache = null;

const microApp = function() {
    return requireMicro.apply(requireMicro, arguments);
};

module.exports = Object.assign(microApp, requireMicro, adapter, {
    CONSTANTS: constants,
    logger,
    config() {
        if (!_configCache) {
            const cfg = tryRequire('config') || {};
            _configCache = adapter.commonAdapter.mergeConfig(cfg);
        }
        return _configCache;
    },
    injectHtml,
});
