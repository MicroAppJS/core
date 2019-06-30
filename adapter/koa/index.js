'use strict';

const logger = require('../../utils/logger');
const requireMicro = require('../../utils/requireMicro');
const routerMerge = require('../../utils/merge-router');
const middlewareMerge = require('../../utils/merge-middleware');
const fixedModuleAlias = require('../common/fixedModuleAlias');

const staticServer = require('./staticServer');

const BaseServerAdapter = require('../base/BaseServerAdapter');

const DEV = Symbol('koa#server#dev');

class KoaAdapter extends BaseServerAdapter {

    constructor() {
        super('KOA');
    }

    mergeRouter(router) {
        if (!router) {
            const koaRouter = require('koa-router');
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
        const koaCompose = require('koa-compose');
        const mw = koaCompose(middlewares);
        if (mw && app && typeof app.use === 'function') {
            app.use(mw);
        }
        return mw;
    }

    runServer(programOpts = {}, callback) {
        this._initDotenv();

        const Koa = require('koa');
        const convert = require('koa-convert');

        const app = new Koa();
        // 兼容koa1的中间件
        const _use = app.use;
        app.use = x => _use.call(app, convert(x));

        // init module-alias
        fixedModuleAlias();
        this._initHooks(app);

        app.on('error', (error, ctx) => {
            logger.error('koa server error: ', error);

            this._hooks('error', error, ctx);
        });

        this._hooks('init'); // 优先级最高

        this._hooks('before');

        // micro server
        this._initEntry(app);

        this._hooks('after');

        if (programOpts[DEV]) {
            // hotload webpack
            if (!programOpts.onlyNode && programOpts.type !== 'server') {
                const webpackAdapter = programOpts.type === 'vusion' ? require('../vusion') : require('../webpack');
                const webpackDevHot = webpackAdapter.devHot();
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
                        ctx.url = `${publicPath}index.html`;
                    }
                    await next();
                });
                const { devMiddleware, hotMiddleware } = require('koa-webpack-middleware');
                app.use(devMiddleware(compiler, devOptions));
                app.use(hotMiddleware(compiler));
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

            this._hooks('end'); // ? 用途不明确
        });
    }

    devHot(programOpts = {}, callback) {
        logger.info('DevServer Start...');

        return this.runServer(
            Object.assign({}, programOpts, {
                [DEV]: true,
            }),
            callback
        );
    }
}
module.exports = new KoaAdapter();
