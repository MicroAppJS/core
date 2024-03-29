'use strict';

/* global expect */

const PreLoadPlugins = require('../../plugins/register');
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
        const service = new Service();
        expect(PreLoadPlugins[0]).not.toBeNull();
        expect(PreLoadPlugins[0]).not.toBeUndefined();
        expect(service.hasPlugin(PreLoadPlugins[0].id)).toBeTruthy();

        const realLink = require.resolve(PreLoadPlugins[0].link);
        expect(service.findPlugin(PreLoadPlugins[0].id).link).toEqual(realLink);

        expect(service.findPlugin(PreLoadPlugins[0].id)).toMatchObject({
            description: 'System Build-in',
            id: PreLoadPlugins[0].id,
            link: require.resolve(realLink),
        });
    });

    it('new constructor init', async () => {
        const service = new Service();
        await service.init();

        expect(service.version).not.toBeUndefined();
        expect(service.version).not.toBeNull();
    });

    it('new constructor run', async () => {
        const service = new Service();
        await service.run();

        expect(service.version).not.toBeUndefined();
        expect(service.version).not.toBeNull();
    });

    it('new constructor runSync', () => {
        const service = new Service();
        service.runSync();

        expect(service.version).not.toBeUndefined();
        expect(service.version).not.toBeNull();
    });

    it('new constructor runSync config', () => {
        const service = new Service();
        service.runSync();

        expect(service.config).not.toBeUndefined();
        expect(service.config).not.toBeNull();

        expect(service.config.name).not.toBeUndefined();
        expect(service.config.name).not.toBeNull();

        console.info(service.config);
    });

});
