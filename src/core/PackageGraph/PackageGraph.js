'use strict';

const { logger } = require('@micro-app/shared-utils');
const PackageGraphNode = require('./libs/PackageGraphNode');

// TODO 此块需要大范围修改。（支持别名 @micro-app，可提取依赖）

/**
 * A PackageGraph.
 * @constructor
 * @param {!Array.<Package>} packages An array of Packages to build the graph out of.
 */
class PackageGraph extends Map {
    constructor(packages) {
        super(packages.map(pkg => [ pkg.name, new PackageGraphNode(pkg) ]));

        if (packages.length !== this.size) {
            // weed out the duplicates
            const seen = new Map();

            for (const { name, location } of packages) {
                if (seen.has(name)) {
                    seen.get(name).push(location);
                } else {
                    seen.set(name, [ location ]);
                }
            }

            // 判断多个依赖冲突
            for (const [ name, locations ] of seen) {
                if (locations.length > 1) {
                    logger.throw(
                        '[core]',
                        'PackageGraph',
                        [ `Package name "${name}" used in multiple packages:`, ...locations ].join('\n\t')
                    );
                }
            }
        }
    }

    get __isMicroAppPackageGraph() {
        return true;
    }

    get rawPackageList() {
        return Array.from(this.values()).map(node => node.pkg);
    }

    filters(nameList = []) {
        // the current list of packages
        const result = new Set(nameList.map(name => this.get(name)).filter(currentNode => !!currentNode));

        // actual Package instances, not PackageGraphNodes
        return [ ...result ].map(node => node.pkg);
    }
}

module.exports = PackageGraph;
