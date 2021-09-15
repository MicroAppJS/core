'use strict';

/* global expect */

const Service = require('../../../core/Service');

describe('clean', () => {

    it('run force', async () => {

        const service = new Service();

        await service.run('clean', { _: [ ], force: true });

        expect(service.commands.clean).not.toBeNull();
        expect(service.commands.clean).not.toBeUndefined();
        expect(typeof service.commands.clean).toEqual('object');
    });


});
