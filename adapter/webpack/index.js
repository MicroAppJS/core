'use strict';

const requireMicro = require('../../utils/requireMicro');
const webpackMerge = require('../../utils/merge-webpack');
const webpackBuild = require('./build');
const webpackDevHot = require('./devHot');

module.exports = {
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
    },
    build() {
        const webpackConfig = this.mergeConfig();
        return webpackBuild(webpackConfig);
    },
    devHot(app) {
        const webpackConfig = this.mergeConfig();
        const wpDH = webpackDevHot(webpackConfig);
        if (wpDH && app && typeof app.use === 'function') {
            const { compiler, devOptions } = wpDH;
            let publicPath = '/';
            if (webpackConfig && webpackConfig.output) {
                publicPath = webpackConfig.output.publicPath || '/';
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
        return wpDH;
    },
};
