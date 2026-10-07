# Google Search Console audit — 7 October 2026

Property: `sc-domain:corstack.dev`. This domain property includes the main site and all subdomains. The indexing report was last updated on 4 October, before the 6 October database/storage migration.

## What Google reported

| Reason | Pages | Affected site | Assessment |
| --- | ---: | --- | --- |
| Soft 404 | 11 | `blocklens.corstack.dev/coin/*` | Coin routes served an empty SPA shell and depended on a browser-side API request. They now serve visible coin content in initial HTML, with correct error status codes. All 11 URLs verified live; Google validation started on 7 October. |
| Page with redirect | 3 | HTTP apex and HTTP/HTTPS `www.corstack.dev` | Expected exclusion when redirects work. The current hosting configuration had regressed: HTTP returned 200 and HTTPS www returned Vercel `DEPLOYMENT_NOT_FOUND` (404). Fixed and verified below. |
| Duplicate without user-selected canonical | 1 | `https://omnimart.corstack.dev/` | No declared canonical; Google selected the former Vercel hostname. Added page-specific canonicals, confirmed by Google's live test, requested indexing, and started validation. |
| Alternate page with proper canonical tag | 1 | `https://web.corstack.dev/` | Expected: this copy declares `https://corstack.dev` as canonical. |
| Crawled — currently not indexed | 1 | `https://verifio.corstack.dev/` | Homepage already had readable server-rendered content. Added missing canonicals, sitemap, and robots discovery. Google's eventual indexing decision remains pending. |
| Blocked due to other 4xx issue | 0 | — | No affected URLs in the current report. |

The 11 Soft 404 coin identifiers are `stellar`, `tron`, `solana`, `leo-token`, `usds`, `monero`, `chainlink`, `cardano`, `whitebit`, `usd-coin`, and `figure-heloc`. Their last crawls were 27–29 September.

Google shows nine indexed URLs across the domain, including the main homepage, Luxe Hotel, VelloTech, and six Blocklens pages. Corstack's portfolio/services pages are absent from that example list; their current rendered content and canonical metadata are available to crawlers.

Manual actions and Security issues both report **No issues detected**. HTTPS reports no issues in the last 90 days. Core Web Vitals has insufficient usage data for both mobile and desktop; this is not a passing performance assessment.

## Changes made to Corstack

- Restored a Cloudflare Worker route for `www.corstack.dev/*`, intercepting the existing proxied hostname before its obsolete Vercel origin. Preserved the apex and `web` custom domains in Wrangler configuration.
- Added permanent 308 redirects from www and HTTP apex to `https://corstack.dev`, preserving paths and query strings.
- Handled the homepage separately and anchored host/protocol conditions explicitly for OpenNext compatibility.
- Gave the standalone portfolio page an H1 while retaining H2 for the homepage's portfolio section.
- Linked the footer's Services item directly to `/services` so the existing page is reachable through site navigation.
- Submitted the existing five-page sitemap to Search Console. No sitemap had previously been submitted in this property. The initial report said **Couldn't fetch**, but Google's live URL inspection successfully fetched the XML, with **Crawl allowed: Yes** and **Page fetch: Successful**. After processing, the Sitemaps report now shows **Success**, with **five discovered pages**.
- Requested indexing for the portfolio page; Google accepted the request. Acceptance does not mean the page is already indexed.

## Validation and deployment

Lint, TypeScript, all 21 existing tests, and the Cloudflare production build passed. The built Worker was tested locally for www redirects, root/nested paths, encoded/repeated query strings, HTTP versus HTTPS behavior, server-rendered portfolio content, and unauthenticated admin protection.

An initial deployment exposed OpenNext behavior that differed from Next.js's routing test utility: an empty wildcard remained literal at `/`, and an unanchored `http` pattern also matched `https`. This introduced a temporary redirect loop. The prior deployment was restored, both issues were corrected, and the actual Worker was tested before redeployment.

Final production version: `3aef4ac2-c050-43fc-a3be-6252017e79ed`.

Verified on the live site:

- HTTP apex and HTTP/HTTPS www return 308 to the correct HTTPS apex URL.
- www portfolio URLs preserve `?source=google`.
- HTTPS homepage and portfolio return 200 with one H1 each.
- Portfolio HTML includes the Services navigation link.
- Existing `web` admin login returns 200; unauthenticated admin session requests return 401.
- Sitemap returns 200 with XML containing the five public canonical URLs.

## Changes made to BlockLens

Repository: `C:\Users\User\Documents\BlockLens`.

Before the change, the reported coin URLs returned HTTP 200 with an empty React root and generic metadata. Browser requests could then show an unavailable-asset message while the URL still returned 200. This is consistent with Google's Soft 404 classification; the exact upstream response during September's crawls cannot be reconstructed.

- Routed `/coin/*` through the Worker before SPA asset fallback. The initial HTML now includes the coin name, price, market statistics, description, and route-specific canonical metadata, for both visitors and crawlers.
- Added a shared server-side coin endpoint and an escaped JSON seed so the browser can use the same initial data immediately.
- Added bounded caching, request coalescing, and an exact-asset CoinPaprika backup for ten of the reported coins when CoinGecko fails. Missing backup statistics display as unavailable; prices are not fabricated. Figure Heloc remains served by CoinGecko.
- Unknown assets return 404; temporary provider failures return 503 with Retry-After, rather than a misleading 200 page.
- Added a 13-URL public sitemap and robots discovery, and route-specific canonical updates during client navigation.

Validation: the isolated SEO checkout passed all **136 tests across 24 files**, TypeScript, and the production build. Live checks verified all 11 reported URLs return 200 with visible content, matching JSON data and their own canonical URL. Unknown coins return 404; the public coin API and sitemap return 200; unauthenticated account requests return 401.

Concurrent authentication and trading changes appeared in the main checkout during this work. They were preserved and excluded from the SEO deployment. Build/tests/deployment ran from `C:\Users\User\Documents\BlockLens-SEO-review`, based on committed revision `a839a7a` plus only this audit's SEO changes. The 136-test result applies to that isolated checkout, not all concurrent edits in the main checkout. The isolated checkout is retained for review; its node_modules directory is a junction to the original repository.

Final production version: `9f38d30e-7105-4e5a-bb7c-9d8d7164369d`. Google visibly confirmed **Validation started**, dated 7 October. Validation has not yet passed.

## Changes made to OmniMart

Repository: `C:\Users\User\Documents\OmniMart`.

Google's 18 September crawl found no user-declared canonical and selected `https://omnimartshop.vercel.app/`. Added a server page wrapper around the existing client homepage, the correct metadata base, and separate canonical URLs for the homepage and products page. Added a two-URL sitemap and robots discovery. A global homepage canonical was avoided so other pages do not inherit the wrong URL.

The Next.js production build, type checking, and Cloudflare build passed. Local and public HTTP checks confirmed both pages' correct canonicals and valid 200 sitemap/robots responses. Google's live test confirmed **Page fetch: Successful**, **Indexing allowed: Yes**, and the declared canonical `https://omnimart.corstack.dev/`. The indexing request was accepted and duplicate validation visibly started on 7 October. Google's selected canonical will only update after reprocessing.

Final production version: `294c4a98-ce31-41f0-b98c-ec3c1a7e7f54`.

## Changes made to Verifio

Repository: `C:\Users\User\Documents\Verifio`.

The homepage already returned readable server-rendered content and HTTP 200, so the exclusion alone did not prove a rendering bug. Added a server homepage wrapper, correct metadata base, page-specific canonicals for home/contact/privacy/terms, a four-URL sitemap, and robots discovery.

The Next.js build and lint of changed public-page files passed. A Windows OpenNext directory-symlink failure was fixed with a build helper that falls back to junctions only for dependency directories inside this repository after EPERM; no system permissions were changed. The complete Cloudflare build then passed. Local and live checks confirmed all four pages' correct canonicals, valid 200 crawl files, and unauthenticated `/api/auth/me` returning 401. Authenticated transactions were not exercised by this SEO audit.

Google's live homepage test confirmed **URL is available to Google**, **Page fetch: Successful**, **Crawl allowed: Yes**, **Indexing allowed: Yes**, and the declared canonical `https://verifio.corstack.dev/`. Google accepted the homepage indexing request. This is a recrawl request, not confirmation of indexing.

Final production version: `ccf39222-c5cf-4020-b38f-2f7941d35518`.

## Google follow-up and remaining processing

- Corstack sitemap: **Success**, five discovered pages.
- BlockLens, OmniMart and Verifio sitemaps: submissions accepted. Their initial report currently shows **Couldn't fetch**, type Unknown and zero discovered pages. All three public sitemap endpoints return valid XML with HTTP 200. Google's live URL tests independently confirmed **Page fetch: Successful** and **Crawl allowed: Yes** for all three sitemap URLs; the tested-source panels showed actual sitemap XML, not SPA fallback HTML. Each was resubmitted once after that check. Sitemap processing remains unconfirmed; the reason for the report's discrepancy is not established.
- BlockLens Soft 404 and OmniMart duplicate validations: **Started**, not yet passed.
- Verifio homepage and Corstack portfolio: indexing requests accepted. Verifio's exclusion is a Google indexing decision rather than an established remaining fetch/rendering defect.
- Redirect exclusions and the `web.corstack.dev` canonical alternate are expected to remain excluded by design.
- Indexing/report totals still reflect Google's earlier crawl data. No promise of indexing or rankings is implied by these code fixes or accepted requests.

Existing production environment variables and secrets were preserved during each deployment. No authentication migration, destructive data operation, or unrelated concurrent code was included.

## Saved Google evidence

Screenshots are in `C:\Users\User\.codex\visualizations\2026\10\04\01a10864-5f9e-7c13-bcbf-c67beba78540`:

- `google-blocklens-validation-started.png`: Google accepted Soft 404 validation.
- `google-omnimart-validation-started.png`: duplicate validation started.
- `google-omnimart-indexing-requested.png` and `google-verifio-indexing-requested.png`: accepted homepage indexing requests.
- `google-portfolio-indexing-requested.png`: accepted Corstack portfolio request.
- `google-verifio-live-test.png`: successful homepage fetch and correct canonical.
- `google-blocklens-sitemap-live-xml.png`, `google-verifio-sitemap-live-xml.png`, `google-omnimart-sitemap-live-xml.png`: Google fetched the actual XML.

All code changes remain uncommitted in their respective repositories for review. Temporary patch drafts in Corstack were removed after applying the changes to their owning repositories; local verification servers were stopped.

## References

- [Google Page indexing report](https://support.google.com/webmasters/answer/7440203?hl=en)
- [Google Sitemaps report and fetch troubleshooting](https://support.google.com/webmasters/answer/7451001?hl=en)
- [Google canonical consolidation guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
