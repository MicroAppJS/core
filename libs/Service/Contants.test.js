'use strict';

/* global expect */

const { PreLoadPlugins, SharedProps, ServiceSharedProps } = require('./Contants');

describe('Contants', () => {

    it('check PreLoadPlugins', () => {
        PreLoadPlugins.forEach(item => {
            expect(item.id).not.toBeUndefined();
            expect(typeof item.id).toEqual('string');
            expect(/[\.|\/]/ig.test(item.id)).toEqual(false);
            expect(item.link).not.toBeUndefined();
            expect(typeof item.link).toEqual('string');
            expect(item.description).not.toBeUndefined();
            expect(typeof item.description).toEqual('string');

            expect(PreLoadPlugins.filter(_item => _item.id === item.id).length).toEqual(1);
        });
    });

    it('check SharedProps & ServiceSharedProps', () => {
        expect(Array.from(new Set(SharedProps)).length).toEqual(SharedProps.length);
        expect(Array.from(new Set(ServiceSharedProps)).length).toEqual(ServiceSharedProps.length);
        expect(SharedProps.some(key => ServiceSharedProps.includes(key))).toEqual(false);
    });

});
