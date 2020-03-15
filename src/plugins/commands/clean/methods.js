'use strict';

module.exports = api => {

    api.registerMethod('beforeCommandClean', {
        type: api.API_TYPE.EVENT,
        description: '清理前事件',
    });
    api.registerMethod('addCommandClean', {
        type: api.API_TYPE.ADD,
        description: '增加清理事件',
    });
    api.registerMethod('afterCommandClean', {
        type: api.API_TYPE.EVENT,
        description: '清理完毕后事件',
    });

};
