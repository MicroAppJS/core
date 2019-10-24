'use strict';

const chalk = require('chalk').default;
const utils = require('util');

const { logger } = require('@micro-app/shared-utils');

const CONSTANTS = require('../../libs/Constants');

const toString = {
    ...logger.toString,
    logo() {
        const message = utils.format(...(arguments || []));
        const { NAME } = CONSTANTS;
        return `${chalk.bgHex('#662F88')(` ${NAME} `)} ${message} \r\n`;
    },
};

module.exports = {
    ...logger,
    toString,
    logo() {
        return logger.getStdoutMethod('log')(toString.logo.call(toString, ...arguments));
    },
};
