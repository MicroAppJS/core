'use strict';

const chalk = require('chalk');

module.exports = function(api) {
    api.registerCommand('version', {
        description: 'show version',
        usage: 'micro-app version',
    }, () => {
        const pkg = require('../../package.json');
        const version = pkg.version;

        api.logger.logo();
        api.logger.logo(`${chalk.green('Version')}: ${chalk.yellow(version)}`);
        api.logger.logo();
    });
};
