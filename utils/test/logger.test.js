'use strict';

/* global expect */

describe('Logger', () => {

    it('test logger', () => {

        const logger = require('../logger');
        logger.error('abc');
        logger.info('abc');
        logger.success('abc');
        logger.logo('abc');
        logger.warn('abc');
        logger.debug('abc');
        const spinner = logger.spinner('abc');
        spinner.start();
        setTimeout(() => {
            spinner.success('cc');
        }, 3000);

    });

});
