'use strict';

module.exports = {
    beforeCommandClean: {
        type: 'EVENT',
        description: '清理前事件',
    },
    addCommandClean: {
        type: 'ADD',
        description: '增加清理事件',
    },
    afterCommandClean: {
        type: 'EVENT',
        description: '清理完毕后事件',
    },
};
