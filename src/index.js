'use strict';

const CONSTANTS = require('../libs/Constants');
const Service = require('../libs/Service');
const logger = require('../src/utils/logger');
const loadFile = require('../src/utils/loadFile');
const requireMicro = require('../src/utils/requireMicro');

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
