# Pearson Concierge — SEO audit & implementation record

Audit date: 23 October 2026. Scope: GitHub source and independently accessed public competitor websites. **No public Pearson Concierge domain was supplied, therefore no crawl, ranking, live Core Web Vitals or Search Console claim is made.**

## Competitive findings

| Competitor | Observable advantage | Source |
|---|---|---|
| Herbert + Arnold | Detailed concierge, travel and property management service taxonomy, Nassau positioning | https://www.herbertandarnold.com/our-services |
| Privileged Bahamas | Concierge/Executive pages, explicit villa, chef, provisioning, wellness and itinerary needs | https://privilegedbahamas.com/concierge-services/ |
| LC Transpo | Highly specific Nassau transfer and concierge messaging, local destinations, tenure claims | https://www.lctranspo.com/ |
| Bella Yacht Concierge | Yacht provisioning specialization and specific yacht-facing capabilities | https://bellayachtbahamas.com/ |
| SALT Island Services | Lifestyle/property membership positioning | https://saltbahamas.net/ |

These businesses are not assumed to outrank Pearson Concierge for any particular keyword. No keyword volumes, rankings or backlink counts were verified. Competing directly as an all-services platform would create unsupported operational promises; focus instead on high-intent service enquiries and request clarity.

## Original gaps and changes

| Finding | Priority | Resolution |
|---|---|---|
| Generic homepage H1 and weak Nassau targeting | High | Keyword-relevant hero and Nassau/Paradise Island explanatory section |
| Only one service overview page | High | Five unique crawlable service pages with descriptions, requirements and FAQs |
| No area or private aviation arrival content | High | Dedicated Nassau/Paradise Island and ground-arrivals pages with clear boundaries |
| No founder identity or B2B referral path | Medium | About page naming Amar Pearson; partner enquiries page |
| No unique metadata or structured data per service | High | Page-specific titles/descriptions/Open Graph and Service, Organization, WebPage, BreadcrumbList JSON-LD |
| No canonical or sitemap | High | Build-time generation conditional on `SITE_URL` after custom domain verification |
| Weak internal linking | High | Service cards, contextual related pages, footer links, breadcrumbs, location links |
| Illustrative remote images with unverified Bahamas location claims | Medium | Remove inaccurate geography claims in alt/caption; replace with genuine approved media after supply |
| No verified contact inbox / delivery configuration | Launch blocker | Preserve existing Cloudflare Pages Function; requires Resend secrets and live email-delivery test |
| No live site crawling or GSC property | Launch blocker | Requires chosen deployed domain, real indexing and performance data |
| Existing stock imagery and external font loading | Medium | Streamlined fonts; real asset/local performance work remains after approved photo selection |

## Target search intents, not promised rankings

- **Bahamas luxury concierge**, **private concierge Nassau**, **Nassau concierge services** → `/`, `/nassau-paradise-island-concierge/`
- **private yacht charter Nassau**, **yacht charter Bahamas** → `/services/private-yacht-charters-bahamas/`
- **in-villa massage Nassau**, **mobile massage Paradise Island** → `/services/in-villa-massage-bahamas/`
- **private chef Nassau**, **chef for Bahamas villa** → `/services/private-chefs-bahamas/`
- **private airport transfer Nassau**, **Nassau private driver** → `/services/nassau-airport-transfers/`
- **villa provisioning Bahamas**, **Nassau villa groceries** → `/services/villa-provisioning-bahamas/`
- **private aviation concierge Nassau**, **Nassau private jet ground arrangements** → `/private-aviation-arrivals-bahamas/`
- **villa and aviation concierge partners Nassau** → `/partners/`

Avoid creating near-identical destination doorway pages without location-specific verified offerings.

## Launch checklist — remaining actions

1. Choose and connect a real custom domain; set Cloudflare Pages `SITE_URL` to its HTTPS origin; rebuild; confirm redirects to one canonical hostname.
2. Set verified sender and inbox (`RESEND_API_KEY`, `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL`); submit a live request and confirm delivery, consent handling and reply process.
3. QA public HTTP 200/301/404, sitemap, canonicals, image loading, mobile and desktop, consent and form submission; run PageSpeed Insights for performance metrics and validate JSON-LD.
4. Verify Google Search Console for the connected domain, submit sitemap and inspect priority pages. Google indexing and rankings cannot be guaranteed.
5. Add real public contact details, approved destination imagery, verified supplier arrangements, business legitimacy and proof only as these become available. Establish a Google Business Profile only if Google's actual business eligibility and in-person contact requirements are met.
6. Evaluate search impressions, enquiries and qualified bookings after indexing; optimize based on actual conversion data, not estimated keyword volumes.

SEO reference: https://developers.google.com/search/docs/fundamentals/seo-starter-guide and https://developers.google.com/search/docs/appearance/structured-data/local-business.
