'use strict';

/* global expect */

const Service = require('../Service');

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
