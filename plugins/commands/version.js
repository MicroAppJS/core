'use strict';

const chalk = require('chalk');

module.exports = function(api) {
    api.registerCommand('version', {
        description: 'show version',
        usage: '',
        options: '',
        details: '',
    }, () => {
        const pkg = require('../../package.json');
        const version = pkg.version;

        api.logger.logo();
        api.logger.logo(`${chalk.green('Version')}: ${chalk.yellow(version)}`);
        api.logger.logo();
    });
};
