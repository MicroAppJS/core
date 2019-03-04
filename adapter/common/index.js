'use strict';

const requireMicro = require('../../utils/requireMicro');
const configMerge = require('../../utils/merge-config');
const fixedModuleAlias = require('./fixedModuleAlias');

// normal config
module.exports = {
    mergeConfig(config) {
        if (!config) {
            config = {};
        }
        const selfConfig = requireMicro.self();
        const micros = selfConfig.micros;
        if (micros && Array.isArray(micros)) {
            // init module-alias
            fixedModuleAlias();
            config = configMerge(config, ...micros);
        }
        return config;
    },
    moduleAlias: fixedModuleAlias,
};
