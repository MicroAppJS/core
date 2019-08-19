'use strict';

const logger = require('../utils/logger');
const requireMicro = require('../utils/requireMicro');
const injectHtml = require('../utils/injectHtml');
const CONSTANTS = require('../config/constants');
const HookEvent = require('../libs/HookEvent');

// utils
const serverMerge = require('../utils/merge-server');
const serverHooksMerge = require('../utils/merge-server-hooks');

const loadConfig = require('./loadConfig');
const loadServerConfig = require('./loadServerConfig');
const loadPlugins = require('./loadPlugins');

const microApp = function() {
    return requireMicro.apply(requireMicro, arguments);
};

module.exports = Object.assign(microApp, requireMicro, {
    CONSTANTS,
    logger,
    injectHtml,
    HookEvent,
    Utils: {
        serverMerge,
        serverHooksMerge,
    },
    loadConfig,
    loadServerConfig,
    loadPlugins,
});
