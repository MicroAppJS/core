'use strict';

const microApp = require('@micro-app/core');
const tryRequire = require('try-require');
const logger = microApp.logger;

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
            const microConfig = microApp(key);
            injectSelfAliasModule(microConfig, key);
        }
    });

    // inject self
    const selfMicroConfig = microApp.self();
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
        const alias = microConfig.resolveShared;
        if (alias && JSON.stringify(alias) !== '{}') {
            moduleAlias.addAliases(alias);
            injectCache[key] = true;
        }
    }
}

module.exports = function(...names) {
    if (!names || names.length <= 0) {
        // inject self
        const selfMicroConfig = microApp.self();
        injectSelfAliasModule(selfMicroConfig, '__self__');
        return;
    }
    names.forEach(key => {
        if (!cache[key]) {
            const microConfig = microApp(key);
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
