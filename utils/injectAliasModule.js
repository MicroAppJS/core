'use strict';

const moduleAlias = require('module-alias');

function injectAliasModule(alias) {
    if (alias && JSON.stringify(alias) !== '{}') {
        // inject shared
        moduleAlias.addAliases(alias);
    }
}

function injectAliasModulePath(paths) {
    if (Array.isArray(paths)) {
        paths = Array.from(new Set(paths));
        paths.forEach(item => {
            moduleAlias.addPath(item);
        });
    } else if (paths && typeof paths === 'string') {
        moduleAlias.addPath(paths);
    }
}

module.exports = {
    injectAliasModule,
    injectAliasModulePath,
};
