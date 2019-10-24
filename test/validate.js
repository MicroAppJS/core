'use strict';

const _ = require('lodash');
const validate = require('../libs/Config/schema');
const { getPadLength } = require('@micro-app/shared-utils');

const result = validate(require('../libs/Config/schema/configSchema'), require('../libs/Constants/default'));
const padLength = getPadLength(result.map(item => {
    return { name: item.keyword };
}));

result.forEach(item => {
    console.error(`[${_.padStart(item.keyword, padLength)}] ${item.dataPath} ${item.message}`);
});
