'use strict';

const loaderUtils = require('loader-utils');

module.exports = function(source) {
    const params = loaderUtils.parseQuery(this.resourceQuery);
    const original = params.original && decodeURIComponent(params.original);
    const warnHint = params.hint && decodeURIComponent(params.hint) || '';
    const microName = params.microName && decodeURIComponent(params.microName);
    const warnText = `缺少注册服务: ${microName}. \n\n  -->  ${warnHint} "${original}" \n\n  -->  这只是在开发环境中的一条警告消息, 你可以在配置中设置 "strict: true".`;
    return source.replace(/<<##HINT##>>/igm, warnText);
};
