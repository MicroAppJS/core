'use strict';

const requireMicro = require('../utils/requireMicro');

// 输出所有对外的内部配置
module.exports = function loadConfig(microAppConfig) {
    if (!microAppConfig) {
        microAppConfig = requireMicro.self();
    }
    const config = {};
    const micros = microAppConfig.micros;
    micros.forEach(key => {
        const microConfig = requireMicro(key);
        if (microConfig) {
            config[key] = microConfig.toConfig(true);
        }
    });
    config[microAppConfig.name] = microAppConfig.toConfig(true);
    return config;
};
