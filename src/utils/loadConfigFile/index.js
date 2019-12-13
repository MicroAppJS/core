'use strict';

const { _, logger, loadFile } = require('@micro-app/shared-utils');
const path = require('path');

const { SUPPOER_CONFIG_FILE_EXTS } = require('../../core/Constants');

function loadConfigFile(rootPath, filename, exts = _.cloneDeep(SUPPOER_CONFIG_FILE_EXTS)) {
    if (!rootPath || !filename) {
        logger.throw('loadConfigFile', 'rootPath or filename must be string!');
    }
    let microConfig;
    let filePath;
    while (!microConfig && exts.length > 0) {
        filePath = path.resolve(rootPath, `${filename}${exts.shift()}`);
        microConfig = loadFile(filePath);
    }

    if (!microConfig) {
        filePath = undefined;
    }

    return [ microConfig, filePath ];
}

module.exports = function(rootPath, filename, exts) {
    return loadConfigFile(rootPath, filename, exts)[0];
};

module.exports.path = loadConfigFile;
