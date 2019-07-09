'use strict';

const path = require('path');
const logger = require('../../utils/logger');

const defaultOpts = {
    test: null,
    resource: path.join(__dirname, './request.js'),
    loader: path.join(__dirname, './loader.js'),
    micros: [],
    debug: false, // 开启log
    warnHint: 'Not Found',
};

class ReplaceFileNotExistsPlugin {

    constructor(options = {}) {
        this.options = Object.assign({}, JSON.parse(JSON.stringify(defaultOpts)), options);
        this.regExpTest = this.options.test;
        this.resource = this.options.resource;
        this.loader = this.options.loader;
        this.warnHint = this.options.warnHint;
        this.debug = this.options.debug;
        // 内部
        this.micros = this.options.micros;
        this._selfName = this.options.selfName || '------------------ 用于排除自己 ------------------';
    }

    queryStr(request, microName) {
        return `?original=${encodeURIComponent(request)}&hint=${encodeURIComponent(this.warnHint)}&microName=${encodeURIComponent(microName)}`;
    }

    beforeResolve(result, callback) {
        if (!result) { return typeof callback === 'function' ? callback(null, result) : result; }
        const resourceRegExp = this.regExpTest;
        if (!resourceRegExp) { return typeof callback === 'function' ? callback(null, result) : result; }
        const request = result.request;
        if (!request.startsWith(this._selfName) && resourceRegExp.test(request)) {
            const prefix = request.replace(resourceRegExp, '').split('/')[0];
            if (prefix && !this.micros.some(key => key === prefix)) {
                if (this.debug) {
                    logger.debug('[ReplaceFileNotExistsPlugin][request] ' + request);
                }
                result.request = this.resource + this.queryStr(request, prefix);
            }
        }
        return typeof callback === 'function' ? callback(null, result) : result;
    }

    afterResolve(result, callback) {
        if (!result) { return typeof callback === 'function' ? callback(null, result) : result; }
        if (result.rawRequest && result.rawRequest.startsWith(this.resource)) {
            if (this.debug) {
                const querystring = result.resource && result.resource.split('?')[1] || '';
                const original = querystring.split('&')[0].replace(/^original=/, '') || '';
                logger.debug('[ReplaceFileNotExistsPlugin][resource] ' + (original ? original : result.rawRequest));
            }
            result.loaders.unshift({
                loader: this.loader,
            });
        }
        return typeof callback === 'function' ? callback(null, result) : result;
    }

    apply(compiler) {
        const hooks = compiler.hooks;
        if (!hooks) {
            compiler.plugin('normal-module-factory', nmf => {
                nmf.plugin('before-resolve', this.beforeResolve.bind(this));
                nmf.plugin('after-resolve', this.afterResolve.bind(this));
            });
        } else { // 适配 wp4
            compiler.hooks.normalModuleFactory.tap('NormalModuleReplacementPlugin',
                nmf => {
                    nmf.hooks.beforeResolve.tap('NormalModuleReplacementPlugin', this.beforeResolve.bind(this));
                    nmf.hooks.afterResolve.tap('NormalModuleReplacementPlugin', this.afterResolve.bind(this));
                }
            );
        }
    }
}

module.exports = ReplaceFileNotExistsPlugin;
