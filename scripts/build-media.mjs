// Converts media-src/ into optimized files in public/ and writes src/media-manifest.json.
import sharp from 'sharp';
import { readdirSync, mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, parse } from 'node:path';

const SRC = 'media-src/images', OUT = 'public/img', VSRC = 'media-src/video', VOUT = 'public/video';
mkdirSync(OUT, { recursive: true }); mkdirSync(VOUT, { recursive: true });

// Max rendered width (CSS px) x2 for retina; never upscale.
const maxW = (n) => {
  if (/^(yandex|paynet|uzum|chevrolet|byd)_1$/.test(n)) return 240;
  if (/^(safia|maxway)$/.test(n)) return 120;
  if (/^(akfa|seoul|uzum_market|lesailes|paynet|mannol|evos|oqtepa)$/.test(n)) return 360;
  if (/^icon_\d$/.test(n)) return 112;
  if (/^work_\d$/.test(n)) return 640;
  if (/^review_\d+$/.test(n)) return 560;
  if (/^(parus_vinder|pero|flag_\d)$/.test(n)) return 420;
  if (/^(rastyajka|klassika|image_6|install_thumb_new)$/.test(n)) return 700;
  if (n === 'konstruksiya') return 1000;
  if (n === 'bannerimage') return 1000;
  if (n === 'image_3') return 1200;
  if (n === 'image_2') return 1600;
  return 1200;
};

const manifest = {};
for (const f of readdirSync(SRC)) {
  const { name, ext } = parse(f);
  if (!/\.(png|jpe?g)$/i.test(ext)) continue;
  if (['apple-touch-icon', 'favicon-32', 'Logo'].includes(name)) continue;
  const img = sharp(join(SRC, f)).rotate();
  const meta = await img.metadata();
  const w = Math.min(meta.width, maxW(name));
  const out = join(OUT, `${name}.webp`);
  const info = await img.resize({ width: w, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(out);
  manifest[`images/${f}`] = { src: `/img/${name}.webp`, width: info.width, height: info.height, bytes: info.size, origBytes: statSync(join(SRC, f)).size };
}

// Logo PNG for structured data (>=112px), icons copied as-is.
await sharp(join(SRC, 'Logo.svg'), { density: 1600 }).resize(512, 512).png().toFile('public/img/logo-512.png');
mkdirSync('public/images', { recursive: true });
for (const f of ['Logo.svg', 'favicon.svg', 'favicon-32.png', 'apple-touch-icon.png']) {
  execFileSync('cp', [join(SRC, f), join('public/images', f)]);
}
manifest['images/Logo.svg'] = { src: '/images/Logo.svg', width: 24, height: 24 };

// favicon.ico = PNG embedded in an ICO container
const png = await sharp(join(SRC, 'Logo.svg'), { density: 600 }).resize(32, 32).png().toBuffer();
const hdr = Buffer.alloc(22);
hdr.writeUInt16LE(0, 0); hdr.writeUInt16LE(1, 2); hdr.writeUInt16LE(1, 4);
hdr.writeUInt8(32, 6); hdr.writeUInt8(32, 7); hdr.writeUInt8(0, 8); hdr.writeUInt8(0, 9);
hdr.writeUInt16LE(1, 10); hdr.writeUInt16LE(32, 12); hdr.writeUInt32LE(png.length, 14); hdr.writeUInt32LE(22, 18);
writeFileSync('public/favicon.ico', Buffer.concat([hdr, png]));

// Videos: H.264 + AAC 64k, faststart (work clips play with sound on click).
for (const f of readdirSync(VSRC)) {
  const out = join(VOUT, f);
  if (existsSync(out) && !process.argv.includes('--force')) { manifest[`images/${f}`] = { src: `/video/${f}` }; continue; }
  const install = f.startsWith('install');
  const args = ['-y', '-loglevel', 'error', '-i', join(VSRC, f), '-vf', 'scale=540:-2', '-c:v', 'libx264', '-preset', 'slow', '-crf', install ? '29' : '30', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
  args.push('-c:a', 'aac', '-b:a', '64k');
  execFileSync('ffmpeg', [...args, out]);
  // poster frame for clips
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', out, '-frames:v', '1', '-vf', 'scale=540:-2', join(OUT, f.replace('.mp4', '-poster.jpg'))]);
  await sharp(join(OUT, f.replace('.mp4', '-poster.jpg'))).webp({ quality: 72 }).toFile(join(OUT, f.replace('.mp4', '-poster.webp')));
  execFileSync('rm', [join(OUT, f.replace('.mp4', '-poster.jpg'))]);
  manifest[`images/${f}`] = { src: `/video/${f}` };
}
writeFileSync('src/media-manifest.json', JSON.stringify(manifest, null, 1));
let before = 0, after = 0;
for (const v of Object.values(manifest)) if (v.origBytes) { before += v.origBytes; after += v.bytes; }
console.log(`images: ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(2)} MB`);
