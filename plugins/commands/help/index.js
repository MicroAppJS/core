'use strict';

module.exports = function(api) {

    const _ = require('lodash');
    const chalk = require('chalk');
    const { getPadLength } = require('@micro-app/shared-utils');

    api.registerCommand('help', {
        hide: true,
    }, args => {
        const helpInfo = api.applyPluginHooks('modifyCommandHelp', {
            scriptName: 'micro-app',
            commands: api.service.commands,
        });

        const command = args._[0];
        if (!command) {
            logMainHelp(helpInfo);
        } else {
            logHelpForCommand(command, helpInfo.commands[command]);
        }
    });

    function logMainHelp(helpInfo) {
        api.logger.logo(`\n\n  Usage: ${helpInfo.scriptName} <command> [options]\n`);
        api.logger.logo();
        api.logger.logo(`${chalk.green('Commands')}:`);
        const commands = helpInfo.commands;
        const padLength = getPadLength(commands);
        for (const name in commands) {
            const opts = commands[name].opts || {};
            if (opts.hide !== true) {
                api.logger.logo(`    * ${chalk.yellow(_.padEnd(name, padLength))}${opts.description ? ` ( ${chalk.gray(opts.description)} )` : ''}`);
            }
        }
        api.logger.logo(
            `\n\n  run ${chalk.blue(
                `${helpInfo.scriptName} help [command]`
            )} for usage of a specific command.\n`
        );
    }

    function logHelpForCommand(name, command) {
        if (!command) {
            api.logger.error(`\n  Command "${name}" does not exist.`);
        } else {
            const opts = command.opts || {};
            if (opts.usage) {
                api.logger.logo(`\n\n  Usage: ${opts.usage}\n`);
            }
            if (opts.options) {
                api.logger.logo();
                api.logger.logo(`${chalk.green('Options')}:`);
                const padLength = getPadLength(opts.options);
                for (const name in opts.options) {
                    api.logger.logo(`    * ${chalk.yellow(_.padEnd(name, padLength))} ( ${chalk.gray(opts.options[name])} )`);
                }
            }
            if (opts.details) {
                api.logger.logo('\n\n' +
                    opts.details
                        .split('\n')
                        .map(line => `  ${line}`)
                        .join('\n')
                + '\n');
            }
            api.logger.logo();
        }
    }
};
