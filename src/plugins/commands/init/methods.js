'use strict';

module.exports = api => {

    api.registerMethod('beforeCommandInit', {
        type: api.API_TYPE.EVENT,
        description: '初始化前事件',
    });
    api.registerMethod('addCommandInit', {
        type: api.API_TYPE.ADD,
        description: '初始化完毕后事件',
    });
    api.registerMethod('afterCommandInit', {
        type: api.API_TYPE.EVENT,
        description: '初始化完毕后事件',
    });

};
