'use strict';

const path = require('path');
const ROOT = path.resolve(__dirname, '../../');

const config = {
    type: '', // types 类型
};

config.plugins = [
    '@micro-app/plugin-deploy', // test
];

if (process.env.NODE_ENV === 'test') {
    config.micros = [
        'test', 'abab',
    ]; // 被注册的容器

    if (!config.plugins) config.plugins = [];
    config.plugins.push([{
        id: 'test',
        description: '这是test',
        link: ROOT + '/test/testPlugin',
    }, {
        a: 1,
    }]);
}

module.exports = config;
