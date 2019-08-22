'use strict';

const tryRequire = require('try-require');
const path = require('path');
const fs = require('fs');

function adapter(microConfig) {
    const microServers = [];
    const root = microConfig.root;
    const { hooks, options = {}, info } = microConfig;
    if (hooks) {
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

function serverHooksMerge(...microConfigs) {
    if (!microConfigs || microConfigs.length <= 0) {
        return [];
    }
    const microServers = [];
    microConfigs.forEach(microConfig => {
        if (microConfig) {
            microServers.push(...adapter(microConfig));
        }
    });
    return microServers;
}

serverHooksMerge.adapter = adapter;
module.exports = serverHooksMerge;
