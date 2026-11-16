// Tells Yandex and Bing (IndexNow) about new and changed pages right after a deploy, so the owner
// does not have to request re-crawling by hand. Google has no such API: it reads sitemap.xml.
// node scripts/indexnow.mjs          -> pages whose <lastmod> in dist/sitemap.xml is within the last 3 days
// node scripts/indexnow.mjs --all    -> every page in the sitemap
// Never fails the deploy: errors are only printed.
import { readFileSync } from 'node:fs';

const HOST = 'parusbayroq.uz';
const KEY = 'd730f1de21368601b7cca99d4da18aa7'; // public/d730f1de21368601b7cca99d4da18aa7.txt holds the same key (IndexNow ownership check)
const xml = readFileSync('dist/sitemap.xml', 'utf8');
const pages = [...xml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)].map((m) => ({ url: m[1], lastmod: m[2] }));
const since = new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10);
const urls = (process.argv.includes('--all') ? pages : pages.filter((p) => p.lastmod >= since)).map((p) => p.url);
if (!urls.length) { console.log('IndexNow: nothing new to submit'); process.exit(0); }
const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls });
for (const endpoint of ['https://yandex.com/indexnow', 'https://api.indexnow.org/indexnow']) {
  try {
    const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body });
    console.log(`IndexNow ${endpoint}: HTTP ${r.status} for ${urls.length} URL(s)`);
  } catch (e) { console.log(`IndexNow ${endpoint}: ${e.message}`); }
}
console.log(urls.join('\n'));
