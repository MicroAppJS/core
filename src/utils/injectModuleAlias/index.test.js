'use strict';

/* global expect */

describe('injectModuleAlias', () => {

    const injectModuleAlias = require('./index');
    const moduleAlias = require('./module-alias');

    it('addPath', () => {

        injectModuleAlias.addPath(__dirname);
        injectModuleAlias.addPaths([ __dirname ]);

        expect(moduleAlias._modulePaths).toContain(__dirname);
    });

    it('add', () => {

        injectModuleAlias.add({
            abcd: __dirname,
        });

        expect(moduleAlias._moduleAliasNames.includes('abcd')).toBeTruthy();
        expect(moduleAlias._moduleAliases.abcd).toContain(__dirname);
    });

});
