// Scheme for the fading article: print on top of the fabric vs dye sublimation inside the fibres (cross-section).
// node scripts/fading-chart.mjs <out.jpg> [ru|uz]
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [out, lang = 'ru'] = process.argv.slice(2);
if (!out) { console.error('usage: fading-chart.mjs out.jpg [ru|uz]'); process.exit(1); }

const T = {
  ru: { title: 'Почему одни флаги выгорают, а другие нет', sub: 'Ткань флага в разрезе',
        bad: 'Печать поверх ткани', good: 'Сублимация на флажной сетке',
        badLayer: 'слой краски', fibre: 'нити ткани', dyed: 'краска внутри нитей',
        badList: ['Краска лежит слоем сверху', 'На солнце бледнеет, на сгибе трескается', 'Сзади почти белая'],
        goodList: ['Краска переходит в газ и входит в нити', 'Не смывается, не трескается, не выгорает', 'Сзади видно ≈90% рисунка'] },
  uz: { title: "Nega ba'zi bayroqlar o'chib qoladi, ba'zilari yo'q", sub: 'Bayroq matosi kesimda',
        bad: 'Mato ustidan bosma', good: "Bayroq to'riga sublimatsiya",
        badLayer: "bo'yoq qatlami", fibre: 'mato iplari', dyed: "bo'yoq iplar ichida",
        badList: ["Bo'yoq ustida qatlam bo'lib yotadi", "Quyoshda oqaradi, bukilgan joyda yoriladi", 'Orqasi deyarli oq'],
        goodList: ["Bo'yoq gazga aylanib, iplarga kiradi", "Yuvilmaydi, yorilmaydi, o'chmaydi", "Orqasidan rasmning ≈90% i ko'rinadi"] },
}[lang];

const W = 1600, H = 900;
const icon = readFileSync(join(root, 'media-src/images/Logo.svg'), 'utf8').replace(/width="24" height="24"/, 'width="100%" height="100%"');
const font = (f) => 'file://' + join(root, 'public/fonts', f);

// Cross-section: a row of thread circles. x0 = panel left, y = thread centre line.
const R = 30, N = 9, GAP = 10;
function threads(x0, y, dyed) {
  let s = '';
  for (let i = 0; i < N; i++) {
    const cx = x0 + R + i * (2 * R + GAP);
    s += dyed
      ? `<circle cx="${cx}" cy="${y}" r="${R}" fill="url(#dye)"/><circle cx="${cx}" cy="${y}" r="${R}" fill="none" stroke="#b0161c" stroke-width="2"/>`
      : `<circle cx="${cx}" cy="${y}" r="${R}" fill="url(#raw)"/><circle cx="${cx}" cy="${y}" r="${R}" fill="none" stroke="#c4cad1" stroke-width="2"/>`;
  }
  return s;
}
const rowW = N * 2 * R + (N - 1) * GAP; // 620
const LX = 80, RX = 900, TY = 500;

// Paint layer on top of the left threads, with cracks and two lifted flakes.
const layerY = TY - R - 22;
let cracks = '';
for (const cx of [LX + 130, LX + 300, LX + 470]) cracks += `<path d="M${cx},${layerY - 2} l8,9 -7,8 9,9" stroke="#f3f5f7" stroke-width="5" fill="none"/>`;
const paint = `<rect x="${LX - 6}" y="${layerY}" width="${rowW + 12}" height="20" rx="4" fill="url(#fade)"/>${cracks}
  <path d="M${LX + 205},${layerY - 2} l46,-26 6,12 -44,22 Z" fill="#ef7f83"/>
  <path d="M${LX + 548},${layerY - 2} l32,-18 5,10 -30,15 Z" fill="#ef7f83"/>`;

// Sun rays hitting both panels.
const rays = (x) => [0, 1, 2, 3].map((i) => `<path d="M${x + 120 + i * 130},${TY - 190} l-30,70" stroke="#f5b400" stroke-width="5" stroke-linecap="round" marker-end="url(#ar)"/>`).join('');

const list = (items, ok) => items.map((t) => `<li><i class="${ok ? 'ok' : 'no'}">${ok ? '✓' : '✕'}</i>${t}</li>`).join('');

const page = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: YS; src: url('${font('YSDisplay-Bold.woff2')}'); font-weight: 700; }
@font-face { font-family: YS; src: url('${font('YSDisplay-Regular.woff2')}'); font-weight: 400; }
* { margin: 0; box-sizing: border-box; }
body { width: ${W}px; height: ${H}px; position: relative; overflow: hidden; font-family: YS, sans-serif; color: #111920; background: linear-gradient(#fbf6ea, #f3f5f7 300px); }
h1 { position: absolute; left: 48px; top: 40px; font-size: 44px; letter-spacing: -.01em; }
.sub { position: absolute; left: 50px; top: 98px; font-size: 22px; color: #5b6774; }
.brand { position: absolute; right: 48px; top: 48px; display: flex; align-items: center; gap: 8px; font-size: 24px; font-weight: 700; }
.brand i { font-style: normal; color: #FF6A00; } .brand .ic { width: 26px; height: 26px; display: block; flex: none; }
.group { position: absolute; top: 160px; height: 46px; width: 680px; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700; color: #fff; border-radius: 12px; }
.g1 { left: 50px; background: #5b6774; } .g2 { left: 870px; background: #FF6A00; }
body > svg { position: absolute; inset: 0; }
.lbl { position: absolute; font-size: 18px; color: #4b5763; white-space: nowrap; }
ul { position: absolute; top: 640px; width: 680px; list-style: none; display: flex; flex-direction: column; gap: 16px; font-size: 24px; }
li { display: flex; align-items: center; gap: 14px; }
li i { flex: none; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-style: normal; font-weight: 700; color: #fff; font-size: 20px; }
i.no { background: #9aa4ae; } i.ok { background: #1aa260; }
.vs { position: absolute; left: 799px; top: 160px; bottom: 40px; width: 2px; background: repeating-linear-gradient(#c9cfd6 0 8px, transparent 8px 16px); }
</style></head><body>
<h1>${T.title}</h1><div class="sub">${T.sub}</div>
<div class="brand"><span class="ic">${icon}</span><span><b>Parus</b> <i>Bayroq</i></span></div>
<div class="group g1">${T.bad}</div><div class="group g2">${T.good}</div><div class="vs"></div>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>
<radialGradient id="raw" cx=".35" cy=".35"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e3e7eb"/></radialGradient>
<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4a3a5"/><stop offset="1" stop-color="#e0464b"/></linearGradient>
<radialGradient id="dye" cx=".35" cy=".35"><stop offset="0" stop-color="#ff5a5f"/><stop offset="1" stop-color="#c8161d"/></radialGradient>
<marker id="ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="#f5b400"/></marker>
</defs>
<circle cx="${W / 2}" cy="292" r="34" fill="#f5b400"/>
${rays(LX)}${rays(RX)}
${paint}${threads(LX, TY, false)}${threads(RX, TY, true)}
</svg>
<div class="lbl" style="left:${LX + 260}px;top:${layerY - 34}px">↓ ${T.badLayer}</div>
<div class="lbl" style="left:${LX}px;top:${TY + R + 14}px">↑ ${T.fibre}</div>
<div class="lbl" style="left:${RX}px;top:${TY + R + 14}px">↑ ${T.dyed}</div>
<ul style="left:60px">${list(T.badList, false)}</ul>
<ul style="left:880px">${list(T.goodList, true)}</ul>
<script>document.fonts.ready.then(() => { document.body.dataset.ready = '1'; });</script>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'fade-'));
writeFileSync(join(dir, 'page.html'), page);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await p.goto('file://' + join(dir, 'page.html'));
await p.waitForSelector('body[data-ready="1"]');
await p.waitForTimeout(150);
await p.screenshot(out.endsWith('.png') ? { path: out } : { path: out, type: 'jpeg', quality: 92 });
await b.close();
console.log('saved', out);
