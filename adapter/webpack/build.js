'use strict';

const tryRequire = require('try-require');
const ora = require('ora');

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
        const spinner = ora('Building for production...');
        spinner.start();
        compiler.run((err, stats) => {
            spinner.stop();
            if (err) {
                // 在这里处理错误
                return reject(err);
            }

            process.stdout.write(stats.toString({
                colors: true,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false,
            }) + '\n');
            // 处理完成
            resolve();
        });
    });
};
