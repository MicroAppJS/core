'use strict';

const { logger, _, assert, loadFile } = require('@micro-app/shared-utils');

const CONSTANTS = require('../../Constants');

const EXTRA_CONFIG = Symbol('EXTRA_CONFIG');

class ExtraConfig {

    constructor(root) {
        assert(typeof root === 'string', 'root is required!');

        Object.defineProperty(this, 'root', {
            value: root,
        });

        let extraConfig = loadFile(root, CONSTANTS.EXTRAL_CONFIG_NAME);
        if (!extraConfig || !_.isPlainObject(extraConfig)) {
            extraConfig = {};
        } else {
            Object.keys(extraConfig).forEach(key => {
                const item = extraConfig[key];
                logger.debug('【 Extra Config 】', `${key}: ${JSON.stringify(item, false, 4)}`);
            });
        }

        this[EXTRA_CONFIG] = extraConfig || {};

        // 其它赋值
        Object.keys(this.config).forEach(key => {
            if (this[key] === undefined) {
                Object.defineProperty(this, key, {
                    writable: true,
                    value: this.config[key],
                });
            }
        });
    }

    get __isPro() {
        return _.isPlainObject(this.config.micros) || _.isPlainObject(this.config.micro);
    }

    get config() {
        return this[EXTRA_CONFIG] || {};
    }

    get micros() {
        const extraConfig = this.config || {};
        // 兼容旧版本
        const microsExtra = this.__isPro ? (extraConfig.micros || extraConfig.micro) : extraConfig;
        const result = {};
        Object.keys(microsExtra).forEach(key => {
            result[key] = Object.assign({}, microsExtra[key] || {
                disabled: false, // 禁用入口
                disable: false,
                link: false,
            });

            // 附加内容需要参考全局配置 (兼容)
            if (process.env.MICRO_APP_OPEN_SOFT_LINK !== 'true') { // 强制禁止使用 软链接
                result[key].link = false;
            }
            if (process.env.MICRO_APP_OPEN_DISABLED_ENTRY !== 'true') { // 强制禁止使用 开启禁用指定模块入口, 优化开发速度
                result[key].disabled = false;
                result[key].disable = false;
            }
        });
        return _.cloneDeep(Object.assign({}, microsExtra, result));
    }

    get command() {
        // TODO 获取预先配置的参数
        return this.config.command || {};
    }
}

module.exports = ExtraConfig;
