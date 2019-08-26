'use strict';

module.exports = [

    './init.js',
    './run.js',
    './command.js',

].reduce((arr, key) => {
    return arr.concat(require(key));
}, []);
