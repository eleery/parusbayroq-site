// Size chart for the feather flag article: XS, S, M, L drawn to scale next to a person
// and a parked car, white canvases with the Parus Bayroq logo.
// node scripts/size-chart.mjs <out.jpg> [ru|uz]
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { SIZES, PRICES } from '../src/lib/prices.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [out, lang = 'ru'] = process.argv.slice(2);
if (!out) { console.error('usage: size-chart.mjs out.jpg [ru|uz]'); process.exit(1); }

const T = {
  ru: { title: 'Размеры флага-паруса', sub: 'Схема в масштабе · размер полотна в см', unit: 'см', std: 'ходовой',
        cars: 'Эту часть закрывают припаркованные машины (≈1,5 м)', person: '175 см' },
  uz: { title: "Parus bayroq o'lchamlari", sub: "Masshtabdagi sxema · mato o'lchami, sm", unit: 'sm', std: 'ommabop',
        cars: "Bu qismini to'xtab turgan mashinalar to'sadi (≈1,5 m)", person: '175 sm' },
}[lang];

const W = 1600, H = 900, G = 822, k = 2; // ground line, px per cm
const LIFT = 35; // base + bare pole under the canvas, cm
const icon = readFileSync(join(root, 'media-src/images/Logo.svg'), 'utf8').replace(/width="24" height="24"/, 'width="100%" height="100%"');
const font = (f) => 'file://' + join(root, 'public/fonts', f);

// Feather flag sizes from prices.mjs ("280×70").
const sizes = PRICES.find((p) => p.key === 'parus').rows.map(([size], i) => { const [h, w] = size.split('×').map(Number); return { s: SIZES[i], h, w }; });
if (sizes.some((x) => !x.h)) throw new Error('no sizes in prices.mjs');

const slots = [690, 935, 1185, 1435];
let svg = '', html = '';
sizes.forEach(({ s, h, w }, i) => {
  const cw = w * k, ch = h * k, x0 = slots[i] - cw / 2, top = G - (LIFT + h) * k, bot = G - LIFT * k;
  const path = `M${x0},${bot} L${x0},${top + ch * 0.05} Q${x0},${top} ${x0 + cw * 0.5},${top} Q${x0 + cw},${top} ${x0 + cw},${top + ch * 0.13} L${x0 + cw},${bot - ch * 0.07} Z`;
  svg += `<clipPath id="c${i}"><path d="${path}"/></clipPath>
  <line x1="${x0}" y1="${G - 14}" x2="${x0}" y2="${top + 4}" stroke="#8d96a0" stroke-width="5" stroke-linecap="round"/>
  <path d="${path}" fill="url(#fab)" stroke="#d3d8de" stroke-width="1.5"/>
  <rect x="${x0 - 2}" y="${top}" width="9" height="${ch}" fill="#FF6A00" clip-path="url(#c${i})"/>
  <path d="M${x0 - 46},${G} L${x0 - 40},${G - 26} Q${x0},${G - 36} ${x0 + 40},${G - 26} L${x0 + 46},${G} Z" fill="#20262c"/>
  <ellipse cx="${x0}" cy="${G - 27}" rx="40" ry="7" fill="#3a434c"/>`;
  const lx = x0 + cw * 0.5, ly = top + ch * 0.6, iy = top + ch * 0.2;
  html += `<div class="fic" style="left:${lx}px;top:${iy}px;width:${Math.round(cw * 0.42)}px;height:${Math.round(cw * 0.42)}px">${icon}</div>
  <div class="logo" style="left:${lx}px;top:${ly}px;font-size:${Math.round(cw * 0.3)}px"><b>Parus</b>&nbsp;<i>Bayroq</i></div>
  <div class="lbl${s === 'M' ? ' std' : ''}" style="left:${slots[i]}px;top:${top - 18}px">${s === 'M' ? `<em>${T.std}</em>` : ''}<strong>${s}</strong><span>${h} × ${w} ${T.unit}</span></div>`;
});

// Car seen from behind (≈170 × 150 cm) and a person (175 cm).
const cx = 215, car = `<g fill="#c3cad2">
  <rect x="${cx - 170}" y="${G - 30}" width="40" height="30" rx="6" fill="#30363d"/><rect x="${cx + 130}" y="${G - 30}" width="40" height="30" rx="6" fill="#30363d"/>
  <rect x="${cx - 172}" y="${G - 192}" width="344" height="164" rx="26"/>
  <path d="M${cx - 140},${G - 190} L${cx - 112},${G - 292} Q${cx},${G - 306} ${cx + 112},${G - 292} L${cx + 140},${G - 190} Z"/>
  <path d="M${cx - 120},${G - 196} L${cx - 100},${G - 280} Q${cx},${G - 292} ${cx + 100},${G - 280} L${cx + 120},${G - 196} Z" fill="#9aa6b2"/>
  <rect x="${cx - 160}" y="${G - 172}" width="64" height="26" rx="8" fill="#e0574a"/><rect x="${cx + 96}" y="${G - 172}" width="64" height="26" rx="8" fill="#e0574a"/>
  <rect x="${cx - 52}" y="${G - 120}" width="104" height="32" rx="4" fill="#eef1f4"/>
  <rect x="${cx - 172}" y="${G - 62}" width="344" height="30" rx="12" fill="#adb6bf"/></g>`;
const px = 470, person = `<g fill="#a3adb7">
  <circle cx="${px}" cy="${G - 175 * k + 22}" r="21"/>
  <rect x="${px - 44}" y="${G - 148 * k}" width="88" height="${110 * k - 100}" rx="30"/>
  <rect x="${px - 64}" y="${G - 146 * k}" width="20" height="${48 * k}" rx="10"/><rect x="${px + 44}" y="${G - 146 * k}" width="20" height="${48 * k}" rx="10"/>
  <rect x="${px - 36}" y="${G - 96 * k}" width="32" height="${96 * k}" rx="14"/><rect x="${px + 4}" y="${G - 96 * k}" width="32" height="${96 * k}" rx="14"/></g>`;

const carY = G - 150 * k;
const page = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: YS; src: url('${font('YSDisplay-Bold.woff2')}'); font-weight: 700; }
@font-face { font-family: YS; src: url('${font('YSDisplay-Regular.woff2')}'); font-weight: 400; }
* { margin: 0; box-sizing: border-box; }
body { width: ${W}px; height: ${H}px; position: relative; overflow: hidden; font-family: YS, sans-serif; color: #111920;
  background: linear-gradient(#f6f7f9, #e8ecf0 ${G}px, #cfd5db ${G}px, #c4cbd2); }
body > svg { position: absolute; inset: 0; }
.logo { position: absolute; transform: translate(-50%, -50%) rotate(-90deg); white-space: nowrap; display: flex; align-items: center; gap: .18em; font-weight: 700; letter-spacing: -.01em; line-height: 1; }
.logo i { font-style: normal; color: #FF6A00; }
.fic { position: absolute; transform: translate(-50%, -50%); }
.lbl { position: absolute; transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; line-height: 1; }
.lbl strong { font-size: 50px; } .lbl span { font-size: 22px; font-weight: 400; color: #46525e; margin-top: 6px; }
.lbl em { font-style: normal; font-size: 20px; font-weight: 700; color: #fff; background: #FF6A00; border-radius: 99px; padding: 7px 16px; margin-bottom: 10px; }
.lbl.std strong { color: #FF6A00; font-size: 60px; }
h1 { position: absolute; left: 48px; top: 46px; font-size: 46px; letter-spacing: -.01em; }
.sub { position: absolute; left: 50px; top: 106px; font-size: 22px; color: #5b6774; }
.brand { position: absolute; left: 50px; top: 150px; display: flex; align-items: center; gap: 8px; font-size: 24px; font-weight: 700; }
.brand i { font-style: normal; color: #FF6A00; } .brand .ic { width: 26px; height: 26px; display: block; flex: none; }
.band { position: absolute; left: 0; right: 0; top: ${carY}px; height: ${G - carY}px; background: rgba(120, 132, 146, .16); border-top: 2px dashed #7d8996; }
.legend { position: absolute; left: 50px; top: 206px; display: flex; align-items: center; gap: 12px; font-size: 20px; color: #4b5763; max-width: 640px; line-height: 1.25; }
.legend i { flex: none; width: 46px; height: 26px; background: rgba(120, 132, 146, .2); border-top: 2px dashed #7d8996; }
.pl { position: absolute; left: ${px}px; top: ${G - 175 * k - 34}px; transform: translateX(-50%); font-size: 19px; color: #5b6774; }
</style></head><body>
<h1>${T.title}</h1><div class="sub">${T.sub}</div>
<div class="brand"><span class="ic">${icon}</span><span><b>Parus</b> <i>Bayroq</i></span></div>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>
<linearGradient id="fab" x1="0" x2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#f7f8fa"/><stop offset="1" stop-color="#e9ecf0"/></linearGradient>
</defs>${car}${person}${svg}</svg>
${html}
<div class="band"></div><div class="legend"><i></i><span>${T.cars}</span></div>
<div class="pl">${T.person}</div>
<script>document.fonts.ready.then(() => { document.body.dataset.ready = '1'; });</script>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'chart-'));
writeFileSync(join(dir, 'page.html'), page);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await p.goto('file://' + join(dir, 'page.html'));
await p.waitForSelector('body[data-ready="1"]');
await p.waitForTimeout(150);
await p.screenshot(out.endsWith('.png') ? { path: out } : { path: out, type: 'jpeg', quality: 92 });
await b.close();
console.log('saved', out);
