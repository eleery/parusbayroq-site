// "What a feather flag is made of": the parts laid out and the assembled flag with its height.
// Facts from the owner (23.11.2026): two pipe sections + a bendable top rod, a mount, a 22 l plastic barrel,
// 4 m long in parts, 3.70–3.80 m assembled, about 1.5 kg to carry.
// node scripts/parts-chart.mjs <out.jpg> [ru|uz]
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [out, lang = 'ru'] = process.argv.slice(2);
if (!out) { console.error('usage: parts-chart.mjs out.jpg [ru|uz]'); process.exit(1); }

const T = {
  ru: { title: 'Из чего состоит флаг-парус', sub: 'Конструкция и полотно — из Турции',
        parts: [['Полотно', 'флажная сетка, сублимация'], ['Верхний прут', 'гнётся дугой и держит форму паруса'], ['2 трубки флагштока', 'вставляются одна в другую'],
                ['Крепление', 'соединяет флагшток с бочкой'], ['Бочка на 22 литра', 'вода или песок']],
        height: 'в сборе 3,7–3,8 м', facts: ['Длина конструкции — 4 м', 'При перевозке ≈ 1,5 кг', 'Собирается без инструментов'] },
  uz: { title: 'Parus bayroq nimadan iborat', sub: "Konstruksiya va mato — Turkiyadan",
        parts: [['Mato', "bayroq to'ri, sublimatsiya"], ['Yuqori tayoqcha', "yoy bo'lib egiladi va parus shaklini ushlaydi"], ['Flagshtokning 2 ta quvuri', 'biri ikkinchisiga kiradi'],
                ['Mahkamlagich', 'flagshtokni bochkaga ulaydi'], ['22 litrli bochka', 'suv yoki qum']],
        height: "yig'ilganda 3,7–3,8 m", facts: ['Konstruksiya uzunligi — 4 m', "Tashishda ≈ 1,5 kg", "Asbobsiz yig'iladi"] },
}[lang];

const W = 1600, H = 900;
const icon = readFileSync(join(root, 'media-src/images/Logo.svg'), 'utf8').replace(/width="24" height="24"/, 'width="100%" height="100%"');
const font = (f) => 'file://' + join(root, 'public/fonts', f);

// Assembled flag on the right: canvas + pole + base, with a height arrow. 1 m ≈ 150 px.
const G = 820, fx = 1240, fh = 3.75 * 150; // ground, pole x, total height in px
const top = G - fh, cw = 120;
const flag = `
  <path d="M${fx},${G - 70} L${fx},${top + 30} Q${fx},${top} ${fx + cw * 0.5},${top} Q${fx + cw},${top} ${fx + cw},${top + 60} L${fx + cw},${G - 120} Z" fill="#fff" stroke="#d3d8de" stroke-width="2"/>
  <rect x="${fx}" y="${top + 20}" width="8" height="${fh - 90}" fill="#FF6A00"/>
  <line x1="${fx}" y1="${G - 14}" x2="${fx}" y2="${top + 6}" stroke="#7d8790" stroke-width="5" stroke-linecap="round"/>
  <path d="M${fx - 46},${G} L${fx - 40},${G - 30} Q${fx},${G - 40} ${fx + 40},${G - 30} L${fx + 46},${G} Z" fill="#20262c"/>
  <line x1="${fx + cw + 60}" y1="${top}" x2="${fx + cw + 60}" y2="${G}" stroke="#FF6A00" stroke-width="3"/>
  <path d="M${fx + cw + 50},${top + 14} l10,-14 10,14 M${fx + cw + 50},${G - 14} l10,14 10,-14" stroke="#FF6A00" stroke-width="3" fill="none"/>`;

// Parts laid out on the left, one row each.
const rows = [
  `<path d="M0,40 L0,6 Q0,0 40,0 Q120,0 120,14 L120,34 Z" fill="#fff" stroke="#c9cfd6" stroke-width="2" transform="scale(1.4)"/><rect x="0" y="4" width="6" height="52" fill="#FF6A00"/>`,
  `<path d="M0,40 Q90,40 160,-10" stroke="#9aa4ae" stroke-width="7" fill="none" stroke-linecap="round"/>`,
  `<rect x="0" y="6" width="150" height="10" rx="5" fill="#9aa4ae"/><rect x="10" y="30" width="150" height="10" rx="5" fill="#b6bfc8"/>`,
  `<rect x="40" y="4" width="22" height="40" rx="4" fill="#5b6774"/><rect x="34" y="0" width="34" height="10" rx="3" fill="#3a434c"/>`,
  `<path d="M14,48 L22,6 Q60,-4 98,6 L106,48 Z" fill="#20262c"/><ellipse cx="60" cy="6" rx="38" ry="7" fill="#3a434c"/><path d="M50,22 h20" stroke="#3b8ee8" stroke-width="6" stroke-linecap="round"/>`,
];
const partsHtml = T.parts.map(([h, p], i) => `<div class="row" style="top:${200 + i * 112}px">
  <svg width="200" height="70" viewBox="-10 -20 200 80">${rows[i]}</svg><div><b>${h}</b><span>${p}</span></div></div>`).join('');

const page = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: YS; src: url('${font('YSDisplay-Bold.woff2')}'); font-weight: 700; }
@font-face { font-family: YS; src: url('${font('YSDisplay-Regular.woff2')}'); font-weight: 400; }
* { margin: 0; box-sizing: border-box; }
body { width: ${W}px; height: ${H}px; position: relative; overflow: hidden; font-family: YS, sans-serif; color: #111920; background: linear-gradient(#f6f7f9, #e8ecf0 ${G}px, #cfd5db ${G}px); }
h1 { position: absolute; left: 48px; top: 44px; font-size: 46px; letter-spacing: -.01em; }
.sub { position: absolute; left: 50px; top: 106px; font-size: 24px; color: #5b6774; }
.brand { position: absolute; right: 48px; top: 52px; display: flex; align-items: center; gap: 8px; font-size: 24px; font-weight: 700; }
.brand i { font-style: normal; color: #FF6A00; } .brand .ic { width: 26px; height: 26px; display: block; flex: none; }
.row { position: absolute; left: 48px; width: 900px; height: 96px; display: flex; align-items: center; gap: 26px; background: #fff; border-radius: 18px; padding: 0 26px; box-shadow: 0 4px 16px rgba(17,25,32,.06); }
.row b { display: block; font-size: 28px; } .row span { display: block; font-size: 21px; color: #5b6774; margin-top: 4px; }
body > svg { position: absolute; inset: 0; }
.h { position: absolute; left: ${fx + cw + 74}px; top: ${top + fh / 2 - 20}px; font-size: 26px; font-weight: 700; color: #FF6A00; width: 140px; line-height: 1.1; }
.fic { position: absolute; width: 52px; height: 52px; }
.flogo { position: absolute; transform: translate(-50%, -50%) rotate(-90deg); white-space: nowrap; font-size: 38px; font-weight: 700; color: #111920; }
.flogo i { font-style: normal; color: #FF6A00; }
.facts { position: absolute; left: 48px; bottom: 26px; display: flex; gap: 34px; font-size: 22px; color: #46525e; }
.facts span::before { content: '•'; color: #FF6A00; margin-right: 10px; }
</style></head><body>
<h1>${T.title}</h1><div class="sub">${T.sub}</div>
<div class="brand"><span class="ic">${icon}</span><span><b>Parus</b> <i>Bayroq</i></span></div>
${partsHtml}
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${flag}</svg>
<div class="h">${T.height}</div>
<div class="fic" style="left:${fx + cw / 2 - 26}px;top:${top + 70}px">${icon}</div>
<div class="flogo" style="left:${fx + cw / 2 + 4}px;top:${top + fh / 2 - 10}px"><b>Parus</b> <i>Bayroq</i></div>
<div class="facts">${T.facts.map((f) => `<span>${f}</span>`).join('')}</div>
<script>document.fonts.ready.then(() => { document.body.dataset.ready = '1'; });</script>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'parts-'));
writeFileSync(join(dir, 'page.html'), page);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await p.goto('file://' + join(dir, 'page.html'));
await p.waitForSelector('body[data-ready="1"]');
await p.waitForTimeout(150);
await p.screenshot(out.endsWith('.png') ? { path: out } : { path: out, type: 'jpeg', quality: 92 });
await b.close();
console.log('saved', out);
