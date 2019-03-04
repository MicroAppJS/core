'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
    entry: {
        login: [ 'babel-polyfill', 'whatwg-fetch', './src/client/views/login/index.js' ],
        platform: [ 'babel-polyfill', 'whatwg-fetch', './src/client/views/platform/index.js' ],
    },
    output: {
        path: path.resolve(__dirname, 'public'),
        publicPath: '/public/',
    },
    resolve: {
        alias: {
            vue$: path.resolve(__dirname, 'node_modules/vue/dist/vue.esm.js'),
            'vue-router$': path.resolve(__dirname, 'node_modules/vue-router/dist/vue-router.esm.js'),
            src: path.resolve(__dirname, 'src'),
            '@': path.resolve(__dirname, 'src/client'),
            views: path.resolve(__dirname, 'src/client/views'),
            apm: path.resolve(__dirname, 'src/client/views/apm'),
            mixins: path.resolve(__dirname, 'src/client/base/mixins'),
            static: path.resolve(__dirname, 'src/client/static'),
            icons: path.resolve(__dirname, 'src/client/static/icons'),
            d3_v5: path.resolve(__dirname, './node_modules/d3'),
            // '@necfe': path.resolve(__dirname, 'src/client/components/necfe'),
        },
        modules: [ path.resolve(__dirname, './node_modules/@necfe/cloud-ui-internal/node_modules') ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'login.html',
            hash: true,
            chunks: [ 'common', 'login' ],
            template: './src/client/views/login/index.html',
        }),
        new HtmlWebpackPlugin({
            filename: 'platform.html',
            hash: true,
            chunks: [ 'common', 'platform' ],
            template: './src/client/views/platform/index.html',
        }),
        // new BundleAnalyzerPlugin(),
    ],
    // 这里的设置是因为yamljs这个库中有node的核心模块的fs的引入。
    node: {
        fs: 'empty',
    },
};

module.exports = config;
