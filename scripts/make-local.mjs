// Copy of the preview build that opens straight from disk (double-click index.html):
// absolute paths become relative, folder links point to index.html.
import { cpSync, readdirSync, readFileSync, writeFileSync, statSync, rmSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';

const SRC = 'dist-preview', OUT = 'dist-local';
rmSync(OUT, { recursive: true, force: true });
cpSync(SRC, OUT, { recursive: true });

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
for (const file of walk(OUT).filter((f) => f.endsWith('.html'))) {
  const depth = relative(OUT, dirname(file)).split('/').filter(Boolean).length;
  const prefix = depth ? '../'.repeat(depth) : './';
  let html = readFileSync(file, 'utf8');
  html = html.replace(/\b(href|src|poster|data-poster)="\/(?!\/)([^"]*)"/g, (m, attr, rest) => {
    let [path, hash = ''] = rest.split('#');
    let query = '';
    if (path.includes('?')) [path, query] = [path.slice(0, path.indexOf('?')), path.slice(path.indexOf('?'))];
    if (path === '' || path.endsWith('/')) path += 'index.html';
    return `${attr}="${prefix}${path}${query}${hash ? '#' + hash : ''}"`;
  });
  writeFileSync(file, html);
}
console.log('dist-local ready');
