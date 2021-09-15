'use strict';

const { _, assert } = require('@micro-app/shared-utils');

const BaseAPI = require('./libs/BaseAPI');

class PluginAPI extends BaseAPI {

    get $isMicroAppPluginAPI() {
        return true;
    }

    // extraPlugins, 不支持嵌套
    registerPlugin(opts) {
        assert(_.isPlainObject(opts), `opts should be plain object, but got ${opts}`);
        opts = this.service.resolvePlugin(opts);
        if (!opts) return; // error
        const { id, apply } = opts;
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
        this.logger.debug('[Plugin]', `api.registerPlugin( ${id} ); Success!`);
    }
}

module.exports = PluginAPI;
