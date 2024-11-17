import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: 'https://docs.m.todaq.net',
  integrations: [react(), mdx(), sitemap()],

  adapter: node({
    mode: 'standalone',
  }),
});
