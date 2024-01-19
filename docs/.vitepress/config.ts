import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'unplugin-detect-duplicated-deps',
    description: 'detect duplicate packaged dependencies',
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [{ text: 'Home', link: '/' }],

        sidebar: [
            {
                items: [
                    { text: 'Introduction', link: '/introduction.md' },
                    { text: 'Getting Started', link: '/getting-started.md' },
                    { text: 'Configuration', link: '/configuration.md' },
                ],
            },
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/tjx666/unplugin-detect-duplicated-deps' },
            { icon: 'twitter', link: 'https://twitter.com/YuTengjing' },
        ],
    },
});
