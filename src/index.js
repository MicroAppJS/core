'use strict';

const CONSTANTS = require('../config/constants');
const Service = require('../libs/Service');
const logger = require('../utils/logger');
const requireMicro = require('../utils/requireMicro');
const moduleAlias = require('../utils/module-alias');
const virtualFile = require('../utils/virtualFile');
const injectHtml = require('../utils/injectHtml');

const microApp = function() {
    return requireMicro.apply(requireMicro, arguments);
};

module.exports = Object.assign(microApp, requireMicro, {
    CONSTANTS,
    Service,
    logger,
    moduleAlias,
    virtualFile,
    injectHtml, // 可移除
});
