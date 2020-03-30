'use strict';

/* global expect */

const PluginService = require('./PluginService');

describe('PluginService', () => {

    it('new constructor', () => {
        process.env.NODE_ENV = 'test';
        const base = new PluginService();

        expect(base.pkg).not.toBeNull();
        expect(base.pkg).not.toBeUndefined();

        expect(base.mode).not.toBeNull();
        expect(base.mode).not.toBeUndefined();
        expect(base.mode).toEqual('test');

        expect(base.strictMode).not.toBeNull();
        expect(base.strictMode).not.toBeUndefined();

    });

    it('applyPluginHooks', () => {
        const base = new PluginService();

        const hook = 'a';
        const ctx = { target: 'tar1' };
        base.pluginHooks[hook] = [
            {
                fn(opts) {
                    expect(opts.args === ctx).toBeTruthy();
                },
                type: Symbol('modify'),
            },
        ];

        base.applyPluginHooks(hook, { a: 'abc' }, ctx);
    });

    it('API_TYPE', () => {
        const base = new PluginService();

        expect(base.API_TYPE).not.toBeNull();
        expect(base.API_TYPE).not.toBeUndefined();

        expect(Object.keys(base.API_TYPE)).toContain('ADD');
        expect(Object.keys(base.API_TYPE)).toContain('MODIFY');
        expect(Object.keys(base.API_TYPE)).toContain('EVENT');

    });

});
