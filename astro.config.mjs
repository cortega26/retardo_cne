import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const site = process.env.PUBLIC_SITE_URL ?? 'https://tooltician.com';
const base = process.env.PUBLIC_BASE_PATH ?? '/retardo_cne';
const siteUrl = new URL(base, site).href;

// https://astro.build/config
export default defineConfig({
  site,
  base,
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        // Homepage (both languages) — highest priority, crawled daily
        if (
          item.url === siteUrl ||
          item.url === new URL('en/', siteUrl).href
        ) {
          return { ...item, priority: 1.0, changefreq: 'daily' };
        }
        // Irregularidades detail pages — updated infrequently
        if (item.url.includes('/irregularidades/')) {
          return { ...item, priority: 0.8, changefreq: 'monthly' };
        }
        // Methodology and other static pages
        return { ...item, priority: 0.6, changefreq: 'monthly' };
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  output: 'static',
});
