'use strict';

/* global expect */

const ExtraConfig = require('./ExtraConfig');

describe('ExtraConfig', () => {

    it('new constructor', () => {
        const config = new ExtraConfig(process.cwd());

        expect(config.micros).not.toBeNull();
        expect(config.micros).not.toBeUndefined();

        // console.warn(config.micros);
        // console.warn(config);
        // console.warn(config.vuepress);
        expect(config.vuepress).toBeUndefined();
        config.vuepress = 'ddd';
        expect(config.vuepress).not.toBeUndefined();
        // console.warn(config.vuepress);
    });

});
