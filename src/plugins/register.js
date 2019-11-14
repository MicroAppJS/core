'use strict';

const path = require('path');

const commands = [
    'help',
    'show',
    'check',
    'version',
].map(p => path.join('commands', p));

module.exports = commands.map(p => {
    return {
        id: 'built-in:' + p.replace(/^\/?commands\/?/ig, '').replace(/\//ig, '-').replace(/\.js/ig, '')
            .toLowerCase(),
        link: path.resolve(__dirname, p),
        description: 'System Build-in',
    };
});
