'use strict';

/* global expect */

const BaseConfig = require('./BaseConfig');
const { loadFile } = require('@micro-app/shared-utils');

const testConfig = {
    shared: {
        api: 'abc',
    },
    plugins: [
        [{
            id: 'test',
            description: '这是test',
            link: __dirname + '/test/testPlugin',
        }, {
            a: 1,
        }],
        {
            id: 'test',
            description: '这是test',
            link: __dirname + '/test/testPlugin',
        },
    ],
};

describe('BaseConfig', () => {

    it('new constructor', () => {
        const defaultConfig = loadFile(__dirname, '../../Constants/default.js');
        const config = new BaseConfig(Object.assign(defaultConfig, testConfig), {
            filePath: __dirname,
            originalRoot: __dirname,
            loadSuccess: true,
        });

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
    });

    it('config inspect', () => {
        const defaultConfig = loadFile(__dirname, '../../Constants/default.js');
        const config = new BaseConfig(Object.assign(defaultConfig, testConfig), {
            filePath: __dirname,
            originalRoot: __dirname,
            loadSuccess: true,
        });

        expect(config.inspect).toBeUndefined();
    });

    it('auto load plugins', () => {
        const config = new BaseConfig({
            plugins: true,
        }, {
            root: process.cwd(),
            filePath: __dirname,
            originalRoot: __dirname,
            loadSuccess: true,
        });

        console.warn('config.plugins: ', config.plugins);
        expect(config.plugins.length > 0).toBeTruthy();
    });

    it('type: master', () => {
        const config = new BaseConfig({}, {
            root: process.cwd(),
            filePath: __dirname,
            originalRoot: __dirname,
            loadSuccess: true,
            type: 'master',
        });

        expect(config.type).toEqual('master');
    });

});
