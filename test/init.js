'use strict';


const Service = require('../');
const service = new Service();

const plugin = service.plugins.find(item => item.id.includes('init'));

(async () => {
    await service.init();

    plugin[Symbol.for('api')].addCommandInit((abc, bbb) => {
        console.warn('[abc]: ', abc);
        console.warn('[bbb]: ', bbb);
        bbb.bbb = 'test';
        return {
            a: 'a',
            b: 'b',
            alias: { // 前端
                api: 'abc',
                config: {
                    link: 'abc',
                    description: '配置',
                },
                service: {
                    link: 'abc',
                    description: '接口',
                    type: 'server',
                },
            },
        };
    });

    await service.runCommand('init', { _: [], force: true });
})();
