'use strict';

const logger = require('../utils/logger');
const requireMicro = require('../utils/requireMicro');
const injectHtml = require('../utils/injectHtml');
const CONSTANTS = require('../config/constants');
const Service = require('../libs/Service');

const microApp = function() {
    return requireMicro.apply(requireMicro, arguments);
};

module.exports = Object.assign(microApp, requireMicro, {
    CONSTANTS,
    logger,
    injectHtml,
    Service,
});
