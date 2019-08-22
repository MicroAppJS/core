'use strict';

const chalk = require('chalk').default;
const utils = require('util');

const CONSTANTS = require('../config/constants');

const toString = {
    debug() {
        const message = utils.format(...(arguments || []));
        return `${chalk.bgMagenta(' DEBUG ')} ${message} \n`;
    },
    warn() {
        const message = utils.format(...(arguments || []));
        return `${chalk.bgYellowBright.black(' WARN ')} ${chalk.yellowBright(message)} \n`;
    },
    error() {
        const message = utils.format(...(arguments || []));
        return `${chalk.bgRed(' ERROR ')} ${chalk.redBright(message)} \n`;
    },
    info() {
        const message = utils.format(...(arguments || []));
        return `${chalk.bgBlue(' INFO ')} ${chalk.blueBright(message)} \n`;
    },
    success() {
        const message = utils.format(...(arguments || []));
        return `${chalk.bgHex('#007007')(' SUCCESS ')} ${chalk.greenBright(message)} \n`;
    },
    logo() {
        const message = utils.format(...(arguments || []));
        const { NAME } = CONSTANTS;
        return `${chalk.bgHex('#662F88')(` ${NAME} `)} ${message} \n`;
    },
};

module.exports = {
    debug() {
        return process.stdout.write(toString.debug.call(toString, ...arguments));
    },
    warn() {
        return process.stdout.write(toString.warn.call(toString, ...arguments));
    },
    error() {
        return process.stdout.write(toString.error.call(toString, ...arguments));
    },
    info() {
        return process.stdout.write(toString.info.call(toString, ...arguments));
    },
    success() {
        return process.stdout.write(toString.success.call(toString, ...arguments));
    },
    logo() {
        return process.stdout.write(toString.logo.call(toString, ...arguments));
    },
    toString,
};
