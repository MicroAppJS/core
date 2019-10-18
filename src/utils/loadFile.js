'use strict';

const tryRequire = require('try-require');
const fs = require('fs-extra');
const path = require('path');
const symbols = require('../../libs/Constants/symbols');

function isSupport(filename) {
    return [ '.js', '.json' ].some(ext => {
        return filename.endsWith(ext);
    });
}

function load(root, filename) {
    const filePath = path.resolve(root, filename);
    if (!fs.existsSync(filePath)) {
        return null;
    }
    if (!fs.statSync(filePath).isFile()) {
        return null;
    }
    const file = tryRequire(filePath);
    return file ? extraConfig(file, root, filename) : null;
}

function extraConfig(file, root, filename) {
    if (file && root && filename) {
        const filePath = path.resolve(root, filename);
        file[symbols.ROOT] = path.dirname(filePath);
        file[symbols.PATH] = filePath;
    }
    return file;
}

function loadFile(root, filename) {
    if (!root || !filename) {
        return null;
    }
    if (!isSupport(filename)) {
        return null;
    }
    if (!fs.existsSync(root)) {
        return null;
    }
    if (!fs.statSync(root).isDirectory()) {
        return null;
    }
    return load(root, filename);
}

module.exports = loadFile;
module.exports.extraConfig = extraConfig;
