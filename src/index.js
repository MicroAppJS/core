'use strict';

const CONSTANTS = require('./core/Constants');
const Service = require('./core/Service');
const Command = require('./core/Command');
const logger = require('./utils/logger');
const loadFile = require('./utils/loadFile');
const requireMicro = require('./utils/requireMicro');

const {
    moduleAlias,
    smartMerge,
    virtualFile,
    injectHtml,
} = require('@micro-app/shared-utils');

// 核心模块不在提供工具
const utils = {
    loadFile,
    smartMerge,
    moduleAlias,
    virtualFile,
    injectHtml, // 可移除
    requireMicro,
};

module.exports = Object.assign(Service, utils, {
    CONSTANTS,
    Service, // 兼容
    Command,
    logger,
});
