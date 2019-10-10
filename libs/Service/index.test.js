'use strict';

/* global expect */

const { PreLoadPlugins } = require('./Constants');
const Service = require('./index');

describe('Service', () => {

    it('new constructor', () => {
        const service = new Service();
        expect(service.selfConfig).not.toBeNull();
        expect(service.selfConfig).not.toBeUndefined();

        expect(service.selfServerConfig).not.toBeNull();
        expect(service.selfServerConfig).not.toBeUndefined();

        expect(service.micros).toBeInstanceOf(Set);

        expect(service.microsConfig).not.toBeNull();
        expect(service.microsConfig).not.toBeUndefined();

        expect(service.microsServerConfig).not.toBeNull();
        expect(service.microsServerConfig).not.toBeUndefined();

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
        const Constants = require('./Constants');
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

});
