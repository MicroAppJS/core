'use strict';

const { _ } = require('@micro-app/shared-utils');

module.exports = function parsePlugin(p) {
    let opts;
    let id;
    let others;
    if (Array.isArray(p)) {
        opts = p[1];
        if (_.isPlainObject(p[0])) {
            others = p[0];
            id = p[0].id;
            p = p[0].link;
        } else {
            p = id = p[0];
        }
    } else if (_.isPlainObject(p)) {
        others = p;
        id = p.id;
        p = p.link;
    }
    id = id || p;
    if (p && id === p) {
        p = null; // 不希望相等
    }
    return {
        ...(others || {}),
        id,
        link: p,
        opts: opts || {},
    };
};

