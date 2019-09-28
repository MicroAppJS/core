'use strict';

module.exports = function(api) {

    const { padEnd } = require('lodash');
    const chalk = require('chalk');
    const getPadLength = require('../../utils/getPadLength');
    const aliasMerge = require('../../utils/merge-alias');

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
            plugins: 'list all plugins',
            'plugins --link': 'list all plugins and link',
            micros: 'list all micros',
            'micros --link': 'list all micros and link',
            env: 'list all envs',
        },
        details,
    }, args => {
        const pluginHooks = api.service.pluginHooks;
        const pluginMethods = api.service.pluginMethods;
        const extendMethods = api.service.extendMethods;
        const plugins = api.service.plugins;
        const info = api.self.toJSON(true);
        const env = api.env || {};
        const micros = api.micros;
        const selfConfig = api.selfConfig;
        const microsConfig = api.microsConfig;
        const alias = aliasMerge(selfConfig, {
            type: 'aliasObj',
            micros,
            microsConfig,
            padAlias: true,
        });
        const shared = aliasMerge(selfConfig, {
            type: 'sharedObj',
            micros,
            microsConfig,
            padAlias: true,
        });

        const type = args._[0];
        switch (type) {
            case 'env':
                api.logger.logo(`${chalk.green('Env List')}:`);
                return showAliasList(Object.keys(env).reduce((obj, key) => {
                    obj[key] = {
                        description: env[key],
                    };
                    return obj;
                }, {}));
            case 'process.env':
                api.logger.logo(`${chalk.green('Process Env List')}:`);
                return showAliasList(Object.keys(process.env).reduce((obj, key) => {
                    obj[key] = {
                        description: process.env[key],
                    };
                    return obj;
                }, {}));
            case 'micros':
                api.logger.logo(`${chalk.green('Micros List')}:`);
                return showAliasList(micros.reduce((obj, key) => {
                    obj[key] = {
                        alias: microsConfig[key] && microsConfig[key].aliasName,
                        description: microsConfig[key] && microsConfig[key].description,
                        link: args.link && microsConfig[key] && microsConfig[key].root,
                    };
                    return obj;
                }, {}));
            case 'alias':
                api.logger.logo(`${chalk.green('Alias List')}:`);
                return showAliasList(Object.keys(alias).reduce((obj, key) => {
                    const item = alias[key];
                    obj[key] = { description: item.description, link: args.link && item.link };
                    return obj;
                }, {}));
            case 'shared':
                api.logger.logo(`${chalk.green('Shared List')}:`);
                return showAliasList(Object.keys(shared).reduce((obj, key) => {
                    const item = shared[key];
                    obj[key] = { description: item.description, link: args.link && item.link };
                    return obj;
                }, {}));
            case 'methods':
                api.logger.logo(`${chalk.green('Plugin Methods')}:`);
                showAliasList(pluginMethods);
                return showAliasList(extendMethods);
            case 'plugins':
                api.logger.logo(`${chalk.green('Plugin List')}:`);
                return showAliasList(plugins.reduce((obj, item) => {
                    let key = item.id;
                    let i = 0;
                    while (obj[key]) {
                        i++;
                        key = `${key} (${i})`;
                    }
                    obj[key] = { description: item.description, link: args.link && item.link };
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
            const alias = obj[key] && obj[key].alias || false;
            if (alias && typeof alias === 'string') {
                textStrs.push(`[ ${chalk.blue(alias)} ]`);
            }
            const desc = obj[key] && obj[key].description || false;
            if (desc && typeof desc === 'string') {
                textStrs.push(`( ${chalk.gray(desc)} )`);
            }
            const link = obj[key] && obj[key].link || false;
            if (link && typeof link === 'string') {
                textStrs.push(`\n${' '.repeat(20)}>>> ${chalk.gray(link)}`);
            }
            api.logger.logo(textStrs.join(' '));
        });
    }
};
