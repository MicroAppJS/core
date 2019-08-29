'use strict';

const { padEnd } = require('lodash');
const chalk = require('chalk');
const getPadLength = require('../../utils/getPadLength');

module.exports = function(api) {
    api.registerCommand('version', {
        description: 'show version',
        usage: 'micro-app version',
    }, () => {
        const pkg = require('../../package.json');

        const packages = api.applyPluginHooks('addCommandVersion', [ pkg ]);

        api.logger.logo();
        api.logger.logo(`${chalk.green('Version')}:`);
        const _pkgs = packages.map(_pkg => {
            const name = _pkg.name;
            const description = _pkg.description;
            const version = _pkg.version;
            return { name, version, description };
        });

        const padLength = getPadLength(_pkgs);

        _pkgs.forEach(info => {
            const textStrs = [ `   * ${chalk.yellow(padEnd(info.name, padLength))}` ];
            const version = info.version || false;
            if (version && typeof version === 'string') {
                textStrs.push(`[ ${chalk.blueBright(version)} ]`);
            }
            const desc = info.description || false;
            if (desc && typeof desc === 'string') {
                textStrs.push(`( ${chalk.gray(desc)} )`);
            }
            api.logger.logo(textStrs.join(' '));
        });

        api.logger.logo();
    });
};
