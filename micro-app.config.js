'use strict';

module.exports = {
    name: '@micro-app/demo',
    description: '',
    version: '0.0.1',
    type: '', // types 类型
    webpack: { // webpack 配置 (只有自己使用)
        // output: {
        //     path: path.resolve(__dirname, 'public'),
        //     publicPath: '/public/',
        // },
    },

    entry: {
        main: './test/index.js',
    },

    htmls: [
        {
            template: './test/index.js',
        },
    ],

    // staticPath: '',

    // dlls: [
    //     {
    //         context: __dirname,
    //     },
    // ],

    alias: { // 前端
        api: 'abc',
        config: {
            link: 'abc',
            description: '配置',
        },
        service: {
            link: 'abc',
            description: '接口',
            type: 'server',
        },
    },

    strict: true,

    micros: [ 'test', 'abab', '@micro-app/shared-utils',
        'git+ssh://git@g.hz.netease.com:22222/ops-fullstack/micro/micro-gportal.git#e718f77fce613a3044c451264e75e9e64b2941f7',
        'git+ssh://git@g.hz.netease.com:22222/ops-fullstack/micro/micro-platform.git#e718f77fce613a3044c451264e75e9e64b2941f7',
        'https://g.hz.netease.com/ops-fullstack/micro/micro-common.git',
    ], // 被注册的容器

    // 服务配置
    server: {
        entry: '', // 服务端入口
        port: 8088, // 服务端口号
        options: {
            // 服务端回调参数
        },
    },

    plugins: [
        [{
            id: 'test',
            description: '这是test',
            link: __dirname + '/test/testPlugin',
        }, {
            a: 1,
        }],
    ],
};
