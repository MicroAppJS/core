'use strict';

const tryRequire = require('try-require');
const logger = require('./logger');

function loadAliasModule() {
    const moduleAlias = tryRequire('module-alias');
    if (moduleAlias) {
        return moduleAlias;
    }
    logger.warn('maybe not install module-alias');
    return null;
}

function injectAliasModule(alias) {
    if (alias && JSON.stringify(alias) !== '{}') {
        const moduleAlias = loadAliasModule();
        if (moduleAlias) {
            // inject shared
            moduleAlias.addAliases(alias);
        }
    }
}

module.exports = injectAliasModule;
