'use strict';

/* global expect */

const Service = require('../../libs/Service');
const PluginAPI = require('../../libs/Service/PluginAPI');
const VueCLIAdapter = require('./index');
const CONSTANTS = require('../../config/constants');
const path = require('path');

describe('Plugin VueCLIAdapter', () => {

    it('VueCLIAdapter', () => {
        const service = new Service();
        const api = new PluginAPI('version', service);

        api.onChainWebpcakConfig = () => {};
        api.modifyWebpcakConfig = () => {};

        VueCLIAdapter(api);

        expect(api.getCwd()).toEqual(CONSTANTS.ROOT);
        expect(api.resolve('abc')).toEqual(path.resolve(CONSTANTS.ROOT, 'abc'));

        expect(api.assertVersion).not.toBeUndefined();
        expect(api.assertVersion).not.toBeNull();

        expect(api.genCacheConfig).not.toBeUndefined();
        expect(api.genCacheConfig).not.toBeNull();

        // expect(api.chainWebpack).not.toBeUndefined();
        // expect(api.chainWebpack).not.toBeNull();

        // expect(api.configureWebpack).not.toBeUndefined();
        // expect(api.configureWebpack).not.toBeNull();

        // expect(api.configureDevServer).not.toBeUndefined();
        // expect(api.configureDevServer).not.toBeNull();
    });

});
