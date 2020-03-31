'use strict';

/* global expect */

const Service = require('../Service');
const PluginAPI = require('./PluginAPI');
const DEFAULT_METHODS = require('../Service/methods');

describe('PluginAPI', () => {

    it('new constructor', () => {
        const service = new Service();
        service.init(true);

        DEFAULT_METHODS.forEach(method => {
            console.warn(method);
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

    it('test registerPlugin', () => {
        const service = new Service();
        const api = new PluginAPI('abc', service);

        const opts = { a: 123 };
        api.registerPlugin({
            ...opts,
            id: 'abcd',
            apply() {},
        });
        expect(service.extraPlugins.find(item => item.id === 'abcd')).not.toBeUndefined();
        expect(service.extraPlugins.find(item => item.id === 'abcd')).not.toBeNull();
        expect(service.extraPlugins.find(item => item.id === 'abcd').a).toEqual(opts.a);
    });

    it('test extendConfig', () => {
        const service = new Service();
        const api = new PluginAPI('abc', service);

        const fn = args => {
            console.log(args);
            return 'abc';
        };
        api.extendConfig('getA', fn);
        expect(service.extendConfigs.getA).not.toBeUndefined();
        expect(service.extendConfigs.getA).not.toBeNull();
        expect(service.extendConfigs.getA).toMatchObject({});
        expect(service.extendConfigs.getA.fn).toEqual(fn);
        expect(service.extendConfigs.getA.fn()).toEqual('abc');
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
        expect(service.extendMethods.a).toMatchObject({});
        expect(service.extendMethods.a.fn).toEqual(fn);
    });

    it('test extendMethod - 2', () => {
        const service = new Service();
        const api = new PluginAPI('abc', service);

        const fn = args => {
            console.log(args);
        };
        api.extendMethod('a', {
            description: 'abc',
        }, fn);
        expect(service.extendMethods.a).not.toBeUndefined();
        expect(service.extendMethods.a).not.toBeNull();
        expect(service.extendMethods.a).toMatchObject({});
        expect(service.extendMethods.a.fn).toEqual(fn);
        expect(service.extendMethods.a.description).toEqual('abc');
    });

    it('isMicroAppPluginAPI', () => {
        const service = new Service();
        service.initSync();
        const plugin = service.plugins[0];
        expect(plugin).not.toBeUndefined();
        expect(plugin).not.toBeNull();
        const api = plugin[Symbol.for('api')];
        expect(api).not.toBeUndefined();
        expect(api).not.toBeNull();

        expect(api.$isMicroAppPluginAPI).toBeTruthy();
    });
});
