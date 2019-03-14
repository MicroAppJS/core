'use strict';

const requireMicro = require('./requireMicro');
const merge = require('webpack-merge');
const tryRequire = require('try-require');
const path = require('path');

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
                            console.warn('fixed entry: ', item);
                            return path.join(microConfig.root, item);
                        }
                        return item;
                    });
                } else if (typeof _entrys === 'string') {
                    if (!tryRequire.resolve(_entrys)) {
                        console.warn('fixed entry: ', _entrys);
                        entry[key] = path.join(microConfig.root, _entrys);
                    }
                }
            });
        }
    }
    if (webpackConfig.plugins && Array.isArray(webpackConfig.plugins)) {
        webpackConfig.plugins.forEach(item => {
            if (item.options && item.options.template) {
                const template = item.options.template;
                if (!tryRequire(template)) {
                    console.warn('fixed plugins->template: ', template);
                    item.options.template = path.join(microConfig.root, template);
                }
            }
        });
    }
    return webpackConfig;
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
    injectSelfWebpackAlias(microConfig, webpackConfig);
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
            Object.keys(microConfig.alias).forEach(key => {
                const p = microConfig.alias[key];
                if (p && typeof p === 'string' && !alias[`${aliasKey}/${key}`]) {
                    const filePath = path.resolve(microConfig.root, p);
                    alias[`${aliasKey}/${key}`] = filePath;
                }
            });
        }
    }
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

    const microConfigs = [];
    names.forEach(key => {
        const microConfig = requireMicro(key);
        if (microConfig) {
            const webpackConfig = patchWebpack(microConfig);
            if (webpackConfig) {
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
    // inject self
    injectSelfWebpackAlias(selfConfig, config);

    if (microConfigs.length) {
        config = merge(...microConfigs, config);
    }
    return uniqArray(config);
};
