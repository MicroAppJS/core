'use strict';

const adapters = {};

adapters.common = require('./common');
adapters.koa = require('./koa');
adapters.vusion = require('./vusion');
adapters.webpack = require('./webpack');

module.exports = adapters;
