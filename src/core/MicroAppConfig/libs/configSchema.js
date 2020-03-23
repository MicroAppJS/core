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
        options: {
            description: '一些需要合并的配置项. ( object )',
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
    },
    type: 'object',
};
