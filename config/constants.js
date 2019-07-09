'use strict';

module.exports = {
    NAME: 'Micro App',
    ROOT: process.env.MICRO_APP_ROOT || process.cwd(),
    NODE_MODULES_NAME: 'node_modules',
    SCOPE_NAME: '@micro-app', // namespace
    CONFIG_NAME: 'micro-app.config.js',
    TYPES: [], // support types
    INJECT_ID: '_MICRO_APP_INJECT_',
    NODE_ENV: process.env.NODE_ENV || 'production', // "production" | "development"
};
