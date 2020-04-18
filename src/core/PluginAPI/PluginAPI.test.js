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
        service.registerPlugin({
            id: 'getA',
            apply(api) {
                api.extendConfig('getA', () => 'a3');
                expect(api.service.pluginMethods.getA).not.toBeUndefined();
                expect(api.service.pluginMethods.getA).not.toBeNull();
                expect(api.service.pluginMethods.getA).toMatchObject({});
                expect(api.getA).toEqual('a3');
            },
        });

        service.initSync();
    });

    it('test extendConfig - 2', () => {
        const service = new Service();
        service.registerPlugin({
            id: 'getB',
            apply(api) {
                api.extendConfig('getB', {
                    description: 'getB',
                }, () => 'a3B');
                expect(api.service.pluginMethods.getB).not.toBeUndefined();
                expect(api.service.pluginMethods.getB).not.toBeNull();
                expect(api.service.pluginMethods.getB).toMatchObject({});
                expect(api.service.pluginMethods.getB.description).toEqual('getB');
                expect(api.getB).toEqual('a3B');
            },
        });

        service.initSync();
    });

    it('test extendMethod', () => {
        const service = new Service();
        service.registerPlugin({
            id: 'abc',
            apply(api) {
                const fn = () => {
                    return 'a';
                };
                api.extendMethod('abc', fn);
                expect(api.service.pluginMethods.abc).not.toBeUndefined();
                expect(api.service.pluginMethods.abc).not.toBeNull();
                expect(api.service.pluginMethods.abc).toMatchObject({});
                expect(api.abc()).toEqual('a');
            },
        });

        service.initSync();
    });

    it('test extendMethod - 2', () => {
        const service = new Service();
        service.registerPlugin({
            id: 'abc2',
            apply(api) {
                const fn = () => {
                    return 'a2';
                };
                api.extendMethod('abc2', {
                    description: 'abc2',
                }, fn);
                expect(api.service.pluginMethods.abc2).not.toBeUndefined();
                expect(api.service.pluginMethods.abc2).not.toBeNull();
                expect(api.service.pluginMethods.abc2).toMatchObject({});
                expect(api.service.pluginMethods.abc2.description).toEqual('abc2');
                expect(api.abc2()).toEqual('a2');
            },
        });

        service.initSync();
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
