'use strict';

const adapters = {};

adapters.commonAdapter = require('./common');
adapters.koaAdapter = require('./koa');
adapters.vusionAdapter = require('./vusion');
adapters.webpackAdapter = require('./webpack');

module.exports = adapters;
