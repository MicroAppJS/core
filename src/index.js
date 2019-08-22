'use strict';

const logger = require('../utils/logger');
const requireMicro = require('../utils/requireMicro');
const injectHtml = require('../utils/injectHtml');
const CONSTANTS = require('../config/constants');
const HookEvent = require('../../MicroApp-CLI/plugins/commands/server/HookEvent');

const microApp = function() {
    return requireMicro.apply(requireMicro, arguments);
};

module.exports = Object.assign(microApp, requireMicro, {
    CONSTANTS,
    logger,
    injectHtml,
    HookEvent,
});
