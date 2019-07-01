'use strict';

const BaseAdapter = require('./BaseAdapter');
const ReplaceFileNotExistsPlugin = require('../../plugins/ReplaceFileNotExistsPlugin');
const CONSTANTS = require('../../config/constants');

class BaseWebpackAdapter extends BaseAdapter {

    mergeConfig() {
        throw new Error('Not Implemented!');
    }

    build() {
        throw new Error('Not Implemented!');
    }

    devHot() {
        throw new Error('Not Implemented!');
    }

    _injectPlugins(webpackConfig, isDev = false) {
        if (!Array.isArray(webpackConfig.plugins)) {
            webpackConfig.plugins = [];
        }

        const selfConfig = this.self;
        const pluginOpts = selfConfig.plugin;
        // inject plugin
        if (isDev && selfConfig.strict === false) {
            const options = Object.assign({
                test: CONSTANTS.SCOPE_NAME ? new RegExp('^' + CONSTANTS.SCOPE_NAME + '/') : /^@micro-app\//i,
            }, pluginOpts.ReplaceFileNotExists);
            webpackConfig.plugins.push(new ReplaceFileNotExistsPlugin(options));
        }
    }
}

module.exports = BaseWebpackAdapter;
