'use strict';

const assert = require('assert');
const _ = require('lodash');

const BaseAPI = require('./libs/BaseAPI');

class PluginAPI extends BaseAPI {

    get __isMicroAppPluginAPI() {
        return true;
    }

    register(hook, fn, type) {
        return this.service.register(hook, fn, type);
    }

    registerMethod(name, opts) {
        return this.service.registerMethod(name, opts);
    }

    registerCommand(name, opts, fn) {
        return this.service.registerCommand(name, opts, fn);
    }

    changeCommandOption(name, newOpts) {
        return this.service.changeCommandOption(name, newOpts);
    }

    extendConfig(name, opts, fn) {
        return this.service.extendConfig(name, opts, fn);
    }

    extendMethod(name, opts, fn) {
        return this.service.extendMethod(name, opts, fn);
    }

    // ZAP 与 PluginService 相似
    registerPlugin(opts) {
        assert(_.isPlainObject(opts), `opts should be plain object, but got ${opts}`);
        opts = this.service.resolvePlugin(opts);
        if (!opts) return; // error
        const {
            id,
            apply,
        } = opts;
        assert(id && apply, 'id and apply must supplied');
        assert(typeof id === 'string', 'id must be string');
        assert(typeof apply === 'function', 'apply must be function');
        assert(
            id.indexOf('built-in:') !== 0,
            'api.registerPlugin() should not register plugin prefixed with built-in:'
        );
        assert(
            opts[Symbol.for('built-in')] === undefined,
            'api.registerPlugin() should not register plugin Symbol.for("built-in"): true'
        );
        assert(
            [ 'id', 'apply', 'opts' ].every(key => Object.keys(opts).includes(key)),
            'Only id, apply and opts is valid plugin properties'
        );
        this.service.extraPlugins.push(opts);
        this.logger.debug('[Plugin]', `registerPlugin( ${id} ); Success!`);
    }
}

module.exports = PluginAPI;
