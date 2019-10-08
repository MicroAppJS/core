'use strict';

/* global expect */

const help = require('.');

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
            } else if ([ 'registerCommand', 'applyPluginHooks' ].includes(key)) {
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

describe('help', () => {

    it('command', () => {
        const api = customAPI({
            _: [ 'show' ],
        });
        help(api);
    });

    it('all', () => {
        const api = customAPI({
            _: [ ],
        });
        help(api);
    });


});
