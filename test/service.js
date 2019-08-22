'use strict';

const yParser = require('yargs-parser');
const name = process.argv[2];
const argv = yParser(process.argv.slice(3));

const Service = require('../libs/Service');

const server = new Service();
server.run(name, argv);
// console.log(server);
