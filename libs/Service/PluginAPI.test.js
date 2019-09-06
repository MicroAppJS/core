'use strict';

/* global expect */

const Service = require('./index');
const PluginAPI = require('./PluginAPI');
const DEFAULT_METHODS = require('./methods');

describe('PluginAPI', () => {

    it('new constructor', () => {
        const service = new Service();
        const api = new PluginAPI('abc', service);
        expect(api.id).toEqual('abc');

        DEFAULT_METHODS.forEach(method => {
            expect(typeof method).toEqual('string');
            expect(service.pluginMethods[method]).not.toBeNull();
            expect(service.pluginMethods[method]).not.toBeUndefined();
            expect(typeof service.pluginMethods[method].fn).toEqual('function');
        });
    });

    it('test state', () => {
        const service = new Service();
        const api = new PluginAPI('abc', service);

        api.setState('a', 123);
        expect(api.getState('a')).toEqual(123);
        api.setState('a', 456);
        expect(api.getState('a')).toEqual(456);
    });

    it('test registerCommand', () => {
        const service = new Service();
        const api = new PluginAPI('abc', service);

        const opts = { a: 123 };
        const fn = args => {
            console.log(args);
        };
        api.registerCommand('a', opts, fn);
        expect(service.commands.a).not.toBeUndefined();
        expect(service.commands.a).not.toBeNull();
        expect(service.commands.a.fn).toEqual(fn);
        expect(service.commands.a.opts).toEqual(opts);
    });

    it('test extendMethod', () => {
        const service = new Service();
        const api = new PluginAPI('abc', service);

        const fn = args => {
            console.log(args);
        };
        api.extendMethod('a', fn);
        expect(service.extendMethods.a).not.toBeUndefined();
        expect(service.extendMethods.a).not.toBeNull();
        expect(service.extendMethods.a).toEqual(fn);
    });

});
