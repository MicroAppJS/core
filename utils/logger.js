'use strict';

const chalk = require('chalk').default;
const utils = require('util');

const CONSTANTS = require('../config/constants');

module.exports = {
    debug() {
        const message = utils.format(...(arguments || []));
        return process.stdout.write(`${chalk.bgMagenta(' DEBUG ')} ${message} \n`);
    },
    warn() {
        const message = utils.format(...(arguments || []));
        return process.stdout.write(`${chalk.bgYellowBright.black(' WARN ')} ${chalk.yellowBright(message)} \n`);
    },
    error() {
        const message = utils.format(...(arguments || []));
        return process.stdout.write(`${chalk.bgRed(' ERROR ')} ${chalk.redBright(message)} \n`);
    },
    info() {
        const message = utils.format(...(arguments || []));
        return process.stdout.write(`${chalk.bgBlue(' INFO ')} ${chalk.blueBright(message)} \n`);
    },
    success() {
        const message = utils.format(...(arguments || []));
        return process.stdout.write(`${chalk.bgHex('#007007')(' SUCCESS ')} ${chalk.greenBright(message)} \n`);
    },
    logo() {
        const { NAME } = CONSTANTS;
        const message = utils.format(...(arguments || []));
        return process.stdout.write(`${chalk.bgHex('#662F88')(` ${NAME} `)} ${message} \n`);
    },
};
