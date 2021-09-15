'use strict';

// console.log('module.id: ', module.id);


// console.warn(module);
// console.warn(module.exports);
// console.warn(exports);

const { _ } = require('@micro-app/shared-utils');
console.log(_.isEmpty(null));
console.log(_.isEmpty(false));
console.log(_.isEmpty(undefined));
console.log(_.isEmpty({}));
console.log(_.isEmpty([]));
console.log(_.isEmpty(''));
