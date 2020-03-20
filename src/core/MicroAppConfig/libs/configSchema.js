'use strict';

module.exports = {
    additionalProperties: true,
    properties: {
        name: {
            description: '名称. ( string )',
            type: 'string',
        },
        description: {
            description: '描述. ( string )',
            type: 'string',
        },
        version: {
            description: '版本号. ( string )',
            type: 'string',
        },
        type: {
            description: '类型. ( string )',
            type: 'string',
        },
        strict: {
            description: '开启对其它模块的强依赖, default: ‘true’.',
            type: 'boolean',
        },
        alias: {
            description: '共享别名, 默认前后端通用. ( object )',
            type: 'object',
        },
        micros: {
            description: '需要注入的子模块. ( array<string> )',
            anyOf: [{
                items: {
                    anyOf: [{
                        required: [ 'name' ],
                        type: 'object',
                    },
                    {
                        type: 'string',
                    },
                    ],
                },
                minItems: 1,
                type: 'array',
            },
            {
                type: 'object',
            },
            ],
        },
        pluginOptions: {
            description: '一些插件配置项. ( object )',
            type: 'object',
        },
        plugins: {
            description: 'micro app 插件集. ( array<array | object> )',
            items: {
                anyOf: [{
                    minItems: 1,
                    type: 'array',
                },
                {
                    type: 'object',
                },
                {
                    type: 'string',
                },
                ],
            },
            minItems: 1,
            type: 'array',
        },
        // ZAP 以下配置将迁移
        entry: {
            description: '入口配置. ( object )',
            type: 'object',
        },
        htmls: {
            description: '模版配置. ( array<object> )',
            items: {
                required: [ 'template' ],
                type: 'object',
            },
            minItems: 1,
            type: 'array',
        },
        staticPath: {
            description: 'static resource path. ( stirng | array<string> )',
            anyOf: [{
                items: {
                    type: 'string',
                },
                minItems: 1,
                type: 'array',
            },
            {
                type: 'string',
            }],
        },
        webpack: {
            description: 'webpack 配置, 只针对自己有效. ( object )',
            type: 'object',
        },
        css: {
            description: 'css配置. ( object )',
            type: 'object',
        },
        devServer: {
            description: '开发服务器配置. ( object )',
            type: 'object',
        },
        publicPath: {
            description: 'public resource path. ( stirng )',
            type: 'string',
        },
        server: {
            description: '服务端配置. ( object )',
            type: 'object',
        },
    },
    type: 'object',
};
