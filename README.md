# Micro APP

## Install

```sh
npm install -g @micro-app/cli
```

or

```sh
npm install -D @micro-app/cli
```

## Usage

1. 在项目 `根目录` 初始化创建一个 `micro-app.config.js` 文件

```sh
npx micro-app init
```

2. 对 `micro-app.config.js` 配置文件进行编辑

```js
module.exports = {
    name: '@micro-app/demo', // 名称
    description: '', // 描述
    version: '0.0.1', // 版本
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
    alias: { // 前端共享接口
        api: '',
    },
    shared: { // 后端共享接口
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
```

3. 在 `package.json` 中加载其他模块, 例如:

```json
    "dependencies": {
        "@micro-app/test": "git+ssh://git@github.com/micro-app.git#test"
    },
```

4. 开发模式

```sh
npx micro-app-dev
```

5. Build

```sh
npx micro-app-build
```

6. 运行

```sh
npx micro-app-build
```

## 项目中使用共享接口

```js
const api = require('@micro-demo/api');
```

## 其他

- 展示所有容器

```js
npx micro-app -l
```

- 展示所有前端共享接口

```js
npx micro-app -s alias
```

- 展示所有后端共享接口

```js
npx micro-app -s shared
```
