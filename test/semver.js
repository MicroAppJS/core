'use strict';

const semver = require('semver');
const logger = require('../src/utils/logger');

function assertVersion(range) {
    const version = require('../package.json').version;
    if (typeof range === 'number') {
        if (!Number.isInteger(range)) {
            logger.throw('Expected string or integer value.');
        }
        range = `^${range}.0.0-0`;
    }
    if (typeof range !== 'string') {
        logger.throw('Expected string or integer value.');
    }

    if (semver.satisfies(version, range)) return;

    logger.throw(`Require @micro-app/core "${range}", but was loaded with "${version}".`);
}

assertVersion('>=0.1.5');
