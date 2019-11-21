'use strict';

/* global expect */

const Service = require('../Service');
const PackageGraph = require('./PackageGraph');

describe('PluginAPI', () => {

    it('new constructor', () => {
        const service = new Service();
        const microsPackageGraph = service.microsPackageGraph;
        console.warn(microsPackageGraph);
        console.warn(microsPackageGraph.rawPackageList);

        const filtered = new Set(microsPackageGraph.rawPackageList);
        console.warn(filtered);
    });

});
