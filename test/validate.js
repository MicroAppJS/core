'use strict';

const _ = require('lodash');
const validate = require('../libs/Config/schema');
const getPadLength = require('../src/utils/getPadLength');

const result = validate(require('../libs/Config/schema/configSchema'), require('../config/default'));
const padLength = getPadLength(result.map(item => {
    return { name: item.keyword };
}));

result.forEach(item => {
    console.error(`[${_.padStart(item.keyword, padLength)}] ${item.dataPath} ${item.message}`);
});
