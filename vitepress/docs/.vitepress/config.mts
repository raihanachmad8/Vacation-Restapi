import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Vacation Restapi',
  description: 'A VitePress Site',
  base: '/',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'author', content: 'Achmad Raihan Fahrezi Effendy' }],
    ['meta', { name: 'keywords', content: 'vacation, restapi, documentation' }],
    ['meta', { property: 'og:title', content: 'Vacation Restapi' }],
    ['meta', { property: 'og:description', content: 'A VitePress Site' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://vacation-restapi.netlify.app/' }],
    ['meta', { property: 'og:site_name', content: 'Vacation Restapi' }],
  ],
  
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
    ],

    search: {
      provider: 'local',
    },

    sidebar: [
      {
        text: 'Introduction',
        items: [
          {
            text: 'What is Vacation RestAPI?',
            link: '/introduction/what-is-vacation-restapi',
          },
          { text: 'Installation', link: '/introduction/installation' },
          { text: 'Folder Structure', link: '/introduction/folder-structure' },
          { text: 'Endpoints', link: '/introduction/endpoints' },
        ],
      },
      {
        text: 'Models',
        items: [
          { text: 'User', link: '/models/user' },
          { text: 'Personal Access Token', link: '/models/personal-access-token' },
          // { text: 'Tags', link: '/models/tags' },
          // { text: 'Article', link: '/models/article' },
          // { text: 'Article Tags', link: '/models/article-tags' },
          // { text: 'Comment', link: '/models/comment' },
          // { text: 'Comment Likes', link: '/models/comment-likes' },
          // { text: 'Comment Replies', link: '/models/comment-replies' },
          // { text: 'Comment Reply Likes', link: '/models/comment-reply-likes' },
          // { text: 'Article Likes', link: '/models/article-likes' },
          // { text: 'Article Bookmarks', link: '/models/article-bookmarks' },
          // { text: 'PlannerGroup', link: '/models/planner-group' },
          // { text: 'KanbanBoard', link: '/models/kanban-board' },
          // { text: 'KanbanCard', link: '/models/kanban-card' },
          // { text: 'KanbanTask', link: '/models/kanban-task' },
          // { text: 'Event', link: '/models/event' },
          // { text: 'Category', link: '/models/category' },

        ],
      },
      {
        text: 'API Documentation',
        items: [
          { text: 'User', link: '/api-documentation/user' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Achmad Raihan Fahrezi Effendy',
    },
  },

});
