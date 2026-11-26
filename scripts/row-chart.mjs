// Front view from the road: one L flag vs a row of three M flags along a car dealership lot.
// Facts from the owner (19.11.2026): 2–3 M flags along a facade are more visible than one L; M canvas 280×70, L 300×70.
// node scripts/row-chart.mjs <out.jpg> [ru|uz]
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [out, lang = 'ru'] = process.argv.slice(2);
if (!out) { console.error('usage: row-chart.mjs out.jpg [ru|uz]'); process.exit(1); }

const T = {
  ru: { title: 'Вдоль площадки: один большой флаг или ряд из трёх M', sub: 'Вид с дороги',
        panels: [['Один флаг L', 'полотно 300×70', 'Заметен в одном месте, остальная площадка теряется'],
                 ['Три флага M', 'полотно 280×70', 'Ряд флагов виден по всей длине площадки']],
        notes: [['L выше M всего на 20 см', 'полотно 300×70 против 280×70'], ['Ряд — это граница салона', 'видно, где начинается площадка и где въезд'], ['Одна надпись или две', '«Автосалон» в ряду, «Тест-драйв» у въезда']] },
  uz: { title: "Maydon bo'ylab: bitta katta bayroqmi yoki uchta M qatori", sub: "Yo'ldan ko'rinish",
        panels: [['Bitta L bayroq', 'mato 300×70', "Bir joyda ko'rinadi, maydonning qolgani yo'qoladi"],
                 ['Uchta M bayroq', 'mato 280×70', "Bayroqlar qatori butun maydon bo'ylab ko'rinadi"]],
        notes: [["L M'dan atigi 20 sm baland", 'mato 300×70 va 280×70'], ['Qator — avtosalon chegarasi', "maydon qayerdan boshlanishi va kirish ko'rinadi"], ['Bitta yozuv yoki ikkita', "qatorda «Avtosalon», kirishda «Test-drayv»"]] },
}[lang];

const W = 1600, H = 900;
const icon = readFileSync(join(root, 'media-src/images/Logo.svg'), 'utf8').replace(/width="24" height="24"/, 'width="100%" height="100%"');
const font = (f) => 'file://' + join(root, 'public/fonts', f);

// Two panels side by side. 1 m = 100 px. M with construction ≈ 3.75 m, L ≈ 3.95 m.
const PW = 724, PY = 170, PH = 560, G = PY + PH - 70; // ground line inside a panel
const PX = [48, 48 + PW + 56];
const FL = []; // flag boxes for the HTML overlay (logo on each canvas)
const flag = (x, hM, wPx = 70) => {
  const top = G - hM * 100, cw = wPx;
  FL.push({ x, top, cw, h: hM * 100 });
  return `<g>
    <path d="M${x},${G - 55} L${x},${top + 22} Q${x},${top} ${x + cw * 0.5},${top} Q${x + cw},${top} ${x + cw},${top + 44} L${x + cw},${G - 90} Z" fill="#fff" stroke="#c9cfd6" stroke-width="2"/>
    <rect x="${x}" y="${top + 16}" width="6" height="${hM * 100 - 72}" fill="#FF6A00"/>
    <line x1="${x}" y1="${G - 10}" x2="${x}" y2="${top + 4}" stroke="#7d8790" stroke-width="3" stroke-linecap="round"/>
    <path d="M${x - 22},${G} L${x - 19},${G - 16} Q${x},${G - 22} ${x + 19},${G - 16} L${x + 22},${G} Z" fill="#20262c"/></g>`;
};
const car = (x, w, c) => `<g transform="translate(${x},${G - 18})"><path d="M0,0 L0,-26 Q4,-34 ${w * 0.22},-36 L${w * 0.32},-58 Q${w * 0.36},-64 ${w * 0.44},-64 L${w * 0.7},-64 Q${w * 0.77},-64 ${w * 0.82},-54 L${w * 0.9},-38 Q${w},-36 ${w},-24 L${w},0 Z" fill="${c}"/>
  <circle cx="${w * 0.2}" cy="0" r="13" fill="#3a434c"/><circle cx="${w * 0.8}" cy="0" r="13" fill="#3a434c"/></g>`;
const cars = (px) => [0, 1, 2, 3].map((i) => car(px + 40 + i * 165, 150, ['#c3cad2', '#9aa4ae', '#dfe3e8', '#aeb6bf'][i])).join('');
const panel = (i) => {
  const px = PX[i];
  const flags = i === 0 ? flag(px + PW / 2 - 35, 3.95) : [0.18, 0.5, 0.82].map((f) => flag(px + PW * f - 35, 3.75)).join('');
  return `<rect x="${px}" y="${PY}" width="${PW}" height="${PH}" rx="18" fill="#fff"/>
    <rect x="${px}" y="${G}" width="${PW}" height="${PY + PH - G}" fill="#e3e7eb"/>
    <rect x="${px + 20}" y="${G - 150}" width="${PW - 40}" height="${150 - 18}" rx="6" fill="#f1f3f5"/>
    ${cars(px)}${flags}`;
};
const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><clipPath id="c0"><rect x="${PX[0]}" y="${PY}" width="${PW}" height="${PH}" rx="18"/></clipPath><clipPath id="c1"><rect x="${PX[1]}" y="${PY}" width="${PW}" height="${PH}" rx="18"/></clipPath></defs>
  <g clip-path="url(#c0)">${panel(0)}</g><g clip-path="url(#c1)">${panel(1)}</g></svg>`;

const page = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: YS; src: url('${font('YSDisplay-Bold.woff2')}'); font-weight: 700; }
@font-face { font-family: YS; src: url('${font('YSDisplay-Regular.woff2')}'); font-weight: 400; }
* { margin: 0; box-sizing: border-box; }
body { width: ${W}px; height: ${H}px; position: relative; overflow: hidden; font-family: YS, sans-serif; color: #111920; background: #eef1f4; }
h1 { position: absolute; left: 48px; top: 40px; font-size: 42px; letter-spacing: -.01em; max-width: 1240px; }
.sub { position: absolute; left: 50px; top: 100px; font-size: 22px; color: #5b6774; }
.brand { position: absolute; right: 48px; top: 48px; display: flex; align-items: center; gap: 8px; font-size: 24px; font-weight: 700; }
.brand i { font-style: normal; color: #FF6A00; } .brand .ic { width: 26px; height: 26px; display: block; flex: none; }
body > svg { position: absolute; inset: 0; }
.ph { position: absolute; top: ${PY + 22}px; width: ${PW - 56}px; }
.ph b { font-size: 28px; } .ph span { font-size: 20px; color: #5b6774; margin-left: 10px; }
.cap { position: absolute; top: ${G + 18}px; width: ${PW - 56}px; font-size: 20px; color: #46525e; }
.fic { position: absolute; width: 30px; height: 30px; }
.flogo { position: absolute; transform: translate(-50%, -50%) rotate(-90deg); white-space: nowrap; font-size: 24px; font-weight: 700; color: #111920; }
.flogo i { font-style: normal; color: #FF6A00; }
.notes { position: absolute; left: 48px; bottom: 34px; display: flex; gap: 22px; width: ${W - 96}px; }
.note { flex: 1; background: #fff; border-radius: 16px; padding: 16px 20px; display: flex; gap: 14px; align-items: flex-start; }
.note i { flex: none; width: 38px; height: 38px; border-radius: 50%; background: #FF6A00; color: #fff; font-style: normal; font-weight: 700; font-size: 22px; display: flex; align-items: center; justify-content: center; }
.note b { display: block; font-size: 22px; } .note span { display: block; font-size: 18px; color: #5b6774; margin-top: 4px; line-height: 1.25; }
</style></head><body>
<h1>${T.title}</h1><div class="sub">${T.sub}</div>
<div class="brand"><span class="ic">${icon}</span><span><b>Parus</b> <i>Bayroq</i></span></div>
${svg}
${T.panels.map(([b, s, c], i) => `<div class="ph" style="left:${PX[i] + 28}px"><b>${b}</b><span>${s}</span></div><div class="cap" style="left:${PX[i] + 28}px">${c}</div>`).join('')}
${FL.map((f) => `<div class="fic" style="left:${f.x + f.cw / 2 - 12}px;top:${f.top + 40}px">${icon}</div><div class="flogo" style="left:${f.x + f.cw / 2 + 3}px;top:${f.top + f.h * 0.42}px"><b>Parus</b> <i>Bayroq</i></div>`).join('')}
<div class="notes">${T.notes.map(([b, s], i) => `<div class="note"><i>${i + 1}</i><div><b>${b}</b><span>${s}</span></div></div>`).join('')}</div>
<script>document.fonts.ready.then(() => { document.body.dataset.ready = '1'; });</script>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'row-'));
writeFileSync(join(dir, 'page.html'), page);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await p.goto('file://' + join(dir, 'page.html'));
await p.waitForSelector('body[data-ready="1"]');
await p.waitForTimeout(150);
await p.screenshot(out.endsWith('.png') ? { path: out } : { path: out, type: 'jpeg', quality: 92 });
await b.close();
console.log('saved', out);
