'use strict';

const webpackMerge = require('../../utils/merge-webpack');
const webpackBuild = require('./build');
const webpackDevHot = require('./devHot');

const BaseWebpackAdapter = require('../base/BaseWebpackAdapter');

class WebpackV3Adapter extends BaseWebpackAdapter {

    constructor() {
        super('WebpackV3');
    }

    mergeConfig(webpackConfig) {
        const selfConfig = this.self;
        if (!webpackConfig) {
            webpackConfig = selfConfig.webpack;
        }
        const micros = selfConfig.micros;
        if (micros && Array.isArray(micros)) {
            webpackConfig = webpackMerge(webpackConfig, ...micros);
        }
        return webpackConfig;
    }

    build() {
        const webpackConfig = this.mergeConfig();
        this._injectPlugins(webpackConfig);
        return webpackBuild(webpackConfig);
    }

    devHot() {
        const webpackConfig = this.mergeConfig();
        this._injectPlugins(webpackConfig, true);
        const wpDH = webpackDevHot(webpackConfig);
        return wpDH;
    }
}

module.exports = WebpackV3Adapter;
