'use strict';

const { Command } = require('../../../');

class HelpCommand extends Command {

    initialize(api) {
        api.registerCommand('help', {
            hide: true,
        }, this.execute.bind(this));
    }

    execute(args) {
        const api = this.api;
        const commands = api.service.commands;

        const helpInfo = api.applyPluginHooks('modifyCommandHelp', {
            scriptName: 'micro-app',
            commands,
        });

        const command = args._[0];
        if (!command) {
            this.logMainHelp(helpInfo);
        } else {
            this.logHelpForCommand(command, helpInfo.commands[command]);
        }
    }

    logMainHelp(helpInfo) {
        const os = require('os');
        const { _, chalk, getPadLength, logger: { SPACE_CHAR } } = require('@micro-app/shared-utils');
        const api = this.api;
        const loggerStacks = [];

        loggerStacks.push(`${SPACE_CHAR} Usage: ${helpInfo.scriptName} <command> [options]`);
        loggerStacks.push('');
        loggerStacks.push(`${SPACE_CHAR} ${chalk.green('Commands')}:`);
        const commands = helpInfo.commands;
        const padLength = getPadLength(commands);
        for (const name in commands) {
            const opts = commands[name].opts || {};
            if (opts.hide !== true) {
                loggerStacks.push(`${SPACE_CHAR}${SPACE_CHAR} * ${chalk.yellow(_.padEnd(name, padLength))}${opts.description ? ` ( ${chalk.gray(opts.description)} )` : ''}`);
            }
        }
        loggerStacks.push('');
        loggerStacks.push(
            `${SPACE_CHAR} run ${chalk.blue(
                `${helpInfo.scriptName} help [command]`
            )} for usage of a specific command.`
        );

        if (loggerStacks.length) {
            api.logger.logo(os.EOL, os.EOL, loggerStacks.join(os.EOL), os.EOL);
        }
    }

    logHelpForCommand(name, command) {
        const os = require('os');
        const { _, chalk, getPadLength, logger: { SPACE_CHAR } } = require('@micro-app/shared-utils');
        const api = this.api;

        if (!command) {
            api.logger.error(`Command "${name}" does not exist.`);
        } else {
            const loggerStacks = [];
            const opts = command.opts || {};
            if (opts.usage) {
                loggerStacks.push('');
                loggerStacks.push(`${SPACE_CHAR} Usage: ${opts.usage}`);
            }
            if (opts.options) {
                loggerStacks.push('');
                loggerStacks.push(`${SPACE_CHAR} ${chalk.green('Options')}:`);
                const padLength = getPadLength(opts.options);
                for (const name in opts.options) {
                    loggerStacks.push(`${SPACE_CHAR}${SPACE_CHAR} * ${chalk.yellow(_.padEnd(name, padLength))} ( ${chalk.gray(opts.options[name])} )`);
                }
            }
            if (opts.details) {
                loggerStacks.push('');
                loggerStacks.push(...opts.details
                    .split(os.EOL)
                    .map(line => `${SPACE_CHAR} ${line}`));
            }

            if (loggerStacks.length) {
                api.logger.logo(os.EOL, loggerStacks.join(os.EOL), os.EOL);
            }
        }
    }
}

module.exports = HelpCommand;
