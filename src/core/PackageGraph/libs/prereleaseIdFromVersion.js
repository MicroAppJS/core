'use strict';

const { semver } = require('@micro-app/shared-utils');

module.exports = prereleaseIdFromVersion;

function prereleaseIdFromVersion(version) {
    return (semver.prerelease(version) || []).shift();
}
