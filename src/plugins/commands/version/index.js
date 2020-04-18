'use strict';

module.exports = function(api) {

    api.registerCommand('version', {
        description: 'show version',
        usage: 'micro-app version',
    }, () => {
        const { _, chalk, getPadLength, fs, tryRequire, logger: { SPACE_CHAR } } = require('@micro-app/shared-utils');
        const os = require('os');
        const path = require('path');

        const pkg = require('../../../../package.json');

        const root = api.root;
        const plugins = api.service.plugins;
        const packages = [ pkg ]
            .concat(api.applyPluginHooks('addCommandVersion', []) || [])
            .concat(plugins.map(plugin => { // 可以通过 插件目录向上自动查询 package.json
                const id = plugin.id;
                let plguinPath = tryRequire.resolve(id);

                let count = 0;
                while (plguinPath) {
                    const dir = path.dirname(plguinPath);
                    plguinPath = path.join(dir, 'package.json');
                    if (fs.existsSync(plguinPath)) {
                        return require(plguinPath);
                    }
                    plguinPath = dir;

                    // 超过 3 次， 开始判断
                    if (count > 3 && plguinPath && !plguinPath.startsWith(root)) {
                        break; // 超出范围则直接放弃
                    }
                    count++;
                }

                return null;
            }).filter(item => !!item));

        const loggerStacks = [];
        loggerStacks.push('');
        loggerStacks.push(`${SPACE_CHAR} ${chalk.green('Version')}:`);
        const _pkgs = _.uniqBy(packages.map(_pkg => {
            const name = _pkg.name;
            const description = _pkg.description;
            const version = _pkg.version;
            return { name, version, description };
        }), 'name');

        const padLength = getPadLength(_pkgs);

        _pkgs.forEach(info => {
            const textStrs = [ `${SPACE_CHAR.repeat(2)} * ${chalk.yellow(_.padEnd(info.name, padLength))}` ];
            const version = info.version || false;
            if (version && typeof version === 'string') {
                textStrs.push(`[ ${chalk.blueBright(version)} ]`);
            }
            const desc = info.description || false;
            if (desc && typeof desc === 'string') {
                textStrs.push(`( ${chalk.gray(desc)} )`);
            }
            loggerStacks.push(textStrs.join(' '));
        });

        if (loggerStacks.length) {
            api.logger.logo(os.EOL, loggerStacks.join(os.EOL), os.EOL);
        }
    });
};

module.exports.registerMethod = require('./registerMethod');
