'use strict';

/* global expect */

const { SHARED_PROPS } = require('.');

describe('Constants', () => {

    it('check SharedProps length', () => {
        expect(Array.from(new Set(SHARED_PROPS)).length).toEqual(SHARED_PROPS.length);
    });

    it('check SharedProps exist', () => {
        const Service = require('../Service');
        const service = new Service();
        SHARED_PROPS.forEach(key => {
            expect(service[key] === undefined && key).toBeFalsy();
            expect(service[key]).not.toBeUndefined();
            expect(service[key]).not.toBeNull();
        });
    });

});
