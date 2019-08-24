'use strict';

const requireMicro = require('../../utils/requireMicro');

class BaseAdapter {
    constructor(type) {
        this.TYPE = type;
    }

    get self() {
        return requireMicro.self();
    }
}

module.exports = BaseAdapter;
