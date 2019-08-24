'use strict';

const logger = require('../../utils/logger');
const requireMicro = require('../../utils/requireMicro');
const WebpackAdapter = require('../webpack');
const loadConfig = require('./loadConfig');
const tryRequire = require('try-require');
const vusionBuild = require('./build');
const vusionDevHot = require('./devHot');

const path = require('path');

const BaseWebpackAdapter = require('../base/BaseWebpackAdapter');

class VusionAdapter extends BaseWebpackAdapter {

    constructor() {
        super('Vusion');
        this.webpackAdapter = new WebpackAdapter();
    }

    mergeConfig(config) {
        if (!config) {
            config = {};
        }
        if (!config.webpack) {
            config.webpack = {};
        }
        let webpackConfig = config.webpack;
        config.webpack = this.webpackAdapter.mergeConfig(webpackConfig);
        webpackConfig = config.webpack;
        // logger.info(webpackConfig);

        const selfConfig = this.self;
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
                // logger.info(vusionConfig);
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
    }

    build() {
        let vusionConfigModule = tryRequire('vusion-cli/config/resolve');
        if (!vusionConfigModule) {
            vusionConfigModule = tryRequire(path.join(process.cwd(), 'node_modules', 'vusion-cli/config/resolve'));
            if (!vusionConfigModule) {
                logger.error('load vusion-cli error!');
                return null;
            }
        }
        let vusionConfig = vusionConfigModule();
        vusionConfig = global.vusionConfig = this.mergeConfig(vusionConfig);

        this._injectPlugins(vusionConfig.webpack);

        const selfConfig = this.self;
        return vusionBuild(vusionConfig, selfConfig);
    }

    serve() {
        let vusionConfigModule = tryRequire('vusion-cli/config/resolve');
        if (!vusionConfigModule) {
            vusionConfigModule = tryRequire(path.join(process.cwd(), 'node_modules', 'vusion-cli/config/resolve'));
            if (!vusionConfigModule) {
                logger.error('load vusion-cli error!');
                return null;
            }
        }
        let vusionConfig = vusionConfigModule();
        vusionConfig = global.vusionConfig = this.mergeConfig(vusionConfig);

        this._injectPlugins(vusionConfig.webpack, true);

        const wpDH = vusionDevHot(vusionConfig);
        return wpDH;
    }
}

module.exports = VusionAdapter;
