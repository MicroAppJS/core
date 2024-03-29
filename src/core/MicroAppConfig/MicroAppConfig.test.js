'use strict';

/* global expect */

const MicroAppConfig = require('.');
const { loadFile } = require('@micro-app/shared-utils');

describe('MicroAppConfig', () => {

    it('new constructor', () => {
        const config = MicroAppConfig.createInstance();

        expect(config.config).not.toBeNull();
        expect(config.root).not.toBeUndefined();

        expect(config.originalRoot).not.toBeNull();
        expect(config.originalRoot).not.toBeUndefined();

        expect(config.version).not.toBeUndefined();
        expect(config.version).not.toBeNull();

        expect(config.micros).toBeInstanceOf(Array);

        expect(config.filePath).not.toBeNull();
        expect(config.filePath).not.toBeUndefined();

        expect(config.plugins).not.toBeNull();
        expect(config.plugins).not.toBeUndefined();

        expect(config.options).not.toBeNull();
        expect(config.options).not.toBeUndefined();
    });

    it('new constructor Config', () => {
        const config = MicroAppConfig.createInstance();

        expect(config.toJSON(true)).not.toBeUndefined();
        expect(config.toJSON(true)).not.toBeNull();

        expect(config).not.toBeUndefined();
        expect(config).not.toBeNull();

        // 已迁移
        expect(config.webpack).toBeUndefined();
        expect(config.entry).toBeUndefined();
        expect(config.htmls).toBeUndefined();
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

        }), {
            filePath: __dirname,
            originalRoot: __dirname,
            loadSuccess: true,
        });

        expect(config.toJSON(true)).not.toBeUndefined();
        expect(config.toJSON(true)).not.toBeNull();

        expect(config).not.toBeUndefined();
        expect(config).not.toBeNull();

        // 已迁移
        expect(config.webpack).toBeUndefined();
        expect(config.entry).toBeUndefined();
        expect(config.html).toBeUndefined();
        expect(config.htmls).toBeUndefined();
        expect(config.staticPaths).toBeUndefined();
        expect(config.server).toBeUndefined();
        expect(config.toServerConfig).toBeUndefined();
    });

    it('manifest', () => {
        const config = MicroAppConfig.createInstance();

        expect(config.manifest).not.toBeUndefined();
        expect(config.manifest).not.toBeNull();
    });

    it('licensePath', () => {
        const config = MicroAppConfig.createInstance();

        expect(config.licensePath).not.toBeUndefined();
        expect(config.licensePath).not.toBeNull();
    });
});
