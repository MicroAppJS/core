'use strict';

module.exports = function initCommand(api, opts) {

    const registerMethods = require('./methods');
    registerMethods(api);

    const { _, chalk, fs, prompt, smartMerge, path } = require('@micro-app/shared-utils');

    const details = `
Examples:
    ${chalk.gray('# init')}
    micro-app init
            `.trim();

    const cmdOpt = {
        description: 'init micro app project.',
        usage: 'micro-app init [options]',
        options: {
            '-': 'init default.',
            '--force': 'force create.',
            // '-n <name>': 'only init <name>.',
        },
        details,
    };

    // start
    api.registerCommand('init', cmdOpt, args => {

        const logger = api.logger;
        const configDir = api.configDir;
        const configFilepath = path.resolve(configDir, 'index.js');
        const info = {};

        let chain = Promise.resolve();

        chain = chain.then(() => {
            logger.info('[Init]', 'Starting init...');
            if (!args.force) {
                if (fs.pathExistsSync(configFilepath)) {
                    logger.warn('[Init]', `check path: ${chalk.gray.underline(configFilepath)}`);
                    return Promise.reject('config already exsits! please use "--force"');
                }
            }
        });

        chain = chain.then(() => {
            logger.info('[Init]', 'Please enter config:');
            return api.applyPluginHooks('beforeCommandInit', { args });
        });

        // name
        chain = chain.then(() => {
            return prompt.input('Enter Name (demo):').then(answer => {
                const name = answer.trim();
                info.name = name || 'demo';
            });
        });

        // description
        chain = chain.then(() => {
            return prompt.input('Enter Description:').then(answer => {
                const description = answer.trim();
                info.description = description;
            });
        });

        // version
        chain = chain.then(() => {
            const pkg = api.pkg;
            const defaultVersion = pkg.version || '0.0.1';
            return prompt.input(`Enter Version (${defaultVersion}):`).then(answer => {
                const version = answer.trim();
                info.version = version || defaultVersion;
            });
        });

        // type
        chain = chain.then(() => {
            return prompt.input('Enter Type:').then(answer => {
                const type = answer.trim();
                info.type = type;
            });
        });

        // others
        chain = chain.then(() => {
            const copyInfo = _.cloneDeep(info);
            const otherInfos = api.applyPluginHooks('addCommandInit', [], copyInfo) || [];
            const otherInfo = otherInfos.reduce((obj, item) => {
                if (item && _.isPlainObject(item)) {
                    return smartMerge(obj, item || {});
                }
                return obj;
            }, {});
            return smartMerge({}, copyInfo, otherInfo, info);
        });

        // show
        chain = chain.then(finalInfo => {
            const configJson = JSON.stringify(finalInfo, false, 4);
            logger.logo(`\n${chalk.grey('Config')}: ${chalk.green(configJson)}`);
            return configJson;
        });

        // confirm
        chain = chain.then(configJson => {
            return prompt.confirm('Are you ok?').then(answer => {
                if (answer) {
                    return Promise.resolve(configJson);
                }
                return Promise.reject('Cancel !!!');
            });
        });

        // create config
        chain = chain.then(configJson => {
            fs.ensureDirSync(configDir);
            fs.writeFileSync(configFilepath, `
'use strict';

module.exports = ${configJson};`);
            logger.success('[Init]', `Fnished, Path: ${chalk.gray.underline(configFilepath)}`);
        });

        chain = chain.then(() => {
            return api.applyPluginHooks('afterCommandInit', { args });
        });

        return chain.catch(err => {
            const msg = err && err.message || err;
            logger.error('[Init]', msg);
        });

    });
};

module.exports.configuration = {
    description: '初始化命令行',
};
