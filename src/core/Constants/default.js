'use strict';

module.exports = {
    name: '', // 名称, 为空则使用 package.json 中的 name
    description: '', // 描述
    version: '0.0.1', // 版本
    type: '', // types 类型
    strict: true, // 是否为严格模式? 默认为 true - 强依赖

    // entry: { // 入口
    // },

    // htmls: [
    // {
    //     template: '',
    // },
    // ], // 模版

    // staticPath: [], // String | Array

    alias: { // 共享别名
        // api: './client/api.js', // 默认为前后端通用
        // service: {
        //     link: './server/service.js',
        //     type: 'server', // 只支持后端
        // },
    },

    // micros: [ // 需要注入的子模块
    // 'test'
    // ],

    // 服务端配置
    // server: {
    // hooks: '', // 服务端 hook 路径
    // entry: '', // 服务端入口
    // host: ‘’, // 服务 IP
    // port: 8888, // 服务端口号
    // options: { }, // 服务端注入附加参数

    // plugins: [ // 插件集
    // [
    //     '', {},
    // ],
    // ],
};
