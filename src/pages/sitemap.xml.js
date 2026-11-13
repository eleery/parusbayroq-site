import { SITE } from '../lib/site.mjs';
import { getPosts, slugOf, postPath, alternatesOf } from '../lib/blog.mjs';

const pages = [{ ru: '/', uz: '/uz/', priority: '1.0' }, { ru: '/flagi-na-zakaz/', uz: '/uz/bayroq-buyurtma/', priority: '0.8' }, { ru: '/privacy/', uz: '/uz/privacy/', priority: '0.2' }];

const entry = (loc, alts, priority, lastmod) => `  <url>\n    <loc>${SITE}${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n` +
  Object.entries(alts).map(([l, p]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${p}"/>\n`).join('') +
  (alts.ru ? `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${alts.ru}"/>\n` : '') + '  </url>';

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages.flatMap((g) => ['ru', 'uz'].map((l) => entry(g[l], { ru: g.ru, uz: g.uz }, g.priority, today)));
  for (const lang of ['ru', 'uz']) {
    const posts = await getPosts(lang);
    if (!posts.length) continue;
    const idx = lang === 'ru' ? '/blog/' : '/uz/blog/';
    urls.push(entry(idx, (await getPosts(lang === 'ru' ? 'uz' : 'ru')).length ? { ru: '/blog/', uz: '/uz/blog/' } : { [lang]: idx }, '0.6', today));
    for (const p of posts) {
      const d = (p.data.updated || p.data.date).toISOString().slice(0, 10);
      urls.push(entry(postPath(lang, slugOf(p)), await alternatesOf(p), '0.6', d));
    }
  }
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`, { headers: { 'Content-Type': 'application/xml' } });
}
