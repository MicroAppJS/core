'use strict';

const path = require('path');
const commands = require('../../plugins/commands');

const contants = {
    PreLoadPlugins: [
        ...commands.map(p => path.join('../../plugins/commands', p)),
        // '../../plugins/abc',
    ].map(p => {
        return {
            id: 'built-in:' + p.replace('../../', '').replace(/\//ig, '-').replace(/\.js/ig, '')
                .toLowerCase(),
            link: path.resolve(__dirname, p),
            description: 'System Build-in',
        };
    }),

    SharedProps: [
        'root',
        'mode',
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
