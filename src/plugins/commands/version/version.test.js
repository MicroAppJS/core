'use strict';

/* global expect */

const Service = require('../../../core/Service');

describe('Command version', () => {

    it('version', () => {
        const service = new Service();

        service.run('version');

        expect(service.commands.version).not.toBeNull();
        expect(service.commands.version).not.toBeUndefined();
        expect(typeof service.commands.version).toEqual('object');
    });

});
