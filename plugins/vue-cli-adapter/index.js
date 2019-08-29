'use strict';

const path = require('path');
const CONSTANTS = require('../../config/constants');

module.exports = function VueCLIAdapter(api, opts) {

    // Current working directory.
    api.getCwd = () => {
        return CONSTANTS.ROOT;
    };

    /**
     * Resolve path for a project.
     *
     * @param {string} _path - Relative path from project root
     * @return {string} The resolved absolute path.
     */
    api.resolve = _path => {
        const context = api.getCwd();
        return path.resolve(context, _path);
    };

    api.assertVersion = range => {
        api.logger.warn(`assertVersion(${range}); 方法未真实实现 !`);
        return true;
    };
    api.genCacheConfig = () => {
        api.logger.warn('genCacheConfig(); 方法未真实实现 !');
        const cacheDirectory = '';
        const cacheIdentifier = '';
        return { cacheDirectory, cacheIdentifier };
    };

    api.registerMethod('chainWebpack', {
        type: api.API_TYPE.EVENT,
        description: '适配 vue-cli 中 chainWebpack 事件',
    });
    api.registerMethod('configureWebpack', {
        type: api.API_TYPE.MODIFY,
        description: '适配 vue-cli 中 configureWebpack 事件, 需要返回值',
    });
    api.registerMethod('configureDevServer', {
        type: api.API_TYPE.EVENT,
        description: '适配 vue-cli 中 configureDevServer 事件',
    });

    api.onChainWebpcakConfig(config => {
        api.applyPluginHooks('chainWebpack', config);
    });

    api.modifyWebpcakConfig(config => {
        return api.applyPluginHooks('configureWebpack', config);
    });
};