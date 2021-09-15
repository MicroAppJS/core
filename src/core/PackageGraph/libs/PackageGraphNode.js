'use strict';

const { semver } = require('@micro-app/shared-utils');
const prereleaseIdFromVersion = require('./prereleaseIdFromVersion');

const PKG = Symbol('PackageGraphNode#PKG');

/**
 * Represents a node in a PackageGraph.
 * @constructor
 * @param {Object} manifest - A Package object to build the node from.
 */
class PackageGraphNode {
    constructor(manifest) {
        this[PKG] = manifest;
    }

    get __isMicroAppPackageGraphNode() {
        return true;
    }

    get pkg() {
        return this[PKG];
    }

    get name() {
        return this.pkg.name;
    }

    get location() {
        return this.pkg.location;
    }

    get version() {
        return this.pkg.version;
    }

    get prereleaseId() {
        return prereleaseIdFromVersion(this.version);
    }

    /**
     * Determine if the Node satisfies a resolved semver range.
     *
     * @param {String} version PackageInfo.version
     * @return {Boolean} result
     */
    satisfies(version) {
        return semver.satisfies(this.version, version);
    }

    /**
     * Returns a string representation of this node (its name)
     *
     * @return {String} name
     */
    toString() {
        return this.name;
    }
}

module.exports = PackageGraphNode;
