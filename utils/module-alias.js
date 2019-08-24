'use strict';

const tryRequire = require('try-require');
const path = require('path');

const requireMicro = require('./requireMicro');
const logger = require('./logger');

const cache = {};
const injectCache = {};

function loadAliasModule() {
    const moduleAlias = tryRequire('module-alias');
    if (moduleAlias) {
        return moduleAlias;
    }
    logger.warn('maybe not install module-alias');
    return null;
}

function injectAliasModule(names) {
    if (!names || !names.length) return;
    names.forEach(key => {
        if (!injectCache[key]) {
            const microConfig = requireMicro(key);
            injectSelfAliasModule(microConfig, key);
        }
    });

    // inject self
    const selfMicroConfig = requireMicro.self();
    injectSelfAliasModule(selfMicroConfig, '__self__');
}

function injectSelfAliasModule(microConfig, key) {
    if (injectCache[key]) {
        return;
    }
    if (!microConfig) {
        return;
    }
    const moduleAlias = loadAliasModule();
    if (moduleAlias) {
        // inject shared
        const alias = {};
        const aliasName = microConfig.name;
        if (aliasName) {
            const aliasKey = aliasName[0] !== '@' ? `@${aliasName}` : aliasName;
            if (aliasName) {
                const currShared = microConfig.shared;
                Object.keys(currShared).forEach(k => {
                    const p = currShared[k];
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

module.exports = function(...names) {
    if (!names || names.length <= 0) {
        // inject self
        const selfMicroConfig = requireMicro.self();
        injectSelfAliasModule(selfMicroConfig, '__self__');
        return;
    }
    names.forEach(key => {
        if (!cache[key]) {
            const microConfig = requireMicro(key);
            if (microConfig) {
                const root = microConfig.root;
                const moduleAlias = loadAliasModule();
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

    // inject self
    injectAliasModule(names);
};
