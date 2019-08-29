'use strict';

/* global expect */

const { PreLoadPlugins } = require('./Contants');
const Service = require('./index');

describe('Service', () => {

    it('new constructor', () => {
        const service = new Service();
        expect(service.selfConfig).not.toBeNull();
        expect(service.selfServerConfig).not.toBeNull();
        expect(service.micros).toBeInstanceOf(Set);
        expect(service.microsConfig).not.toBeNull();
        expect(service.microsServerConfig).not.toBeNull();
        expect(service.plugins).not.toBeNull();
        expect(service.plugins.length).toEqual(PreLoadPlugins.length);
    });

    it('new constructor Done', () => {
        const service = new Service();
        expect(service.version).not.toBeNull();
    });

});
