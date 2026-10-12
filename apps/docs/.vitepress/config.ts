import { readFileSync } from 'node:fs';
import { defineConfig, type DefaultTheme } from 'vitepress';
import { apiPages } from './api-pages';

function navigation(ru: boolean): DefaultTheme.NavItem[] {
  const base = ru ? '/ru' : '';
  return [
    {
      text: ru ? 'Документация' : 'Documentation',
      link: `${base}/guide/introduction`,
    },
    { text: ru ? 'Компоненты' : 'Components', link: `${base}/components/` },
    { text: 'GitHub', link: 'https://github.com/Flowscape-UI/mimimo' },
  ];
}
function sidebar(ru: boolean): DefaultTheme.SidebarItem[] {
  const base = ru ? '/ru' : '';
  return [
    {
      text: ru ? 'Начало работы' : 'Getting started',
      items: [
        {
          text: ru ? 'Введение' : 'Introduction',
          link: `${base}/guide/introduction`,
        },
        {
          text: ru ? 'Окружения' : 'Environments',
          link: `${base}/guide/environments`,
        },
        {
          text: ru
            ? 'PNG, GIF, видео и спрайты'
            : 'PNG, GIF, video and sprites',
          link: `${base}/guide/media`,
        },
        {
          text: ru ? 'Свой пакет питомца' : 'Build a pet pack',
          link: `${base}/guide/pet-pack`,
        },
        { text: ru ? 'Обзор API' : 'API overview', link: `${base}/guide/api` },
        { text: ru ? 'Компоненты' : 'Components', link: `${base}/components/` },
      ],
    },
    ...[
      {
        en: 'Create and animate',
        ru: 'Создание и анимация',
        slugs: ['create-pet', 'define-pet', 'add-state', 'play', 'reactions'],
      },
      {
        en: 'Place and control',
        ru: 'Размещение и управление',
        slugs: [
          'position',
          'size',
          'draggable',
          'preload',
          'playback',
          'visibility',
          'destroy',
        ],
      },
      {
        en: 'Connect with your app',
        ru: 'Связь с приложением',
        slugs: ['say', 'events', 'panels', 'chat'],
      },
    ].map((group) => ({
      text: ru ? group.ru : group.en,
      collapsed: false,
      items: group.slugs.map((slug) => {
        const page = apiPages.find((page) => page.slug === slug)!;
        return { text: ru ? page.ru : page.en, link: `${base}/api/${slug}` };
      }),
    })),
  ];
}
export default defineConfig({
  title: 'Mimimo',
  description:
    'Little companions. Big personality. A framework-independent TypeScript library by Flowscape.',
  lang: 'en-US',
  base: process.env.MIMIMO_DOCS_BASE ?? '/',
  outDir: './dist',
  cleanUrls: true,
  appearance: 'force-dark',
  srcExclude: ['README.md', 'src/**', 'tests/**'],
  head: [
    [
      'link',
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href:
          'data:image/svg+xml,' +
          encodeURIComponent(
            readFileSync(
              new URL('../public/logo.svg', import.meta.url),
              'utf8',
            ),
          ),
      },
    ],
  ],
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: { nav: navigation(false), sidebar: sidebar(false) },
    },
    ru: {
      label: 'Русский',
      lang: 'ru',
      themeConfig: {
        nav: navigation(true),
        sidebar: sidebar(true),
        outline: { label: 'На этой странице', level: [2, 3] },
        docFooter: { prev: 'Предыдущая страница', next: 'Следующая страница' },
        sidebarMenuLabel: 'Меню',
        returnToTopLabel: 'Наверх',
        langMenuLabel: 'Язык',
        skipToContentLabel: 'К содержимому',
        footer: { message: 'Маленькие спутники от команды Flowscape.' },
      },
    },
  },
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'mimimo',
    search: {
      provider: 'local',
      options: {
        locales: {
          ru: {
            translations: {
              button: {
                buttonText: 'Поиск',
                buttonAriaLabel: 'Поиск по документации',
              },
              modal: {
                noResultsText: 'Ничего не найдено',
                resetButtonTitle: 'Очистить',
                backButtonTitle: 'Назад',
                displayDetails: 'Показать подробности',
                footer: {
                  selectText: 'выбрать',
                  navigateText: 'перейти',
                  closeText: 'закрыть',
                },
              },
            },
          },
        },
      },
    },
    outline: [2, 3],
    footer: { message: 'Little companions, made by Flowscape Team.' },
  },
});
