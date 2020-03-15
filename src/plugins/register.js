'use strict';

const path = require('path');
const builtIn = Symbol.for('built-in');

const commands = [

    'help',
    'show',
    'version',
    'init',
    'clean',

].map(p => path.join('commands', p));

module.exports = commands.map(p => {
    return {
        id: 'built-in:' + p.replace(/^\/?commands\/?/ig, '')
            .replace(/\//ig, '-')
            .replace(/\.js/ig, '')
            .toLowerCase(),
        link: require.resolve(`./${p}`),
        description: 'System Build-in',
        [builtIn]: true,
    };
});
