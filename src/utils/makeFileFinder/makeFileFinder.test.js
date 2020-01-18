'use strict';

/* global expect */

const path = require('path');
const makeFileFinder = require('.');

describe('makeFileFinder', () => {

    it('node_module', () => {
        const root = path.resolve(process.cwd(), 'node_modules');
        const finder = makeFileFinder(root, [ '*' ]);

        const pkgInfos = finder('package.json', filePaths => {
            return filePaths.map(item => item.replace(root, ''));
        });

        expect(pkgInfos.length > 0).toBeTruthy();
    });

});
