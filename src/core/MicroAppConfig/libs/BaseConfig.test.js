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

        expect(config.path).not.toBeNull();
        expect(config.path).not.toBeUndefined();

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

        expect(config.inspect).not.toBeNull();
        expect(config.inspect).not.toBeUndefined();
        config.inspect();
    });

});
