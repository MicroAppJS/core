'use strict';

const loaderUtils = require('loader-utils');

module.exports = function(source) {
    const params = loaderUtils.parseQuery(this.resourceQuery);
    const original = params.original;
    const warnText = `Not Found "${original}"`;
    return source.replace(/<<##HINT##>>/igm, warnText);
};
