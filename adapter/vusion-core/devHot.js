'use strict';

const logger = require('../../utils/logger');
const tryRequire = require('try-require');
const path = require('path');
const webpackDevHot = require('../webpack/devHot');

module.exports = function(vusionConfig) {
    const modulePath = 'vusion-cli-core';
    let vusionCore = tryRequire(modulePath);
    if (!vusionCore) {
        vusionCore = tryRequire(path.join(process.cwd(), 'node_modules', modulePath));
        if (!vusionCore) {
            logger.error(`load ${modulePath} error!`);
            return null;
        }
    }

    const webpackConfig = vusionCore.prepare('dev', vusionConfig);
    return webpackDevHot(webpackConfig);
};
