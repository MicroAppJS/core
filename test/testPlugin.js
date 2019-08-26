'use strict';


module.exports = function(api, opts) {
    console.log(opts);
    api.onInitDone(item => {
        console.log('init Done', item);
    });
    api.onPluginInitDone(item => {
        console.log('onPluginInitDone', item);
    });
    api.beforeMergeWebpackConfig(item => {
        console.log('beforeMergeWebpackConfig', item);
    });
    api.afterMergeWebpackConfig(item => {
        console.log('afterMergeWebpackConfig', item);
    });
    // api.onChainWebpcakConfig(webpackChainConfig => {
    //     console.log('onChainWebpcakConfig', webpackChainConfig);
    // });
    api.onInitDone(() => {
        console.log('init Done2', api.getState('webpackConfig'));
    });
};
