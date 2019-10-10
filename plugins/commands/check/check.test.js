'use strict';

/* global expect */

const check = require('.');

const customAPI = function(args) {
    const temp = {};
    return new Proxy({}, {
        get(target, key) {
            if (Object.keys(temp).includes(key)) {
                return temp[key];
            }
            if (key === 'service') {
                return new Proxy({}, {
                    get(t, k) {
                        if (typeof k === 'string' && /s$/g.test(k)) {
                            return [];
                        }
                        return {};
                    },
                });
            } else if (key === 'self') {
                return {
                    toJSON() {
                        return {};
                    },
                };
            } else if ([
                'registerCommand',
                'applyPluginHooks',
                'runCommand',
            ].includes(key)) {
                return function(name, o, cb) {
                    cb && cb(args);
                    return o;
                };
            } else if (key === 'logger') {
                return new Proxy({}, {
                    get() {
                        return function() {};
                    },
                });
            }
            if (typeof key === 'string' && /s$/g.test(key)) {
                return [];
            }
            return {};
        },
        set(target, key, value) {
            temp[key] = value;
            return true;
        },
    });
};

describe('check', () => {

    it('deps', () => {
        const api = customAPI({
            _: [ 'deps' ],
        });
        check(api);
    });

    it('dependencies', () => {
        const api = customAPI({
            _: [ 'dependencies' ],
        });
        check(api);
    });

    it('default', () => {
        const api = customAPI({
            _: [ ],
        });
        check(api);
    });


});
