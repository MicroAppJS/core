'use strict';

const _ = require('lodash');

module.exports = function(object, ...sources) {
    return _.mergeWith(object, ...sources, (objValue, srcValue) => {
        if (_.isArray(objValue)) {
            return _.uniqWith(objValue.concat(srcValue), _.isEqual);
        }
    });
};

module.exports.normal = function(object, ...sources) {
    return _.mergeWith(object, ...sources, (objValue, srcValue) => {
        if (_.isArray(objValue)) {
            return _.uniq(objValue.concat(srcValue));
        }
    });
};
