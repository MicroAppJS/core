'use strict';

module.exports = {
    beforeCommandInit: {
        type: 'EVENT',
        description: '初始化前事件',
    },
    addCommandInit: {
        type: 'ADD',
        description: '增加初始化事件',
    },
    afterCommandInit: {
        type: 'EVENT',
        description: '初始化完毕后事件',
    },
    otherCommandInit: {
        type: 'EVENT',
        description: '其它初始化事件, 根据参数判断',
    },
};
