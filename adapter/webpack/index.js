'use strict';

const requireMicro = require('../../utils/requireMicro');
const webpackMerge = require('../../utils/merge-webpack');
const webpackBuild = require('./build');
const webpackDevHot = require('./devHot');

const BaseAdapter = require('../base/BaseAdapter');

class WebpackV3Adapter extends BaseAdapter {

    constructor() {
        super('WebpackV3');
    }

    mergeConfig(webpackConfig) {
        const selfConfig = requireMicro.self();
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
