'use strict';

const requireMicro = require('../../utils/requireMicro');
const configMerge = require('../../utils/merge-config');
const fixedModuleAlias = require('./fixedModuleAlias');

// normal config
const BaseAdapter = require('../base/BaseAdapter');

class CommonAdapter extends BaseAdapter {

    constructor() {
        super('COMMON');

        this.moduleAlias = fixedModuleAlias;
    }

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
    }

}

module.exports = new CommonAdapter();
