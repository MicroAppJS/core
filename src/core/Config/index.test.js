'use strict';

/* global expect */

const MicroAppConfig = require('./index');
const loadFile = require('../../utils/loadFile');

describe('MicroAppConfig', () => {

    it('new constructor', () => {
        const defaultConfig = loadFile(__dirname, '../Constants/default.js');
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
        const defaultConfig = loadFile(__dirname, '../Constants/default.js');
        const config = new MicroAppConfig(Object.assign({}, defaultConfig, {

        }));

        expect(config.toJSON(true)).not.toBeUndefined();
        expect(config.toJSON(true)).not.toBeNull();

        expect(config.toConfig(true)).not.toBeUndefined();
        expect(config.toConfig(true)).not.toBeNull();

        // 已迁移
        expect(config.webpack).toBeUndefined();
        expect(config.entry).toBeUndefined();
        expect(config.htmls).toBeUndefined();
        expect(config.dlls).toBeUndefined();
        expect(config.staticPaths).toBeUndefined();
        expect(config.server).toBeUndefined();
        expect(config.toServerConfig).toBeUndefined();
    });

    it('new constructor others', () => {
        const defaultConfig = loadFile(__dirname, '../Constants/default.js');
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

        expect(config.toJSON(true)).not.toBeUndefined();
        expect(config.toJSON(true)).not.toBeNull();

        expect(config.toConfig(true)).not.toBeUndefined();
        expect(config.toConfig(true)).not.toBeNull();

        // 已迁移
        expect(config.webpack).toBeUndefined();
        expect(config.entry).toBeUndefined();
        expect(config.html).toBeUndefined();
        expect(config.htmls).toBeUndefined();
        expect(config.dll).toBeUndefined();
        expect(config.dlls).toBeUndefined();
        expect(config.staticPaths).toBeUndefined();
        expect(config.server).toBeUndefined();
        expect(config.toServerConfig).toBeUndefined();
    });
});
