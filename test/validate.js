'use strict';

const _ = require('lodash');
const validate = require('../libs/schema');
const getPadLength = require('../utils/getPadLength');

const result = validate(require('../libs/schema/microAppConfigSchema.json'), require('../config/default'));
const padLength = getPadLength(result.map(item => {
    return { name: item.keyword };
}));

result.forEach(item => {
    console.error(`[${_.padStart(item.keyword, padLength)}] ${item.dataPath} ${item.message}`);
});
