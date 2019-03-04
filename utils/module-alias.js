'use strict';

const requireMicro = require('./requireMicro');
const tryRequire = require('try-require');
const path = require('path');

const cache = {};
const injectCache = {};

function injectAliasModule(names) {
    if (!names || !name.length) return;
    names.forEach(key => {
        if (!injectCache[key]) {
            const microConfig = requireMicro(key);
            if (microConfig) {
                const moduleAlias = tryRequire('module-alias');
                if (moduleAlias) {
                    // inject shared
                    const alias = {};
                    const aliasName = microConfig.name;
                    if (aliasName) {
                        const aliasKey = aliasName[0] !== '@' ? `@${aliasName}` : aliasName;
                        if (aliasName) {
                            Object.keys(microConfig.shared).forEach(k => {
                                const p = microConfig.shared[k];
                                if (p && typeof p === 'string' && !alias[`${aliasKey}/${k}`]) {
                                    const filePath = path.resolve(microConfig.root, p);
                                    alias[`${aliasKey}/${k}`] = filePath;
                                }
                            });
                        }
                    }
                    if (alias && JSON.stringify(alias) !== '{}') {
                        moduleAlias.addAliases(alias);
                        injectCache[key] = true;
                    }
                }
            }
        }
    });
}

module.exports = function(...names) {
    if (!names || names.length <= 0) {
        return;
    }
    names.forEach(key => {
        if (!cache[key]) {
            const microConfig = requireMicro(key);
            if (microConfig) {
                const root = microConfig.root;
                const moduleAlias = tryRequire('module-alias');
                if (moduleAlias) {
                    const _package = microConfig.package;
                    if (_package._moduleAliases || _package._moduleDirectories) {
                        moduleAlias(root);
                    }
                    cache[key] = true;
                }
            }
        }
    });

    injectAliasModule(names);
};
