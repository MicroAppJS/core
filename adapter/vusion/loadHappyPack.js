'use strict';

const os = require('os');
const HappyPack = require('happypack');

function getThreadSize() {
    const cupsSize = os.cpus().length;
    if (cupsSize > 16) return 16;
    return cupsSize > 8 ? Math.ceil(cupsSize / 3 * 2) : cupsSize;
}

function getHappyPackThreads(threadSize) {
    const options = {};
    if (threadSize > 4) {
        options.threads = 4;
    }
    return options;
}

module.exports = function loadHappyPack(webpackConfig, pluginConfig) {
    if (!pluginConfig.HappyPack) return webpackConfig;
    const options = pluginConfig.HappyPack || {};
    if (options.disabled) return webpackConfig;
    const rules = webpackConfig.module.rules;
    if (rules) {
        const threadSize = getThreadSize();
        const happyThreadPool = HappyPack.ThreadPool(Object.assign({ size: threadSize }, options));
        rules.forEach(rule => {
            if (rule.test && rule.test.test('.css')) {
                const loaders = rule.use || [ rule.loader ];
                if (loaders) {
                    delete rule.use;
                    delete rule.loader;
                    rule.use = 'happypack/loader?id=styles';
                    if (loaders[0] && loaders[0].loader && loaders[0].loader.includes('extract-text-webpack-plugin/dist/loader')) {
                        rule.use = [ loaders.shift(), rule.use, ...loaders.splice(-2) ];
                    }
                    if (rule.options && loaders[0] && typeof loaders[0] === 'object') {
                        loaders[0].options = rule.options;
                        delete rule.options;
                    }
                    webpackConfig.plugins.push(new HappyPack({
                        id: 'styles',
                        threadPool: happyThreadPool,
                        loaders,
                        ...getHappyPackThreads(threadSize),
                    }));
                }
            } else if (rule.test && rule.test.test('.js')) {
                const loaders = rule.use || [{
                    loader: rule.loader,
                }];
                if (loaders) {
                    delete rule.use;
                    delete rule.loader;
                    rule.use = 'happypack/loader?id=js';
                    if (rule.options && loaders[0] && typeof loaders[0] === 'object') {
                        loaders[0].options = rule.options;
                        delete rule.options;
                    }
                    webpackConfig.plugins.push(new HappyPack({
                        id: 'js',
                        threadPool: happyThreadPool,
                        loaders,
                        ...getHappyPackThreads(threadSize),
                    }));
                }
            } else if (rule.test && rule.test.test('.vue')) {
                const loaders = rule.use || [{
                    loader: rule.loader,
                }];
                if (loaders) {
                    delete rule.use;
                    delete rule.loader;
                    rule.use = 'happypack/loader?id=vue';
                    if (rule.options && loaders[0] && typeof loaders[0] === 'object') {
                        loaders[0].options = rule.options;
                        delete rule.options;
                    }
                    webpackConfig.plugins.push(new HappyPack({
                        id: 'vue',
                        threadPool: happyThreadPool,
                        loaders,
                        ...getHappyPackThreads(threadSize),
                    }));
                }
            // } else if (rule.test && rule.test.test('.vue/index.js')) {
            //     const loaders = rule.use || [{
            //         loader: rule.loader,
            //     }];
            //     if (loaders) {
            //         delete rule.use;
            //         delete rule.loader;
            //         rule.use = 'happypack/loader?id=vue-multifile';
            //         if (rule.options && loaders[0] && typeof loaders[0] === 'object') {
            //             loaders[0].options = rule.options;
            //             delete rule.options;
            //         }
            //         webpackConfig.plugins.push(new HappyPack({
            //             id: 'vue-multifile',
            //             threadPool: happyThreadPool,
            //             loaders,
            //         }));
            //     }
            }
        });
    }
    return webpackConfig;
};

