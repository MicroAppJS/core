'use strict';

/* global expect */

const Service = require('../../../core/Service');
// const help = require('.');

describe('Command help', () => {

    it('command', () => {
        const service = new Service();

        service.run('help', {
            _: [ 'show' ],
        });
    });

    it('all', () => {
        const service = new Service();

        service.run('help');
    });

});
