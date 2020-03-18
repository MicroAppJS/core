'use strict';

/* global expect */

const Service = require('../../../');

describe('show', () => {

    it('env', () => {
        const service = new Service();
        service.runSync('show', { _: [ 'env' ] });
    });

    it('micros', () => {
        const service = new Service();
        service.runSync('show', { _: [ 'micros' ] });
    });

    it('alias', () => {
        const service = new Service();
        service.runSync('show', { _: [ 'alias' ] });
    });

    it('shared', () => {
        const service = new Service();
        service.runSync('show', { _: [ 'shared' ] });
    });

    it('methods', () => {
        const service = new Service();
        service.runSync('show', { _: [ 'methods' ] });
    });

    it('plugins', () => {
        const service = new Service();
        service.runSync('show', { _: [ 'plugins' ] });
    });

    it('hooks', () => {
        const service = new Service();
        service.runSync('show', { _: [ 'hooks' ] });
    });

    it('info', () => {
        const service = new Service();
        service.runSync('show', { _: [ 'info' ] });
    });


    it('process.env', () => {
        const service = new Service();
        service.runSync('show', { _: [ 'process.env' ] });
    });


    it('api', () => {
        const service = new Service();
        service.runSync('show', { _: [ 'api' ] });
    });


    it('addCommandShow', async () => {
        const service = new Service();

        const plugin = service.plugins.find(item => item.id.includes('show'));
        expect(typeof plugin).toEqual('object');

        await service.init();

        expect(plugin[Symbol.for('api')]).not.toBeUndefined();
        plugin[Symbol.for('api')].changeCommandOption('show', oldOpts => {
            Object.assign(oldOpts.options, {
                test: 'list all test',
            });
            return oldOpts;
        });
        plugin[Symbol.for('api')].addCommandShow(() => {
            return {
                type: 'test',
                info: {
                    a: 'a',
                    b: 'b',
                    c: 'c',
                },
            };
        });

        await service.runCommand('show');
        await service.runCommand('show', { _: [ 'test' ] });

        expect(service.commands.show).not.toBeNull();
        expect(service.commands.show).not.toBeUndefined();
        expect(typeof service.commands.show).toEqual('object');
    });


    it('none', async () => {
        const service = new Service();

        const plugin = service.plugins.find(item => item.id.includes('show'));
        expect(typeof plugin).toEqual('object');

        await service.init();

        expect(plugin[Symbol.for('api')]).not.toBeUndefined();

        await service.runCommand('show', { _: [ 'none' ] });

        expect(service.commands.show).not.toBeNull();
        expect(service.commands.show).not.toBeUndefined();
        expect(typeof service.commands.show).toEqual('object');
    });

});
