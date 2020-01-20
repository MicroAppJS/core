'use strict';

module.exports = api => {

    api.registerMethod('addCommandVersion', {
        type: api.API_TYPE.ADD,
        description: '增加依赖库的版本信息',
    });

};
