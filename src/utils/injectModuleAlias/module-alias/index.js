'use strict';

const BuiltinModule = require('module');

// Guard against poorly mocked module constructors
const Module = module.constructor.length > 1
    ? module.constructor
    : BuiltinModule;

const nodePath = require('path');

let modulePaths = [];
let moduleAliases = {};
let moduleAliasNames = [];

const oldNodeModulePaths = Module._nodeModulePaths;
Module._nodeModulePaths = function(from) {
    let paths = oldNodeModulePaths.call(this, from);

    // Only include the module path for top-level modules
    // that were not installed:
    if (from.indexOf('node_modules') === -1) {
        paths = [ ...new Set(modulePaths.concat(paths)) ];
    }

    return paths;
};

const oldResolveFilename = Module._resolveFilename;
Module._resolveFilename = function(request, parentModule, isMain, options) {
    for (let i = moduleAliasNames.length; i-- > 0;) {
        const alias = moduleAliasNames[i];
        if (isPathMatchesAlias(request, alias)) {
            let aliasTarget = moduleAliases[alias];
            // Custom function handler
            if (typeof moduleAliases[alias] === 'function') {
                const fromPath = parentModule.filename;
                aliasTarget = moduleAliases[alias](fromPath, request, alias);
                if (!aliasTarget || typeof aliasTarget !== 'string') {
                    throw new Error('[module-alias] Expecting custom handler function to return path.');
                }
            }
            request = nodePath.join(aliasTarget, request.substr(alias.length));
            // Only use the first match
            break;
        }
    }

    return oldResolveFilename.call(this, request, parentModule, isMain, options);
};

function isPathMatchesAlias(path, alias) {
    // Matching /^alias(\/|$)/
    if (path.indexOf(alias) === 0) {
        if (path.length === alias.length) return true;
        if (path[alias.length] === '/') return true;
    }

    return false;
}

function addPathHelper(path, targetArray) {
    path = nodePath.normalize(path);
    if (targetArray && targetArray.indexOf(path) === -1) {
        targetArray.push(path);
    }
}

function removePathHelper(path, targetArray) {
    if (targetArray) {
        const index = targetArray.indexOf(path);
        if (index !== -1) {
            targetArray.splice(index, 1);
        }
    }
}

function addPath(path) {
    let parent;
    path = nodePath.normalize(path);

    if (modulePaths.indexOf(path) === -1) {
        modulePaths.push(path);
        // Enable the search path for the current top-level module
        require.main && addPathHelper(path, require.main.paths);
        parent = module.parent;

        // Also modify the paths of the module that was used to load the
        // app-module-paths module and all of it's parents
        while (parent && parent !== require.main) {
            addPathHelper(path, parent.paths);
            parent = parent.parent;
        }
    }
}

function addAliases(aliases) {
    for (const alias in aliases) {
        addAlias(alias, aliases[alias]);
    }
}

function addAlias(alias, target) {
    moduleAliases[alias] = target;
    // Cost of sorting is lower here than during resolution
    moduleAliasNames = Object.keys(moduleAliases);
    moduleAliasNames.sort();
}

/**
 * Reset any changes maded (resets all registered aliases
 * and custom module directories)
 * The function is undocumented and for testing purposes only
 */
function reset() {
    // Reset all changes in paths caused by addPath function
    modulePaths.forEach(function(path) {
        require.main && removePathHelper(path, require.main.paths);

        // Delete from require.cache if the module has been required before.
        // This is required for node >= 11
        Object.getOwnPropertyNames(require.cache).forEach(function(name) {
            if (name.indexOf(path) !== -1) {
                delete require.cache[name];
            }
        });

        let parent = module.parent;
        while (parent && parent !== require.main) {
            removePathHelper(path, parent.paths);
            parent = parent.parent;
        }
    });

    modulePaths = [];
    moduleAliases = {};
}

/**
 * Import aliases from package.json
 * @param {object} options options
 */
function init(options) {
    if (typeof options === 'string') {
        options = { base: options };
    }

    options = options || {};

    let candidatePackagePaths;
    if (options.base) {
        candidatePackagePaths = [ nodePath.resolve(options.base.replace(/\/package\.json$/, '')) ];
    } else {
    // There is probably 99% chance that the project root directory in located
    // above the node_modules directory,
    // Or that package.json is in the node process' current working directory (when
    // running a package manager script, e.g. `yarn start` / `npm run start`)
        candidatePackagePaths = [ nodePath.join(__dirname, '../..'), process.cwd() ];
    }

    let npmPackage;
    let base;
    for (const i in candidatePackagePaths) {
        try {
            base = candidatePackagePaths[i];

            npmPackage = require(nodePath.join(base, 'package.json'));
            break;
        } catch (e) {
            // noop
        }
    }

    if (typeof npmPackage !== 'object') {
        const pathString = candidatePackagePaths.join(',\n');
        throw new Error('Unable to find package.json in any of:\n[' + pathString + ']');
    }

    //
    // Import aliases
    //

    const aliases = npmPackage._moduleAliases || {};

    for (const alias in aliases) {
        if (aliases[alias][0] !== '/') {
            aliases[alias] = nodePath.join(base, aliases[alias]);
        }
    }

    addAliases(aliases);

    //
    // Register custom module directories (like node_modules)
    //

    if (npmPackage._moduleDirectories instanceof Array) {
        npmPackage._moduleDirectories.forEach(function(dir) {
            if (dir === 'node_modules') return;

            const modulePath = nodePath.join(base, dir);
            addPath(modulePath);
        });
    }
}

module.exports = init;
module.exports.addPath = addPath;
module.exports.addAlias = addAlias;
module.exports.addAliases = addAliases;
module.exports.isPathMatchesAlias = isPathMatchesAlias;
module.exports.reset = reset;

// test
[ '_modulePaths', '_moduleAliases', '_moduleAliasNames' ].forEach((key, index) => {
    Object.defineProperty(module.exports, key, {
        get() {
            return [ modulePaths, moduleAliases, moduleAliasNames ][index];
        },
    });
});
