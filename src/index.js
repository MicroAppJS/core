'use strict';

const CONSTANTS = require('./core/Constants');
const Service = require('./core/Service');
const logger = require('./utils/logger');
const loadFile = require('./utils/loadFile');
const requireMicro = require('./utils/requireMicro');

const {
    moduleAlias,
    smartMerge,
    virtualFile,
    injectHtml,
} = require('@micro-app/shared-utils');

function microApp() {
    return requireMicro.apply(requireMicro, arguments);
}

// 核心模块不在提供工具
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
