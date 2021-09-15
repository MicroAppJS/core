'use strict';

const path = require('path');
const { assert, _, npa, parseGitUrl, tryRequire, fs, stringifyObject } = require('@micro-app/shared-utils');
const CONSTANTS = require('../../Constants');

const PKG_INFO = Symbol('PackageInfo#pkgInfo');

class PackageInfo {

    constructor(name, root = process.cwd(), spec = false) {
        assert(name, 'name is required!');

        // ZAP: 可进行参数优化
        const pkgInfo = spec ? npa.resolve(name, spec, root) : npa(name, root);
        if (!pkgInfo.name) {
            const gitInfo = parseGitUrl(name);
            pkgInfo.source = pkgInfo.source || gitInfo.resource || undefined;
            pkgInfo.gitCommittish = pkgInfo.gitCommittish || gitInfo.hash || undefined;
            pkgInfo.setName(gitInfo.name);
            pkgInfo.scope = pkgInfo.scope || gitInfo.organization || undefined;
        }

        this.root = root;
        this[PKG_INFO] = pkgInfo;

        this.recombination();
    }

    get __isMicroAppPackageInfo() {
        return true;
    }

    /**
     * @see https://github.com/npm/npm-package-arg#result-object
     *
     * @return {string} result
     */
    get pkgInfo() {
        return this[PKG_INFO];
    }

    // git, remote, file, directory, tag, version, range
    get type() {
        return this.pkgInfo.type;
    }

    get name() {
        return this.pkgInfo.name;
    }

    set name(name) {
        !_.isEmpty(name) && this.pkgInfo.setName(name);
    }

    get source() {
        return this.pkgInfo.source;
    }

    get location() {
        if (this.pkgInfo.location) {
            return this.pkgInfo.location;
        }
        return this.pkgInfo.raw;
    }

    set location(location) {
        if (!_.isEmpty(location)) {
            this.pkgInfo.location = location;
            this.recombination();
        }
    }

    get escapedName() {
        return this.pkgInfo.escapedName;
    }

    get version() {
        return this.pkgInfo.gitCommittish || this.pkgInfo.gitRange || this.pkgInfo.fetchSpec;
    }

    parseGitUrl() {
        return parseGitUrl(this.location);
    }

    recombination() {
        const rootPath = this.root;
        if (this.pkgInfo.location) { // 存在的重组为本地文件
            const newPkg = npa.resolve(this.name, `file:${path.relative(rootPath, this.pkgInfo.location)}`, rootPath);
            return _.merge(this[PKG_INFO], newPkg);
        } else if (tryRequire.resolve(this.name)) {
            const location = path.resolve(rootPath, CONSTANTS.NODE_MODULES_NAME, this.name);
            if (fs.existsSync(location)) {
                this.location = location;
            }
        }
        return this;
    }

    toJSON() {
        return {
            name: this.name,
            type: this.type,
            version: this.version,
            source: this.source,
            location: this.location,
            escapedName: this.escapedName,
            pkgInfo: this.pkgInfo,
        };
    }

    toString() {
        const config = this.toJSON();
        return stringifyObject(config, {
            indent: '  ',
            singleQuotes: false,
        });
    }
}

function parsePackageInfo(name, root, spec) {
    assert(root, 'root is required!');
    if (!_.isString(name)) return null;
    const pkgInfo = new PackageInfo(name, root, spec);
    return pkgInfo;
}

module.exports = PackageInfo;
module.exports.parsePackageInfo = parsePackageInfo;
