'use strict';


module.exports = function(api, opts) {
    console.log(opts);
    api.onPluginInitWillDone(item => {
        console.log('onPluginInitWillDone', item);
        api.config.abc = 'haha';
        console.info('api.microsConfig: ', Object.keys(api.microsConfig));
    });
    api.onPluginInitDone(item => {
        console.log('onPluginInitDone', item);
        console.info('config.abc: ', api.config.abc);
    });
    api.onInitWillDone(item => {
        console.log('init Done', item);
    });
    api.onInitDone(item => {
        console.log('init Done', item);
    });
    api.onInitDone(() => {
        console.log('init Done2', api.getState('webpackConfig'));
    });

    api.runCommand('test');
};

module.exports.registerCommand = {
    test: {
        ccc: '123',
        fn: async arg => {
            console.warn('arg: ', arg);
        },
    },
};
