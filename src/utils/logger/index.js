'use strict';

const os = require('os');
const chalk = require('chalk');
const utils = require('util');

const { logger } = require('@micro-app/shared-utils');
const isNew = !!logger.npmlog;

const CONSTANTS = require('../../core/Constants');

let result = logger;

if (isNew) {
    logger.setAlias('logo', 'noise');
} else {
    result = {
        ...logger,
        toString: Object.assign({ // 兼容.
            logo() {
                const message = utils.format(...(arguments || []));
                const { NAME } = CONSTANTS;
                return `${chalk.bgHex('#662F88')(` ${NAME} `)} ${message} ${os.EOL}`;
            },
        }, logger.toString), // 兼容.
        logo(...args) {
            return logger.getStdoutMethod('log')(toString.logo.call(toString, ...args));
        },
    };
}

module.exports = result;
