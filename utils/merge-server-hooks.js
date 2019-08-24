'use strict';

const requireMicro = require('./requireMicro');
const tryRequire = require('try-require');
const path = require('path');
const fs = require('fs');

function adapter(microConfig) {
    const microServers = [];
    const root = microConfig.root;
    const _serverConfig = microConfig.server;
    const { hooks, options = {} } = _serverConfig;
    if (hooks) {
        const info = microConfig.toJSON(true);
        const hooksFile = path.resolve(root, hooks);
        if (fs.statSync(hooksFile).isDirectory()) {
            const hookFuncs = [];
            fs.readdirSync(hooksFile).forEach(filename => {
                const fp = path.resolve(hooksFile, filename);
                const hooksCallback = tryRequire(fp);
                if (hooksCallback && typeof hooksCallback === 'function') {
                    hookFuncs.push({
                        key: filename.replace(/\.js$/, ''),
                        value: hooksCallback,
                    });
                }
            });
            if (hookFuncs.length) {
                microServers.push({
                    hooks: hookFuncs.reduce((obj, item) => {
                        obj[item.key] = item.value;
                        return obj;
                    }, {}),
                    options,
                    info,
                });
            }
        } else {
            const hooksCallback = tryRequire(hooksFile);
            if (hooksCallback && typeof hooksCallback === 'function') {
                microServers.push({
                    hooks: hooksCallback,
                    options,
                    info,
                });
            }
        }
    }
    return microServers;
}

function serverHooksMerge(...names) {
    if (!names || names.length <= 0) {
        return [];
    }
    const microServers = [];
    names.forEach(key => {
        const microConfig = requireMicro(key);
        if (microConfig) {
            microServers.push(...adapter(microConfig));
        }
    });
    return microServers;
}

serverHooksMerge.adapter = adapter;
module.exports = serverHooksMerge;
