'use strict';

const { logger, _, assert } = require('@micro-app/shared-utils');

const CONSTANTS = require('../Constants');

const loadConfig = require('../../utils/loadConfig');

const EXTRA_CONFIG = Symbol('EXTRA_CONFIG');

class ExtraConfig {

    /**
     *
     * @param {*} root 更目录
     * @param {*} context 上下文环境变量
     */
    constructor(root, context) {
        assert(typeof root === 'string', 'root is required!');
        this.context = context || {};

        Object.defineProperty(this, 'root', {
            value: root,
        });

        let extraConfig = loadConfig(root, CONSTANTS.MICRO_APP_EXTRA_CONFIG_NAME);
        if (!extraConfig || !_.isPlainObject(extraConfig)) {
            extraConfig = {};
        } else {
            Object.keys(extraConfig).forEach(key => {
                const item = extraConfig[key];
                logger.debug('[ExtraConfig]', `${key}: ${JSON.stringify(item, false, 4)}`);
            });
        }

        this[EXTRA_CONFIG] = extraConfig || {};

        // 其它赋值
        if (this.__isPro) {
            Object.keys(this.config).forEach(key => {
                if (this[key] === undefined) {
                    Object.defineProperty(this, key, {
                        writable: true,
                        value: this.config[key],
                    });
                }
            });
        }

        // 全局指令(兼容指令)
        if (this.context.openSoftLink) {
            logger.info('[global]', '已开启软链接: --open-soft-link = true');
        }
        if (this.context.openDisabledEntry) {
            logger.info('[global]', '已开启禁用指定模块入口: --open-disabled-entry = true');
        }
    }

    get __isPro() {
        return _.isPlainObject(this.config.micros);
    }

    get config() {
        return this[EXTRA_CONFIG] || {};
    }

    // ZAP 兼容，后面要去除
    get scope() {
        if (this.__isPro) {
            return this.config.scope || '';
        }
        return CONSTANTS.SCOPE_NAME;
    }

    get micros() {
        const { openSoftLink = false, openDisabledEntry = false } = this.context;
        const extraConfig = this.config || {};
        // 兼容旧版本
        const microsExtra = this.__isPro ? extraConfig.micros : extraConfig;

        const result = {};
        Object.keys(microsExtra).forEach(key => {
            result[key] = Object.assign({}, microsExtra[key] || {
                disabled: false, // 禁用入口
                disable: false, // 开启禁用指定模块入口, 优化开发速度, 同 disabled
                link: false, // 开启软链接
            });

            // 附加内容需要参考全局配置 (兼容)
            if (!openSoftLink) { // 强制禁止使用 软链接
                result[key].link = false;
            }
            if (!openDisabledEntry) { // 强制禁止使用 开启禁用指定模块入口, 优化开发速度
                result[key].disabled = false;
                result[key].disable = false;
            }

            // ZAP 兼容赋值（后面需要去除的）
            if (!key.startsWith(this.scope) && _.isUndefined(result[`${this.scope}/${key}`])) {
                result[`${this.scope}/${key}`] = result[key];
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
