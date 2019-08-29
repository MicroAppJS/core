'use strict';

const path = require('path');
const commands = require('../../plugins/commands');

const contants = {
    PreLoadPlugins: [
        ...commands.map(p => path.join('../../plugins/commands', p)),
        '../../plugins/webpack-adapter',
        '../../plugins/vue-cli-adapter',
    ].map(p => {
        return {
            id: 'built-in:' + p.replace('../../', '').replace(/\//ig, '-').replace(/\.js/ig, '')
                .toLowerCase(),
            link: path.resolve(__dirname, p),
            description: 'System Build-in',
        };
    }),

    SharedProps: [
        'id',
        'env',
        'version',
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
