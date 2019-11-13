'use strict';

/* global expect */

const Service = require('../../../core/Service');
// const help = require('.');

describe('Command help', () => {

    it('command', async () => {
        const service = new Service();

        await service.run('help', {
            _: [ 'show' ],
        });
    });

    it('all', async () => {
        const service = new Service();

        await service.run('help');
    });

});
