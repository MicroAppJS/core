'use strict';

module.exports = function cleanCommand(api) {

    const { _, chalk, fs, prompt, logger: { SPACE_CHAR } } = require('@micro-app/shared-utils');

    const details = `
Examples:
    ${chalk.gray('# clean temp dir')}
    micro-app clean temp
    `.trim();

    const cmdOpt = {
        description: 'clean some dir.',
        usage: 'micro-app clean [options]',
        options: {
            '-': 'default clean.',
            '--force': 'force clean.',
        },
        details,
    };

    api.registerCommand('clean', cmdOpt, args => {

        const logger = api.logger;

        let chain = Promise.resolve();

        // add
        chain = chain.then(() => {
            logger.info('[clean]', 'Starting clean...');
        });

        // others
        chain = chain.then(() => {
            const cleanList = api.applyPluginHooks('addCommandClean', [ api.tempDir ]) || [];
            return _.uniq(cleanList);
        });

        // show
        chain = chain.then(cleanList => {
            logger.logo(`\n\n${chalk.blue('Clean List')}: \n${cleanList.map(item => SPACE_CHAR + '* ' + chalk.yellow.underline(item)).join('\n')}\n`);
            return cleanList;
        });

        // angin hint
        chain = chain.then(cleanList => {
            if (!args.force) {
                return prompt.confirm('Are you sure?').then(answer => {
                    if (answer) {
                        return Promise.resolve(cleanList);
                    }
                    return Promise.reject('Cancel !!!');
                });
            }
            return Promise.resolve(cleanList);
        });

        // create config
        chain = chain.then(cleanList => {
            if (cleanList && Array.isArray(cleanList)) {
                cleanList.forEach(p => {
                    if (fs.existsSync(p)) {
                        const stat = fs.statSync(p);
                        if (stat.isDirectory()) {
                            logger.debug('[clean]', 'Directory: ', p);
                            fs.removeSync(p);
                        } else if (stat.isFile()) {
                            logger.debug('[clean]', 'File: ', p);
                            fs.unlinkSync(p);
                        }
                    }
                });
            }
            logger.success('[clean]', 'Clean Successful!');
        });

        chain = chain.then(() => {
            return api.applyPluginHooks('afterCommandClean', { args });
        });

        return chain.catch(err => {
            const msg = err && err.message || err;
            logger.error('[clean]', msg);
        });
    });
};

module.exports.registerMethod = require('./registerMethod');
