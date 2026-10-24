import { mkdir, copyFile, rm, readFile, writeFile } from 'node:fs/promises';
import { pages } from '../content/pages.mjs';

const out = new URL('../dist/', import.meta.url);
const root = new URL('../', import.meta.url);
const servicePages = pages.filter(page => page.service);
const urlEnv = process.env.SITE_URL?.trim() || 'https://concierge.bahamasaisolutions.com';
const siteUrl = urlEnv ? validSiteUrl(urlEnv) : '';

function validSiteUrl(value) {
  let u;
  try { u = new URL(value); } catch { throw new Error('SITE_URL must be an absolute HTTPS URL, e.g. https://your-domain.com'); }
  if (u.protocol !== 'https:' || u.username || u.password || u.search || u.hash || u.pathname !== '/' || !u.hostname.includes('.')) {
    throw new Error('SITE_URL must be a verified HTTPS origin without a path, query or credentials.');
  }
  return u.origin;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
}
function absolute(path) { return siteUrl ? `${siteUrl}${path}` : undefined; }
function linkToRequest(service) {
  return `/?service=${encodeURIComponent(service || 'Something else')}#enquire`;
}
function metaTags(path, title, description, schemaObjects = []) {
  const url = absolute(path);
  const schema = schemaObjects.length ? `<script type="application/ld+json">${JSON.stringify(schemaObjects.length === 1 ? schemaObjects[0] : { '@context': 'https://schema.org', '@graph': schemaObjects }).replace(/</g,'\\u003c')}</script>` : '';
  return [
    `<meta name="description" content="${escapeHtml(description)}" />`,
    '<meta name="robots" content="index,follow,max-image-preview:large" />',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Pearson Concierge" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    ...(url ? [`<link rel="canonical" href="${escapeHtml(url)}" />`,`<meta property="og:url" content="${escapeHtml(url)}" />`] : []),
    '<meta name="twitter:card" content="summary" />',
    schema,
  ].join('\n  ');
}
const brand = `<a class="brand" href="/" aria-label="Pearson Concierge home"><span class="brand-mark" aria-hidden="true">P<span class="mark-slash">/</span>C</span><span class="brand-wordmark"><strong>PEARSON</strong><small>CONCIERGE</small></span></a>`;
const nav = `<header class="site-header">${brand}<nav class="desktop-nav" aria-label="Primary navigation"><a href="/#services">Services</a><a href="/nassau-paradise-island-concierge/">Nassau & Paradise Island</a><a href="/private-aviation-arrivals-bahamas/">Private arrivals</a><a href="/about/">About</a></nav><a class="header-cta" href="/#enquire">Make an enquiry <span aria-hidden="true">↗</span></a><button class="menu-toggle" type="button" aria-controls="mobile-nav" aria-expanded="false" aria-label="Open navigation"><span></span><span></span></button><nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation" hidden><a href="/#services">Services</a><a href="/nassau-paradise-island-concierge/">Nassau & Paradise Island</a><a href="/private-aviation-arrivals-bahamas/">Private arrivals</a><a href="/about/">About</a><a href="/partners/">For partners</a><a href="/#enquire">Make an enquiry ↗</a></nav></header>`;
function navTitle(page) { return page.title.split(' | ')[0]; }
const pathLookup = new Map(pages.map(p => [p.path, p]));
const footerServices = servicePages.map(page=>`<a href="${page.path}">${escapeHtml(navTitle(page).replace(/ in (Nassau|The Bahamas).*$/, ''))}</a>`).join('');
const footer = `<footer class="site-footer"><div class="container"><div class="footer-top"><div>${brand}<p>Private concierge and lifestyle arrangements in Nassau and Paradise Island, The Bahamas.</p><p class="footer-note">Founder-led by Amar Pearson. Services arranged by request, subject to confirmation.</p></div><div class="footer-aside"><span class="footer-kicker">IT STARTS WITH A REQUEST</span><a href="/#enquire">Consider it handled. <span>↗</span></a></div></div><nav class="footer-service-nav" aria-label="Service pages">${footerServices}<a href="/nassau-paradise-island-concierge/">Nassau concierge</a><a href="/private-aviation-arrivals-bahamas/">Private aviation arrivals</a><a href="/about/">About</a><a href="/partners/">For partners</a></nav><div class="footer-bottom"><span>© ${new Date().getUTCFullYear()} PEARSON CONCIERGE</span><span>NASSAU, THE BAHAMAS</span><div><a href="/privacy.html">PRIVACY</a><a href="/">HOME ↑</a></div></div></div></footer>`;
function breadcrumbs(page) {
  const second = page.path.startsWith('/services/') ? `<span aria-hidden="true">/</span><a href="/#services">Services</a>` : '';
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a>${second}<span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(navTitle(page))}</span></nav>`;
}
function structured(page) {
  const business = { '@type': 'Organization', name: 'Pearson Concierge', description: 'Founder-led private concierge service focusing on Nassau and Paradise Island in The Bahamas.', founder: { '@type':'Person',name:'Amar Pearson' }, areaServed: [{ '@type':'Place',name:'Nassau, The Bahamas' },{ '@type':'Place',name:'Paradise Island, The Bahamas' }], ...(siteUrl ? {url:siteUrl} : {}) };
  const webPage = { '@type':'WebPage', name: navTitle(page), description:page.description, ...(absolute(page.path) ? {url:absolute(page.path)} : {}) };
  const crumbs = [{name:'Home',item:absolute('/')},...(page.path.startsWith('/services/')?[{name:'Services',item:absolute('/#services')}]:[]),{name:navTitle(page),item:absolute(page.path)}];
  const breadcrumb = { '@type':'BreadcrumbList',itemListElement:crumbs.map((item,i)=>({ '@type':'ListItem',position:i+1,name:item.name,...(item.item?{item:item.item}:{})})) };
  const svc = page.service ? [{ '@type':'Service',name:navTitle(page),serviceType:page.serviceType,description:page.description,provider:{'@type':'Organization',name:'Pearson Concierge',...(siteUrl?{url:siteUrl}:{})},areaServed:[{'@type':'Place',name:'Nassau, The Bahamas'},{'@type':'Place',name:'Paradise Island, The Bahamas'}]}] : [];
  return [business,webPage,breadcrumb,...svc];
}
function renderPage(page) {
  const needTitle = page.path==='/about/' ? 'Who we can help' : page.path==='/partners/' ? 'What to send us' : 'What to include in your request';
  const related = page.related.map(path => pathLookup.get(path)).filter(Boolean);
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#17201e"/>
<title>${escapeHtml(page.title)}</title>
${metaTags(page.path,page.title,page.description,structured(page))}
<link rel="icon" type="image/svg+xml" href="/favicon.svg"/><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/><link rel="stylesheet" href="/styles.css"/><script defer src="/script.js"></script></head>
<body><a class="skip-link" href="#main">Skip to content</a>${nav}<main id="main"><section class="page-hero"><div class="container">${breadcrumbs(page)}<span class="eyebrow">${escapeHtml(page.eyebrow)}</span><h1>${page.heading}</h1><p>${escapeHtml(page.intro)}</p><div class="page-actions"><a class="btn btn-cream" href="${linkToRequest(page.service)}">Request an arrangement <span aria-hidden="true">↗</span></a><a class="underlined-link" href="/#services">Browse concierge services ↗</a></div></div></section>
<section class="page-body"><div class="container page-body-grid"><article><h2>${escapeHtml(page.leadHeading)}</h2><p>${escapeHtml(page.lead)}</p>${page.sections.map(s=>`<section><h3>${escapeHtml(s.heading)}</h3><p>${escapeHtml(s.body)}</p></section>`).join('')}</article><aside class="page-aside"><h2>${escapeHtml(needTitle)}</h2><ul>${page.needs.map(n=>`<li>${escapeHtml(n)}</li>`).join('')}</ul><p>We review requests individually. Pricing and availability must be confirmed before any service is booked.</p><a class="btn btn-dark" href="${linkToRequest(page.service)}">Send your enquiry <span aria-hidden="true">↗</span></a></aside></div></section>
<section class="page-faq" aria-labelledby="faq-heading"><div class="container"><span class="eyebrow">BEFORE YOU ARRANGE</span><h2 id="faq-heading">Frequently asked questions.</h2><div class="page-faq-items">${page.faqs.map(([q,a])=>`<div class="page-faq-item"><h3>${escapeHtml(q)}</h3><p>${escapeHtml(a)}</p></div>`).join('')}</div></div></section><section class="related-section"><div class="container"><span class="eyebrow">ALSO EXPLORE</span><div class="related-grid">${related.map(p=>`<a class="related-link" href="${p.path}">${escapeHtml(navTitle(p))}<span>DISCOVER MORE ↗</span></a>`).join('')}</div></div></section></main>${footer}</body></html>`;
}

await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
for (const file of ['index.html','styles.css','script.js','privacy.html','favicon.svg']) {
  await copyFile(new URL(file,root),new URL(file,out));
}
for (const page of pages) {
  const path = new URL(`.${page.path}`,out);
  await mkdir(path,{recursive:true});
  await writeFile(new URL('index.html',path),renderPage(page));
}
const home = new URL('index.html',out);
let html = await readFile(home,'utf8');
const htitle = 'Bahamas Luxury Concierge Services | Pearson Concierge';
const hdesc = 'Private concierge services in Nassau and Paradise Island, Bahamas. Arrange yacht days, in-villa massage, private chefs, airport transfers and villa provisioning.';
const homeSchema = [{ '@type':'Organization',name:'Pearson Concierge',description:hdesc,founder:{'@type':'Person',name:'Amar Pearson'},areaServed:[{'@type':'Place',name:'Nassau, The Bahamas'},{'@type':'Place',name:'Paradise Island, The Bahamas'}],...(siteUrl?{url:siteUrl}:{})},{'@type':'WebSite',name:'Pearson Concierge',...(siteUrl?{url:siteUrl}:{})}];
// The source home may already be SEO-enriched for root deployments. Keep rebuilds idempotent.
html=html.replace(/<!-- SEO-OUTPUT-START -->[\s\S]*?<!-- SEO-OUTPUT-END -->/g,'');
html=html.replace('</head>', `<!-- SEO-OUTPUT-START -->` + `${siteUrl?`<link rel="canonical" href="${escapeHtml(siteUrl)}/"/><meta property="og:url" content="${escapeHtml(siteUrl)}/"/>`:''}<meta property="og:site_name" content="Pearson Concierge"/><meta name="twitter:card" content="summary_large_image"/><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':homeSchema})}</script><!-- SEO-OUTPUT-END --></head>`);
await writeFile(home,html);
let privacy=await readFile(new URL('privacy.html',out),'utf8');
privacy=privacy.replace('content="index,follow"','content="noindex,follow"');
if(siteUrl) privacy=privacy.replace(/<link rel="canonical" href="[^"]+"\s*\/>/g,'');
privacy=privacy.replace('</head>',`<link rel="canonical" href="${escapeHtml(siteUrl)}/privacy.html"/></head>`);
await writeFile(new URL('privacy.html',out),privacy);
const notFound = `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="robots" content="noindex,follow"/><title>Page Not Found | Pearson Concierge</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"/><link rel="stylesheet" href="/styles.css"/></head><body><a class="skip-link" href="#main">Skip to content</a>${nav}<main id="main"><section class="page-hero"><div class="container"><span class="eyebrow">PAGE NOT FOUND</span><h1>This page isn't available.</h1><p>Return to Pearson Concierge to explore private services in Nassau and Paradise Island.</p><div class="page-actions"><a class="btn btn-cream" href="/">Back to homepage <span aria-hidden="true">↗</span></a></div></div></section></main>${footer}</body></html>`;
await writeFile(new URL('404.html',out),notFound);
const urls=['/',...pages.map(p=>p.path)];
const robots='User-agent: *\nAllow: /\n'+(siteUrl?`Sitemap: ${siteUrl}/sitemap.xml\n`:'');
await writeFile(new URL('robots.txt',out),robots);
if(siteUrl) {
  const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(path=>`  <url><loc>${escapeHtml(siteUrl+path)}</loc></url>`).join('\n')}\n</urlset>\n`;
  await writeFile(new URL('sitemap.xml',out),xml);
}
console.log(`Built ${pages.length+1} indexable pages and privacy in dist/. ${siteUrl?`Sitemap enabled: ${siteUrl}`:'SITE_URL missing: canonical URLs and sitemap correctly withheld until domain confirmed.'}`);
