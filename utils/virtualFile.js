'use strict';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const tryRequire = require('try-require');

const CACHE_FILES = {};
const CACHE_LOADED_FILES = {};

function hash(contents) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(contents);
    return hash.digest('hex');
}

function secondPlan(_cache) {
    const _dirname = _cache.dirname;
    const _filename = _cache.filename;
    const _contents = _cache.contents;
    const _module = {};
    // eslint-disable-next-line no-new-func
    const func = new Function('require', 'module', '__filename', '__dirname', _contents);
    func(require, _module, _filename, _dirname);
    if (!_.isUndefined(_module.exports)) {
        return _module.exports;
    }
    if (!_.isEmpty(_module)) {
        return _module;
    }
    return null;
}


module.exports.register = function(filepath, contents, opts = {}) {
    let filename = filepath;
    if (!fs.existsSync(filepath)) {
        filename = tryRequire.resolve(filepath) || filename;
    }
    if (_.isFunction(contents)) {
        contents = contents(fs.readFileSync(filename, 'utf8'), filename, opts);
    }
    const extname = path.extname(filename) || '';
    CACHE_FILES[filepath] = {
        ...opts,
        filepath,
        filename,
        dirname: path.dirname(filename),
        basename: path.basename(filename, extname),
        extname,
        contents,
    };
};

module.exports.require = function(filepath) {
    const _file = CACHE_LOADED_FILES[filepath];
    if (!_.isUndefined(_file)) {
        return _file;
    }
    const _cache = CACHE_FILES[filepath];
    if (_cache) {
        const _extname = _cache.extname;
        const _basename = _cache.basename;
        const _dirname = _cache.dirname;
        const _filename = _cache.filename;
        const _contents = _cache.contents;
        let _fileCache;
        if (_filename.includes('node_modules')) {
            const _hash = hash(_contents);
            const newLink = path.resolve(_dirname, `${_basename}.vfile.${_hash}${_extname}`);
            fs.writeFileSync(newLink, _contents, 'utf8');
            _fileCache = require(newLink);
            fs.unlinkSync(newLink);
        } else {
            _fileCache = secondPlan(_cache);
        }
        if (!_.isUndefined(_fileCache)) {
            CACHE_LOADED_FILES[filepath] = _fileCache;
        }
        return _fileCache;
    }
    return null;
};
Object.defineProperty(module.exports.require, 'cache', {
    get() {
        return Object.keys(CACHE_LOADED_FILES);
    },
});

module.exports.reset = function() {
    Object.keys(CACHE_LOADED_FILES).forEach(key => {
        delete CACHE_LOADED_FILES[key];
    });
};
