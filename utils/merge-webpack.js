'use strict';

const requireMicro = require('./requireMicro');
const merge = require('webpack-merge');
const tryRequire = require('try-require');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

// 附加选项配置
function extralCustomConfig(microConfig, extralConfig) {
    if (!microConfig) {
        return;
    }
    const webpackConfig = microConfig.webpack;
    if (!webpackConfig) {
        return;
    }
    const disabled = extralConfig.disabled || extralConfig.disable;
    if (disabled) { // disabled entry
        delete webpackConfig.entry;
        delete webpackConfig.plugins;
    }
    return microConfig;
}

// 修补
function patchWebpack(microConfig) {
    if (!microConfig) {
        return null;
    }
    const webpackConfig = microConfig.webpack;
    if (!webpackConfig) {
        return null;
    }
    if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
    }
    if (!webpackConfig.resolve.modules || !Array.isArray(webpackConfig.resolve.modules)) {
        webpackConfig.resolve.modules = [];
    }
    if (microConfig.nodeModules && !webpackConfig.resolve.modules.includes(microConfig.nodeModules)) {
        webpackConfig.resolve.modules.push(microConfig.nodeModules);
    }

    // fix entry path
    if (webpackConfig.entry) {
        const entry = webpackConfig.entry;
        if (typeof entry === 'object') {
            Object.keys(entry).forEach(key => {
                const _entrys = entry[key];
                if (Array.isArray(_entrys)) {
                    entry[key] = _entrys.map(item => {
                        if (!tryRequire.resolve(item)) {
                            logger.warn('fixed entry: ', item);
                            return path.join(microConfig.root, item);
                        }
                        return item;
                    });
                } else if (typeof _entrys === 'string') {
                    if (!tryRequire.resolve(_entrys)) {
                        logger.warn('fixed entry: ', _entrys);
                        entry[key] = path.join(microConfig.root, _entrys);
                    }
                }
            });
        }
    }
    // fix plugins
    if (webpackConfig.plugins && Array.isArray(webpackConfig.plugins)) {
        webpackConfig.plugins = webpackConfig.plugins.filter(item => {
            const constru = item.constructor;
            if (constru && constru.name) {
                const constructorName = constru.name;
                if (constructorName === 'HtmlWebpackPlugin') {
                    if (item.options && item.options.template) {
                        const template = item.options.template;
                        if (!tryRequire(template)) {
                            logger.warn('fixed plugins->template: ', template);
                            item.options.template = path.join(microConfig.root, template);
                        }
                    }
                    return true;
                }
            }
            // 副产品不需要其他
            return false;
        });
    }

    return webpackConfig;
}

// 注入 dll
function injectDllPlugin(microConfig) {
    if (!microConfig) {
        return null;
    }
    const webpackConfig = microConfig.webpack;
    if (!webpackConfig) {
        return null;
    }
    // inject dll
    if (microConfig.dll && typeof microConfig.dll === 'object') {
        if (!microConfig.dll.disabled) {
            if (microConfig.dll.context && microConfig.dll.manifest && microConfig.dll.filepath) {
                const context = path.resolve(microConfig.root, microConfig.dll.context);
                const filepath = path.resolve(microConfig.root, microConfig.dll.filepath);
                const manifest = path.resolve(microConfig.root, microConfig.dll.manifest);
                if (fs.existsSync(context) && fs.existsSync(filepath) && fs.existsSync(manifest)) {
                    if (!webpackConfig.plugins || !Array.isArray(webpackConfig.plugins)) {
                        webpackConfig.plugins = [];
                    }
                    const AddAssetHtmlPlugin = tryRequire('add-asset-html-webpack-plugin');
                    const webpack = tryRequire('webpack');
                    if (AddAssetHtmlPlugin && webpack) {
                        const dllConfig = JSON.parse(JSON.stringify(microConfig.dll));
                        delete dllConfig.context;
                        delete dllConfig.filepath;
                        delete dllConfig.manifest;
                        webpackConfig.plugins.push(
                            new webpack.DllReferencePlugin({
                                context,
                                manifest: require(manifest),
                            }),
                            new AddAssetHtmlPlugin({
                                filepath,
                                ...Object.assign({
                                    hash: true,
                                    includeSourcemap: false,
                                }, dllConfig),
                            })
                        );
                    }
                }
            }
        }
    }
    return microConfig;
}

// inject alias
function injectWebpackAlias(microConfig) {
    if (!microConfig) {
        return;
    }
    const webpackConfig = microConfig.webpack;
    if (!webpackConfig) {
        return;
    }
    return injectSelfWebpackAlias(microConfig, webpackConfig);
}

// inject self alias
function injectSelfWebpackAlias(microConfig, webpackConfig) {
    if (!microConfig) {
        return;
    }
    if (!webpackConfig) {
        return;
    }
    if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
    }
    if (!webpackConfig.resolve.alias) {
        webpackConfig.resolve.alias = {};
    }
    const alias = webpackConfig.resolve.alias;
    const aliasName = microConfig.name;
    if (aliasName) {
        const aliasKey = aliasName[0] !== '@' ? `@${aliasName}` : aliasName;
        if (aliasName) {
            const currAlias = microConfig.alias;
            Object.keys(currAlias).forEach(key => {
                const p = currAlias[key];
                if (p && typeof p === 'string' && !alias[`${aliasKey}/${key}`]) {
                    const filePath = path.resolve(microConfig.root, p);
                    alias[`${aliasKey}/${key}`] = filePath;
                }
            });
        }
    }
    return microConfig;
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

module.exports = function webpackMerge(config = {}, ...names) {
    const selfConfig = requireMicro.self() || {};
    if (!names || names.length <= 0) {
        // inject self
        injectSelfWebpackAlias(selfConfig, config);
        return config;
    }

    // extral config
    const microsExtral = selfConfig.microsExtral || {};
    const microsDllPlugin = selfConfig.dll || {};

    const microConfigs = [];
    names.forEach(key => {
        const microConfig = requireMicro(key);
        if (microConfig) {
            const webpackConfig = patchWebpack(microConfig);
            if (webpackConfig) {
                if (!microsDllPlugin.disabled) {
                    injectDllPlugin(microConfig);
                }

                // const micros = microConfig.micros;
                // if (micros && Array.isArray(micros)) {
                //     webpackConfig = webpackMerge(webpackConfig, micros);
                // }

                // inject
                injectWebpackAlias(microConfig);

                const extralConfig = microsExtral[key];
                if (extralConfig) {
                    extralCustomConfig(microConfig, extralConfig);
                }
                microConfigs.push(webpackConfig);
            }
        }
    });

    if (microConfigs.length) {
        config = merge(...microConfigs, config);
    }
    // inject self
    injectSelfWebpackAlias(selfConfig, config);

    return uniqArray(config);
};
