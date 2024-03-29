'use strict';

const { _, logger, loadFile, hash } = require('@micro-app/shared-utils');
const path = require('path');

const { SUPPOER_CONFIG_FILE_EXTS, MICRO_APP_DIR, CONFIG_NAME, EXTRAL_CONFIG_NAME, MICRO_APP_CONFIG_NAME, MICRO_APP_EXTRA_CONFIG_NAME } = require('../../core/Constants');
const LOAD_CACHE = new Map(); // cache

function copyExts(exts) {
    return _.cloneDeep(exts || SUPPOER_CONFIG_FILE_EXTS);
}

function loadConfigFile(rootPath, filename, exts) {
    if (!rootPath || !filename) {
        logger.throw('[core > loadConfigFile]', 'rootPath or filename must be string!');
    }

    const _hash = hash(`${rootPath}#${filename}`);
    if (LOAD_CACHE.has(_hash)) {
        return LOAD_CACHE.get(_hash);
    }

    let finalMicroConfig;
    let finalFilePath;

    // load microapp/config.js
    if (filename === MICRO_APP_CONFIG_NAME) {
        const configRoot = path.resolve(rootPath, MICRO_APP_DIR);
        const _exts = copyExts(exts);
        while (!finalMicroConfig && _exts.length > 0) {
            finalFilePath = path.resolve(configRoot, `${filename}${_exts.shift()}`);
            finalMicroConfig = loadFile(finalFilePath);
        }
    } else {
        // load microapp/xxx.config.js
        const configRoot = path.resolve(rootPath, MICRO_APP_DIR);
        const _exts = copyExts(exts);
        while (!finalMicroConfig && _exts.length > 0) {
            finalFilePath = path.resolve(configRoot, `${filename}.${MICRO_APP_CONFIG_NAME}${_exts.shift()}`);
            finalMicroConfig = loadFile(finalFilePath);
        }
    }

    let _filename = filename;
    // first, load microapp/config/....
    if (_filename === MICRO_APP_CONFIG_NAME) {
        _filename = 'index';
    }
    const configRoot = path.resolve(rootPath, MICRO_APP_DIR, MICRO_APP_CONFIG_NAME);
    let _exts = copyExts(exts);
    while (!finalMicroConfig && _exts.length > 0) {
        finalFilePath = path.resolve(configRoot, `${_filename}${_exts.shift()}`);
        finalMicroConfig = loadFile(finalFilePath);
    }
    // second, load cwd/micro-app.xxx.config
    _exts = copyExts(exts);
    if (filename === MICRO_APP_CONFIG_NAME) {
        _filename = CONFIG_NAME;
    } else {
        const reg = new RegExp(MICRO_APP_EXTRA_CONFIG_NAME);
        _filename = EXTRAL_CONFIG_NAME.replace(reg, filename);
    }
    while (!finalMicroConfig && _exts.length > 0) {
        finalFilePath = path.resolve(rootPath, `${_filename}${_exts.shift()}`);
        finalMicroConfig = loadFile(finalFilePath);
    }

    if (!finalMicroConfig) {
        finalFilePath = undefined;
    }

    const result = [ finalMicroConfig, finalFilePath ];
    LOAD_CACHE.set(_hash, result); // cached
    return result;
}

module.exports = function(rootPath, filename, exts) {
    const [ _c, _p ] = loadConfigFile(rootPath, filename, exts);
    if (_c) {
        _c.__filepath__ = _p;
        _c[Symbol.for('filepath')] = _p;
    }
    return _c;
};

module.exports.carryPath = loadConfigFile;
