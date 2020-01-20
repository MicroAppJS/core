'use strict';

const pkg = require('../../../package.json');
const path = require('path');

const constants = {
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
};

constants.MICRO_APP_CONFIG_DIR = path.join(constants.MICRO_APP_DIR, constants.MICRO_APP_CONFIG_NAME);

module.exports = constants;
