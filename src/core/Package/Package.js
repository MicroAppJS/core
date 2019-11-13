'use strict';

const path = require('path');
const { fs } = require('@micro-app/shared-utils');

const BasePackage = require('./libs/BasePackage');
const CONSTANTS = require('../Constants');

const CONTENTS_PATH = Symbol('MicroApp#contents');

class Package extends BasePackage {

    get __isMicroAppPackage() {
        return true;
    }

    // accessors
    get version() {
        return this.pkg.version;
    }

    set version(version) {
        this.pkg.version = version;
    }

    get contents() {
        // if modified with setter, use that value
        if (this[CONTENTS_PATH]) {
            return this[CONTENTS_PATH];
        }

        // if provided by pkg.publishConfig.directory value
        if (this.pkg.publishConfig && this.pkg.publishConfig.directory) {
            return path.join(this.location, this.pkg.publishConfig.directory);
        }

        // default to package root
        return this.location;
    }

    set contents(subDirectory) {
        this[CONTENTS_PATH] = path.join(this.location, subDirectory);
    }

    // "live" collections
    get dependencies() {
        return this.pkg.dependencies;
    }

    get devDependencies() {
        return this.pkg.devDependencies;
    }

    get optionalDependencies() {
        return this.pkg.optionalDependencies;
    }

    get peerDependencies() {
        return this.pkg.peerDependencies;
    }

    /**
   * Map-like retrieval of arbitrary values
   * @param {String} key field name to retrieve value
   * @return {Any} value stored under key, if present
   */
    get(key) {
        return this.pkg[key];
    }

    /**
   * Map-like storage of arbitrary values
   * @param {String} key field name to store value
   * @param {Any} val value to store
   * @return {Package} instance for chaining
   */
    set(key, val) {
        this.pkg[key] = val;
        return this;
    }

    /**
   * Mutate local dependency spec according to type
   * @param {Object} resolved npa metadata
   * @param {String} depVersion semver
   * @param {String} savePrefix npm_config_save_prefix
   */
    updateLocalDependency(resolved, depVersion, savePrefix) {
        const depName = resolved.name;

        // first, try runtime dependencies
        let depCollection = this.dependencies;

        // try optionalDependencies if that didn't work
        if (!depCollection || !depCollection[depName]) {
            depCollection = this.optionalDependencies;
        }

        // fall back to devDependencies
        if (!depCollection || !depCollection[depName]) {
            depCollection = this.devDependencies;
        }

        if (resolved.registry || resolved.type === 'directory') {
            // a version (1.2.3) OR range (^1.2.3) OR directory (file:../foo-pkg)
            depCollection[depName] = `${savePrefix}${depVersion}`;
        } else if (resolved.gitCommittish) {
            // a git url with matching committish (#v1.2.3 or #1.2.3)
            const [ tagPrefix ] = /^\D*/.exec(resolved.gitCommittish);

            // update committish
            const { hosted } = resolved; // take that, lint!
            hosted.committish = `${tagPrefix}${depVersion}`;

            // always serialize the full url (identical to previous resolved.saveSpec)
            depCollection[depName] = hosted.toString({ noGitPlus: false, noCommittish: false });
        } else if (resolved.gitRange) {
            // a git url with matching gitRange (#semver:^1.2.3)
            const { hosted } = resolved; // take that, lint!
            hosted.committish = `semver:${savePrefix}${depVersion}`;

            // always serialize the full url (identical to previous resolved.saveSpec)
            depCollection[depName] = hosted.toString({ noGitPlus: false, noCommittish: false });
        }
    }
}

function lazy(ref, dir = '.') {
    if (typeof ref === 'string') {
        const location = path.resolve(path.basename(ref) === CONSTANTS.PACKAGE_JSON ? path.dirname(ref) : ref);
        const manifest = fs.readJSONSync(path.join(location, CONSTANTS.PACKAGE_JSON));

        return new Package(manifest, location);
    }

    // don't use instanceof because it fails across nested module boundaries
    if ('__isMicroAppPackage' in ref) {
        return ref;
    }

    // assume ref is a json object
    return new Package(ref, dir);
}

module.exports = Package;
module.exports.lazy = lazy;

