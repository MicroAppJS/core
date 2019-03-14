'use strict';

const requireMicro = require('./requireMicro');
const tryRequire = require('try-require');
const path = require('path');

module.exports = function serverMerge(...names) {
    if (!names || names.length <= 0) {
        return [];
    }
    const microServers = [];
    names.forEach(key => {
        const microConfig = requireMicro(key);
        if (microConfig) {
            const root = microConfig.root;
            const _serverConfig = microConfig.server;
            const { entry, options = {} } = _serverConfig;
            if (entry) {
                const entryFile = path.resolve(root, entry);
                const entryCallback = tryRequire(entryFile);
                if (entryCallback && typeof entryCallback === 'function') {
                    microServers.push({
                        entry: entryCallback,
                        options,
                        info: microConfig.toJSON(true),
                    });
                }
            }
        }
    });
    return microServers;
};
