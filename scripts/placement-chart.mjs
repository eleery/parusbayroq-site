// Top-down scheme: where to put flags at a roadside car wash / tire shop.
// node scripts/placement-chart.mjs <out.jpg> [ru|uz]
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [out, lang = 'ru'] = process.argv.slice(2);
if (!out) { console.error('usage: placement-chart.mjs out.jpg [ru|uz]'); process.exit(1); }

const T = {
  ru: { title: 'Где поставить флаги у автомойки или сервиса', sub: 'Вид сверху',
        road: 'дорога', building: 'Автомойка · шиномонтаж', entry: 'въезд',
        notes: [['Заранее, до поворота', 'водитель замечает флаг и успевает перестроиться'], ['У въезда', 'показывает, куда сворачивать'], ['Вдоль фасада', 'если боксов несколько — видно всю точку']] },
  uz: { title: "Avtomoyka yoki servis oldiga bayroqni qayerga qo'yish kerak", sub: 'Tepadan ko\'rinish',
        road: "yo'l", building: 'Avtomoyka · shinomontaj', entry: 'kirish',
        notes: [['Oldinroq, burilishdan avval', "haydovchi bayroqni ko'rib, qatorni almashtirishga ulguradi"], ['Kirish oldida', "qayerga burilishni ko'rsatadi"], ["Fasad bo'ylab", "boks ko'p bo'lsa — butun nuqta ko'rinadi"]] },
}[lang];

const W = 1600, H = 900;
const icon = readFileSync(join(root, 'media-src/images/Logo.svg'), 'utf8').replace(/width="24" height="24"/, 'width="100%" height="100%"');
const font = (f) => 'file://' + join(root, 'public/fonts', f);

// Geometry: road band, curb, building with a driveway gap.
const RY = 200, RH = 190, CURB = RY + RH; // road from y=200 to 390
const BX = 760, BW = 760, BY = 470, BH = 210; // building
const EX = 600, EW = 140; // driveway x..x+EW
const pin = (x, y, n) => `<g transform="translate(${x},${y})"><circle r="30" fill="#FF6A00"/><text y="11" text-anchor="middle" font-size="32" font-weight="700" fill="#fff" font-family="YS">${n}</text></g>`;
const car = (x, y) => `<g transform="translate(${x},${y})"><rect x="-44" y="-20" width="88" height="40" rx="12" fill="#5b6774"/><rect x="-14" y="-16" width="30" height="32" rx="6" fill="#9aa4ae"/></g>`;

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect x="0" y="${RY}" width="${W}" height="${RH}" fill="#4a535c"/>
  <line x1="0" y1="${RY + RH / 2}" x2="${W}" y2="${RY + RH / 2}" stroke="#e8ecf0" stroke-width="4" stroke-dasharray="40 30"/>
  <rect x="0" y="${CURB}" width="${W}" height="14" fill="#c3cad2"/>
  <rect x="${EX}" y="${CURB}" width="${EW}" height="${BY - CURB + 40}" fill="#6b747d"/>
  <path d="M120,${RY + RH * 0.75} h120 l-16,-14 M240,${RY + RH * 0.75} l-16,14" stroke="#fff" stroke-width="5" fill="none"/>
  <path d="M${W - 120},${RY + RH * 0.25} h-120 l16,-14 M${W - 240},${RY + RH * 0.25} l16,14" stroke="#fff" stroke-width="5" fill="none"/>
  ${car(420, RY + RH * 0.75)}${car(1180, RY + RH * 0.25)}
  <path d="M${EX - 120},${RY + RH * 0.75} C${EX + 20},${RY + RH * 0.75} ${EX + EW / 2},${CURB - 20} ${EX + EW / 2},${CURB + 70}" stroke="#FF6A00" stroke-width="5" stroke-dasharray="14 10" fill="none"/>
  <path d="M${EX + EW / 2 - 14},${CURB + 56} l14,18 14,-18" stroke="#FF6A00" stroke-width="5" fill="none"/>
  <rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="10" fill="#dfe6ec" stroke="#b6bfc8" stroke-width="3"/>
  ${[0, 1, 2].map((i) => `<rect x="${BX + 40 + i * 240}" y="${BY - 6}" width="200" height="20" fill="#9aa4ae"/>`).join('')}
  ${pin(300, CURB + 46, 1)}${pin(EX - 34, CURB + 46, 2)}${pin(BX + 200, BY - 58, 3)}${pin(BX + 440, BY - 58, 3)}
</svg>`;

const page = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: YS; src: url('${font('YSDisplay-Bold.woff2')}'); font-weight: 700; }
@font-face { font-family: YS; src: url('${font('YSDisplay-Regular.woff2')}'); font-weight: 400; }
* { margin: 0; box-sizing: border-box; }
body { width: ${W}px; height: ${H}px; position: relative; overflow: hidden; font-family: YS, sans-serif; color: #111920; background: #eef1e6; }
h1 { position: absolute; left: 48px; top: 40px; font-size: 42px; letter-spacing: -.01em; max-width: 1200px; }
.sub { position: absolute; left: 50px; top: 100px; font-size: 22px; color: #5b6774; }
.brand { position: absolute; right: 48px; top: 48px; display: flex; align-items: center; gap: 8px; font-size: 24px; font-weight: 700; }
.brand i { font-style: normal; color: #FF6A00; } .brand .ic { width: 26px; height: 26px; display: block; flex: none; }
body > svg { position: absolute; inset: 0; }
.lbl { position: absolute; font-size: 20px; color: #fff; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; opacity: .85; }
.bld { position: absolute; left: ${BX}px; top: ${BY + BH / 2 - 18}px; width: ${BW}px; text-align: center; font-size: 30px; font-weight: 700; color: #46525e; }
.entry { position: absolute; left: ${EX}px; top: ${BY + 8}px; width: ${EW}px; text-align: center; font-size: 20px; color: #fff; font-weight: 700; }
.notes { position: absolute; left: 48px; bottom: 34px; display: flex; gap: 22px; width: ${W - 96}px; }
.note { flex: 1; background: #fff; border-radius: 16px; padding: 16px 20px; display: flex; gap: 14px; align-items: flex-start; box-shadow: 0 4px 14px rgba(17,25,32,.06); }
.note i { flex: none; width: 38px; height: 38px; border-radius: 50%; background: #FF6A00; color: #fff; font-style: normal; font-weight: 700; font-size: 22px; display: flex; align-items: center; justify-content: center; }
.note b { display: block; font-size: 22px; } .note span { display: block; font-size: 18px; color: #5b6774; margin-top: 4px; line-height: 1.25; }
</style></head><body>
<h1>${T.title}</h1><div class="sub">${T.sub}</div>
<div class="brand"><span class="ic">${icon}</span><span><b>Parus</b> <i>Bayroq</i></span></div>
${svg}
<div class="lbl" style="left:${W / 2 - 40}px;top:${RY + 14}px">${T.road}</div>
<div class="bld">${T.building}</div>
<div class="entry">${T.entry}</div>
<div class="notes">${T.notes.map(([b, s], i) => `<div class="note"><i>${i + 1}</i><div><b>${b}</b><span>${s}</span></div></div>`).join('')}</div>
<script>document.fonts.ready.then(() => { document.body.dataset.ready = '1'; });</script>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'place-'));
writeFileSync(join(dir, 'page.html'), page);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await p.goto('file://' + join(dir, 'page.html'));
await p.waitForSelector('body[data-ready="1"]');
await p.waitForTimeout(150);
await p.screenshot(out.endsWith('.png') ? { path: out } : { path: out, type: 'jpeg', quality: 92 });
await b.close();
console.log('saved', out);
