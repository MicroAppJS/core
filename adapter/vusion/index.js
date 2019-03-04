'use strict';

const requireMicro = require('../../utils/requireMicro');
const webpackAdapter = require('../webpack');
const loadConfig = require('./loadConfig');
const tryRequire = require('try-require');
const vusionBuild = require('./build');
const vusionDevHot = require('./devHot');

const path = require('path');

module.exports = {
    mergeConfig(config) {
        if (!config) {
            config = {};
        }
        if (!config.webpack) {
            config.webpack = {};
        }
        let webpackConfig = config.webpack;
        config.webpack = webpackAdapter.mergeConfig(webpackConfig);
        webpackConfig = config.webpack;
        // console.log(webpackConfig);

        const selfConfig = requireMicro.self();
        const micros = selfConfig.micros;
        micros.forEach(key => {
            const microConfig = requireMicro(key);
            if (microConfig) {
                const rootCWD = microConfig.root;

                // fixed
                if (!Array.isArray(global.extraArgs)) {
                    global.extraArgs = [];
                }

                const vusionConfig = loadConfig(rootCWD);
                // console.log(vusionConfig);
                if (vusionConfig) {
                    if (vusionConfig.staticPath || vusionConfig.assetsPath) {
                        const CopyWebpackPlugin = tryRequire('copy-webpack-plugin');
                        if (CopyWebpackPlugin) {
                            if (!webpackConfig.plugins) {
                                webpackConfig.plugins = [];
                            }
                            // TODO: need fix vusion : CopyWebpackPlugin
                            webpackConfig.plugins.push(
                                new CopyWebpackPlugin([{
                                    from: path.resolve(rootCWD, vusionConfig.staticPath || vusionConfig.assetsPath),
                                    to: webpackConfig.output.path,
                                    ignore: [ '.*' ],
                                }])
                            );
                        }
                    }
                }
            }
        });
        return config;
    },
    build() {
        let vusionConfigModule = tryRequire('vusion-cli/config/resolve');
        if (!vusionConfigModule) {
            vusionConfigModule = tryRequire(path.join(process.cwd(), 'node_modules', 'vusion-cli/config/resolve'));
            if (!vusionConfigModule) {
                console.error('load vusion-cli error!');
                return null;
            }
        }
        let vusionConfig = vusionConfigModule();
        vusionConfig = global.vusionConfig = this.mergeConfig(vusionConfig);

        return vusionBuild(vusionConfig);
    },
    devHot(app) {
        let vusionConfigModule = tryRequire('vusion-cli/config/resolve');
        if (!vusionConfigModule) {
            vusionConfigModule = tryRequire(path.join(process.cwd(), 'node_modules', 'vusion-cli/config/resolve'));
            if (!vusionConfigModule) {
                console.error('load vusion-cli error!');
                return null;
            }
        }
        let vusionConfig = vusionConfigModule();
        vusionConfig = global.vusionConfig = this.mergeConfig(vusionConfig);

        const dh = vusionDevHot(vusionConfig);
        if (dh && app && typeof app.use === 'function') {
            const { compiler, devOptions } = dh;
            let publicPath = '/';
            if (vusionConfig && vusionConfig.webpack && vusionConfig.webpack.output) {
                publicPath = vusionConfig.webpack.output.publicPath || '/';
            }
            app.use(async (ctx, next) => {
                if (ctx.url === '/') {
                    ctx.url = `${publicPath}index.html`;
                }
                await next();
            });
            const { devMiddleware, hotMiddleware } = require('koa-webpack-middleware');
            app.use(devMiddleware(compiler, devOptions));
            app.use(hotMiddleware(compiler));
        }
        return dh;
    },
};
