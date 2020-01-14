'use strict';

const pkg = require('../../../package.json');
const Symbols = require('./symbols');
const path = require('path');

const constants = {
    Symbols,
    NAME: 'Micro App',
    VERSION: pkg.version,
    ROOT: process.env.MICRO_APP_ROOT || process.cwd(),
    NODE_MODULES_NAME: 'node_modules',
    PACKAGE_JSON: 'package.json',
    SCOPE_NAME: '@micro-app', // namespace
    CONFIG_NAME: 'micro-app.config',
    EXTRAL_CONFIG_NAME: 'micro-app.extra.config',
    SUPPOER_CONFIG_FILE_EXTS: [ '.js', '.json', '.yaml', '.yml' ],
    // TYPES: [], // support types， 不需要限制
    INJECT_ID: '_MICRO_APP_INJECT_',
    ENV_PREFIX: 'MICRO_APP_',
    MICRO_APP_DIR: 'microapp',
    MICRO_APP_TEMP_DIR: '.temp', // glob temp
};

constants.MICRO_APP_CONFIG_DIR = path.join(constants.MICRO_APP_DIR, 'config');

module.exports = constants;
