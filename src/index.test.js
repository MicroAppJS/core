'use strict';

/* global expect */

describe('Main', () => {

    it('new constructor', () => {
        const MicroApp = require('./index');

        expect(MicroApp.CONSTANTS).not.toBeNull();
        expect(MicroApp.CONSTANTS).not.toBeUndefined();

        expect(MicroApp.Service).not.toBeNull();
        expect(MicroApp.Service).not.toBeUndefined();

        expect(MicroApp.logger).not.toBeNull();
        expect(MicroApp.logger).not.toBeUndefined();
    });

});
