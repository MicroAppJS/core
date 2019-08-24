'use strict';

const adapters = {};

adapters.CommonAdapter = require('./common');
adapters.KoaAdapter = require('./koa');
adapters.VusionAdapter = require('./vusion');
adapters.WebpackAdapter = require('./webpack');
adapters.VusionCoreAdapter = require('./vusion-core');

module.exports = adapters;
