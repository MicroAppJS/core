'use strict';

const logger = require('../../utils/logger');
const tryRequire = require('try-require');
const path = require('path');

module.exports = function(vusionConfig) {
    let webpackConfig = tryRequire('vusion-cli/webpack/' + vusionConfig.type);
    if (!webpackConfig) {
        webpackConfig = tryRequire(path.join(process.cwd(), 'node_modules', 'vusion-cli/webpack/' + vusionConfig.type));
        if (!webpackConfig) {
            logger.error('load vusion-cli error!');
            return Promise.reject('load vusion-cli error...');
        }
    }

    let buildCompiler = tryRequire('vusion-cli/lib/build');
    if (!buildCompiler) {
        buildCompiler = tryRequire(path.join(process.cwd(), 'node_modules', 'vusion-cli/lib/build'));
        if (!buildCompiler) {
            logger.error('load vusion-cli error!');
            return Promise.reject('load vusion-cli error...');
        }
    }

    const savedEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const compiler = buildCompiler(webpackConfig);
    process.env.NODE_ENV = savedEnv || 'development';

    const promise = compiler.run();
    return promise;
};
