'use strict';

/* global expect */

const validateSchema = require('.');

describe('validateSchema', () => {

    it('validate', () => {
        const schema = require('../../core/MicroAppConfig/libs/configSchema');
        const config = require('../../core/Constants/default');

        const result = validateSchema(schema, config);
        expect(result).toBeTruthy();
    });

});
