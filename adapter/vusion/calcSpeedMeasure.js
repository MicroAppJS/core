'use strict';

const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');

function removeUselessPlugins(webpackConfig) {
    const plugins = webpackConfig.plugins;
    if (plugins && Array.isArray(plugins)) {
        webpackConfig.plugins = plugins.filter(item => {
            const constru = item.constructor;
            if (constru && constru.name) {
                return true;
            }
            return false;
        });
    }
    return webpackConfig;
}

module.exports = function calcSpeedMeasure(webpackConfig, pluginConfig) {
    if (!pluginConfig.SpeedMeasurePlugin) return webpackConfig;
    const options = pluginConfig.SpeedMeasurePlugin || {};
    if (options.disabled) return webpackConfig;
    webpackConfig = removeUselessPlugins(webpackConfig);
    const smp = new SpeedMeasurePlugin(options);
    return smp.wrap(webpackConfig);
};
