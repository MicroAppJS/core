'use strict';

// const vusion = require('../adapter/vusion');
// console.log(JSON.stringify(vusion.mergeConfig(require('../vusion.config')), null, 4));


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


// const tryRequire = require('try-require');
// const a = tryRequire.resolve('/Users/zyao89/Code/New Direction/MicroApp/core/utils/loadFile.js');
// console.log(a);

// const logger = require('../src/utils/logger');
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


// logger.throw('abc');

const { npa, parseGitUrl } = require('@micro-app/shared-utils');

// const result = npa('git+ssh://git@g.hz.netease.com:22222/ops-fullstack/micro/micro-common.git#develop');
// console.log(result);

// console.log(GitUrlParse(result.raw));
const item = '@micro-app/cli';
// const item = 'http://abc.com/core.tgz';
// const item = 'git+ssh://git@g.hz.netease.com:22222/ops-fullstack/micro/micro-gportal.git#e718f77fce613a3044c451264e75e9e64b2941f7';


// const _n2 = parseGitUrl(item);
// const _n = _.merge({}, _n2, _n1);

const pkgInfo = npa(item);
if ([ 'git', 'remote' ].includes(pkgInfo.type)) {
    const gitInfo = parseGitUrl(item);
    pkgInfo.source = pkgInfo.source || gitInfo.resource || undefined;
    pkgInfo.gitCommittish = pkgInfo.gitCommittish || gitInfo.hash || undefined;
    if (!pkgInfo.name) {
        pkgInfo.setName(gitInfo.name);
        pkgInfo.fullName = gitInfo.full_name;
    }
    pkgInfo.scope = pkgInfo.scope || gitInfo.organization || undefined;
}
pkgInfo.fullName = pkgInfo.fullName || pkgInfo.name;


console.log(pkgInfo);
