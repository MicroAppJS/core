'use strict';

const webpackMerge = require('../../utils/merge-webpack');
const webpackBuild = require('./build');
const webpackDevHot = require('./devHot');

const BaseWebpackAdapter = require('../base/BaseWebpackAdapter');

class WebpackAdapter extends BaseWebpackAdapter {

    constructor() {
        super('WebpackV4');
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
        const selfConfig = this.self;
        return webpackBuild(webpackConfig, selfConfig);
    }

    serve() {
        const webpackConfig = this.mergeConfig();
        this._injectPlugins(webpackConfig, true);
        const wpDH = webpackDevHot(webpackConfig);
        return wpDH;
    }
}

module.exports = WebpackAdapter;
