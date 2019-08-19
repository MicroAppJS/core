'use strict';

const requireMicro = require('../utils/requireMicro');

// 输出所有对外的内部配置
module.exports = function loadServerConfig(microAppConfig) {
    if (!microAppConfig) {
        microAppConfig = requireMicro.self();
    }
    const server = {};
    const micros = microAppConfig.micros;
    micros.forEach(key => {
        const microConfig = requireMicro(key);
        if (microConfig) {
            server[key] = microAppConfig.toServerConfig();
        }
    });
    server[microAppConfig.name] = microAppConfig.toServerConfig();
    return server;
};
