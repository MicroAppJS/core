'use strict';

const path = require('path');

module.exports = {
    name: '@micro-app/demo',
    description: 'a simple demo',
    version: '0.0.1',
    type: '', // types 类型
    webpack: { // webpack 配置
        output: {
            path: path.resolve(__dirname, 'public'),
            publicPath: '/public/',
        },
    },
    entry: {
        main: './client/main.js',
    },

    // staticPath: '',

    htmls: [
        {
            filename: 'index.html',
            hash: true,
            chunks: [ 'common', 'main' ],
            template: './client/index.html',
        },
    ],
    alias: { // 前端共享
        api: './client/api.js',
        config: {
            type: 'server', // 后端共享
            link: './server/config.js',
        },
    },

    micros: [ 'test' ],

    // 服务配置
    server: {
        entry: './server/entry.js', // path
        port: 8088,
        options: { },
    },
};
