'use strict';

const BaseAdapter = require('./BaseAdapter');

class BaseServerAdapter extends BaseAdapter {

    mergeRouter() {
        throw new Error('Not Implemented!');
    }

    mergeMiddleware() {
        throw new Error('Not Implemented!');
    }

    runServer() {
        throw new Error('Not Implemented!');
    }
}

module.exports = BaseServerAdapter;
