'use strict';

const { logger } = require('@micro-app/shared-utils');

module.exports = reportCycles;

function reportCycles(paths, rejectCycles) {
    if (!paths.length) {
        return;
    }

    const cycleMessage = [ 'Dependency cycles detected, you should fix these!' ].concat(paths).join('\n');

    if (rejectCycles) {
        logger.throw('ECYCLE', cycleMessage);
    }

    logger.warn('ECYCLE', cycleMessage);
}
