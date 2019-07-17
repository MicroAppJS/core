'use strict';

const logger = require('../../utils/logger');
const tryRequire = require('try-require');
const path = require('path');
const ora = require('ora');
const loadHappyPack = require('./loadHappyPack');
const calcSpeedMeasure = require('./calcSpeedMeasure');

module.exports = function(vusionConfig, selfConfig) {
    let webpackConfig = tryRequire('vusion-cli/webpack/' + vusionConfig.type);
    if (!webpackConfig) {
        webpackConfig = tryRequire(path.join(process.cwd(), 'node_modules', 'vusion-cli/webpack/' + vusionConfig.type));
        if (!webpackConfig) {
            logger.error('load vusion-cli error!');
            return Promise.reject('load vusion-cli error...');
        }
    }

    let buildCompiler = tryRequire('vusion-cli/lib/build');
    if (!buildCompiler) {
        buildCompiler = tryRequire(path.join(process.cwd(), 'node_modules', 'vusion-cli/lib/build'));
        if (!buildCompiler) {
            logger.error('load vusion-cli error!');
            return Promise.reject('load vusion-cli error...');
        }
    }
    const finalWebpackConfig = buildCompiler.prepare(webpackConfig);

    const webpack = tryRequire('webpack');
    if (!webpack) {
        return Promise.reject('load webpack error...');
    }

    // 优化处理
    const compiler = webpack(calcSpeedMeasure(loadHappyPack(finalWebpackConfig, selfConfig.plugin), selfConfig.plugin));

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
