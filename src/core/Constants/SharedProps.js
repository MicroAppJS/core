'use strict';

// TODO 可以增加注释
// service 对 pluginAPI 暴露的所有方法
module.exports = [

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
    'registerMethod',
    'registerCommand',
    'changeCommandOption',
    'extendConfig',
    'extendMethod',
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

];
