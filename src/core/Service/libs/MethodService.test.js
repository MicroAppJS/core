'use strict';

/* global expect */

const MethodService = require('./MethodService');

describe('MethodService', () => {

    it('new constructor', () => {
        const base = new MethodService();

        expect(base.pkg).not.toBeNull();
        expect(base.pkg).not.toBeUndefined();

        expect(base.mode).not.toBeNull();
        expect(base.mode).not.toBeUndefined();
        expect(base.mode).toEqual('test');

        expect(base.strictMode).not.toBeNull();
        expect(base.strictMode).not.toBeUndefined();

    });

    it('parseConfig', () => {
        const base = new MethodService();

        const config = base.parseConfig('webpack');
        expect(config).not.toBeUndefined();

        const extraConfig = base.parseConfig('extra');
        expect(extraConfig).not.toBeUndefined();
        expect(extraConfig).not.toBeNull();
    });

    it('packages', () => {
        const base = new MethodService();

        expect(base.packages).not.toBeUndefined();
        expect(base.packages).not.toBeNull();
    });

    it('microsConfig', () => {
        const base = new MethodService();

        expect(base.microsConfig).not.toBeUndefined();
        expect(base.microsConfig).not.toBeNull();

        console.warn(base.micros);
        // console.warn(base.microsConfig);
        // console.warn(base.packages);
    });

    it('microsPackages', () => {
        const base = new MethodService();

        expect(base.microsPackages).not.toBeUndefined();
        expect(base.microsPackages).not.toBeNull();

        // console.warn(base.microsPackages);
        // console.warn(base.microsConfig);
        console.warn(base.packages);
    });

});
