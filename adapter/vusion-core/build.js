'use strict';

const logger = require('../../utils/logger');
const tryRequire = require('try-require');
const path = require('path');
const webpackBuild = require('../webpack/build');

module.exports = function(vusionConfig, selfConfig) {
    const modulePath = 'vusion-cli-core';
    let vusionCore = tryRequire(modulePath);
    if (!vusionCore) {
        vusionCore = tryRequire(path.join(process.cwd(), 'node_modules', modulePath));
        if (!vusionCore) {
            logger.error('load vusion-cli-core error!');
            return null;
        }
    }

    const webpackConfig = vusionCore.prepare('build', vusionConfig);
    return webpackBuild(webpackConfig);
};
