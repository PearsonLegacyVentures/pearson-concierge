import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { pages } from '../content/pages.mjs';

function build(siteUrl='') {
  const env={...process.env};
  if (siteUrl) env.SITE_URL=siteUrl;
  else delete env.SITE_URL;
  execFileSync(process.execPath,['scripts/build.mjs'],{cwd:new URL('../',import.meta.url),env,stdio:'pipe'});
}
const read=path=>readFileSync(new URL('../dist/'+path,import.meta.url),'utf8');

test('all landing pages are crawlable, unique and linked from the home page', () => {
  build();
  const home=read('index.html');
  const titles=new Set();
  const metas=new Set();
  for (const page of pages) {
    const html=read(page.path.slice(1)+'index.html');
    assert.match(html,/<h1>[^]*?<\/h1>/);
    assert.ok(html.includes(`<title>${page.title.replaceAll('&','&amp;')}</title>`),page.path);
    assert.ok(html.includes(page.description.replaceAll('&','&amp;')),page.path);
    assert.ok(!titles.has(page.title),'duplicate title');
    assert.ok(!metas.has(page.description),'duplicate description');
    assert.ok(html.includes('name="robots" content="index,follow'),page.path);
    titles.add(page.title); metas.add(page.description);
    assert.ok(home.includes(`href="${page.path}"`) || page.path==='/partners/',`Not linked on homepage: ${page.path}`);
    const match=html.match(/<script type="application\/ld\+json">([^]*?)<\/script>/);
    assert.ok(match,`Missing structured data: ${page.path}`);
    const graph=JSON.parse(match[1]);
    assert.equal(graph['@context'],'https://schema.org');
    assert.ok(graph['@graph'].some(node=>node['@type']==='BreadcrumbList'));
    if(page.service) assert.ok(graph['@graph'].some(node=>node['@type']==='Service'));
    assert.match(html,/\/\?service=/);
  }
  const defaultOrigin='https://concierge.bahamasaisolutions.com';
  assert.ok(read('sitemap.xml').includes(`<loc>${defaultOrigin}/</loc>`));
  assert.ok(read('robots.txt').includes(`Sitemap: ${defaultOrigin}/sitemap.xml`));
  assert.ok(home.includes(`rel="canonical" href="${defaultOrigin}/"`));
  assert.equal((home.match(/rel="canonical"/g)||[]).length,1);
  for (const page of pages) {
    const html=read(page.path.slice(1)+'index.html');
    assert.ok(html.includes(`rel="canonical" href="${defaultOrigin}${page.path}"`));
    assert.ok(read('sitemap.xml').includes(`<loc>${defaultOrigin}${page.path}</loc>`));
  }
  assert.match(read('404.html'),/noindex,follow/);
  assert.match(read('privacy.html'),/noindex,follow/);
});

test('verified SITE_URL enables exact canonical URLs, sitemap and robots reference', () => {
  build('https://concierge.testing.invalid');
  const sitemap=read('sitemap.xml');
  const robots=read('robots.txt');
  const home=read('index.html');
  assert.ok(home.includes('rel="canonical" href="https://concierge.testing.invalid/"'));
  for(const page of pages) {
    const html=read(page.path.slice(1)+'index.html');
    assert.ok(html.includes(`rel="canonical" href="https://concierge.testing.invalid${page.path}"`));
    assert.ok(sitemap.includes(`<loc>https://concierge.testing.invalid${page.path}</loc>`));
  }
  assert.ok(sitemap.includes('<loc>https://concierge.testing.invalid/</loc>'));
  assert.ok(robots.includes('Sitemap: https://concierge.testing.invalid/sitemap.xml'));
  assert.match(read('privacy.html'),/content="noindex,follow"/);
});

test('SITE_URL rejects unsafe and ambiguous values', () => {
  for(const url of ['http://example.com','https://example.com/other','javascript:alert(1)','https://example.com/?ref=a']) {
    assert.throws(()=>execFileSync(process.execPath,['scripts/build.mjs'],{cwd:new URL('../',import.meta.url),env:{...process.env,SITE_URL:url},stdio:'pipe'}));
  }
});
