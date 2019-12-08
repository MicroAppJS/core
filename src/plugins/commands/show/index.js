'use strict';

module.exports = function showCommand(api) {

    const { _, chalk, getPadLength, logger: { SPACE_CHAR } } = require('@micro-app/shared-utils');
    const os = require('os');

    const details = `
Examples:
    ${chalk.gray('# info')}
    micro-app show info
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
            configs: 'list all configs',
        },
        details,
    }, args => {
        const aliasMerge = require('../../../utils/merge-alias');

        const pluginHooks = api.service.pluginHooks;
        const pluginMethods = api.service.pluginMethods;
        const extendMethods = api.service.extendMethods;
        const sharedProps = api.service.sharedProps;
        const extendConfigs = api.service.extendConfigs;
        const plugins = api.service.plugins;
        const info = api.self.toJSON();
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
                return showAliasList('Env List', Object.keys(env).reduce((obj, key) => {
                    obj[key] = {
                        description: env[key],
                    };
                    return obj;
                }, {}));
            case 'process.env':
                return showAliasList('Process Env List', Object.keys(process.env).reduce((obj, key) => {
                    obj[key] = {
                        description: process.env[key],
                    };
                    return obj;
                }, {}));
            case 'micros':
                return showAliasList('Micros List', micros.reduce((obj, key) => {
                    obj[key] = {
                        alias: microsConfig[key] && microsConfig[key].aliasName,
                        description: microsConfig[key] && microsConfig[key].description,
                        link: args.link && microsConfig[key] && microsConfig[key].root,
                    };
                    return obj;
                }, {}));
            case 'alias':
                return showAliasList('Alias List', Object.keys(alias).reduce((obj, key) => {
                    const item = alias[key];
                    obj[key] = { description: item.description, link: args.link && item.link };
                    return obj;
                }, {}));
            case 'shared':
                return showAliasList('Shared List', Object.keys(shared).reduce((obj, key) => {
                    const item = shared[key];
                    obj[key] = { description: item.description, link: args.link && item.link };
                    return obj;
                }, {}));
            case 'methods':
                showAliasList('Plugin Methods', pluginMethods);
                return showAliasList(extendMethods);
            case 'configs':
                showAliasList('Plugin Configs', sharedProps);
                return showAliasList(extendConfigs);
            case 'plugins':
                return showAliasList('Plugin List', plugins.reduce((obj, item) => {
                    const key = item.id;
                    const alias = item.alias;
                    let i = 0;
                    let _key = key;
                    if (alias) {
                        _key = `${key} (${alias})`;
                    }
                    while (obj[_key]) {
                        i++;
                        _key = `${key} (${i})`;
                    }
                    obj[_key] = { description: item.description, link: args.link && item.link };
                    return obj;
                }, {}));
            case 'hooks':
                return showAliasList('Plugin hooks', Object.keys(pluginHooks).reduce((obj, key) => {
                    obj[key] = { description: `${JSON.stringify(pluginHooks[key].length)}` };
                    return obj;
                }, {}));
            case 'info':
                return showAliasList('Show Details', Object.keys(info).reduce((obj, key) => {
                    obj[key] = { description: JSON.stringify(info[key]) };
                    return obj;
                }, {}));
            default:
                // const envinfo = require('envinfo');
                // TODO 这里应该支持扩展.
                api.logger.error(`Not Support options: "${type}" !`);
                return api.runCommand('help', { _: [ 'show' ] });
        }
    });

    function showAliasList(title, obj) {
        const loggerStacks = [];

        if (_.isString(title)) {
            loggerStacks.push('');
            loggerStacks.push(`${SPACE_CHAR} ${chalk.green(title)}:`);
        } else if (!_.isPlainObject(obj)) {
            obj = title;
            title = undefined;
        }

        const arrs = Object.keys(obj);
        const padLength = getPadLength(arrs.map(key => ({ name: key })));

        arrs.forEach(key => {
            const textStrs = [];
            textStrs.push(`${SPACE_CHAR.repeat(2)} * ${chalk.yellow(_.padEnd(key, padLength))}`);
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
                textStrs.push(os.EOL);
                textStrs.push(`${SPACE_CHAR.repeat(3)} >>> ${chalk.gray(link)}`);
            }
            loggerStacks.push(textStrs.join(''));
        });

        if (loggerStacks.length) {
            api.logger.logo(os.EOL, loggerStacks.join(os.EOL), os.EOL);
        }
    }
};
