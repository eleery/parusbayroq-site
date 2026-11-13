// The test copy must never be indexed.
import { writeFileSync } from 'node:fs';
writeFileSync('dist-preview/robots.txt', 'User-agent: *\nDisallow: /\n');
console.log('dist-preview/robots.txt: Disallow all');
