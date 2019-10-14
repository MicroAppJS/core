'use strict';

/* global expect */

const MicroAppConfig = require('./index');
const defaultConfig = require('../../micro-app.config');

describe('MicroAppConfig', () => {

    it('new constructor', () => {
        const config = new MicroAppConfig(Object.assign({}, defaultConfig, {

        }));

        expect(config.config).not.toBeNull();
        expect(config.root).not.toBeUndefined();

        expect(config.originalRoot).not.toBeNull();
        expect(config.originalRoot).not.toBeUndefined();

        expect(config.version).not.toBeUndefined();
        expect(config.version).not.toBeNull();

        expect(config.micros).toBeInstanceOf(Array);

        expect(config.path).not.toBeNull();
        expect(config.path).not.toBeUndefined();

        expect(config.isDev).not.toBeNull();
        expect(config.isDev).not.toBeUndefined();

        expect(config.plugins).not.toBeNull();
        expect(config.plugins).not.toBeUndefined();
    });

    it('new constructor Config', () => {
        const config = new MicroAppConfig(Object.assign({}, defaultConfig, {

        }));

        expect(config.webpack).not.toBeUndefined();
        expect(config.webpack).not.toBeNull();

        expect(config.entry).not.toBeUndefined();
        expect(config.entry).not.toBeNull();

        expect(config.htmls).not.toBeUndefined();
        expect(config.htmls).not.toBeNull();

        expect(config.dlls).not.toBeUndefined();
        expect(config.dlls).not.toBeNull();

        expect(config.staticPaths).not.toBeUndefined();
        expect(config.staticPaths).not.toBeNull();

        expect(config.server).not.toBeUndefined();
        expect(config.server).not.toBeNull();

        expect(config.toJSON(true)).not.toBeUndefined();
        expect(config.toJSON(true)).not.toBeNull();

        expect(config.toConfig(true)).not.toBeUndefined();
        expect(config.toConfig(true)).not.toBeNull();

        expect(config.toServerConfig(true)).not.toBeUndefined();
        expect(config.toServerConfig(true)).not.toBeNull();
    });

    it('new constructor others', () => {
        const config = new MicroAppConfig(Object.assign({}, defaultConfig, {
            entry: {
                main: [ './test/index.js' ],
            },

            staticPath: [ 'abc' ],

            dlls: [
                {
                    context: __dirname,
                    manifest: __dirname,
                    filepath: __filename,
                },
            ],
        }));

        expect(config.webpack).not.toBeUndefined();
        expect(config.webpack).not.toBeNull();

        expect(config.entry).not.toBeUndefined();
        expect(config.entry).not.toBeNull();

        expect(config.html).not.toBeUndefined();
        expect(config.html).not.toBeNull();

        expect(config.htmls).not.toBeUndefined();
        expect(config.htmls).not.toBeNull();

        expect(config.dll).not.toBeUndefined();
        expect(config.dll).not.toBeNull();

        expect(config.dlls).not.toBeUndefined();
        expect(config.dlls).not.toBeNull();

        expect(config.staticPaths).not.toBeUndefined();
        expect(config.staticPaths).not.toBeNull();

        expect(config.server).not.toBeUndefined();
        expect(config.server).not.toBeNull();

        expect(config.toJSON(true)).not.toBeUndefined();
        expect(config.toJSON(true)).not.toBeNull();

        expect(config.toConfig(true)).not.toBeUndefined();
        expect(config.toConfig(true)).not.toBeNull();

        expect(config.toServerConfig(true)).not.toBeUndefined();
        expect(config.toServerConfig(true)).not.toBeNull();
    });
});
