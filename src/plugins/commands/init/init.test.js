'use strict';

/* global expect */

const Service = require('../../../core/Service');

describe('Command version', () => {

    it('version', async () => {
        const service = new Service();

        const plugin = service.plugins.find(item => item.id.includes('init'));
        expect(typeof plugin).toEqual('object');
    });

    // it('addCommandInit', async () => {
    //     const service = new Service();

    //     const plugin = service.plugins.find(item => item.id.includes('init'));
    //     expect(typeof plugin).toEqual('object');

    //     await service.init();

    //     expect(plugin[Symbol.for('api')]).not.toBeUndefined();
    //     plugin[Symbol.for('api')].addCommandInit(abc => {
    //         console.warn('abc: ', abc);
    //         return {
    //             a: 'a',
    //             b: 'b',
    //             c: 'c',
    //         };
    //     });

    //     await service.runCommand('init');

    //     expect(service.commands.init).not.toBeNull();
    //     expect(service.commands.init).not.toBeUndefined();
    //     expect(typeof service.commands.init).toEqual('object');
    // });

});
