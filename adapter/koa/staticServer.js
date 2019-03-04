'use strict';

const requireMicro = require('../../utils/requireMicro');
const path = require('path');

module.exports = function() {
    // 读取配置文件
    const selfConfig = requireMicro.self();
    const serverConfig = selfConfig.server;
    const webpackConfig = selfConfig.webpack;
    const { options = {}, staticBase } = serverConfig;

    let staticPath = staticBase && path.resolve(selfConfig.root, staticBase);
    if (!staticPath && webpackConfig && webpackConfig.output) {
        staticPath = webpackConfig.output.path;
    }
    if (!staticPath) {
        return { webpackConfig };
    }
    const koaStaticServer = require('koa-static');
    const koaStatic = koaStaticServer(staticPath, Object.assign({
        maxage: 1000 * 60 * 60 * 1,
        index: 'index.html',
    }, options));
    return {
        koaStatic,
        webpackConfig,
    };
};
