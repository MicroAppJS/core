'use strict';

// service 对 pluginAPI 暴露的所有方法

// 关于注册的方法
const registerKeys = [
    'registerCommand',
    'registerMethod',
];
const extendKeys = [
    'extendConfig',
    'extendMethod',
];

module.exports = [].concat(registerKeys, extendKeys, [

    'root',
    'mode',
    'target',
    'type',
    'strictMode', // 暂无用
    'env',
    // 'version', // pluginAPI 中已有，且是 core 的版本信息
    'pkg',
    'extraConfig',
    'microsExtraConfig',
    'parseConfig',
    'applyPluginHooks',
    'applyPluginHooksAsync',
    'resolvePlugin',
    'config',
    'micros',
    // 'self', // 不对外提供
    'selfConfig',
    'microsConfig',
    'changePluginOption',
    'runCommand',
    'hasPlugin',
    'findPlugin',
    // plugin method
    'register',
    'changeCommandOption',
    // new v0.3
    'resolve',
    'resolveWorkspace',
    'selfKey',
    'nodeModulesPath',
    'fileFinder',
    'packages',
    'configDir',
    'tempDir',
    'getTempDirPackageGraph',
    'microsPackages',
    'API_TYPE',
    'hasKey',

]);

module.exports.REGISTER_KEYS = registerKeys;
module.exports.EXTEND_KEYS = extendKeys;
