// Blog images: media-src/blog/<pair>/<name>.png|jpg -> public/img/blog/<pair>/<name>.webp (max 1200 px wide)
// plus <name>-og.jpg (1200x630) for social previews. Writes src/blog-images.json with sizes.
// Run after adding images: npm run blog-images
import sharp from 'sharp';
import { readdirSync, mkdirSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join, parse } from 'node:path';

const SRC = 'media-src/blog', OUT = 'public/img/blog';
const manifest = {};
if (existsSync(SRC)) {
  for (const pair of readdirSync(SRC)) {
    const dir = join(SRC, pair);
    if (!statSync(dir).isDirectory()) continue;
    mkdirSync(join(OUT, pair), { recursive: true });
    for (const f of readdirSync(dir)) {
      const { name, ext } = parse(f);
      if (!/\.(png|jpe?g|webp)$/i.test(ext)) continue;
      const src = join(dir, f);
      const web = `/img/blog/${pair}/${name}.webp`, og = `/img/blog/${pair}/${name}-og.jpg`;
      const info = await sharp(src).rotate().resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile('public' + web);
      await sharp(src).rotate().resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 82, mozjpeg: true }).toFile('public' + og);
      manifest[web] = { width: info.width, height: info.height, bytes: info.size, og };
    }
  }
}
writeFileSync('src/blog-images.json', JSON.stringify(manifest, null, 1) + '\n');
console.log(`blog images: ${Object.keys(manifest).length}`);
