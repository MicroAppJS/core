'use strict';

const ReplaceFileNotExistsPlugin = require('./ReplaceFileNotExistsPlugin');
const webpackMerge = require('../../utils/merge-webpack');
const Config = require('webpack-chain');
const CONSTANTS = require('../../config/constants');

module.exports = function WebpackAdapter(api, opts) {

    api.registerMethod('beforeMergeWebpackConfig', {
        type: api.API_TYPE.EVENT,
        description: '合并 webpack 配置之前事件',
    });
    api.registerMethod('afterMergeWebpackConfig', {
        type: api.API_TYPE.EVENT,
        description: '合并 webpack 配置之后事件',
    });
    api.registerMethod('modifyChainWebpcakConfig', {
        type: api.API_TYPE.MODIFY,
        description: '合并之后提供 webpack-chain 进行再次修改事件',
    });
    api.registerMethod('onChainWebpcakConfig', {
        type: api.API_TYPE.EVENT,
        description: '修改之后提供 webpack-chain 进行查看事件',
    });

    api.onInitWillDone(() => {
        const webpackConfig = api.config.webpack || {};
        delete webpackConfig.plugins; // 不接受 plugins

        api.applyPluginHooks('beforeMergeWebpackConfig', webpackConfig);

        const afterWebpackConfig = webpackMerge(webpackConfig, {
            microsExtral: api.self.microsExtral || {},
            micros: api.micros,
            config: api.selfConfig,
            microsConfig: api.microsConfig,
        });

        api.applyPluginHooks('afterMergeWebpackConfig', afterWebpackConfig);

        const webpackChainConfig = new Config();
        webpackChainConfig.merge(afterWebpackConfig);

        const selfConfig = api.self;
        if (selfConfig.strict === false && process.env.NODE_ENV === 'development') {
            const options = Object.assign({
                test: CONSTANTS.SCOPE_NAME ? new RegExp('^' + CONSTANTS.SCOPE_NAME + '/') : /^@micros\//i,
            }, (opts.ReplaceFileNotExists || {}), {
                micros: selfConfig.micros,
                selfName: selfConfig.name,
            });
            webpackChainConfig.plugin('replace-file-not-exists').use(ReplaceFileNotExistsPlugin, [ options ]);
        }

        const finalWebpackChainConfig = api.applyPluginHooks('modifyChainWebpcakConfig', webpackChainConfig);
        api.applyPluginHooks('onChainWebpcakConfig', finalWebpackChainConfig);

        api.setState('webpackChainConfig', finalWebpackChainConfig);
        api.setState('webpackConfig', finalWebpackChainConfig.toConfig());
    });
};
