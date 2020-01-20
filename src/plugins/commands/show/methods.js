'use strict';

module.exports = api => {

    api.registerMethod('addCommandShow', {
        type: api.API_TYPE.ADD,
        description: '增加展示信息命令',
    });

};
