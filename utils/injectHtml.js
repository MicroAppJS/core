'use strict';

const toString = require('stream-to-string');
const cheerio = require('cheerio');
const stream = require('stream');

const CONSTANTS = require('../config/constants');

module.exports = async function injectHtml(ctx) {
    // 处理文件注入一些信息
    let ok = false;
    if (ctx && ctx.method === 'GET' && ctx.type === 'text/html') {
        let body = null;
        if (ctx.body instanceof stream.Readable) {
            body = await toString(ctx.body);
        } else if (ctx.body instanceof Buffer) {
            body = String(ctx.body);
        } else if (typeof ctx.body === 'string') {
            body = ctx.body;
        }
        if (body) {
            ctx.body = body;
            try {
                const $ = cheerio.load(ctx.body);
                const { INJECT_ID } = CONSTANTS;
                if ($(`body>#${INJECT_ID}`).length <= 0) {
                    const INJECT_MICRO_APP = `{
                        cache: {},
                        get: function(key) {
                            if (this.cache[key] == null) {
                                try {
                                    var text = document.getElementById("${INJECT_ID}_" + key);
                                    if (text) {
                                        var value = JSON.parse(decodeURIComponent(text.value) || null);
                                        this.cache[key] = value;
                                    }
                                } catch (error) {
                                    console.warn(error);
                                }
                            }
                            return this.cache[key];
                        },
                    };`.replace(/[\s]{2,}/gm, '');
                    $('body').prepend(`<div id="${INJECT_ID}" style="display: none;"><script type="text/javascript" charset="utf-8">window.MicroApp=${INJECT_MICRO_APP}</script></div>`);
                    ctx.body = $.html();
                }
                ok = true;
            } catch (error) {
                ok = false;
            }
        }
    }
    return function(key, value) {
        if (ok) {
            const $ = cheerio.load(ctx.body);
            const { INJECT_ID } = CONSTANTS;
            $('body>#_MICRO_APP_INJECT_').append(`<textarea id="${INJECT_ID}_${key}" style="display: none;">${encodeURIComponent(JSON.stringify(value))}</textarea>`);
            ctx.body = $.html();
        }
    };
};
