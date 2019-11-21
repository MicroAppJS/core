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

        const helpInfo = api.applyPluginHooks('modifyCommandHelp', {
            scriptName: 'micro-app',
            commands: api.service.commands,
        });

        const command = args._[0];
        if (!command) {
            this.logMainHelp(helpInfo);
        } else {
            this.logHelpForCommand(command, helpInfo.commands[command]);
        }
    }

    logMainHelp(helpInfo) {
        const { _, chalk, getPadLength } = require('@micro-app/shared-utils');
        const api = this.api;

        api.logger.logo(`\n  Usage: ${helpInfo.scriptName} <command> [options]\n`);
        api.logger.logo(`  ${chalk.green('Commands')}:`);
        const commands = helpInfo.commands;
        const padLength = getPadLength(commands);
        for (const name in commands) {
            const opts = commands[name].opts || {};
            if (opts.hide !== true) {
                api.logger.logo(`    * ${chalk.yellow(_.padEnd(name, padLength))}${opts.description ? ` ( ${chalk.gray(opts.description)} )` : ''}`);
            }
        }
        api.logger.logo(
            `\n  run ${chalk.blue(
                `${helpInfo.scriptName} help [command]`
            )} for usage of a specific command.\n`
        );
    }

    logHelpForCommand(name, command) {
        const { _, chalk, getPadLength } = require('@micro-app/shared-utils');
        const api = this.api;

        if (!command) {
            api.logger.error(`\n  Command "${name}" does not exist.`);
        } else {
            const opts = command.opts || {};
            if (opts.usage) {
                api.logger.logo(`\n  Usage: ${opts.usage}\n`);
            }
            if (opts.options) {
                api.logger.logo(`  ${chalk.green('Options')}:`);
                const padLength = getPadLength(opts.options);
                for (const name in opts.options) {
                    api.logger.logo(`    * ${chalk.yellow(_.padEnd(name, padLength))} ( ${chalk.gray(opts.options[name])} )`);
                }
            }
            if (opts.details) {
                api.logger.logo('\n' +
                opts.details
                    .split('\n')
                    .map(line => `  ${line}`)
                    .join('\n')
            + '\n');
            }
        }
    }
}

module.exports = HelpCommand;
