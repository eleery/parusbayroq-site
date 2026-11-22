// Four-step schemes for blog articles: "mockup" (from a photo to a flag) and "install" (setting up a feather flag).
// node scripts/steps-chart.mjs <out.jpg> [ru|uz] [mockup|install]
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [out, lang = 'ru', preset = 'mockup'] = process.argv.slice(2);
if (!out) { console.error('usage: steps-chart.mjs out.jpg [ru|uz] [mockup|install]'); process.exit(1); }

const TEXTS = { mockup: {
  ru: { title: 'Макет флага: от фото до флага', sub: 'Дизайн бесплатно, печать — только после вашего «да»',
        steps: [['Присылаете, что есть', 'логотип, фото вывески или скриншот'], ['Дизайнер делает макет', 'бесплатно, под размер флага'],
                ['Вы согласовываете', 'есть замечания — поправим'], ['Печать и доставка', 'обычно 3 дня, срочно — от 2 часов']] },
  uz: { title: 'Bayroq maketi: rasmdan bayroqqacha', sub: "Dizayn bepul, bosma — faqat siz «ha» deganingizdan keyin",
        steps: [['Bor narsani yuborasiz', 'logotip, peshlavha rasmi yoki skrinshot'], ['Dizayner maket qiladi', "bepul, bayroq o'lchamiga moslab"],
                ['Siz tasdiqlaysiz', "e'tirozingiz bo'lsa — tuzatamiz"], ['Bosma va yetkazish', "odatda 3 kun, shoshilinch — 2 soatdan"]] },
}, install: {
  ru: { title: 'Установка флага-паруса за 2 минуты', sub: 'Без инструментов — можно установить самому',
        steps: [['Соберите флагшток', 'соедините секции между собой'], ['Наденьте полотно', 'проденьте флагшток в карман и подвяжите низ'],
                ['Поставьте в основание', 'вставьте флагшток в бочку вертикально'], ['Залейте воду или песок', 'чтобы флаг устойчиво стоял на ветру']] },
  uz: { title: "Parus bayroqni 2 daqiqada o'rnatish", sub: "Asbobsiz — o'zingiz o'rnatsangiz bo'ladi",
        steps: [["Flagshtokni yig'ing", "qismlarini bir-biriga ulang"], ['Matoni kiygizing', "flagshtokni cho'ntagiga o'tkazib, pastini bog'lang"],
                ["Asosga qo'ying", "flagshtokni bochkaga tik qilib suqing"], ["Suv yoki qum soling", "shamolda mahkam turishi uchun"]] },
} };
const T = TEXTS[preset][lang];

const W = 1600, H = 900;
const icon = readFileSync(join(root, 'media-src/images/Logo.svg'), 'utf8').replace(/width="24" height="24"/, 'width="100%" height="100%"');
const font = (f) => 'file://' + join(root, 'public/fonts', f);

// Small feather flag used inside the icons (coffee shop design from the cover photo).
const miniFlag = (x, y, h, color = '#6b3f2a') => {
  const w = h * 0.3;
  return `<g transform="translate(${x},${y})">
    <path d="M0,${h} L0,${h * 0.05} Q0,0 ${w * 0.5},0 Q${w},0 ${w},${h * 0.13} L${w},${h * 0.93} Z" fill="${color}"/>
    <path d="M0,${h * 0.84} C${w * 0.4},${h * 0.8} ${w * 0.7},${h * 0.9} ${w},${h * 0.84} L${w},${h * 0.93} L0,${h} Z" fill="#f1e3cf"/>
    <rect x="${w * 0.3}" y="${h * 0.1}" width="${w * 0.4}" height="${w * 0.3}" rx="3" fill="#fff"/>
    <rect x="${w * 0.42}" y="${h * 0.24}" width="${w * 0.16}" height="${h * 0.52}" rx="3" fill="#fff" opacity=".95"/>
    <line x1="0" y1="${h + 14}" x2="0" y2="0" stroke="#7d8790" stroke-width="3"/></g>`;
};
const ICONS = { mockup: [
  // phone with a shop photo
  `<rect x="60" y="20" width="100" height="170" rx="16" fill="#1f262d"/><rect x="68" y="36" width="84" height="134" rx="6" fill="#dfe6ec"/>
   <rect x="74" y="62" width="72" height="22" rx="3" fill="#6b3f2a"/><circle cx="110" cy="73" r="6" fill="#fff"/>
   <rect x="80" y="90" width="60" height="60" fill="#b8c4ce"/><rect x="100" y="110" width="20" height="40" fill="#8796a3"/>`,
  // monitor with a flag mockup
  `<rect x="20" y="30" width="180" height="120" rx="10" fill="#1f262d"/><rect x="30" y="40" width="160" height="100" rx="4" fill="#fff"/>
   <rect x="95" y="150" width="30" height="22" fill="#9aa4ae"/><rect x="70" y="172" width="80" height="8" rx="4" fill="#9aa4ae"/>${miniFlag(100, 46, 86)}`,
  // approval check
  `<circle cx="110" cy="105" r="72" fill="#1aa260"/><path d="M76,106 l24,24 46,-50" stroke="#fff" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  // printed flag on its base
  `${miniFlag(96, 12, 150)}<path d="M66,196 L70,178 Q96,172 122,178 L126,196 Z" fill="#20262c"/>`,
], install: [
  // pole sections being joined
  `<rect x="40" y="150" width="70" height="10" rx="5" fill="#9aa4ae" transform="rotate(-35 75 155)"/>
   <rect x="96" y="98" width="70" height="10" rx="5" fill="#9aa4ae" transform="rotate(-35 131 103)"/>
   <rect x="122" y="40" width="70" height="10" rx="5" fill="#b6bfc8" transform="rotate(-35 157 45)"/>
   <path d="M150,92 l14,-10 M150,92 l2,-16" stroke="#FF6A00" stroke-width="6" stroke-linecap="round"/>`,
  // canvas on the pole, bottom tied with a cord
  `${miniFlag(96, 10, 160, '#22a45a')}<path d="M96,166 q-14,10 0,20 q14,8 0,16" stroke="#FF6A00" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  // pole standing upright in the barrel base
  `${miniFlag(104, 18, 140, '#22a45a')}<path d="M66,200 L72,170 Q104,160 136,170 L142,200 Z" fill="#20262c"/><ellipse cx="104" cy="170" rx="32" ry="6" fill="#3a434c"/>
   <path d="M170,40 v120 M162,52 l8,-12 8,12 M162,148 l8,12 8,-12" stroke="#FF6A00" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  // water poured into the base
  `<path d="M40,200 L48,150 Q100,136 152,150 L160,200 Z" fill="#20262c"/><ellipse cx="100" cy="150" rx="52" ry="9" fill="#3a434c"/>
   <path d="M118,26 L178,26 L170,86 L126,86 Z" fill="#dfe6ec" stroke="#9aa4ae" stroke-width="4" transform="rotate(-30 148 56)"/>
   <path d="M124,96 q-8,16 -14,40" stroke="#3b8ee8" stroke-width="8" fill="none" stroke-linecap="round"/>
   <circle cx="96" cy="132" r="5" fill="#3b8ee8"/><circle cx="118" cy="140" r="4" fill="#3b8ee8"/>`,
] };
const icons = ICONS[preset];

const cards = T.steps.map(([h, p], i) => `<div class="card" style="left:${48 + i * 384}px">
  <div class="num">${i + 1}</div>
  <svg class="ic" width="220" height="210" viewBox="0 0 220 210">${icons[i]}</svg>
  <b>${h}</b><span>${p}</span></div>${i < 3 ? `<div class="arrow" style="left:${48 + i * 384 + 340}px">→</div>` : ''}`).join('');

const page = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: YS; src: url('${font('YSDisplay-Bold.woff2')}'); font-weight: 700; }
@font-face { font-family: YS; src: url('${font('YSDisplay-Regular.woff2')}'); font-weight: 400; }
* { margin: 0; box-sizing: border-box; }
body { width: ${W}px; height: ${H}px; position: relative; overflow: hidden; font-family: YS, sans-serif; color: #111920; background: #f3f5f7; }
h1 { position: absolute; left: 48px; top: 48px; font-size: 46px; letter-spacing: -.01em; }
.sub { position: absolute; left: 50px; top: 110px; font-size: 24px; color: #5b6774; }
.brand { position: absolute; right: 48px; top: 56px; display: flex; align-items: center; gap: 8px; font-size: 24px; font-weight: 700; }
.brand i { font-style: normal; color: #FF6A00; } .brand .ic { width: 26px; height: 26px; display: block; flex: none; }
.card { position: absolute; top: 236px; width: 330px; height: 560px; background: #fff; border-radius: 24px; box-shadow: 0 6px 24px rgba(17,25,32,.08);
  display: flex; flex-direction: column; align-items: center; padding: 34px 26px; text-align: center; }
.num { width: 56px; height: 56px; border-radius: 50%; background: #FF6A00; color: #fff; font-weight: 700; font-size: 30px; display: flex; align-items: center; justify-content: center; }
.card svg.ic { margin: 30px 0 26px; }
.card b { font-size: 30px; line-height: 1.15; letter-spacing: -.01em; }
.card span { margin-top: 14px; font-size: 22px; line-height: 1.3; color: #5b6774; }
.arrow { position: absolute; top: 486px; width: 44px; font-size: 44px; color: #FF6A00; text-align: center; font-weight: 700; }
</style></head><body>
<h1>${T.title}</h1><div class="sub">${T.sub}</div>
<div class="brand"><span class="ic">${icon}</span><span><b>Parus</b> <i>Bayroq</i></span></div>
${cards}
<script>document.fonts.ready.then(() => { document.body.dataset.ready = '1'; });</script>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'steps-'));
writeFileSync(join(dir, 'page.html'), page);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await p.goto('file://' + join(dir, 'page.html'));
await p.waitForSelector('body[data-ready="1"]');
await p.waitForTimeout(150);
await p.screenshot(out.endsWith('.png') ? { path: out } : { path: out, type: 'jpeg', quality: 92 });
await b.close();
console.log('saved', out);
