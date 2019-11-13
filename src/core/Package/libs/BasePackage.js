'use strict';

const path = require('path');
const { fs, _, npa, assert } = require('@micro-app/shared-utils');

const CONSTANTS = require('../../Constants');

const PKG = Symbol('MicroApp#pkg');
const RESOLVE = Symbol('MicroApp#resolved');
const LOCATION = Symbol('MicroApp#location');
const ROOT_PATH = Symbol('MicroApp#rootPath');

class BasePackage {
    constructor(pkg, location, rootPath = location) {
        assert(pkg, 'pkg is required!');
        assert(location, 'location is required!');

        this[PKG] = pkg;

        // npa will throw an error if the name is invalid
        this[RESOLVE] = npa.resolve(pkg.name, `file:${path.relative(rootPath, location)}`, rootPath);

        this[LOCATION] = location;
        this[ROOT_PATH] = rootPath;
    }

    get pkg() {
        return this[PKG];
    }

    get name() {
        return this.pkg.name;
    }

    get private() {
        return Boolean(this.pkg.private);
    }

    get resolved() {
        return this[RESOLVE];
    }

    get bin() {
        if (this.pkg.bin === 'string') {
            return {
                [binSafeName(this.resolved)]: this.pkg.bin,
            };
        }
        return Object.assign({}, this.pkg.bin);
    }

    get scripts() {
        return Object.assign({}, this.pkg.scripts);
    }

    get location() {
        return this[LOCATION];
    }

    get manifestLocation() {
        return path.join(this.location, CONSTANTS.PACKAGE_JSON);
    }

    get nodeModulesLocation() {
        return path.join(this.location, CONSTANTS.NODE_MODULES_NAME);
    }

    get binLocation() {
        return path.join(this.nodeModulesLocation, '.bin');
    }

    /**
     * Provide shallow copy for munging elsewhere
     * @return {Object} json
     */
    toJSON() {
        return _.cloneDeep(this.pkg);
    }

    /**
     * Refresh internal state from disk (e.g., changed by external lifecycles)
     * @return {Promise} resolves when refresh finished
     */
    refresh() {
        return fs.readJSON(this.manifestLocation).then(pkg => {
            this[PKG] = pkg;
            return this;
        });
    }


    /**
     * Write manifest changes to disk
     * @return {Promise} resolves when write finished
     */
    serialize() {
        return fs.writeJSON(this.manifestLocation, this.pkg).then(() => this);
    }

    inspect() {
        return this.toString();
    }

    toString() {
        return _.pick(this, [
            'name',
            'private',
            'bin',
            'scripts',
            'location',
            'manifestLocation',
            'nodeModulesLocation',
            'binLocation',
        ]);
    }
}

module.exports = BasePackage;

function binSafeName({ name, scope }) {
    return scope ? name.substring(scope.length + 1) : name;
}
