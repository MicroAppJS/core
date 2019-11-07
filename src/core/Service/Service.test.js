'use strict';

/* global expect */

const { PreLoadPlugins } = require('./constants');
const Service = require('./index');

describe('Service', () => {

    it('new constructor', () => {
        const service = new Service();
        expect(service.selfConfig).not.toBeNull();
        expect(service.selfConfig).not.toBeUndefined();

        // 去除
        expect(service.selfServerConfig).toBeUndefined();

        expect(service.micros).toBeInstanceOf(Array);

        expect(service.microsConfig).not.toBeNull();
        expect(service.microsConfig).not.toBeUndefined();

        // 去除
        expect(service.microsServerConfig).toBeUndefined();

        expect(service.plugins).not.toBeNull();
        expect(service.plugins).not.toBeUndefined();
        expect(service.plugins.length).toEqual(PreLoadPlugins.length);
    });

    it('new constructor Done', () => {
        const service = new Service();
        expect(service.version).not.toBeUndefined();
        expect(service.version).not.toBeNull();
    });

    it('hasPlugin should be true', () => {
        const Constants = require('./constants');
        const service = new Service();
        expect(Constants.PreLoadPlugins[0]).not.toBeNull();
        expect(Constants.PreLoadPlugins[0]).not.toBeUndefined();
        expect(service.hasPlugin(Constants.PreLoadPlugins[0].id)).toBeTruthy();

        const realLink = require.resolve(Constants.PreLoadPlugins[0].link);
        expect(service.findPlugin(Constants.PreLoadPlugins[0].id).link).toEqual(realLink);

        expect(service.findPlugin(Constants.PreLoadPlugins[0].id)).toMatchObject({
            description: 'System Build-in',
            id: Constants.PreLoadPlugins[0].id,
            link: require.resolve(realLink),
        });
    });

    it('new constructor init', () => {
        const service = new Service();
        service.init();

        expect(service.version).not.toBeUndefined();
        expect(service.version).not.toBeNull();
    });

    it('new constructor run', () => {
        const service = new Service();
        service.run();

        expect(service.version).not.toBeUndefined();
        expect(service.version).not.toBeNull();
    });

});
