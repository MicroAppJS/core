'use strict';

const pkg = require('../../../package.json');
const SHARED_PROPS = require('./SharedProps');

module.exports = {
    PKG: pkg,
    NAME: 'Micro App',
    VERSION: pkg.version,
    ROOT: process.env.MICRO_APP_ROOT || process.cwd(),
    NODE_MODULES_NAME: 'node_modules',
    PACKAGE_JSON: 'package.json',
    SCOPE_NAME: '@micro-app', // namespace
    CONFIG_NAME: 'micro-app.config', // 兼容
    EXTRAL_CONFIG_NAME: 'micro-app.extra.config', // 兼容
    SUPPOER_CONFIG_FILE_EXTS: [ '.js', '.json', '.yaml', '.yml' ],
    // TYPES: [], // support types， 不需要限制
    INJECT_ID: '_MICRO_APP_INJECT_',
    ENV_PREFIX: 'MICRO_APP_',

    // ======= NEW =======
    MICRO_APP_CONFIG_NAME: 'config', // 不可更改
    MICRO_APP_EXTRA_CONFIG_NAME: 'extra', // 不可更改
    MICRO_APP_DIR: 'microapp',
    MICRO_APP_TEMP_DIR: '.temp', // glob temp
    API_TYPE: { // plugin api type
        ADD: Symbol('add'),
        MODIFY: Symbol('modify'),
        EVENT: Symbol('event'),
        EXTEND: Symbol('extend'),
    },
    // 内置插件标识
    BUILT_IN: Symbol.for('built-in'),
};

// service 对 pluginAPI 暴露的所有方法
module.exports.SHARED_PROPS = SHARED_PROPS;
