'use strict';

const path = require('path');

const { _, loadFile } = require('@micro-app/shared-utils');

const { Symbols } = require('../core/Constants');

function extraConfig(file, root, filename) {
    if (file && root && filename) {
        const filePath = path.resolve(root, filename);
        file[Symbols.ROOT] = path.dirname(filePath);
        file[Symbols.PATH] = filePath;
        file[Symbols.FILENAME] = filename;
        file[Symbols.DIRNAME] = path.basename(root);
    }
    return file;
}

module.exports = function(root, filename) {
    if (!_.isEmpty(root) && _.isUndefined(filename)) {
        filename = path.basename(root);
        root = path.dirname(root);
    }
    return loadFile(root, filename, {
        after(root, filename, file) {
            if (file) {
                file[Symbols.LOAD_SUCCESS] = true;
                extraConfig(file, root, filename);
                return true;
            }
            return false;
        },
    });
};

module.exports.extraConfig = extraConfig;
