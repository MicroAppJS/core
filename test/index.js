'use strict';

// const loadFile = require('../utils/loadFile');
// const requireMicro = require('../utils/requireMicro');

// const obj = loadFile(process.cwd(), 'micro-app.config.js');

// const c = requireMicro('test');


// const vusion = require('../adapter/vusion');
// console.log(JSON.stringify(vusion.mergeConfig(require('../vusion.config')), null, 4));


// const koa = require('../adapter/koa');
// console.log(JSON.stringify(koa.mergeRouter(null), null, 4));
// console.log(JSON.stringify(koa.mergeMiddleware(null), null, 4));


// const common = require('../adapter/common');
// console.log('hah:', JSON.stringify(common.mergeConfig({
//     pp: 123,
//     order: 456,
// }), null, 4));
// common.moduleAlias();

// console.log(require('@test/config'));


// const reg = new RegExp('^/a', 'g');
// console.log('/abc/abc/ba/a'.replace(reg, '/'));


// const ma = require('../');
// // ma.CONSTANTS.ROOT = __dirname;
// console.log(ma('test'));
// console.log(ma.loadConfig());
// ma.koa.start();


// const tryRequire = require('try-require');
// const a = tryRequire.resolve('/Users/zyao89/Code/New Direction/MicroApp/MicroApp-Core/utils/loadFile.js');
// console.log(a);

const logger = require('../utils/logger');
// logger.error('abc');
// logger.info('abc');
// logger.success('abc');
// logger.logo('abc');
// logger.warn('abc');
// logger.debug('abc');
// const spinner = logger.spinner('abc');
// spinner.start();
// setTimeout(() => {
//     spinner.fail('cc');
// }, 3000);


// const _ = require('lodash');
// const wmerge = require('webpack-merge');

// const a = { a: 1, b: { c: { d: 2 } }, z: [ '12' ] };
// const b = { a: { aa: 2 }, b: { c: { vv: 2 } }, c: { c: '33' }, z: [ '45' ] };
// const c = _.merge({}, a, b);
// logger.debug(c);
// logger.warn(wmerge.smart(a, b));


logger.throw('abc');
