'use strict';

const config = {
    type: '', // types 类型
};

config.plugins = [
    '@micro-app/plugin-deploy', // test
];

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
