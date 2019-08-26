'use strict';

const tryRequire = require('try-require');
const path = require('path');

function adapter(microConfig) {
    const microServers = [];
    const root = microConfig.root;
    const { entry, options = {}, info } = microConfig;
    if (entry) {
        const entryFile = path.resolve(root, entry);
        const entryCallback = tryRequire.resolve(entryFile);
        if (entryCallback && typeof entryCallback === 'string') {
            microServers.push({
                link: entryCallback,
                options,
                info,
            });
        }
    }
    return microServers;
}

function serverMerge(...microConfigs) {
    if (!microConfigs || microConfigs.length <= 0) {
        return [];
    }
    const microServers = [];
    microConfigs.forEach(microConfig => {
        microServers.push(...adapter(microConfig));
    });
    return microServers;
}

serverMerge.adapter = adapter;
module.exports = serverMerge;
