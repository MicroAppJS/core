'use strict';

const VUSION_CONFIG = 'vusion.config.js';
const loadFile = require('../../utils/loadFile.js');

module.exports = function(root) {
    return loadFile(root, VUSION_CONFIG);
};
