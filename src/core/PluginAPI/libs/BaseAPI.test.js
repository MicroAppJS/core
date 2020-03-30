'use strict';

/* global expect */

const BaseAPI = require('./BaseAPI');

describe('BaseAPI', () => {

    it('new constructor', () => {
        const base = new BaseAPI();
        expect(base.logger).not.toBeNull();
        expect(base.logger).not.toBeUndefined();

        expect(base.version).not.toBeNull();
        expect(base.version).not.toBeUndefined();

        expect(base.assertVersion).not.toBeNull();
        expect(base.assertVersion).not.toBeUndefined();

        // base.assertVersion(0);
        // base.assertVersion('^0');
    });

    it('validateSchema', () => {
        const base = new BaseAPI();

        const schema = {
            additionalProperties: false,
            properties: {
                name: {
                    description: '名称. ( string )',
                    type: 'string',
                },
            },
            type: 'object',
        };

        base.validateSchema(schema, {
            name: 'test',
        });
    });

});
