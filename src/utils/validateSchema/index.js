'use strict';

const { getPadLength, _, validateSchema, logger, assert } = require('@micro-app/shared-utils');

/**
 * valiate config
 * @param {Object} schema schema
 * @param {Object} config config
 * @return {boolean} valid
 */
module.exports = function(schema, config) {
    assert(schema, 'schema must be required.');
    const result = validateSchema(schema, config);
    const padLength = getPadLength(result.map(item => {
        return { name: item.keyword };
    }));
    if (!result.length) return true;

    result.forEach(item => {
        logger.warn('[validate]', `${_.padEnd(item.keyword, padLength)} [ ${item.dataPath} ${item.message} ]`);
    });
    logger.throw('[validate]', 'illegal configuration !!!');
    return false;
};
