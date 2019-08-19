'use strict';

// plugins
const ReplaceFileNotExistsPlugin = require('../plugins/ReplaceFileNotExistsPlugin');

// 输出所有对外的内部配置
module.exports = function loadPlugins() {
    return {
        ReplaceFileNotExistsPlugin,
    };
};
