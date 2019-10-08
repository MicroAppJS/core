'use strict';

/* global expect */

const Service = require('../../../libs/Service');
const PluginAPI = require('../../../libs/Service/PluginAPI');
const versionCommand = require('./index');

describe('Command version', () => {

    it('version', () => {
        const service = new Service();
        const api = new PluginAPI('version', service);

        versionCommand(api);

        expect(service.commands.version).not.toBeNull();
        expect(service.commands.version).not.toBeUndefined();
        expect(typeof service.commands.version).toEqual('object');
    });

});
