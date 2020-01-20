'use strict';

/* global expect */

const Service = require('../../../core/Service');

describe('Command version', () => {

    it('version', async () => {
        const service = new Service();

        await service.run('version');

        expect(service.commands.version).not.toBeNull();
        expect(service.commands.version).not.toBeUndefined();
        expect(typeof service.commands.version).toEqual('object');
    });

    it('addCommandVersion', async () => {
        const service = new Service();

        const plugin = service.plugins.find(item => item.id.includes('version'));
        expect(typeof plugin).toEqual('object');

        await service.init();

        expect(plugin[Symbol.for('api')]).not.toBeUndefined();
        plugin[Symbol.for('api')].addCommandVersion(() => {
            return {
                name: 'a',
                version: 'b',
                description: 'c',
            };
        });

        await service.runCommand('version');

        expect(service.commands.version).not.toBeNull();
        expect(service.commands.version).not.toBeUndefined();
        expect(typeof service.commands.version).toEqual('object');
    });

});
