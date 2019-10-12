'use strict';

const _ = require('lodash');
const smartMerge = require('./smartMerge');

function padAliasName(config, type) {
    const alias = {};
    const aliasName = config.aliasName;
    if (aliasName) {
        const currAlias = config[type];
        Object.keys(currAlias).forEach(key => {
            const aliasKey = `${aliasName}/${key}`;
            alias[aliasKey] = currAlias[key];
        });
    }
    return alias;
}

module.exports = function aliasMerge(config, opts) {
    const type = opts.type;
    const names = opts.micros;
    const isPadAlias = opts.isPadAlias || opts.padAlias;
    const aliasArrs = [];
    if (!names || names.length <= 0) {
        aliasArrs.push(isPadAlias ? padAliasName(config, type) : config[type]);
    } else {
        names.forEach(key => {
            const microConfig = opts.microsConfig[key];
            if (microConfig) {
                aliasArrs.push(isPadAlias ? padAliasName(microConfig, type) : microConfig[type]);
            }
        });
        aliasArrs.push(isPadAlias ? padAliasName(config, type) : config[type]);
    }

    return _.cloneDeep(smartMerge({}, ...aliasArrs));
};
