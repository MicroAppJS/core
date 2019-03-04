'use strict';

const requireMicro = require('../../utils/requireMicro');
const initModuleAlias = require('../../utils/module-alias');

module.exports = function() {
    const selfConfig = requireMicro.self();
    const micros = selfConfig.micros;
    if (micros && Array.isArray(micros)) {
        // init module-alias
        initModuleAlias(...micros);
    }
};
