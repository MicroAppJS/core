'use strict';

module.exports = [

    './init.js',
    './run.js',

].reduce((arr, key) => {
    return arr.concat(require(key));
}, []);
