'use strict';

/* global expect */

const show = require('.');

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
            } else if (key === 'registerCommand') {
                return function(name, o, cb) {
                    cb && cb(args);
                };
            } else if (key === 'registerMethod') {
                return function(name, o, cb) {
                    cb && cb(args);
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

describe('show', () => {

    it('env', () => {
        const api = customAPI({
            _: [ 'env' ],
        });
        api.env = { a: 'b' };
        show(api);
    });

    it('micros', () => {
        const api = customAPI({
            _: [ 'micros' ],
        });
        api.micros = [ 'a', 'b', 'c' ];
        show(api);
    });

    it('alias', () => {
        const api = customAPI({
            _: [ 'alias' ],
        });
        api.micros = [ 'a', 'b', 'c' ];
        api.microsConfig = {
            a: {
            },
        };
        api.selfConfig = {
            aliasObj: {
                a: {
                },
            },
        };
        show(api);
    });

    it('shared', () => {
        const api = customAPI({
            _: [ 'shared' ],
        });
        api.micros = [ 'a', 'b', 'c' ];
        api.microsConfig = {
            a: {
            },
        };
        api.selfConfig = {
            sharedObj: {
                a: 'c',
            },
        };
        show(api);
    });

    it('methods', () => {
        const api = customAPI({
            _: [ 'methods' ],
        });
        api.service = {
            pluginMethods: [ 'a', 'b', 'c' ],
            extendMethods: {},
        };
        show(api);
    });

    it('plugins', () => {
        const api = customAPI({
            _: [ 'plugins' ],
        });
        api.service = {
            plugins: [ 'a', 'b', 'c' ],
        };
        show(api);
    });

    it('hooks', () => {
        const api = customAPI({
            _: [ 'hooks' ],
        });
        api.service = {
            pluginHooks: [ 'a', 'b', 'c' ],
        };
        show(api);
    });

    it('info', () => {
        const api = customAPI({
            _: [ 'info' ],
        });
        show(api);
    });


    it('process.env', () => {
        const api = customAPI({
            _: [ 'process.env' ],
        });
        show(api);
    });


    it('configs', () => {
        const api = customAPI({
            _: [ 'configs' ],
        });
        show(api);
    });


    it('addCommandShow', async () => {
        const Service = require('../../../core/Service');
        const service = new Service();

        const plugin = service.plugins.find(item => item.id.includes('show'));
        expect(typeof plugin).toEqual('object');

        await service.init();

        expect(plugin[Symbol.for('api')]).not.toBeUndefined();
        plugin[Symbol.for('api')].changeCommandOption('show', oldOpts => {
            Object.assign(oldOpts.options, {
                test: 'list all test',
            });
            return oldOpts;
        });
        plugin[Symbol.for('api')].addCommandShow(() => {
            return {
                type: 'test',
                info: {
                    a: 'a',
                    b: 'b',
                    c: 'c',
                },
            };
        });

        await service.runCommand('show');
        await service.runCommand('show', { _: [ 'test' ] });

        expect(service.commands.show).not.toBeNull();
        expect(service.commands.show).not.toBeUndefined();
        expect(typeof service.commands.show).toEqual('object');
    });


    it('none', async () => {
        const Service = require('../../../core/Service');
        const service = new Service();

        const plugin = service.plugins.find(item => item.id.includes('show'));
        expect(typeof plugin).toEqual('object');

        await service.init();

        expect(plugin[Symbol.for('api')]).not.toBeUndefined();

        await service.runCommand('show', { _: [ 'none' ] });

        expect(service.commands.show).not.toBeNull();
        expect(service.commands.show).not.toBeUndefined();
        expect(typeof service.commands.show).toEqual('object');
    });

});
