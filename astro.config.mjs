import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://parusbayroq.uz',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'never' },
  compressHTML: true,
});
