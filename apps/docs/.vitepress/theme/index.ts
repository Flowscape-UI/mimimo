import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import { Home } from './home';
import { h } from 'vue';
import { SiteFlowy } from './site-flowy';
import { PetDemo } from './pet-demo';
import '../../src/style.css';
import './style.css';
export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, { 'layout-bottom': () => h(SiteFlowy) }),
  enhanceApp({ app }) {
    app.component('MimimoHome', Home);
    app.component('PetDemo', PetDemo);
  },
} satisfies Theme;
