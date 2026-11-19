// Scheme for the single- vs double-sided flag article: how each flag looks from the front and from the back.
// node scripts/sides-chart.mjs <out.jpg> [ru|uz]
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [out, lang = 'ru'] = process.argv.slice(2);
if (!out) { console.error('usage: sides-chart.mjs out.jpg [ru|uz]'); process.exit(1); }

const T = {
  ru: { title: 'Односторонний и двусторонний флаг', sub: 'Как флаг-парус выглядит с двух сторон',
        single: 'Односторонний', double: 'Двусторонний',
        front: 'Спереди', frontNote: 'цвета 100%', back: 'Сзади', backNote: 'зеркально, ≈90% рисунка',
        side1: 'Сторона 1', side2: 'Сторона 2', sideNote: 'читается правильно',
        singleNote: 'Одна напечатанная сторона, сзади рисунок просвечивает',
        layers: 'Две напечатанные стороны и прослойка: на каждой можно сделать свою надпись' },
  uz: { title: 'Bir tomonlama va ikki tomonlama bayroq', sub: "Parus bayroq ikki tomondan qanday ko'rinadi",
        single: 'Bir tomonlama', double: 'Ikki tomonlama',
        front: 'Oldidan', frontNote: 'ranglar 100%', back: 'Orqasidan', backNote: "ko'zgudagidek, rasmning ≈90%",
        side1: '1-tomon', side2: '2-tomon', sideNote: "to'g'ri o'qiladi",
        singleNote: "Bitta bosilgan tomon, orqasidan rasm o'tib ko'rinadi",
        layers: "Bosilgan ikki tomon va o'rta qatlam: har tomoniga o'z yozuvini qilsa bo'ladi" },
}[lang];

const W = 1600, H = 900;
const icon = readFileSync(join(root, 'media-src/images/Logo.svg'), 'utf8').replace(/width="24" height="24"/, 'width="100%" height="100%"');
const font = (f) => 'file://' + join(root, 'public/fonts', f);

// One feather flag (pole on the left), car wash design. mirror = seen from the back of a single-sided flag.
const FW = 150, FH = 450;
function flag(text, { mirror = false, pale = false } = {}) {
  const p = `M0,${FH} L0,${FH * 0.05} Q0,0 ${FW * 0.5},0 Q${FW},0 ${FW},${FH * 0.13} L${FW},${FH * 0.93} Z`;
  return `<div class="flag${mirror ? ' mirror' : ''}${pale ? ' pale' : ''}">
  <svg width="${FW + 90}" height="${FH + 120}" viewBox="-45 -4 ${FW + 90} ${FH + 120}">
    <defs><clipPath id="c${text}${mirror}"><path d="${p}"/></clipPath></defs>
    <line x1="0" y1="${FH + 80}" x2="0" y2="4" stroke="#8d96a0" stroke-width="5" stroke-linecap="round"/>
    <g clip-path="url(#c${text}${mirror})">
      <rect x="0" y="0" width="${FW}" height="${FH}" fill="#1f6fe0"/>
      <path d="M0,${FH * 0.8} C${FW * 0.3},${FH * 0.76} ${FW * 0.6},${FH * 0.86} ${FW},${FH * 0.8} L${FW},${FH} L0,${FH} Z" fill="#fff"/>
      <path d="M0,${FH * 0.86} C${FW * 0.3},${FH * 0.82} ${FW * 0.6},${FH * 0.92} ${FW},${FH * 0.86}" stroke="#1f6fe0" stroke-width="5" fill="none"/>
      <path d="M${FW * 0.5},${FH * 0.07} C${FW * 0.42},${FH * 0.12} ${FW * 0.36},${FH * 0.15} ${FW * 0.36},${FH * 0.18} A${FW * 0.14},${FW * 0.14} 0 0 0 ${FW * 0.64},${FH * 0.18} C${FW * 0.64},${FH * 0.15} ${FW * 0.58},${FH * 0.12} ${FW * 0.5},${FH * 0.07} Z" fill="#fff"/>
      <circle cx="${FW * 0.75}" cy="${FH * 0.1}" r="7" fill="none" stroke="#fff" stroke-width="3"/><circle cx="${FW * 0.27}" cy="${FH * 0.13}" r="5" fill="none" stroke="#fff" stroke-width="3"/>
      <rect x="0" y="0" width="7" height="${FH}" fill="#0d3f8f"/>
    </g>
    <path d="M-38,${FH + 112} L-33,${FH + 86} Q0,${FH + 76} 33,${FH + 86} L38,${FH + 112} Z" fill="#20262c"/>
    <ellipse cx="0" cy="${FH + 85}" rx="32" ry="6" fill="#3a434c"/>
  </svg>
  <div class="ftxt" style="top:${FH * 0.5 - 4}px">${text}</div></div>`;
}

const col = (x, head, note, f) => `<div class="col" style="left:${x}px"><div class="cap"><b>${head}</b><span>${note}</span></div>${f}</div>`;
const page = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: YS; src: url('${font('YSDisplay-Bold.woff2')}'); font-weight: 700; }
@font-face { font-family: YS; src: url('${font('YSDisplay-Regular.woff2')}'); font-weight: 400; }
* { margin: 0; box-sizing: border-box; }
body { width: ${W}px; height: ${H}px; position: relative; overflow: hidden; font-family: YS, sans-serif; color: #111920;
  background: linear-gradient(#f6f7f9, #e8ecf0 872px, #cfd5db 872px, #c4cbd2); }
h1 { position: absolute; left: 48px; top: 40px; font-size: 44px; letter-spacing: -.01em; }
.sub { position: absolute; left: 50px; top: 98px; font-size: 22px; color: #5b6774; }
.brand { position: absolute; right: 48px; top: 48px; display: flex; align-items: center; gap: 8px; font-size: 24px; font-weight: 700; }
.brand i { font-style: normal; color: #FF6A00; } .brand .ic { width: 26px; height: 26px; display: block; flex: none; }
.group { position: absolute; top: 150px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700; color: #fff; border-radius: 12px; }
.g1 { left: 48px; width: 640px; background: #5b6774; } .g2 { left: 760px; width: 792px; background: #FF6A00; }
.col { position: absolute; top: 246px; width: 300px; display: flex; flex-direction: column; align-items: center; }
.cap { text-align: center; margin-bottom: 8px; line-height: 1.2; } .cap b { display: block; font-size: 24px; } .cap span { font-size: 18px; color: #5b6774; }
.flag { position: relative; width: ${FW + 90}px; height: ${FH + 120}px; transform: translateX(${150 - 45 - FW / 2}px); }
.flag.mirror { transform: translateX(${150 - 45 - FW / 2}px) scaleX(-1); }
.flag.pale { filter: saturate(.72) brightness(1.12); }
.ftxt { position: absolute; left: ${45 + FW * 0.5}px; transform: translate(-50%, -50%) rotate(-90deg); white-space: nowrap; color: #fff; font-weight: 700; font-size: 40px; letter-spacing: -.01em; }
.note { position: absolute; top: 202px; font-size: 18px; color: #4b5763; text-align: center; line-height: 1.25; }
.n1 { left: 48px; width: 640px; } .n2 { left: 760px; width: 792px; }
.vs { position: absolute; left: 718px; top: 150px; bottom: 40px; width: 2px; background: repeating-linear-gradient(#b7c0c9 0 8px, transparent 8px 16px); }
</style></head><body>
<h1>${T.title}</h1><div class="sub">${T.sub}</div>
<div class="brand"><span class="ic">${icon}</span><span><b>Parus</b> <i>Bayroq</i></span></div>
<div class="group g1">${T.single}</div><div class="group g2">${T.double}</div><div class="vs"></div>
${col(48, T.front, T.frontNote, flag('Автомойка'))}
${col(388, T.back, T.backNote, flag('Автомойка', { mirror: true, pale: true }))}
${col(790, T.side1, T.sideNote, flag('Автомойка'))}
${col(1170, T.side2, T.sideNote, flag('Avtomoyka'))}
<div class="note n1">${T.singleNote}</div><div class="note n2">${T.layers}</div>
<script>document.fonts.ready.then(() => { document.body.dataset.ready = '1'; });</script>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'sides-'));
writeFileSync(join(dir, 'page.html'), page);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await p.goto('file://' + join(dir, 'page.html'));
await p.waitForSelector('body[data-ready="1"]');
await p.waitForTimeout(150);
await p.screenshot(out.endsWith('.png') ? { path: out } : { path: out, type: 'jpeg', quality: 92 });
await b.close();
console.log('saved', out);
