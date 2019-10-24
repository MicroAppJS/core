'use strict';

const CONSTANTS = require('../libs/Constants');
const Service = require('../libs/Service');
const logger = require('../src/utils/logger');
const loadFile = require('../src/utils/loadFile');
const smartMerge = require('../src/utils/smartMerge');
const requireMicro = require('../src/utils/requireMicro');
const moduleAlias = require('../src/utils/injectModuleAlias');
const virtualFile = require('../src/utils/virtualFile');
const injectHtml = require('../src/utils/injectHtml');

function microApp() {
    return requireMicro.apply(requireMicro, arguments);
}

const utils = {
    loadFile,
    smartMerge,
    moduleAlias,
    virtualFile,
    injectHtml, // 可移除
};

module.exports = Object.assign(microApp, requireMicro, utils, {
    CONSTANTS,
    Service,
    logger,
});
