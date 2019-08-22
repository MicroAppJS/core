'use strict';

// 未使用

const requireMicro = require('./requireMicro');
const tryRequire = require('try-require');
const path = require('path');
const merge = require('webpack-merge');
const fs = require('fs');

// 最外层 config 覆盖内部
module.exports = function configMerge(config, ...names) {
    if (!names || names.length <= 0) {
        return config;
    }
    const microConfigs = [];
    names.forEach(key => {
        const microConfig = requireMicro(key);
        if (microConfig) {
            const root = microConfig.root;
            const _config = microConfig.shared.config;
            if (_config) {
                const configPath = path.resolve(root, _config);
                let _nodeConfig = null;
                if (fs.existsSync(configPath) && fs.statSync(configPath).isFile()) {
                    _nodeConfig = tryRequire(configPath);
                }
                if (!_nodeConfig) {
                    const configModule = tryRequire('config');
                    if (configModule) {
                        const configUtil = configModule.util;
                        _nodeConfig = configUtil.loadFileConfigs(configPath);
                    }
                }
                if (_nodeConfig) {
                    microConfigs.push(_nodeConfig);
                }
            }
        }
    });
    if (microConfigs.length) {
        config = merge.recursive(true, ...microConfigs, config);
    }
    return config;
};
