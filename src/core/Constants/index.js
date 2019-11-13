'use strict';

const pkg = require('../../../package.json');
const Symbols = require('./symbols');

module.exports = {
    Symbols,
    NAME: 'Micro App',
    VERSION: pkg.version,
    ROOT: process.env.MICRO_APP_ROOT || process.cwd(),
    NODE_MODULES_NAME: 'node_modules',
    PACKAGE_JSON: 'package.json',
    SCOPE_NAME: '@micro-app', // namespace
    CONFIG_NAME: 'micro-app.config.js',
    EXTRAL_CONFIG_NAME: 'micro-app.extra.config.js',
    TYPES: [], // support types
    INJECT_ID: '_MICRO_APP_INJECT_',
    ENV_PREFIX: 'MICRO_APP_',
};
