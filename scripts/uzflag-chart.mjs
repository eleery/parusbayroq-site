// "Flag of Uzbekistan: proportions and colours" scheme for the state-flags article.
// The flag geometry is the public-domain construction used on Wikimedia Commons (500×250, ratio 1:2):
// blue 0–80, red 80–85, white 85–165, red 165–170, green 170–250; crescent and 12 stars in rows of 3, 4, 5.
// node scripts/uzflag-chart.mjs <out.jpg> [ru|uz]
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [out, lang = 'ru'] = process.argv.slice(2);
if (!out) { console.error('usage: uzflag-chart.mjs out.jpg [ru|uz]'); process.exit(1); }

const T = {
  ru: { title: 'Флаг Узбекистана: пропорции и цвета', sub: 'Как выглядит государственный флаг',
        legend: [['#0099b5', 'Голубая полоса', 'сверху'], ['#fff', 'Белая полоса', 'с тонкой красной каймой сверху и снизу'], ['#1eb53a', 'Зелёная полоса', 'снизу'],
                 ['#0099b5', 'Полумесяц и 12 звёзд', 'белые, на голубой полосе у древка: звёзды рядами 3, 4 и 5']],
        facts: [['1 : 2', 'ширина к длине'], ['18.11.1991', 'флаг утверждён законом'], ['300×150 см', 'размер L — в пропорции 1:2']] },
  uz: { title: "O'zbekiston bayrog'i: nisbatlari va ranglari", sub: "Davlat bayrog'i qanday ko'rinadi",
        legend: [['#0099b5', "Moviy yo'l", 'yuqorida'], ['#fff', "Oq yo'l", "tepasi va pastida ingichka qizil hoshiya"], ['#1eb53a', "Yashil yo'l", 'pastda'],
                 ['#0099b5', 'Yarim oy va 12 ta yulduz', "oq, moviy yo'lda dasta tomonda: yulduzlar 3, 4 va 5 qatorda"]],
        facts: [['1 : 2', "eni va bo'yi nisbati"], ['18.11.1991', 'bayroq qonun bilan tasdiqlangan'], ['300×150 sm', "L o'lcham — 1:2 nisbatda"]] },
}[lang];

const W = 1600, H = 900;
const icon = readFileSync(join(root, 'media-src/images/Logo.svg'), 'utf8').replace(/width="24" height="24"/, 'width="100%" height="100%"');
const font = (f) => 'file://' + join(root, 'public/fonts', f);

const FX = 70, FY = 200, FW = 760, FH = 380; // flag box on the page (1:2)
const flag = `<svg x="${FX}" y="${FY}" width="${FW}" height="${FH}" viewBox="0 0 500 250">
  <rect width="500" height="250" fill="#1eb53a"/><rect width="500" height="125" fill="#0099b5"/>
  <rect width="500" height="90" y="80" fill="#ce1126"/><rect width="500" height="80" y="85" fill="#fff"/>
  <circle cx="70" cy="40" r="30" fill="#fff"/><circle cx="80" cy="40" r="30" fill="#0099b5"/>
  <g fill="#fff" transform="translate(136,64)"><g id="s3"><g id="s"><g id="f"><g id="t">
    <path id="o" d="M0,-6V0H3" transform="rotate(18,0,-6)"/><use href="#o" transform="scale(-1,1)"/></g>
    <use href="#t" transform="rotate(72)"/></g><use href="#t" transform="rotate(-72)"/><use href="#f" transform="rotate(144)"/></g>
    <use href="#s" y="-24"/><use href="#s" y="-48"/></g>
    <use href="#s3" x="24"/><use href="#s3" x="48"/><use href="#s" x="-48"/><use href="#s" x="-24"/><use href="#s" x="-24" y="-24"/></g>
  <rect width="500" height="250" fill="none" stroke="#d3d8de" stroke-width="1"/></svg>`;
const dims = `
  <line x1="${FX}" y1="${FY + FH + 34}" x2="${FX + FW}" y2="${FY + FH + 34}" stroke="#FF6A00" stroke-width="3"/>
  <path d="M${FX + 14},${FY + FH + 24} l-14,10 14,10 M${FX + FW - 14},${FY + FH + 24} l14,10 -14,10" stroke="#FF6A00" stroke-width="3" fill="none"/>
  <line x1="${FX - 34}" y1="${FY}" x2="${FX - 34}" y2="${FY + FH}" stroke="#FF6A00" stroke-width="3"/>
  <path d="M${FX - 44},${FY + 14} l10,-14 10,14 M${FX - 44},${FY + FH - 14} l10,14 10,-14" stroke="#FF6A00" stroke-width="3" fill="none"/>`;

const page = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: YS; src: url('${font('YSDisplay-Bold.woff2')}'); font-weight: 700; }
@font-face { font-family: YS; src: url('${font('YSDisplay-Regular.woff2')}'); font-weight: 400; }
* { margin: 0; box-sizing: border-box; }
body { width: ${W}px; height: ${H}px; position: relative; overflow: hidden; font-family: YS, sans-serif; color: #111920; background: #f4f6f8; }
h1 { position: absolute; left: 48px; top: 40px; font-size: 44px; letter-spacing: -.01em; }
.sub { position: absolute; left: 50px; top: 102px; font-size: 22px; color: #5b6774; }
.brand { position: absolute; right: 48px; top: 48px; display: flex; align-items: center; gap: 8px; font-size: 24px; font-weight: 700; }
.brand i { font-style: normal; color: #FF6A00; } .brand .ic { width: 26px; height: 26px; display: block; flex: none; }
body > svg { position: absolute; inset: 0; }
.d { position: absolute; font-size: 26px; font-weight: 700; color: #FF6A00; }
.legend { position: absolute; left: 900px; top: 196px; width: 652px; display: flex; flex-direction: column; gap: 16px; }
.row { display: flex; gap: 18px; align-items: center; background: #fff; border-radius: 16px; padding: 16px 20px; }
.sw { flex: none; width: 52px; height: 52px; border-radius: 10px; border: 2px solid #d3d8de; position: relative; overflow: hidden; }
.row b { display: block; font-size: 24px; } .row span { display: block; font-size: 19px; color: #5b6774; margin-top: 3px; line-height: 1.25; }
.facts { position: absolute; left: 48px; bottom: 40px; width: ${W - 96}px; display: flex; gap: 22px; }
.fact { flex: 1; background: #fff; border-radius: 16px; padding: 18px 22px; }
.fact b { display: block; font-size: 32px; color: #FF6A00; } .fact span { display: block; font-size: 19px; color: #46525e; margin-top: 4px; }
</style></head><body>
<h1>${T.title}</h1><div class="sub">${T.sub}</div>
<div class="brand"><span class="ic">${icon}</span><span><b>Parus</b> <i>Bayroq</i></span></div>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${flag}${dims}</svg>
<div class="d" style="left:${FX + FW / 2 - 8}px;top:${FY + FH + 44}px">2</div>
<div class="d" style="left:${FX - 62}px;top:${FY + FH / 2 - 16}px">1</div>
<div class="legend">${T.legend.map(([c, b, s], i) => `<div class="row"><div class="sw" style="background:${c}">${i === 1 ? '<i style="position:absolute;left:0;right:0;top:6px;height:4px;background:#ce1126"></i><i style="position:absolute;left:0;right:0;bottom:6px;height:4px;background:#ce1126"></i>' : ''}${i === 3 ? '<svg viewBox="0 0 52 52" width="48" height="48"><circle cx="20" cy="26" r="12" fill="#fff"/><circle cx="24" cy="26" r="12" fill="#0099b5"/><circle cx="38" cy="20" r="2.4" fill="#fff"/><circle cx="38" cy="30" r="2.4" fill="#fff"/><circle cx="31" cy="30" r="2.4" fill="#fff"/></svg>' : ''}</div><div><b>${b}</b><span>${s}</span></div></div>`).join('')}</div>
<div class="facts">${T.facts.map(([b, s]) => `<div class="fact"><b>${b}</b><span>${s}</span></div>`).join('')}</div>
<script>document.fonts.ready.then(() => { document.body.dataset.ready = '1'; });</script>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'uzflag-'));
writeFileSync(join(dir, 'page.html'), page);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await p.goto('file://' + join(dir, 'page.html'));
await p.waitForSelector('body[data-ready="1"]');
await p.waitForTimeout(150);
await p.screenshot(out.endsWith('.png') ? { path: out } : { path: out, type: 'jpeg', quality: 92 });
await b.close();
console.log('saved', out);
