# Micro APP

## Install

```sh
npm install -g @micro-app/cli
```

## Usage

Create a `micro-app.config.js`

```sh
micro-app init
```

## Conifg

```js
module.exports = {
    name: '@micro-app/demo',
    description: '',
    version: '0.0.1',
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
    alias: { // 前端
        api: '',
    },
    shared: { // 后端
        config: '',
        // middleware: '', // koa-middleware
        // router: '', // koa-router
    },

    micros: [ 'test' ],
    // micros$$test: { // 单独配置
    //     disabled: true, // 禁用入口
    // },

    // 服务配置
    server: {
        entry: '', // path
        port: 8088,
        staticBase: '/public', // path
        options: { },
    },
};
```
