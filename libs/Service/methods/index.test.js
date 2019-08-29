'use strict';

/* global expect */

const DEFAULT_METHODS = require('./index');

describe('methods', () => {

    it('check DEFAULT_METHODS', () => {
        expect(Array.from(new Set(DEFAULT_METHODS)).length).toEqual(DEFAULT_METHODS.length);

        DEFAULT_METHODS.forEach(item => {
            expect(item).not.toBeUndefined();
            expect(typeof item).toEqual('string');
            expect(/[\.|\/]/ig.test(item)).toEqual(false);
        });
    });

});
