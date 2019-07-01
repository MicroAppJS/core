'use strict';

const path = require('path');
const logger = require('../../utils/logger');

const defaultOpts = {
    test: null,
    resource: path.join(__dirname, './request.js'),
    loader: path.join(__dirname, './loader.js'),
    micros: [],
    debug: false, // 开启log
    warnHint: '',
};

class ReplaceFileNotExistsPlugin {

    constructor(options = {}) {
        this.options = Object.assign({}, JSON.parse(JSON.stringify(defaultOpts)), options);
        this.regExpTest = this.options.test;
        this.resource = this.options.resource;
        this.loader = this.options.loader;
        this.micros = this.options.micros;
        this.warnHint = this.options.warnHint;
        this.debug = this.options.debug;
    }

    queryStr(request) {
        return `?original=${request}&hint=${this.warnHint}`;
    }

    apply(compiler) {
        const resourceRegExp = this.regExpTest;
        if (!resourceRegExp) return;
        const hooks = compiler.hooks;
        if (!hooks) {
            compiler.plugin('normal-module-factory', nmf => {
                nmf.plugin('before-resolve', (result, callback) => {
                    if (!result) return callback();
                    if (resourceRegExp.test(result.request)) {
                        const request = result.request;
                        const prefix = request.replace(resourceRegExp, '').split('/')[0];
                        if (prefix && !this.micros.some(key => key === prefix)) {
                            if (this.debug) {
                                logger.debug('[request] ' + request);
                            }
                            result.request = this.resource + this.queryStr(request);
                        }
                    }
                    return callback(null, result);
                });
                nmf.plugin('after-resolve', (result, callback) => {
                    if (!result) return callback();
                    if (result.rawRequest && result.rawRequest.startsWith(this.resource)) {
                        if (this.debug) {
                            logger.debug('[resource] ' + result.resource);
                        }
                        result.loaders.unshift({
                            loader: this.loader,
                        });
                    }
                    return callback(null, result);
                });
            });
        }

        // TODO 适配 wp4

        // compiler.hooks.normalModuleFactory.tap(
        //     'NormalModuleReplacementPlugin',
        //     nmf => {
        //         nmf.hooks.beforeResolve.tap('NormalModuleReplacementPlugin', result => {
        //             if (!result) return;
        //             if (resourceRegExp.test(result.request)) {
        //                 if (typeof newResource === 'function') {
        //                     newResource(result);
        //                 } else {
        //                     result.request = newResource;
        //                 }
        //             }
        //             return result;
        //         });
        //         nmf.hooks.afterResolve.tap('NormalModuleReplacementPlugin', result => {
        //             if (!result) return;
        //             if (resourceRegExp.test(result.resource)) {
        //                 if (typeof newResource === 'function') {
        //                     newResource(result);
        //                 } else {
        //                     result.resource = path.resolve(
        //                         path.dirname(result.resource),
        //                         newResource
        //                     );
        //                 }
        //             }
        //             return result;
        //         });
        //     }
        // );
    }
}

module.exports = ReplaceFileNotExistsPlugin;
