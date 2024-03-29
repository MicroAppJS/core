'use strict';

module.exports = function initCommand(api, opts) {

    const { _, chalk, fs, prompt, smartMerge, path } = require('@micro-app/shared-utils');
    const logger = api.logger;

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
            '--name <name>': 'only init <name>.',
        },
        details,
    };

    // default config
    api.otherCommandInit(async ({ args }) => {
        if (args.name) {
            logger.info('[Init]', `initialize ${chalk.yellow(args.name)} config`);
            return {}; // default, name is empty!!!
        }
        // must be return info
        return defaultInit(args);
    });

    // start
    api.registerCommand('init', cmdOpt, args => {
        let chain = Promise.resolve();

        chain = chain.then(() => {
            logger.info('[Init]', 'Starting init...');
            return api.applyPluginHooks('beforeCommandInit', { args });
        });

        chain = chain.then(() => checkInitConfig(args));

        // must be return info
        chain = chain.then(() => api.applyPluginHooksAsync('otherCommandInit', { args }));

        // create config
        chain = chain.then(finalInfo => saveInitConfig(args, finalInfo || {}));

        chain = chain.then(info => {
            return api.applyPluginHooks('afterCommandInit', { args, info });
        });

        return chain.catch(err => {
            const msg = err && err.message || err;
            logger.error('[Init]', msg);
        });

    });

    function checkInitConfig(args) {
        const configDir = api.configDir;

        const filename = (args.name || 'index');
        const configJsFilepath = path.resolve(configDir, `${filename}.js`);
        const configJsonFilepath = path.resolve(configDir, `${filename}.json`);

        let chain = Promise.resolve();

        chain = chain.then(() => {
            if (!args.force) {
                if (fs.pathExistsSync(configJsFilepath)) {
                    logger.warn('[Init]', `check path: ${chalk.gray.underline(configJsFilepath)}`);
                    return Promise.reject('config already exsits! please use "--force"');
                } else if (fs.pathExistsSync(configJsonFilepath)) {
                    logger.warn('[Init]', `check path: ${chalk.gray.underline(configJsonFilepath)}`);
                    return Promise.reject('config already exsits! please use "--force"');
                }
            }
        });

        return chain;
    }

    function saveInitConfig(args, info) {
        const configDir = api.configDir;

        let chain = Promise.resolve(info);

        // show
        chain = chain.then(finalInfo => {
            const configJson = JSON.stringify(finalInfo, false, 4);
            logger.logo(`\n${chalk.grey('Config')}: ${chalk.green(configJson)}`);
            return finalInfo;
        });

        // confirm
        chain = chain.then(finalInfo => {
            return prompt.confirm('Are you ok?').then(answer => {
                if (answer) {
                    return Promise.resolve(finalInfo);
                }
                return Promise.reject('Cancel !!!');
            });
        });

        const filename = (args.name || 'index');
        const configJsFilepath = path.resolve(configDir, `${filename}.js`);
        const configJsonFilepath = path.resolve(configDir, `${filename}.json`);

        // create config
        chain = chain.then(finalInfo => {
            fs.ensureDirSync(configDir);
            // delete old file
            fs.removeSync(configJsFilepath);
            fs.removeSync(configJsonFilepath);
            // writer new file
            // 优先输出 js
            const jsFileContent = `'use strict';

// example ${filename}.config
module.exports = {
${Object.entries(finalInfo).map(([ key, vlaue ]) => {
        let k = '';
        if (typeof key === 'string' && /^[A-Za-z_$]\w*$/g.test(key)) {
            k = key;
        } else {
            k = JSON.stringify(key);
        }
        return `    ${k}: ${JSON.stringify(vlaue)}`;
    }).join(',\n')}
};
`;
            // fs.writeJSONSync(configJsonFilepath, finalInfo, { encoding: 'utf8', spaces: 4 });
            // logger.success('[Init]', `Fnished, Path: ${chalk.gray.underline(configJsonFilepath)}`);
            fs.writeFileSync(configJsFilepath, jsFileContent, { encoding: 'utf8' });
            logger.success('[Init]', `Fnished, Path: ${chalk.gray.underline(configJsFilepath)}`);
            return finalInfo;
        });

        return chain;
    }

    function defaultInit(args) {
        const pkg = api.pkg;

        const info = {};

        let chain = Promise.resolve();

        // name
        chain = chain.then(() => {
            logger.info('[Init]', 'Please enter config:');
            const defaultName = pkg.name || '';
            return prompt.input(`Enter Name (${defaultName}):`).then(answer => {
                const name = answer.trim();
                info.name = name || defaultName;
            });
        });

        // description
        chain = chain.then(() => {
            const defaultDescription = pkg.description || '';
            return prompt.input(`Enter Description (${defaultDescription}):`).then(answer => {
                const description = answer.trim();
                info.description = description || defaultDescription;
            });
        });

        // version
        chain = chain.then(() => {
            const defaultVersion = pkg.version || '0.0.1';
            return prompt.input(`Enter Version (${defaultVersion}):`).then(answer => {
                const version = answer.trim();
                info.version = version || defaultVersion;
            });
        });

        // type (不让用户输入，可忽略)
        // chain = chain.then(() => {
        //     return prompt.input('Enter Type:').then(answer => {
        //         const type = answer.trim();
        //         info.type = type;
        //     });
        // });

        // others
        chain = chain.then(() => {
            const copyInfo = _.cloneDeep(info);
            const otherInfos = api.applyPluginHooks('addCommandInit', [], copyInfo) || [];
            const otherInfo = otherInfos.reduce((c, item) => {
                return c.then(obj => {
                    if (item && _.isPlainObject(item)) {
                        return smartMerge(obj, item || {});
                    } else if (item && _.isFunction(item)) {
                        const r = item();
                        if (r && _.isFunction(r.then)) {
                            return r.then(o => {
                                return smartMerge(obj, o || {});
                            });
                        }
                        return smartMerge(obj, r || {});
                    }
                    return obj;
                });
            }, Promise.resolve({}));
            return otherInfo.then(oinfos => {
                return smartMerge({}, copyInfo, oinfos, info);
            });
        });

        return chain;
    }
};

module.exports.registerMethod = require('./methods');

module.exports.configuration = {
    description: '初始化命令行',
};
