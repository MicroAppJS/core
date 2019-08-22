'use strict';

const merge = require('webpack-merge');
const tryRequire = require('try-require');

const logger = require('./logger');

// 附加选项配置
function extralCustomConfig(webpackConfig = {}, extralConfig) {
    const disabled = extralConfig.disabled || extralConfig.disable;
    if (disabled) { // disabled entry
        delete webpackConfig.entry;
        delete webpackConfig.plugins;
        Object.keys(webpackConfig.plugin).forEach(key => {
            if (key.indexOf('-html') > 0) {
                delete webpackConfig.plugin[key];
            }
        });
    }
    return webpackConfig;
}

function removeUselessPlugins(webpackConfig) {
    const plugins = webpackConfig.plugins;
    if (plugins && Array.isArray(plugins)) {
        webpackConfig.plugins = plugins.filter(item => {
            const constru = item.constructor;
            if (constru && constru.name && constru.name !== 'Function') {
                return true;
            }
            return false;
        });
    }
    return webpackConfig;
}

// 修补
function patchWebpack(microConfig) {
    if (!microConfig) {
        return {};
    }
    const webpackConfig = {};
    if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
    }
    if (!webpackConfig.resolve.modules || !Array.isArray(webpackConfig.resolve.modules)) {
        webpackConfig.resolve.modules = [];
    }
    if (microConfig.nodeModules && !webpackConfig.resolve.modules.includes(microConfig.nodeModules)) {
        webpackConfig.resolve.modules.push(microConfig.nodeModules);
    }

    if (!webpackConfig.entry) {
        webpackConfig.entry = {};
    }
    Object.assign(webpackConfig.entry, microConfig.entry);

    return injectWebpackPlugins(webpackConfig, microConfig);
}

function injectWebpackPlugins(webpackConfig = {}, microConfig) {
    if (!microConfig) {
        return webpackConfig;
    }

    const aliasName = microConfig.aliasName;

    if (!webpackConfig.plugin) {
        webpackConfig.plugin = {};
    }
    const HtmlWebpackPlugin = tryRequire('html-webpack-plugin');
    if (Array.isArray(microConfig.htmls) && HtmlWebpackPlugin) {
        const _htmls = microConfig.htmls;
        _htmls.forEach((item, index) => {
            const id = item.id || index;
            try {
                webpackConfig.plugin[id ? `${aliasName}-html-${id}` : `${aliasName}-html`] = {
                    plugin: HtmlWebpackPlugin,
                    args: [ item ],
                };
            } catch (error) {
                logger.warn(`[ htmls error] id: ${id}, options: ${JSON.stringify(item, false, 4)}`);
                throw error;
            }
        });
    } else if (!HtmlWebpackPlugin) {
        logger.warn('not found "html-webpack-plugin"');
    }

    const webpack = tryRequire('webpack');
    if (Array.isArray(microConfig.dlls) && webpack) {
        const _dlls = microConfig.dlls;
        _dlls.forEach((item, index) => {
            const id = item.id || index;
            try {
                webpackConfig.plugin[id ? `${aliasName}-dll-${id}` : `${aliasName}-dll`] = {
                    plugin: webpack.DllReferencePlugin,
                    args: [{
                        context: item.context,
                        manifest: require(item.manifest),
                    }],
                };

                const AddAssetHtmlPlugin = tryRequire('add-asset-html-webpack-plugin');
                if (!AddAssetHtmlPlugin) {
                    logger.warn('not found "add-asset-html-webpack-plugin"');
                } else {
                    webpackConfig.plugin[id ? `${aliasName}-add-asset-html-${id}` : `${aliasName}-add-asset-html`] = {
                        plugin: AddAssetHtmlPlugin,
                        args: [ item ],
                    };
                }
            } catch (error) {
                logger.warn(`[ dlls error] id: ${id}, options: ${JSON.stringify(item, false, 4)}`);
                throw error;
            }
        });
    } else if (!webpack) {
        logger.warn('not found "webpack"');
    }

    return removeUselessPlugins(webpackConfig);
}

// inject alias
function injectWebpackAlias(webpackConfig, microConfig = {}) {
    if (!webpackConfig) {
        return;
    }
    if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
    }
    if (!webpackConfig.resolve.alias) {
        webpackConfig.resolve.alias = {};
    }
    Object.assign(webpackConfig.resolve.alias, microConfig.resolveAlias);
    return webpackConfig;
}

// 去重复
function uniqArray(webpackConfig) {
    if (!webpackConfig) {
        return null;
    }
    if (webpackConfig.resolve && webpackConfig.resolve.modules && Array.isArray(webpackConfig.resolve.modules)) {
        webpackConfig.resolve.modules = [ ...new Set(webpackConfig.resolve.modules) ];
    }
    if (webpackConfig.entry) {
        const entry = webpackConfig.entry;
        if (typeof entry === 'object') {
            Object.keys(entry).forEach(key => {
                if (Array.isArray(entry[key])) {
                    entry[key] = [ ...new Set(entry[key]) ];
                }
            });
        }
    }
    return webpackConfig;
}


function webpackMerge(webpackConfig = {}, opts = {}) {
    let config = patchWebpack(opts.config);
    const names = opts.micros;
    if (!names || names.length <= 0) {
        // inject self
        injectWebpackAlias(config, opts.config);
        return merge.smart(webpackConfig, config);
    }

    // extral config
    const microsExtral = opts.microsExtral || {};

    const microConfigs = [];
    names.forEach(key => {
        const microConfig = opts.microsConfig[key];
        if (microConfig) {
            const wc = patchWebpack(microConfig);
            // inject
            injectWebpackAlias(wc, microConfig);

            const extralConfig = microsExtral[key];
            if (extralConfig) {
                extralCustomConfig(wc, extralConfig);
            }
            microConfigs.push(wc);
        }
    });

    if (microConfigs.length) {
        config = merge.smart(webpackConfig, ...microConfigs, config);
    }
    // inject self
    injectWebpackAlias(config, opts.config);

    return uniqArray(config);
}

webpackMerge.injectWebpackPlugins = injectWebpackPlugins;

module.exports = webpackMerge;
