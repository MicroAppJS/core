'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    name: '@micro-app/demo',
    description: 'a simple demo',
    version: '0.0.1',
    type: '', // types 类型
    webpack: { // webpack 配置
        entry: {
            main: './client/main.js',
        },
        output: {
            path: path.resolve(__dirname, 'public'),
            publicPath: '/public/',
        },
        resolve: {
            alias: {},
            // modules: [],
        },
        plugins: [
            new HtmlWebpackPlugin({
                filename: 'index.html',
                hash: true,
                chunks: [ 'common', 'main' ],
                template: './client/index.html',
            }),
        ],
    },
    alias: { // 前端共享
        api: './client/api.js',
        config: {
            type: 'server', // 后端共享
            link: './server/config.js',
        },
    },

    micros: [ 'test' ],
    // micros$$test: { // 单独配置
    //     disabled: true, // 禁用入口
    // },

    // 服务配置
    server: {
        entry: './server/entry.js', // path
        port: 8088,
        staticBase: 'public', // path
        options: { },
    },
};
