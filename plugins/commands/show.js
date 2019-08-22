'use strict';

const { padEnd } = require('lodash');
const chalk = require('chalk');
const getPadLength = require('../../utils/getPadLength');
const aliasMerge = require('../../utils/merge-alias');

module.exports = function(api) {
    const details = `
Examples:
  ${chalk.gray('# info')}
  micro-app show
  ${chalk.gray('# alias')}
  micro-app show alias
  `.trim();
    api.registerCommand('show', {
        description: 'show alias & shared list, etc.',
        usage: 'micro-app show [options]',
        options: {
            alias: 'list all alias names',
            shared: 'list all shared names',
            info: 'inspect config',
            methods: 'list all plugin methods',
            hooks: 'list all plugin hooks',
        },
        details,
    }, args => {
        const pluginHooks = api.service.pluginHooks;
        const pluginMethods = api.service.pluginMethods;
        const plugins = api.service.plugins;
        const info = api.self.toJSON(true);
        const micros = api.micros;
        const alias = aliasMerge(api.selfConfig, {
            type: 'alias',
            micros,
            microsConfig: api.microsConfig,
            padAlias: true,
        });
        const shared = aliasMerge(api.selfConfig, {
            type: 'shared',
            micros,
            microsConfig: api.microsConfig,
            padAlias: true,
        });

        const type = args._[0];
        switch (type) {
            case 'alias':
                api.logger.logo(`${chalk.green('Alias List')}:`);
                return showAliasList(alias);
            case 'shared':
                api.logger.logo(`${chalk.green('Shared List')}:`);
                return showAliasList(shared);
            case 'methods':
                api.logger.logo(`${chalk.green('Plugin Methods')}:`);
                return showAliasList(pluginMethods);
            case 'plugins':
                api.logger.logo(`${chalk.green('Plugin List')}:`);
                return showAliasList(plugins.reduce((obj, item) => {
                    obj[item.id] = { description: item.description, link: item.link };
                    return obj;
                }, {}));
            case 'hooks':
                api.logger.logo(`${chalk.green('Plugin hooks')}:`);
                return showAliasList(Object.keys(pluginHooks).reduce((obj, key) => {
                    obj[key] = { description: `${JSON.stringify(pluginHooks[key].length)}` };
                    return obj;
                }, {}));
            case 'info':
            default:
                api.logger.logo(`${chalk.green('Show Details')}:`);
                return showAliasList(Object.keys(info).reduce((obj, key) => {
                    obj[key] = { description: JSON.stringify(info[key]) };
                    return obj;
                }, {}));
        }
    });

    function showAliasList(obj) {
        const arrs = Object.keys(obj);
        const padLength = getPadLength(arrs.map(key => ({ name: key })));
        arrs.forEach(key => {
            const textStrs = [ `   * ${chalk.yellow(padEnd(key, padLength))}` ];
            const desc = obj[key] && obj[key].description || false;
            if (desc && typeof desc === 'string') {
                textStrs.push(`( ${chalk.gray(desc)} )`);
            }
            const link = obj[key] && obj[key].link || false;
            if (link && typeof link === 'string') {
                textStrs.push(`--> ${chalk.gray(link)}`);
            }
            api.logger.logo(textStrs.join(' '));
        });
    }
};
