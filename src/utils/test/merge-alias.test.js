'use strict';

/* global expect */

const mergeAlias = require('../merge-alias');

describe('mergeAlias', () => {

    it('padAliasName', () => {
        const padAliasName = mergeAlias.padAliasName;

        const aliasObjg = padAliasName({
            aliasName: '@abc',
        });

        expect(aliasObjg).not.toBeNull();
        expect(aliasObjg).not.toBeUndefined();
    });

});
