'use strict';

module.exports = {
    sourceDir: 'docs',
    title: 'MicroApp - Core',
    description: '🔌 多模块可插拔插件的微应用框架',
    sidebars: {
        '/guide/': [ '基础', '深入' ],
        '/config/': [ '增强' ],
    },
    navs: {
        '/guide/': '指南',
        '/config/': '配置',
        '/api/': 'API',
        '/plugin/': '插件',
    },
    themeConfig: {
        // logo: '/logo.png',
        lastUpdated: '上次编辑时间',
        repoLabel: '查看源码',
        editLinkText: '在 GitHub 上编辑此页',
        // 假定是 GitHub. 同时也可以是一个完整的 GitLab URL
        repo: 'MicroAppJS/core',
        // 自定义仓库链接文字。默认从 `themeConfig.repo` 中自动推断为
        // "GitHub"/"GitLab"/"Bitbucket" 其中之一，或是 "Source"。
        // repoLabel: '查看源码',
        // 假如你的文档仓库和项目本身不在一个仓库：
        // docsRepo: 'MicroAppJS/MicroApp-Core',
        // 假如文档不是放在仓库的根目录下：
        docsDir: 'docs',
        // 假如文档放在一个特定的分支下：
        docsBranch: 'master',
        // 默认是 false, 设置为 true 来启用
        editLinks: true,
        // 默认为 "Edit this page"
        // editLinkText: '帮助我们改善此页面！',
        sidebarDepth: 2,
        // algolia: {
        //     indexName: "cli_vuejs",
        //     apiKey: "f6df220f7d246aff64a56300b7f19f21"
        // },
        // search: false,
        // searchMaxSuggestions: 10,
        // displayAllHeaders: true // 默认值：false
    },
    deploy: {
        repo: 'git@github.com:MicroAppJS/core.git',
        branch: 'gh-pages',
    },
};
