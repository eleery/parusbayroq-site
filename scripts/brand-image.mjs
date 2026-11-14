// Puts the Parus Bayroq logo (wind icon + wordmark) onto the plain flag in a generated photo,
// and optionally a small corner badge. Uses Chromium: the logo layer is mapped onto the flag
// with a perspective transform (matrix3d) and multiplied over the fabric so folds and shading show through.
//
// node scripts/brand-image.mjs <in.png> <out.png> --quad x1,y1,x2,y2,x3,y3,x4,y4 [--layout vertical|horizontal] [--dark] [--no-badge]
//                                [--text "КОФЕ" [--sub "навынос"] [--icon]] [--lines "Line 1|Line 2|Line 3"]
//   --text: a client's phrase instead of our logo (vertical, fitted to the flag); --icon adds our wind icon on top.
//   --lines: several small lines (to show an overloaded flag that nobody can read).
//   quad: flag area corners on the photo, clockwise from top-left (TL, TR, BR, BL), in image pixels.
//   vertical: icon on top, wordmark reading bottom-to-top (sail / feather flags).
//   horizontal: icon left of the wordmark (classic flags, banners).
//   --dark: white logo for dark/orange fabric (normal blend instead of multiply).
import { createRequire } from 'node:module';
// Playwright is preinstalled globally (not a project dependency), so load it through CommonJS resolution.
const { chromium } = createRequire(import.meta.url)('playwright');
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import sharp from 'sharp';

const [inp, out, ...rest] = process.argv.slice(2);
const opt = (k) => { const i = rest.indexOf(k); return i >= 0 ? rest[i + 1] : undefined; };
const quad = (opt('--quad') || '').split(',').map(Number);
if (!inp || !out || quad.length !== 8 || quad.some(Number.isNaN)) {
  console.error('usage: brand-image.mjs in.png out.png --quad x1,y1,x2,y2,x3,y3,x4,y4 [--layout vertical|horizontal] [--dark] [--no-badge]');
  process.exit(1);
}
const layout = opt('--layout') || 'vertical';
const dark = rest.includes('--dark');
const badge = !rest.includes('--no-badge');
const root = resolve(new URL('..', import.meta.url).pathname);
const { width: W, height: H } = await sharp(inp).metadata();

const icon = readFileSync(join(root, 'media-src/images/Logo.svg'), 'utf8')
  .replace(/width="24" height="24"/, 'width="100%" height="100%"')
  .replace(/#FF6A00/g, dark ? '#ffffff' : '#FF6A00');
const fontUrl = (f) => 'file://' + join(root, 'public/fonts', f);
const ink = dark ? '#ffffff' : '#111920', accent = dark ? '#ffffff' : '#FF6A00';

// Logo layer, drawn in its own box (SW x SH) and then projected onto the quad.
// The box keeps the flag's proportions so the logo is not squeezed.
const qw = (Math.hypot(quad[2] - quad[0], quad[3] - quad[1]) + Math.hypot(quad[4] - quad[6], quad[5] - quad[7])) / 2;
const qh = (Math.hypot(quad[6] - quad[0], quad[7] - quad[1]) + Math.hypot(quad[4] - quad[2], quad[5] - quad[3])) / 2;
const [SW, SH] = layout === 'vertical' ? [Math.round(Math.min(420, Math.max(200, 1000 * qw / qh))), 1000] : [1000, Math.round(Math.min(600, Math.max(260, 1000 * qh / qw)))];
const icoV = Math.min(190, SW - 40);
const text = opt('--text'), sub = opt('--sub'), lines = opt('--lines'), withIcon = rest.includes('--icon');
const esc = (v) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const logo = lines
  ? `<div class="v"><div class="vt"><div class="rot fit lines" data-len=".94" data-thick=".86">${lines.split('|').map((l) => `<div>${esc(l)}</div>`).join('')}</div></div></div>`
  : text
  ? `<div class="v">${withIcon ? `<div class="ic">${icon}</div>` : ''}<div class="vt"><div class="rot fit" data-len=".9" data-thick=".66"><div class="big">${esc(text)}</div>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}</div></div></div>`
  : layout === 'vertical'
  ? `<div class="v"><div class="ic">${icon}</div><div class="vt"><span class="wm"><b>Parus</b> <i>Bayroq</i></span></div></div>`
  : `<div class="h"><div class="ic">${icon}</div><span class="wm"><b>Parus</b> <i>Bayroq</i></span></div>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: YS; src: url('${fontUrl('YSDisplay-Bold.woff2')}'); font-weight: 700; }
html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; }
body { background: url('file://${resolve(inp)}') 0 0 / ${W}px ${H}px no-repeat; position: relative; font-family: YS, sans-serif; }
#layer { position: absolute; left: 0; top: 0; width: ${SW}px; height: ${SH}px; transform-origin: 0 0; mix-blend-mode: ${dark ? 'normal' : 'multiply'}; opacity: .94; filter: blur(.35px); }
.wm { font-weight: 700; color: ${ink}; white-space: nowrap; letter-spacing: -.01em; line-height: 1; }
.wm b { font-weight: 700; } .wm i { font-style: normal; color: ${accent}; }
.v { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; padding: 30px 0; box-sizing: border-box; }
.v .ic { width: ${icoV}px; height: ${icoV}px; flex: none; }
.v .vt { flex: 1; width: 100%; position: relative; }
.v .vt .wm { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) rotate(-90deg); font-size: ${Math.round(Math.min(132, SW * 0.5))}px; }
.rot { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) rotate(-90deg); white-space: nowrap; text-align: center; color: ${ink}; font-weight: 700; }
.rot .big { line-height: .95; letter-spacing: -.01em; } .rot .sub { font-size: .4em; line-height: 1.1; color: ${accent}; margin-top: .08em; }
.rot.lines { line-height: 1.12; text-align: left; } .rot.lines div:first-child { color: ${accent}; }
.h { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; gap: 34px; }
.h .ic { width: 200px; height: 200px; flex: none; } .h .wm { font-size: 150px; }
#badge { position: absolute; right: ${Math.round(W * 0.018)}px; bottom: ${Math.round(W * 0.018)}px; display: flex; align-items: center; gap: ${Math.round(W * 0.006)}px;
  background: rgba(255,255,255,.88); border-radius: 999px; padding: ${Math.round(W * 0.006)}px ${Math.round(W * 0.012)}px ${Math.round(W * 0.006)}px ${Math.round(W * 0.009)}px;
  font-size: ${Math.round(W * 0.0135)}px; color: #111920; box-shadow: 0 2px 10px rgba(0,0,0,.12); }
#badge .ic { width: ${Math.round(W * 0.016)}px; height: ${Math.round(W * 0.016)}px; }
#badge i { font-style: normal; color: #FF6A00; }
</style></head><body>
<div id="layer">${logo}</div>
${badge ? `<div id="badge"><span class="ic">${icon.replace(/#ffffff/g, '#FF6A00')}</span><span><b>Parus</b> <i>Bayroq</i></span></div>` : ''}
<script>
document.fonts.ready.then(function(){
// Perspective transform mapping the box (0,0)-(SW,SH) onto the quad (adjugate method).
function adj(m){return[m[4]*m[8]-m[5]*m[7],m[2]*m[7]-m[1]*m[8],m[1]*m[5]-m[2]*m[4],m[5]*m[6]-m[3]*m[8],m[0]*m[8]-m[2]*m[6],m[2]*m[3]-m[0]*m[5],m[3]*m[7]-m[4]*m[6],m[1]*m[6]-m[0]*m[7],m[0]*m[4]-m[1]*m[3]];}
function mul(a,b){const c=Array(9);for(let i=0;i<3;i++)for(let j=0;j<3;j++){let s=0;for(let k=0;k<3;k++)s+=a[3*i+k]*b[3*k+j];c[3*i+j]=s;}return c;}
function mulv(m,v){return[m[0]*v[0]+m[1]*v[1]+m[2]*v[2],m[3]*v[0]+m[4]*v[1]+m[5]*v[2],m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];}
function basis(x1,y1,x2,y2,x3,y3,x4,y4){const m=[x1,x2,x3,y1,y2,y3,1,1,1];const v=mulv(adj(m),[x4,y4,1]);return mul(m,[v[0],0,0,0,v[1],0,0,0,v[2]]);}
function proj(s,d){return mul(basis(...d),adj(basis(...s)));}
const q=${JSON.stringify(quad)}, w=${SW}, h=${SH};
let t=proj([0,0,w,0,0,h,w,h],[q[0],q[1],q[2],q[3],q[6],q[7],q[4],q[5]]);
for(let i=0;i<9;i++)t[i]=t[i]/t[8];
// Fit client text: as large as the flag allows along its length and across it.
document.querySelectorAll('.fit').forEach(function(el){el.style.fontSize='100px';var box=el.parentNode;var k=Math.min(box.clientHeight*+el.dataset.len/el.offsetWidth,box.clientWidth*+el.dataset.thick/el.offsetHeight);el.style.fontSize=(100*k)+'px';});
document.getElementById('layer').style.transform='matrix3d('+[t[0],t[3],0,t[6],t[1],t[4],0,t[7],0,0,1,0,t[2],t[5],0,t[8]].join(',')+')';
document.body.dataset.ready='1';});
</script></body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'brand-'));
const page = join(dir, 'page.html');
writeFileSync(page, html);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await p.goto('file://' + page);
await p.waitForSelector('body[data-ready="1"]');
await p.waitForTimeout(150);
await p.screenshot(out.endsWith('.png') ? { path: out } : { path: out, type: 'jpeg', quality: 92 });
await b.close();
console.log('branded ->', out);
