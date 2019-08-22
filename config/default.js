'use strict';

module.exports = {
    name: '', // 名称, 为空则使用 package.json 中的 name
    description: '', // 描述
    version: '0.0.1', // 版本
    type: '', // types 类型
    strict: true, // 是否为严格模式? 默认为 true - 强依赖

    entry: { // 入口
    },

    htmls: [], // 模版

    staticPath: [], // String | Array

    dlls: [
        // { // dll 基本配置, [ 只支持子模块中使用 ]
        //     disabled: false,
        //     context: '',
        //     manifest: '',
        //     filepath: '',
        // },
    ],

    webpack: { // webpack 配置信息
    },

    alias: { // 共享别名
        // api: './client/api.js', // 默认为前后端通用
        // service: {
        //     link: './server/service.js',
        //     type: 'server', // 只支持后端
        // },
    },

    micros: [ // 需要注入的子模块
        // 'test'
    ],
    // micros$$test: { // 单独配置
    //     disabled: true, // 禁用入口
    //     lnk: '‘, // 软链接, 用于本地调试
    // },

    // 服务端配置
    server: {
        // hooks: '', // 服务端 hook 路径
        // entry: '', // 服务端入口
        // host: ‘’, // 服务 IP
        // port: 8888, // 服务端口号
        // contentBase: '', // 服务端静态文件目录
        // options: { }, // 服务端注入附加参数
        // proxyGlobal: false, // 全局无服务, 只走代理
        // proxy: { // 服务代理
        //     '/api': {
        //         target: 'http://127.0.0.1', // target host
        //         changeOrigin: true, // needed for virtual hosted sites
        //         ws: true, // proxy websockets
        //     },
        // },
    },

    // 自动向主容器同步 package.json
    deploy: {
        // git: 'ssh://git@....git',
        // branch: 'develop',
    },

    // 一些插件配置项
    plugin: {
        // ReplaceFileNotExists: {
        //     debug: false, // 开启log
        //     warnHint: 'Not Found',
        //     loader: '', // 路径
        //     resource: '', // 路径
        //     test: /^@micros\//i, // 匹配规则
        // },
        // SpeedMeasurePlugin: {
        //     disabled: true,
        // },
        // HappyPack: {
        //     disabled: true,
        // },
    },

    plugins: [
        [
            '', {},
        ],
    ],
};
