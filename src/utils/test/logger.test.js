'use strict';

/* global expect */

describe('Logger', () => {

    it('logger debug', () => {

        const logger = require('../logger');
        logger.debug('abc');

    });

    it('logger error', () => {

        const logger = require('../logger');
        logger.error('abc');

    });

    it('logger info', () => {

        const logger = require('../logger');
        logger.info('abc');

    });

    it('logger success', () => {

        const logger = require('../logger');
        logger.success('abc');

    });

    it('logger logo', () => {

        const logger = require('../logger');
        logger.logo('abc');

    });

    it('logger warn', () => {

        const logger = require('../logger');
        logger.warn('abc');

    });

    it('logger spinner', () => {

        const logger = require('../logger');
        const spinner = logger.spinner('abc');
        spinner.start();
        setTimeout(() => {
            spinner.success('cc');
        }, 3000);

    });

    it('logger toString', () => {

        const logger = require('../logger');
        console.log(logger.toString());

    });

});
