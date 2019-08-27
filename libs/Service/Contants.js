'use strict';

const path = require('path');
const commands = require('../../plugins/commands');

module.exports = {
    PreLoadPlugins: [
        '../../plugins/webpack-adapter',
        ...commands.map(p => path.join('../../plugins/commands', p)),
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
    ],
};
