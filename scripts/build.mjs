import { mkdir, copyFile, rm } from 'node:fs/promises';
const target = new URL('../dist/', import.meta.url);
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
for (const file of ['index.html', 'styles.css', 'script.js', 'privacy.html', 'favicon.svg', 'robots.txt']) {
  await copyFile(new URL(`../${file}`, import.meta.url), new URL(file, target));
}
console.log('Built static site in dist/. Deploy using Cloudflare Pages; keep functions/ in repository root.');
