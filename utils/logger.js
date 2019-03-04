'use strict';

const chalk = require('chalk').default;
const utils = require('util');

const { NAME } = require('../config/constants');

module.exports = {
    error() {
        const message = utils.format(...(arguments || []));
        return process.stdout.write(`${chalk.bgRed(' ERROR ')} ${chalk.yellowBright('>>>')} ${chalk.redBright(message)} \n`);
    },
    info() {
        const message = utils.format(...(arguments || []));
        return process.stdout.write(`${chalk.bgBlue(' INFO ')} ${chalk.yellowBright('>>>')} ${message} \n`);
    },
    success() {
        const message = utils.format(...(arguments || []));
        return process.stdout.write(`${chalk.bgHex('#007007')(' SUCCESS ')} ${chalk.yellowBright('>>>')} ${chalk.greenBright(message)} \n`);
    },
    logo() {
        const message = utils.format(...(arguments || []));
        return process.stdout.write(`${chalk.bgHex('#662F88')(` ${NAME} `)} ${chalk.yellowBright('>>>')} ${message} \n`);
    },
};
