'use strict';

/* global expect */

const requireMicro = require('../requireMicro');

describe('requireMicro', () => {

    it('self', () => {
        const selfConfig = requireMicro.self();

        expect(selfConfig).not.toBeUndefined();
        expect(selfConfig).not.toBeNull();

        selfConfig.abc = 'abcddd';
        expect(selfConfig.abc).toEqual('abcddd');
    });

});
