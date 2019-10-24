'use strict';

const path = require('path');

const { loadFile } = require('@micro-app/shared-utils');

const logger = require('./logger');
const symbols = require('../../libs/Constants/symbols');

function isSupport(filename) {
    return [ '.js', '.json' ].some(ext => {
        return filename.endsWith(ext);
    });
}

function extraConfig(file, root, filename) {
    if (file && root && filename) {
        const filePath = path.resolve(root, filename);
        file[symbols.ROOT] = path.dirname(filePath);
        file[symbols.PATH] = filePath;
    }
    return file;
}

module.exports = function(root, filename) {
    return loadFile(root, filename, {
        before(root, filename) {
            if (!isSupport(filename)) {
                logger.warn(`Not Support ext "${filename}"`);
                return false;
            }
            return true;
        },
        after(root, filename, file) {
            if (file) {
                file[symbols.LOAD_SUCCESS] = true;
                extraConfig(file, root, filename);
                return true;
            }
            return false;
        },
    });
};
module.exports.extraConfig = extraConfig;
