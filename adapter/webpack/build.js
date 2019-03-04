'use strict';

const tryRequire = require('try-require');

module.exports = function(webpackConfig) {

    if (!webpackConfig) {
        return Promise.reject('webpackConfig null...');
    }

    const webpack = tryRequire('webpack');
    if (!webpack) {
        return Promise.reject('load webpack error...');
    }

    const compiler = webpack(webpackConfig);

    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err || stats.hasErrors()) {
                // 在这里处理错误
                return reject(err);
            }

            process.stdout.write(stats.toString({ all: true, colors: true }) + '\n');
            // 处理完成
            resolve();
        });
    });
};
