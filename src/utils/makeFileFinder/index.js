'use strict';

const path = require('path');
const { _, globby, logger } = require('@micro-app/shared-utils');

module.exports = makeFileFinder;

function makeFileFinder(rootPath, packageConfigs = []) {
    if (!Array.isArray(packageConfigs)) {
        packageConfigs = [ packageConfigs ];
    }
    const globOpts = {
        cwd: rootPath,
        absolute: true,
        followSymlinkedDirectories: false,
        // POSIX results always need to be normalized
        transform: fp => path.normalize(fp),
    };

    if (packageConfigs.some(cfg => cfg.indexOf('**') > -1)) {
        if (packageConfigs.some(cfg => cfg.indexOf('node_modules') > -1)) {
            logger.throw(
                'EPKGCONFIG',
                'An explicit node_modules package path does not allow globstars (**)'
            );
        }
        globOpts.ignore = [
            // allow globs like "packages/**",
            // but avoid picking up node_modules/**/package.json
            '**/node_modules/**',
        ];
    }

    return (fileName, fileMapper, customGlobOpts) => {
        const options = Object.assign({}, customGlobOpts, globOpts);
        const results = packageConfigs.sort().map(globPath => {
            let results = globby.sync(path.join(globPath, fileName), options);

            // fast-glob does not respect pattern order, so we re-sort by absolute path
            results = results.sort();

            if (fileMapper && _.isFunction(fileMapper)) {
                results = fileMapper(results);
            }

            return results;
        });

        // always flatten the results
        return flattenResults(results);
    };
}

function flattenResults(results) {
    return results.reduce((acc, result) => acc.concat(result), []);
}
