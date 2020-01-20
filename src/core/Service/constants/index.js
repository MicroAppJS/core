'use strict';

const contants = {
    PreLoadPlugins: require('../../../plugins/register'),

    // service 对 pluginAPI 暴露的所有方法
    // TODO 可以增加注释
    SharedProps: [
        'root',
        'mode',
        'type',
        'strictMode',
        'env',
        'version',
        'pkg',
        'extraConfig',
        'microsExtraConfig',
        'parseConfig',
        'applyPluginHooks',
        'applyPluginHooksAsync',
        'resolvePlugin',
        'config',
        'micros',
        'self',
        'selfConfig',
        'microsConfig',
        'changePluginOption',
        'runCommand',
        'hasPlugin',
        'findPlugin',
        // new v0.3
        'resolve',
        'resolveWorkspace',
        'selfKey',
        'nodeModulesPath',
        'fileFinder',
        'packages',
        'configDir',
        'tempDir',
        'tempDirPackageGraph',
        'microsPackages',
        'microsPackageGraph',
    ],
};

module.exports = contants;
