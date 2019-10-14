'use strict';


module.exports = function(api, opts) {
    console.log(opts);
    api.onInitDone(item => {
        console.log('init Done', item);
    });
    api.beforeMergeConfig(config => {
        console.log('beforeMergeConfig', config);
    });
    api.afterMergeConfig(config => {
        console.log('afterMergeConfig', config);
    });
    api.onPluginInitDone(item => {
        console.log('onPluginInitDone', item);
    });
    api.onInitDone(() => {
        console.log('init Done2', api.getState('webpackConfig'));
    });
};
