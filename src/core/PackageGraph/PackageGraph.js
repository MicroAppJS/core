'use strict';

const { logger, npa } = require('@micro-app/shared-utils');
const PackageGraphNode = require('./libs/PackageGraphNode');
const CyclicPackageGraphNode = require('./libs/CyclicPackageGraphNode');
const reportCycles = require('./libs/reportCycles');

// TODO 此块需要大范围修改。（支持别名 @micro-app，可提取依赖）

/**
 * A PackageGraph.
 * @constructor
 * @param {!Array.<Package>} packages An array of Packages to build the graph out of.
 * @param {String} graphType ("allDependencies" or "dependencies")
 *    Pass "dependencies" to create a graph of only dependencies,
 *    excluding the devDependencies that would normally be included.
 * @param {Boolean} forceLocal Force all local dependencies to be linked.
 */
class PackageGraph extends Map {
    constructor(packages, graphType = 'allDependencies', forceLocal) {
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

            for (const [ name, locations ] of seen) {
                if (locations.length > 1) {
                    logger.throw(
                        'ENAME',
                        [ `Package name "${name}" used in multiple packages:`, ...locations ].join('\n\t')
                    );
                }
            }
        }

        this.forEach((currentNode, currentName) => {
            const graphDependencies =
        graphType === 'dependencies'
            ? Object.assign({}, currentNode.pkg.optionalDependencies, currentNode.pkg.dependencies)
            : Object.assign(
                {},
                currentNode.pkg.devDependencies,
                currentNode.pkg.optionalDependencies,
                currentNode.pkg.dependencies
            );

            Object.keys(graphDependencies).forEach(depName => {
                const depNode = this.get(depName);
                // Yarn decided to ignore https://github.com/npm/npm/pull/15900 and implemented "link:"
                // As they apparently have no intention of being compatible, we have to do it for them.
                // @see https://github.com/yarnpkg/yarn/issues/4212
                const spec = graphDependencies[depName].replace(/^link:/, 'file:');
                const resolved = npa.resolve(depName, spec, currentNode.location);

                if (!depNode) {
                    // it's an external dependency, store the resolution and bail
                    return currentNode.externalDependencies.set(depName, resolved);
                }

                if (forceLocal || resolved.fetchSpec === depNode.location || depNode.satisfies(resolved)) {
                    // a local file: specifier OR a matching semver
                    currentNode.localDependencies.set(depName, resolved);
                    depNode.localDependents.set(currentName, currentNode);
                } else {
                    // non-matching semver of a local dependency
                    currentNode.externalDependencies.set(depName, resolved);
                }
            });
        });
    }

    get __isMicroAppPackageGraph() {
        return true;
    }

    get rawPackageList() {
        return Array.from(this.values()).map(node => node.pkg);
    }

    /**
   * Takes a list of Packages and returns a list of those same Packages with any Packages
   * they depend on. i.e if packageA depended on packageB `graph.addDependencies([packageA])`
   * would return [packageA, packageB].
   *
   * @param {!Array.<Package>} filteredPackages The packages to include dependencies for.
   * @return {Array.<Package>} The packages with any dependencies that weren't already included.
   */
    addDependencies(filteredPackages) {
        return this.extendList(filteredPackages, 'localDependencies');
    }

    /**
   * Takes a list of Packages and returns a list of those same Packages with any Packages
   * that depend on them. i.e if packageC depended on packageD `graph.addDependents([packageD])`
   * would return [packageD, packageC].
   *
   * @param {!Array.<Package>} filteredPackages The packages to include dependents for.
   * @return {Array.<Package>} The packages with any dependents that weren't already included.
   */
    addDependents(filteredPackages) {
        return this.extendList(filteredPackages, 'localDependents');
    }

    /**
   * Extends a list of packages by traversing on a given property, which must refer to a
   * `PackageGraphNode` property that is a collection of `PackageGraphNode`s
   *
   * @param {!Array.<Package>} packageList The list of packages to extend
   * @param {!String} nodeProp The property on `PackageGraphNode` used to traverse
   * @return {Array.<Package>} The packages with any additional packages found by traversing
   *                           nodeProp
   */
    extendList(packageList, nodeProp) {
    // the current list of packages we are expanding using breadth-first-search
        const search = new Set(packageList.map(({ name }) => this.get(name)));

        // an intermediate list of matched PackageGraphNodes
        const result = [];

        search.forEach(currentNode => {
            // anything searched for is always a result
            result.push(currentNode);

            currentNode[nodeProp].forEach((meta, depName) => {
                const depNode = this.get(depName);

                if (depNode !== currentNode && !search.has(depNode)) {
                    search.add(depNode);
                }
            });
        });

        // actual Package instances, not PackageGraphNodes
        return result.map(node => node.pkg);
    }

    /**
     * Returns the cycles of this graph. If two cycles share some elements, they will
     * be returned as a single cycle.
     *
     * @param {!boolean} rejectCycles Whether or not to reject cycles
     * @return {Set<CyclicPackageGraphNode>} set
     */
    collapseCycles(rejectCycles) {
        const cyclePaths = [];
        const nodeToCycle = new Map();
        const cycles = new Set();

        const walkStack = [];

        function visits(baseNode, dependentNode) {
            if (nodeToCycle.has(baseNode)) {
                return;
            }

            let topLevelDependent = dependentNode;
            while (nodeToCycle.has(topLevelDependent)) {
                topLevelDependent = nodeToCycle.get(topLevelDependent);
            }

            if (
                topLevelDependent === baseNode ||
        (topLevelDependent.isCycle && topLevelDependent.has(baseNode.name))
            ) {
                const cycle = new CyclicPackageGraphNode();

                walkStack.forEach(nodeInCycle => {
                    nodeToCycle.set(nodeInCycle, cycle);
                    cycle.insert(nodeInCycle);
                    cycles.delete(nodeInCycle);
                });

                cycles.add(cycle);
                cyclePaths.push(cycle.toString());

                return;
            }

            if (walkStack.indexOf(topLevelDependent) === -1) {
                // eslint-disable-next-line no-use-before-define
                visitWithStack(baseNode, topLevelDependent);
            }
        }

        function visitWithStack(baseNode, currentNode = baseNode) {
            walkStack.push(currentNode);
            currentNode.localDependents.forEach(visits.bind(null, baseNode));
            walkStack.pop();
        }

        this.forEach(currentNode => visitWithStack(currentNode));
        cycles.forEach(collapsedNode => visitWithStack(collapsedNode));

        reportCycles(cyclePaths, rejectCycles);

        return cycles;
    }

    /**
     * Remove all candidate nodes.
     * @param {PackageGraphNode[]} candidates candidates
     * @return {null} null
     */
    prune(...candidates) {
        if (candidates.length === this.size) {
            return this.clear();
        }

        candidates.forEach(node => this.remove(node));
    }

    /**
   * Delete by value (instead of key), as well as removing pointers
   * to itself in the other node's internal collections.
   * @param {PackageGraphNode} candidateNode instance to remove
   */
    remove(candidateNode) {
        this.delete(candidateNode.name);

        this.forEach(node => {
            // remove incoming edges ("indegree")
            node.localDependencies.delete(candidateNode.name);

            // remove outgoing edges ("outdegree")
            node.localDependents.delete(candidateNode.name);
        });
    }
}

module.exports = PackageGraph;
