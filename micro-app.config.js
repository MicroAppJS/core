'use strict';

module.exports = {
    name: '@micro-app/demo',
    description: '',
    version: '0.0.1',
    type: '', // types 类型
    webpack: { // webpack 配置
        entry: {

        },
        // output: {
        //     path: path.resolve(__dirname, 'public'),
        //     publicPath: '/public/',
        // },
        resolve: {
            alias: {},
            // modules: [],
        },
        plugins: [],
    },
    alias: { // 前端
        api: '',
    },
    shared: { // 后端
        config: '',
        // middleware: '', // koa-middleware
        // router: '', // koa-router
    },

    micros: [ 'test' ], // 被注册的容器
    // micros$$test: { // 单独配置
    //     disabled: true, // 禁用入口
    // },

    // 服务配置
    server: {
        entry: '', // 服务端入口
        port: 8088, // 服务端口号
        staticBase: 'public', // 静态文件地址
        options: {
            // 服务端回调参数
        },
    },
};
