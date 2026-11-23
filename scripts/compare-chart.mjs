// Comparison of entrance advertising (signboard, banner, A-frame, feather flag) for the blog.
// node scripts/compare-chart.mjs <out.jpg> [ru|uz]
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [out, lang = 'ru'] = process.argv.slice(2);
if (!out) { console.error('usage: compare-chart.mjs out.jpg [ru|uz]'); process.exit(1); }

// y = yes, p = partly, n = no
const T = {
  ru: { title: 'Что поставить у входа', sub: 'Вывеска, баннер, штендер и флаг-парус — сильные и слабые стороны',
        cols: ['Вывеска', 'Баннер', 'Штендер', 'Флаг-парус'],
        rows: [['Видно с дороги, над машинами', 'p', 'p', 'n', 'y'], ['Ловит взгляд движением', 'n', 'n', 'n', 'y'],
               ['Можно переставить', 'n', 'n', 'y', 'y'], ['Легко сменить надпись', 'n', 'p', 'y', 'y']],
        best: ['название навсегда', 'большая картинка на фасаде', 'меню и цены у двери', 'привести с дороги ко входу'],
        bestLabel: 'Лучше всего для', legend: ['да', 'частично', 'нет'] },
  uz: { title: "Kirish oldiga nima qo'yish kerak", sub: "Peshlavha, banner, shtender va parus bayroq — kuchli va zaif tomonlari",
        cols: ['Peshlavha', 'Banner', 'Shtender', 'Parus bayroq'],
        rows: [["Yo'ldan, mashinalar ustidan ko'rinadi", 'p', 'p', 'n', 'y'], ["Harakati bilan ko'zni tortadi", 'n', 'n', 'n', 'y'],
               ["Boshqa joyga qo'ysa bo'ladi", 'n', 'n', 'y', 'y'], ['Yozuvni oson almashtirsa bo\'ladi', 'n', 'p', 'y', 'y']],
        best: ['doimiy nom uchun', 'fasadda katta rasm', 'eshik oldida menyu va narxlar', "yo'ldan kirishgacha olib kelish"],
        bestLabel: 'Eng yaxshisi', legend: ['ha', 'qisman', "yo'q"] },
}[lang];

const W = 1600, H = 900;
const icon = readFileSync(join(root, 'media-src/images/Logo.svg'), 'utf8').replace(/width="24" height="24"/, 'width="100%" height="100%"');
const font = (f) => 'file://' + join(root, 'public/fonts', f);
const mark = { y: '<i class="y">✓</i>', p: '<i class="p">~</i>', n: '<i class="n">✕</i>' };

const head = `<tr><th></th>${T.cols.map((c, i) => `<th class="${i === 3 ? 'hl' : ''}">${c}</th>`).join('')}</tr>`;
const body = T.rows.map((r) => `<tr><td class="lbl">${r[0]}</td>${r.slice(1).map((v, i) => `<td class="${i === 3 ? 'hl' : ''}">${mark[v]}</td>`).join('')}</tr>`).join('')
  + `<tr class="best"><td class="lbl">${T.bestLabel}</td>${T.best.map((b, i) => `<td class="${i === 3 ? 'hl' : ''}">${b}</td>`).join('')}</tr>`;

const page = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: YS; src: url('${font('YSDisplay-Bold.woff2')}'); font-weight: 700; }
@font-face { font-family: YS; src: url('${font('YSDisplay-Regular.woff2')}'); font-weight: 400; }
* { margin: 0; box-sizing: border-box; }
body { width: ${W}px; height: ${H}px; position: relative; overflow: hidden; font-family: YS, sans-serif; color: #111920; background: #f3f5f7; }
h1 { position: absolute; left: 48px; top: 44px; font-size: 46px; letter-spacing: -.01em; }
.sub { position: absolute; left: 50px; top: 106px; font-size: 24px; color: #5b6774; }
.brand { position: absolute; right: 48px; top: 52px; display: flex; align-items: center; gap: 8px; font-size: 24px; font-weight: 700; }
.brand i { font-style: normal; color: #FF6A00; } .brand .ic { width: 26px; height: 26px; display: block; flex: none; }
table { position: absolute; left: 48px; right: 48px; top: 176px; width: ${W - 96}px; border-collapse: separate; border-spacing: 0; background: #fff; border-radius: 22px; overflow: hidden; box-shadow: 0 6px 24px rgba(17,25,32,.08); }
th, td { height: 96px; text-align: center; font-size: 24px; border-bottom: 1px solid #e6eaee; padding: 0 16px; }
th { font-size: 28px; height: 90px; } td.lbl { text-align: left; font-size: 24px; padding-left: 32px; width: 430px; }
th.hl { background: #FF6A00; color: #fff; } td.hl { background: #fff4ec; }
tr.best td { height: 120px; border-bottom: none; font-size: 21px; color: #46525e; line-height: 1.25; } tr.best td.lbl { font-weight: 700; color: #111920; font-size: 24px; } tr.best td.hl { color: #b54600; font-weight: 700; }
td i { display: inline-flex; width: 46px; height: 46px; border-radius: 50%; align-items: center; justify-content: center; font-style: normal; font-weight: 700; font-size: 26px; color: #fff; }
i.y { background: #1aa260; } i.p { background: #c9cfd6; color: #46525e; } i.n { background: #eef1f4; color: #9aa4ae; }
.legend { position: absolute; left: 50px; bottom: 34px; display: flex; gap: 28px; font-size: 20px; color: #5b6774; align-items: center; }
.legend i { width: 30px; height: 30px; font-size: 17px; margin-right: 8px; display: inline-flex; border-radius: 50%; align-items: center; justify-content: center; font-style: normal; font-weight: 700; }
</style></head><body>
<h1>${T.title}</h1><div class="sub">${T.sub}</div>
<div class="brand"><span class="ic">${icon}</span><span><b>Parus</b> <i>Bayroq</i></span></div>
<table>${head}${body}</table>
<div class="legend"><span><i class="y" style="background:#1aa260;color:#fff">✓</i>${T.legend[0]}</span><span><i style="background:#c9cfd6;color:#46525e">~</i>${T.legend[1]}</span><span><i style="background:#eef1f4;color:#9aa4ae">✕</i>${T.legend[2]}</span></div>
<script>document.fonts.ready.then(() => { document.body.dataset.ready = '1'; });</script>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'cmp-'));
writeFileSync(join(dir, 'page.html'), page);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await p.goto('file://' + join(dir, 'page.html'));
await p.waitForSelector('body[data-ready="1"]');
await p.waitForTimeout(150);
await p.screenshot(out.endsWith('.png') ? { path: out } : { path: out, type: 'jpeg', quality: 92 });
await b.close();
console.log('saved', out);
