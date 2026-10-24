/** Publish generated SEO routes for installations serving the repository root instead of dist/.
 * Keep Cloudflare Pages builds pointed at dist/ when possible.
 */
import { copyFile, mkdir } from 'node:fs/promises';
import { pages } from '../content/pages.mjs';
const root = new URL('../', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
for (const name of ['index.html', 'privacy.html', 'robots.txt', 'sitemap.xml', '404.html']) {
  await copyFile(new URL(name, dist), new URL(name, root));
}
for (const page of pages) {
  const path = page.path.slice(1);
  await mkdir(new URL(path, root), { recursive: true });
  await copyFile(new URL(`${path}index.html`, dist), new URL(`${path}index.html`, root));
}
console.log(`Synced ${pages.length} prerendered pages and the SEO assets into the repository root.`);
