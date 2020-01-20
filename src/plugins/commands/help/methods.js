'use strict';

module.exports = api => {

    api.registerMethod('modifyCommandHelp', {
        type: api.API_TYPE.MODIFY,
        description: 'modify command of help options.',
    });

};
