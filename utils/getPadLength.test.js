'use strict';

/* global expect */

const getPadLength = require('./getPadLength');

describe('getPadLength', () => {

    it('array', () => {
        const MAX = 21;
        const obj = [
            { name: 'abc' },
            { name: 'abcd' },
            { name: 'a'.repeat(MAX) },
        ];
        const longest = getPadLength(obj);

        expect(longest).toEqual(MAX + 1);
    });

    it('object', () => {
        const MAX = 15;
        const obj = {
            abc: 1,
            c: 2,
            abcddd: 3,
            ['c'.repeat(MAX)]: 'ccc',
        };
        const longest = getPadLength(obj);

        expect(longest).toEqual(MAX + 1);
    });

});
