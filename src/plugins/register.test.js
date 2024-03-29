'use strict';

/* global expect */

const PreLoadPlugins = require('./register');

describe('Constants', () => {

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

        expect(Array.from(new Set(PreLoadPlugins.map(item => item.id))).length).toEqual(PreLoadPlugins.length);
    });

});
