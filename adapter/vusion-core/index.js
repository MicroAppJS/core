'use strict';

const logger = require('../../utils/logger');
const VusionAdapter = require('../vusion');
const tryRequire = require('try-require');
const vusionBuild = require('./build');
const vusionDevHot = require('./devHot');

const path = require('path');

const BaseWebpackAdapter = require('../base/BaseWebpackAdapter');

function resolveVusionConfig() {
    const modulePath = 'vusion-cli-core/src/vusionConfigResolver/resolve.js';
    let vusionConfigModule = tryRequire(modulePath);
    if (!vusionConfigModule) {
        vusionConfigModule = tryRequire(path.join(process.cwd(), 'node_modules', modulePath));
        if (!vusionConfigModule) {
            logger.error('load vusion-cli-core error!');
            return null;
        }
    }
    const configs = typeof vusionConfigModule === 'function' && vusionConfigModule() || {};
    return configs.vusionConfig;
}

class VusionCoreAdapter extends BaseWebpackAdapter {

    constructor() {
        super('VusionCore');
        this.vusionAdapter = new VusionAdapter();
    }

    mergeConfig(config) {
        return this.vusionAdapter.mergeConfig(config);
    }

    build() {
        const vusionConfig = global.vusionConfig = this.mergeConfig(resolveVusionConfig());

        this._injectPlugins(vusionConfig.webpack);

        const selfConfig = this.self;
        return vusionBuild(vusionConfig, selfConfig);
    }

    serve() {
        const vusionConfig = global.vusionConfig = this.mergeConfig(resolveVusionConfig());

        this._injectPlugins(vusionConfig.webpack, true);

        const wpDH = vusionDevHot(vusionConfig);
        return wpDH;
    }
}

module.exports = VusionCoreAdapter;
