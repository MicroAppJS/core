'use strict';

const path = require('path');
const { globby } = require('@micro-app/shared-utils');

const BaseConfig = require('./libs/BaseConfig');
const Package = require('../Package');

class MicroAppConfig extends BaseConfig {

    static get LICENSE_GLOB() {
        return 'LICEN{S,C}E{,.*}';
    }

    get __isMicroAppConfig() {
        return true;
    }

    get manifest() {
        let manifest;

        try {
            const packageJson = this.package;
            // Encapsulate raw JSON in Package instance
            manifest = new Package(packageJson, this.root);

            // redefine getter to lazy-loaded value
            Object.defineProperty(this, 'manifest', {
                value: manifest,
            });
        } catch (err) {
            // try again next time
        }

        return manifest;
    }

    get licensePath() {
        let licensePath;

        try {
            const search = globby.sync(MicroAppConfig.LICENSE_GLOB, {
                cwd: this.root,
                absolute: true,
                case: false,
                // Project license is always a sibling of the root manifest
                deep: false,
                // POSIX results always need to be normalized
                transform: fp => {
                    return path.normalize(fp);
                },
            });

            licensePath = search.shift();

            if (licensePath) {
            // redefine getter to lazy-loaded value
                Object.defineProperty(this, 'licensePath', {
                    value: licensePath,
                });
            }
        } catch (err) {
            throw err;
        }

        return licensePath;
    }
}

module.exports = MicroAppConfig;
