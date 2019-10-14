'use strict';

/* global expect */

describe('ModuleAlias', () => {

    const moduleAlias = require('./index');

    it('init', () => {

        moduleAlias();

    });

    it('addPath', () => {

        moduleAlias.addPath(__dirname);

        expect(moduleAlias._modulePaths).toContain(__dirname);
    });

    it('addAlias', () => {

        moduleAlias.addAlias('@abc', __dirname);

        expect(moduleAlias._moduleAliasNames.includes('@abc')).toBeTruthy();
        expect(moduleAlias._moduleAliases['@abc']).toContain(__dirname);
    });

    it('addAliases', () => {

        moduleAlias.addAliases({
            abcd: __dirname,
        });

        expect(moduleAlias._moduleAliasNames.includes('abcd')).toBeTruthy();
        expect(moduleAlias._moduleAliases.abcd).toContain(__dirname);
    });

});
