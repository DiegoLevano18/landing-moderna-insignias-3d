import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// En GitHub Actions, SITE_URL y BASE_PATH los entrega actions/configure-pages.
// Con dominio propio (marqa.shop) BASE_PATH queda vacío.
const site = process.env.SITE_URL || 'https://marqa.shop';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.includes('/admin') })],
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data: blob:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
    },
  },
});
