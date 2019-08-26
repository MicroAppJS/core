# Micro APP

## Install

```sh
yarn add @micro-app/cli
```

or

```sh
npm install -D @micro-app/cli
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
    type: '', // types 类型
    webpack: { // webpack 配置
        // output: {
        //     path: path.resolve(__dirname, 'public'),
        //     publicPath: '/public/',
        // },
    },

    entry: {
        main: './test/index.js',
    },

    htmls: [
        {
            template: './test/index.js',
        },
    ],

    // dlls: [
    //     {
    //         context: __dirname,
    //     },
    // ],

    alias: { // 前端
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

    strict: true,

    micros: [ 'test' ], // 被注册的容器
    // micros$$test: { // 单独配置
    //     disabled: true, // 禁用入口
    //     link: '', // 本地路径, 进行本地开发使用的软链接.
    // },

    // 服务配置
    server: {
        entry: '', // 服务端入口
        port: 8088, // 服务端口号
        contentBase: 'public', // 静态文件地址
        options: {
            // 服务端回调参数
        },
    },

    plugins: [
        // [{
        //     id: 'test',
        //     description: '这是test',
        //     link: __dirname + '/test/testPlugin',
        // }, {
        //     a: 1,
        // }],
    ],

    // deploy: {
    //     git: 'git+ssh://git@xxxxx.git',
    //     branch: 'test',
    //     // branch: {
    //     //     name: 'develop',
    //     //     extends: true,
    //     // },
    //     message: '', // 提交 message 中增加内容
    // },
};
```

### 在 `package.json` 中加载其他模块, 例如:

```json
    "dependencies": {
        "@micro-app/test": "git+ssh://git@github.com/micro-app.git#test"
    },
```

### 开发模式

```sh
npx micro-app serve
```

or

```sh
npx micro-app-dev
```

### Build

```sh
npx micro-app build
```

or

```sh
npx micro-app-build
```

### 运行

```sh
npx micro-app start
```

or

```sh
npx micro-app-start
```

## 项目中使用共享接口

```js
const api = require('@micro-demo/api');
```

## Plugins 扩展

## 其他

- 展示所有容器

```js
npx micro-app show micros
```

- 展示所有前端共享接口

```js
npx micro-app show alias
```

- 展示所有后端共享接口

```js
npx micro-app show shared
```
