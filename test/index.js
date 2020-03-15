'use strict';

const { yParser } = require('@micro-app/shared-utils');
const name = process.argv[2];
const argv = yParser(process.argv.slice(3));

const Service = require('../');
const server = new Service();

console.log(argv);
server.run(name, argv);
