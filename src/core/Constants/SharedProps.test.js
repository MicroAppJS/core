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

    it('check base', () => {
        const Service = require('../Service/libs/BaseService');
        const service = new Service();
        SHARED_PROPS.BaseServiceKeys.forEach(key => {
            expect(service[key] === undefined && key).toBeFalsy();
            expect(service[key]).not.toBeUndefined();
            expect(service[key]).not.toBeNull();
        });
    });

    it('check method', () => {
        const Service = require('../Service/libs/MethodService');
        const service = new Service();
        SHARED_PROPS.MethodServiceKeys.forEach(key => {
            expect(service[key] === undefined && key).toBeFalsy();
            expect(service[key]).not.toBeUndefined();
            expect(service[key]).not.toBeNull();
        });
    });

    it('check plugin', () => {
        const Service = require('../Service/libs/PluginService');
        const service = new Service();
        SHARED_PROPS.PluginServiceKeys.forEach(key => {
            expect(service[key] === undefined && key).toBeFalsy();
            expect(service[key]).not.toBeUndefined();
            expect(service[key]).not.toBeNull();
        });
    });

});
