'use strict';

const { padEnd } = require('lodash');
const chalk = require('chalk');
const _ = require('lodash');
const semver = require('semver');
const getPadLength = require('../../utils/getPadLength');

module.exports = function(api) {
    const details = `
Examples:
  ${chalk.gray('# dependencies to compare')}
  micro-app check dependencies
  `.trim();

    api.registerCommand('check', {
        description: 'show alias & shared list, etc.',
        usage: 'micro-app show [options]',
        options: {
            deps: 'check all dependencies to compare.',
            dependencies: 'check all dependencies to compare.',
        },
        details,
    }, args => {
        const selfConfig = api.selfConfig || {};
        const micros = api.micros || [];
        const microsConfig = api.microsConfig || {};

        const type = args._[0];
        switch (type) {
            case 'deps':
            case 'dependencies':
                api.logger.logo(`${chalk.green('Dependencies List')}:`);
                return checkDependencies({ selfConfig, micros, microsConfig });
            default:
                api.logger.error(`Not Support options: "${type}" !`);
                return api.runCommand('help', { _: [ 'check' ] });
        }
    });

    function checkDependencies({ selfConfig, micros, microsConfig }) {
        const selfPackage = selfConfig.package || {};
        const selfDeps = selfPackage.dependencies || {};
        const dependenciesMap = {};
        const microsDeps = micros.reduce((obj, key) => {
            const pkg = microsConfig[key] && microsConfig[key].package;
            if (pkg && _.isPlainObject(pkg.dependencies)) {
                obj[key] = pkg.dependencies;
                Object.keys(pkg.dependencies).forEach(name => {
                    if (!dependenciesMap[name]) {
                        dependenciesMap[name] = [];
                    }
                    dependenciesMap[name].push(key);
                });
            }
            return obj;
        }, {});

        const arrs = Object.keys(selfDeps);
        const padLength = getPadLength(arrs.concat(micros).map(key => ({ name: key })));
        arrs.forEach(key => {
            const _version = selfDeps[key];
            const textStrs = [ `   * ${chalk.yellow(padEnd(key, padLength))} ${chalk.gray(`[ ${_version} ]`)}` ];
            const _names = dependenciesMap[key] || false;
            if (_names && Array.isArray(_names) && _names.length > 0) {
                _names.forEach(_name => {
                    const _microName = chalk.blue(padEnd(_name, padLength - 2));
                    const _microVersion = microsDeps[_name][key];
                    const _warpperMicroVersion = chalk[semver.neq(_version.replace(/[\^|\~]/g, ''), _microVersion.replace(/[\^|\~]/g, '')) ? 'red' : 'gray'](`[ ${_microVersion} ]`);
                    textStrs.push(`\n${' '.repeat(15) + chalk.gray('|--')} ${_microName} ${_warpperMicroVersion}`);
                });
            }
            api.logger.logo(textStrs.join(' '));
        });
    }
};
