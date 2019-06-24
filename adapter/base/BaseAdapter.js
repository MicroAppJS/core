'use strict';

class BaseAdapter {
    constructor(type) {
        this.TYPE = type;
    }

    mergeConfig() {
        throw new Error('Not Implemented!');
    }

    build() {
        throw new Error('Not Implemented!');
    }

    devHot() {
        throw new Error('Not Implemented!');
    }
}

module.exports = BaseAdapter;
