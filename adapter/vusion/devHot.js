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
            return null;
        }
    }

    let devCompiler = tryRequire('vusion-cli/lib/dev');
    if (!devCompiler) {
        devCompiler = tryRequire(path.join(process.cwd(), 'node_modules', 'vusion-cli/lib/dev'));
        if (!devCompiler) {
            logger.error('load vusion-cli error!');
            return null;
        }
    }

    const { compiler, devOptions } = devCompiler.prepare(webpackConfig);
    return { webpackConfig, compiler, devOptions };
};
