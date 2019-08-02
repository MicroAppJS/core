'use strict';

const Koa = require('koa');
const koaRouter = require('koa-router');
const koaCompose = require('koa-compose');
const koaConvert = require('koa-convert');

const logger = require('../../utils/logger');
const requireMicro = require('../../utils/requireMicro');
const routerMerge = require('../../utils/merge-router');
const middlewareMerge = require('../../utils/merge-middleware');
const fixedModuleAlias = require('../common/fixedModuleAlias');

const staticServer = require('./staticServer');

const BaseServerAdapter = require('../base/BaseServerAdapter');

const DEV = Symbol('koa#server#dev');

class KoaAdapter extends BaseServerAdapter {

    constructor(webpackAdapter, options = {}) {
        super('KOA');
        this.webpackAdapter = webpackAdapter;
        this.options = options;
    }

    mergeRouter(router) {
        if (!router) {
            router = new koaRouter();
        }
        const selfConfig = requireMicro.self();
        const micros = selfConfig.micros;
        if (micros && Array.isArray(micros)) {
            // init module-alias
            fixedModuleAlias();
            router = routerMerge(router, ...micros);
        }
        return router;
    }

    mergeMiddleware(app) {
        let middlewares = [];
        const selfConfig = requireMicro.self();
        const micros = selfConfig.micros;
        if (micros && Array.isArray(micros)) {
            // init module-alias
            fixedModuleAlias();
            middlewares = middlewareMerge(...micros) || [];
        }
        const mw = koaCompose(middlewares);
        if (mw && app && typeof app.use === 'function') {
            app.use(mw);
        }
        return mw;
    }

    start(callback) {
        this._initDotenv();

        const app = new Koa();
        // 兼容koa1的中间件
        const _use = app.use;
        app.use = x => _use.call(app, koaConvert(x));

        // init module-alias
        fixedModuleAlias();
        this._initHooks(app);

        app.on('error', (error, ctx) => {
            logger.error('koa server error: ', error);

            this._hooks('error', error, ctx);
        });

        // 服务代理 proxy
        const isProxyGlobal = this._initProxy(app);
        if (!isProxyGlobal) { // 全局代理则不走服务端业务逻辑
            this._hooks('init'); // 优先级最高
            this._hooks('before');
            // micro server
            this._initEntry(app);
            this._hooks('after');
        } else {
            this._hooks('proxy');
        }

        const programOpts = this.options;
        if (this[DEV]) {
            // hotload webpack
            if (!programOpts.onlyNode && programOpts.type !== 'server') {
                const webpackDevHot = this.webpackAdapter.serve();
                if (!webpackDevHot) {
                    throw new Error('load webpackDevHot error!!!');
                }

                const { webpackConfig, compiler, devOptions } = webpackDevHot;

                let publicPath = '/';
                if (webpackConfig && webpackConfig.output) {
                    publicPath = webpackConfig.output.publicPath || '/';
                }
                app.use(async (ctx, next) => {
                    if (ctx.url === '/') {
                        // FIXME 这里需要优化
                        ctx.url = `${publicPath}index.html`;
                    }
                    await next();
                });

                if (this.webpackAdapter.TYPE === 'WebpackV3' || this.webpackAdapter.TYPE === 'Vusion') {
                    const { devMiddleware, hotMiddleware } = require('koa-webpack-middleware');
                    app.use(devMiddleware(compiler, devOptions));
                    app.use(hotMiddleware(compiler));
                } else {
                    const koaWebpack = require('koa-webpack');
                    (async () => {
                        const middleware = await koaWebpack({ compiler, devMiddleware: devOptions });
                        app.use(middleware);
                    })();
                }
            }
        } else {
            // static file
            const { koaStatic, webpackConfig } = staticServer();
            if (koaStatic) {
                let publicPath = '/';
                if (webpackConfig && webpackConfig.output) {
                    publicPath = webpackConfig.output.publicPath || '/';
                }
                const reg = new RegExp(`^${publicPath}`, 'g');
                app.use(async (ctx, next) => {
                    if (ctx.url && publicPath) {
                        ctx.url = ctx.url.replace(reg, '/');
                    }
                    await next();
                });
                app.use(koaStatic);
            }
        }

        // 读取配置文件
        const selfConfig = requireMicro.self();
        const serverConfig = selfConfig.server;
        const port = programOpts.port || serverConfig.port || 8888;
        const host = programOpts.host || serverConfig.host || 'localhost';
        app.listen(port, host === 'localhost' ? '0.0.0.0' : host, err => {
            if (err) { return logger.error(err); }

            logger.success(`Server running..., listen on ${port}`);

            const url = `http://${host}:${port}`;
            callback && typeof callback === 'function' && callback(url);
        });
    }

    serve(callback) {
        logger.info('DevServer Start...');
        this[DEV] = true;
        return this.start(callback);
    }
}
module.exports = KoaAdapter;
