'use strict';

const config = {
    name: '@micro-app/demo',
    description: '',
    version: '0.0.1',
    type: '', // types 类型

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
};

if (process.env.NODE_ENV === 'test') {
    config.micros = [
        'test', 'abab', '@micro-app/shared-utils',
    ]; // 被注册的容器

    if (!config.plugins) config.plugins = [];
    config.plugins.push([{
        id: 'test',
        description: '这是test',
        link: __dirname + '/test/testPlugin',
    }, {
        a: 1,
    }]);
}

module.exports = config;
