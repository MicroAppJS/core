'use strict';

const CONSTANTS = require('../config/constants');
const Service = require('../libs/Service');
const logger = require('../src/utils/logger');
const requireMicro = require('../src/utils/requireMicro');
const moduleAlias = require('../src/utils/injectModuleAlias');
const virtualFile = require('../src/utils/virtualFile');
const injectHtml = require('../src/utils/injectHtml');

const microApp = function() {
    return requireMicro.apply(requireMicro, arguments);
};

// TODO enhance utils (load package.json)

module.exports = Object.assign(microApp, requireMicro, {
    CONSTANTS,
    Service,
    logger,
    moduleAlias,
    virtualFile,
    injectHtml, // 可移除
});
