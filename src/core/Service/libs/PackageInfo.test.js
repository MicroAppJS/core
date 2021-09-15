'use strict';

/* global expect */

const { parsePackageInfo } = require('./PackageInfo');

describe('PackageInfo', () => {

    it('parsePackageInfo', () => {
        const name = '@micro-app/shared-utils';
        const root = process.cwd();
        const pkg = parsePackageInfo(name, root);

        expect(pkg).not.toBeNull();
        expect(pkg).not.toBeUndefined();

        console.warn(pkg);
    });

});
