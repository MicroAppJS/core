'use strict';

const contants = {
    PreLoadPlugins: require('../../../plugins/register'),

    // service 对 pluginAPI 暴露的所有方法
    SharedProps: [
        'root',
        'mode',
        'strictMode',
        'env',
        'version',
        'pkg',
        'microsExtraConfig', 'microsExtralConfig',
        'applyPluginHooks',
        'applyPluginHooksAsync',
        'resolvePlugin',
        'config',
        'serverConfig',
        'micros',
        'self',
        'selfConfig',
        'selfServerConfig',
        'microsConfig',
        'microsServerConfig',
        'changePluginOption',
        'runCommand',
        'hasPlugin',
        'findPlugin',
    ],
};

module.exports = contants;
