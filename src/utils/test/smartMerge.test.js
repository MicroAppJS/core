'use strict';

/* global expect */

const smartMerge = require('../smartMerge');
const merge = require('webpack-merge');

describe('smartMerge', () => {

    it('array', () => {
        const a = {
            array: [{
                a: 1,
                b: 2,
                abc: 'dd',
            }],
            cc: 'abc',
        };
        const b = {
            array: [{
                a: 1,
            }],
            cc: 'abc',
        };
        const c = {
            array: [{
                a: 1,
            }],
            cc: 'abcd',
        };

        const aa = { a: 1, b: { c: { d: 2 } }, z: [ '12' ] };
        const bb = { a: { aa: 2 }, b: { c: { vv: 2 } }, c: { c: '33' }, z: [ '45' ] };

        const result = smartMerge({}, a, b, c, aa, bb);
        const result1 = smartMerge.normal({}, a, b, c, aa, bb);
        const result2 = merge.smart({}, a, b, c, aa, bb);
        // console.log(result);
        // console.log(result1);
        // console.log(result2);
        expect(result1).toEqual(result2);
        expect(result).not.toEqual(result2);
    });

});
