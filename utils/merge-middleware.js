'use strict';

const requireMicro = require('./requireMicro');
const tryRequire = require('try-require');
const path = require('path');

module.exports = function middlewareMerge(...names) {
    if (!names || names.length <= 0) {
        return [];
    }
    const microMiddlewares = [];
    names.forEach(key => {
        const microConfig = requireMicro(key);
        if (microConfig) {
            const root = microConfig.root;
            const _middleware = microConfig.shared.middleware;
            if (_middleware) {
                // const micros = microConfig.micros;
                // if (micros && Array.isArray(micros)) {
                //     microMiddlewares = microMiddlewares.concat(middlewareMerge(micros));
                // }

                const middlewarePath = path.resolve(root, _middleware);
                const _koaMiddleware = tryRequire(middlewarePath);
                if (_koaMiddleware) {
                    microMiddlewares.push(_koaMiddleware);
                }
            }
        }
    });
    return microMiddlewares;
};
