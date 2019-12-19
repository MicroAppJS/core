# Micro APP Core

Pluggable micro application framework.

基于webpack多入口的多仓库业务模块开发的插件应用框架核心库.

[![Coverage Status][Coverage-img]][Coverage-url]
[![CircleCI][CircleCI-img]][CircleCI-url]
[![NPM Version][npm-img]][npm-url]
[![NPM Download][download-img]][download-url]

[Coverage-img]: https://coveralls.io/repos/github/MicroAppJS/core/badge.svg?branch=master
[Coverage-url]: https://coveralls.io/github/MicroAppJS/core?branch=master
[CircleCI-img]: https://circleci.com/gh/MicroAppJS/core/tree/master.svg?style=svg
[CircleCI-url]: https://circleci.com/gh/MicroAppJS/core/tree/master
[npm-img]: https://img.shields.io/npm/v/@micro-app/core.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@micro-app/core
[download-img]: https://img.shields.io/npm/dm/@micro-app/core.svg?style=flat-square
[download-url]: https://npmjs.org/package/@micro-app/core

## Install

```sh
yarn add @micro-app/core
```

or

```sh
npm install -D @micro-app/core
```

## Usage

### 在项目 `根目录` 初始化创建一个 `micro-app.config.js` 文件

```sh
npx micro-app init
```

### 对 `micro-app.config.js` 配置文件进行编辑

```js
module.exports = {
    name: '@micro-app/demo',
    description: '',
    version: '0.0.1',
    type: '', // type 类型

    staticPath: '', // String | Array

    entry: { // 入口
        main: './test/index.js',
    },

    // htmls: [ // 输出模版配置
    //     {
    //         template: './test/index.js',
    //     },
    // ],

    // dlls: [
    //     {
    //         context: __dirname,
    //     },
    // ],

    alias: { // 别名配置
        api: '',
        config: {
            link: '',
            description: '配置',
        },
        service: {
            link: '',
            description: '接口',
            type: 'server',
        },
    },

    strict: true, // 严格强依赖模式

    micros: [ 'test' ], // 被注册的容器

    plugins: [ // 自定义插件
        // [{
        //     id: 'test',
        //     description: '这是test',
        //     link: __dirname + '/test/testPlugin',
        // }, {
        //     a: 1,
        // }],
    ],
};
```

### 在 `package.json` 中加载其他模块, 例如:

```json
    "dependencies": {
        "@micro-app/test": "git+ssh://git@github.com/micro-app.git#test"
    },
```

## 项目中使用共享接口

```js
const api = require('@micro-demo/api');
```

## Plugins 扩展

### 首先在 micro-app.config.js 中注册插件

```js
plugins: [
        [ // 1
            {
                id: 'test', // 插件 id
                description: '这是test', // 插件描述
                link: __dirname + '/test/testPlugin.js',  // 插件地址
            }, { // 注册入的 opts
                a: 1,
            }
        ],
    ],
```

### 插件文件 `testPlugin.js`

文件必须返回一个方法.

```js
module.exports = function(api, opts) {
    console.log(opts);
    api.onInitDone(item => {
        console.log('init Done', item);
    });
    api.onInitDone(() => {
        console.log('init Done2', api.getState('webpackConfig'));
    });
    api.onPluginInitDone(item => {
        console.log('onPluginInitDone', item);
    });
};
```

### 内置部分插件提供的 api 方法

可通过如下命令进行动态查看

```js
npx micro-app show methods
```

以提供的方法如下, `System Build-in` 为内置方法

```js
╰─➤  npx micro-app show methods
  Plugin Methods:
     * onPluginInitDone            ( System Build-in )
     * beforeMergeConfig           ( System Build-in )
     * afterMergeConfig            ( System Build-in )
     * onInitWillDone              ( System Build-in )
     * onInitDone                  ( System Build-in )
     * modifyCommand               ( System Build-in )
     * onRunCommand                ( System Build-in )
     * modifyCommandHelp           ( System Build-in )
```

## 其他

### 已支持的终端命令行

```js
╰─➤  npx micro-app help


  Usage: micro-app <command> [options]


  Commands:
      * show       ( show alias & shared list, etc. )
      * check      ( check all dependencies. )
      * version    ( show version )
      * start      ( runs server for production )
      * serve      ( runs server for development )
      * build      ( build for production )
      * update     ( update package.json )
      * deploy     ( sync commit status. )


  run micro-app help [command] for usage of a specific command.
```

### 展示所有容器

```js
npx micro-app show micros
```

### 展示所有前端共享接口

```js
npx micro-app show alias
```

### 展示所有全局共享接口

```js
npx micro-app show shared
```
