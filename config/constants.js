'use strict';

const pkg = require('../package.json');

module.exports = {
    NAME: 'Micro App',
    VERSION: pkg.version,
    ROOT: process.env.MICRO_APP_ROOT || process.cwd(),
    NODE_MODULES_NAME: 'node_modules',
    SCOPE_NAME: '@micro-app', // namespace
    CONFIG_NAME: 'micro-app.config.js',
    EXTRAL_CONFIG_NAME: 'micro-app.extral.config.js',
    TYPES: [], // support types
    INJECT_ID: '_MICRO_APP_INJECT_',
    PACKAGE_JSON: 'package.json',
};
