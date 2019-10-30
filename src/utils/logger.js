'use strict';

const os = require('os');
const chalk = require('chalk');
const utils = require('util');

const { logger } = require('@micro-app/shared-utils');

const CONSTANTS = require('../core/Constants');

const toString = {
    ...logger.toString,
    logo() {
        const message = utils.format(...(arguments || []));
        const { NAME } = CONSTANTS;
        return `${chalk.bgHex('#662F88')(` ${NAME} `)} ${message} ${os.EOL}`;
    },
};

module.exports = {
    ...logger,
    toString,
    logo() {
        return logger.getStdoutMethod('log')(toString.logo.call(toString, ...arguments));
    },
};
