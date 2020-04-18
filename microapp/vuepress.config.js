'use strict';

module.exports = {
    sourceDir: 'docs',
    description: '🔌 多模块可插拔插件的微应用框架',
    locales: {
        '/': {
            lang: 'zh-CN',
            title: 'MicroApp - Core',
            description: '一款简洁而优雅的 博客 & 文档 主题, 依赖于 Micro App 微应用框架',

            label: '简体中文',
            selectText: '选择语言',
            ariaLabel: '选择语言',
            editLinkText: '在 GitHub 上编辑此页',
            lastUpdated: '上次编辑时间',
            repoLabel: '查看源码',
            // sidebar: getSidebar('zh'),
            nav: getNav('zh'),
        },
        // '/en/': {
        //     lang: 'en-US',
        //     title: 'Plugin - VuePress',
        //     description: 'Vue-powered Static Site Generator',
        // },
    },
    // 假定是 GitHub. 同时也可以是一个完整的 GitLab URL
    repoIcon: 'github',
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
    footer: {
        powerby: true,
        copyright: true,
        // beian: 'abc',
    },
    command: {
        deploy: {
            repo: 'git@github.com:MicroAppJS/core.git',
            branch: 'gh-pages',
        },
    },
};

function getSidebar(lang = 'zh') {
    switch (lang) {
        case 'zh':
        default:
            return {
                [`/${lang}/guide/`]: getGuideSidebar('基础', '深入'),
                [`/${lang}/config/`]: getConfigSidebar('增强'),
            };
    }
}


function getGuideSidebar(groupA, groupB) {
    return [
        {
            title: groupA,
            collapsable: false,
            children: [
                '',
                'getting-started',
                // 'directory-structure',
                'assets',
                'basic-config',
                'i18n',
                'theme-config',
                'deploy',
            ],
        },
        {
            title: groupB,
            collapsable: false,
            children: [
                'deep/frontmatter',
                'deep/permalinks',
                'deep/markdown-slot',
                'deep/global-computed',
            ],
        },
    ];
}


function getConfigSidebar(groupA, groupB) {
    return [
        {
            title: groupA,
            collapsable: false,
            children: [
                '',
                'svg-icon',
                'home',
                'copyright',
                'footer',
                'friend-link',
                'redirect',
                'google-analytics',
                // 'global-computed',
            ],
        },
        {
            title: groupB,
            collapsable: false,
            children: [
                'blog/',
                'blog/home',
                'blog/category-tag',
                'blog/author',
                'blog/comment',
                'blog/rss',
                'blog/frontmatter',
                'blog/blog-config',
            ],
        },
    ];
}

function getNav(lang) {
    switch (lang) {
        case 'zh':
        default:
            return [
                {
                    text: '指南',
                    link: '/zh/guide/',
                    icon: 'guide',
                },
                {
                    text: '配置',
                    link: '/zh/config/',
                    icon: 'doc',
                },
                {
                    text: 'API',
                    link: '/zh/api/',
                    icon: 'api',
                },
                {
                    text: '插件',
                    link: '/zh/plugin/',
                    icon: 'plugin',
                },
            ];
    }
}
