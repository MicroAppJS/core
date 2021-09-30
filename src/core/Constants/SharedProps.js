'use strict';

// service 对 pluginAPI 暴露的所有方法

const BaseServiceKeys = [
    'root',
    'mode',
    'target',
    'type',
    'strictMode', // 暂无用
    'env',
    // 'version', // pluginAPI 中已有，且是 core 的版本信息
    'pkg',
    'config',
    'micros',
    // 'self', // 不对外提供
    'selfConfig',
    // new v0.3
    'selfKey',
    'nodeModulesPath',
    'hasKey',
];

const MethodServiceKeys = [
    'microsConfig',
    'extraConfig',
    'microsExtraConfig',
    'parseConfig',
    // method
    'changeCommandOption',
    // new v0.3
    'resolve',
    'resolveWorkspace',
    'fileFinder',
    'packages',
    'configDir',
    'tempDir',
    'getTempDirPackageGraph',
    'microsPackages',
    'writeTempFileSync',
    'writeTempFile',
];

// 关于注册的方法
const registerKeys = [
    'registerCommand',
    'registerMethod',
    'extendConfig',
    'extendMethod',
];
const PluginServiceKeys = [
    // plugin method
    'changePluginOption',
    'register',
    'hasPlugin',
    'findPlugin',
    'resolvePlugin',
    'applyPluginHooks',
    'applyPluginHooksAsync',
    'API_TYPE',
].concat(registerKeys);

module.exports = [].concat(
    BaseServiceKeys,
    MethodServiceKeys,
    PluginServiceKeys,
    [
        'runCommand',
    ]);

module.exports.BaseServiceKeys = BaseServiceKeys;
module.exports.MethodServiceKeys = MethodServiceKeys;
module.exports.PluginServiceKeys = PluginServiceKeys;

// 提供提前注册
module.exports.BEFORE_INIT_METHODS = [].concat(registerKeys);
