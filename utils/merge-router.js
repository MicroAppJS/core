'use strict';

const requireMicro = require('./requireMicro');
const tryRequire = require('try-require');
const path = require('path');

module.exports = function routerMerge(router, ...names) {
    if (!names || names.length <= 0) {
        return router;
    }
    const microRouters = [];
    names.forEach(key => {
        const microConfig = requireMicro(key);
        if (microConfig) {
            const root = microConfig.root;
            const _router = microConfig.shared.router;
            if (_router) {
                // const micros = microConfig.micros;
                // if (micros && Array.isArray(micros)) {
                //     router = routerMerge(router, micros);
                // }

                const routerPath = path.resolve(root, _router);
                const _koaRouter = tryRequire(routerPath);
                if (_koaRouter) {
                    microRouters.push(_koaRouter);
                }
            }
        }
    });
    if (microRouters.length) {
        microRouters.forEach(r => {
            router.use(r.routes(), r.allowedMethods());
        });
    }
    return router;
};
