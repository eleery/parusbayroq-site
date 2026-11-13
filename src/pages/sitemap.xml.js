import { SITE } from '../lib/site.mjs';
const groups = [{ ru: '/', uz: '/uz/', priority: '1.0' }, { ru: '/privacy/', uz: '/uz/privacy/', priority: '0.2' }];
export function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = groups.flatMap((g) => ['ru', 'uz'].map((l) => `  <url>\n    <loc>${SITE}${g[l]}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${g.priority}</priority>\n` +
    ['ru', 'uz'].map((a) => `    <xhtml:link rel="alternate" hreflang="${a}" href="${SITE}${g[a]}"/>\n`).join('') +
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${g.ru}"/>\n  </url>`)).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`, { headers: { 'Content-Type': 'application/xml' } });
}
