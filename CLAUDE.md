# ViralGadgets (viralgadgets.shmor.ai)

A Shmor marketplace (shared rules in `../../CLAUDE.md`): its own brand, design and SEO. The gadgets everyone is talking about on TikTok, Amazon and YouTube, sorted by age, who it's for and type, with honest heads-ups, links to influencer reviews and deal timing. Replaced the planned "Shmor Tech" card on shmor.ai (2026-10-14). Repo: `Shmorai/shmor-viralgadgets` (private until launch). Status: **building**, with no referral links yet.

## Where things are
| What | Where |
|---|---|
| Card on shmor.ai, search keywords, **referral links**, offers, SEO defaults, `retail` (Amazon hosts + Associates tags per region) | `shmor-site.json` |
| **Gadget catalogue** (every product card on the site) | `data/gadgets.json` |
| Finder, ticker and spotlight block renderers (kit hook) | `tools/blocks.js` |
| Pages (1 JSON file = 1 Google landing page) | `content/` (`home.json` = homepage) |
| Design: header, logo, footer | `templates/layout.html` |
| Design: styles | `assets/site.css` (kit defaults; **ViralGadgets theme** block at the bottom) |
| Finder behaviour (filters, search, region, Surprise me, saved hearts) | `assets/site.js` (bottom block) |
| Generated output (don't edit by hand) | `index.html`, `*/index.html`, `sitemap.xml`, `robots.txt`, `404.html`, `search/`, `blog/feed.xml` |

## The gadget finder
- `data/gadgets.json` items: `id, name, brand, type, ages[kids|teens|young|adults|seniors], who[him,her], price (budget|mid|premium band, never an exact price), trend[tiktok|amazon|youtube], blurb, why, note (heads-up), q (search words), guide (page slug), link (referral slug, optional), added (YYYY-MM → "New" sticker + ticker)`.
- A page shows it with a block `{ "type": "gadgets", "position": "top", "title", "intro", "preset": { "trend"|"who"|"age"|"type"|"price": value } }` or a curated `"ids": [...]` list. Cards are **static HTML** (crawlable); JS only filters. Filters sync to the URL (`/?type=gaming&age=teens#finder`), so pages and posts can deep-link into the finder.
- "Check today's price": the item's `link` via `shmor.ai/go/` if it has one, otherwise a plain Amazon search for the visitor's region (US amazon.com, UK amazon.co.uk, EU amazon.de; auto-guessed from browser language, switchable, remembered). When the user gets **Amazon Associates** tags, paste them exactly into `shmor-site.json` → `retail.<region>.tag`. Other affiliate programmes → `links` + item `link`.
- "YouTube reviews" / "TikTok reviews" open live search results for that product. **We never claim what a specific influencer said** about a product, and show no star ratings, prices or sales figures.
- Who/age tags are editorial starting points. Gift pages say plainly that gadgets aren't gendered.

## Pages (26)
Home (ticker + full finder, shop-by-person tiles, browse-by-type, how we pick) · tiktok-gadgets · amazon-gadgets · gadgets-under-50 · gift-ideas (+ for-teens, for-kids, for-her, for-him, for-grandparents) · gaming-gadgets · smart-home-gadgets · kitchen-gadgets · cameras-for-creators · tech-deals (sale calendar + how to check a deal) · tech-reviewers (MKBHD, Mrwhosetheboss, Unbox Therapy, LTT, iJustine, JerryRigEverything, Dave2D, Austin Evans: channel links only, no endorsement claimed; FTC/ASA/EU disclosure rules) · blog + 9 posts.
Top menu (navOrder): TikTok finds, Amazon finds, Gift ideas, Gaming, Smart home, Deals, Reviewers, Journal (the blog).

## Blog (/blog/)
Posts (2026-10): Apple fall launches (iPhone Duo, 18 Pro, Watch 12, AirPods 5), Kodak Charmera, digicam comeback, Black Friday tech deals guide (27 Nov 2026 / Cyber Monday 30 Nov), spotting fake reviews & paid posts, TikTok-made-me-buy-it worth it?, Christmas tech gifts by age, power banks on planes, smart glasses explained.
Writing rules: research current facts, link sources (`"sources"`), "as of" wording for anything that changes, no year in titles, no invented prices/stats/quotes/reviews, link into the finder or relevant pages, free-licence Unsplash image (check the URL returns 200). When a big launch happens, add it to `data/gadgets.json` with `"added"` and write a post.
Dated facts to re-check: Prime Big Deal Days card on tech-deals (was 6–7 Oct 2026), Black Friday dates, Meta Ray-Ban Display availability, DJI US availability, airline power-bank rules.

## Design
"Editorial" (redesigned 2026-10-14 after the user found the first "sticker pop" look too childish and asked for something more stylish with more photos; the old theme is in git history). Warm paper #F5F3EE, near-black ink #0E0E10, one vermilion accent #E8452C (soft #FF8A73 on dark photos), hairline borders #E0DBD1, no cartoon outlines or icons. Fonts (user asked for a cross: this layout and logo with the first design's type, 2026-10-14): Bricolage Grotesque 800 for headlines, wordmark and buttons, tight letter-spacing, with the highlighted word (`h1Html` <em>) in accent colour over a tilted underline bar; Inter for body and UI. The type overrides are the last block in `assets/site.css`. Logo: black rounded square with a cream "V" chevron and a vermilion dot; wordmark "Viral" + vermilion "Gadgets" in Bricolage, "BY SHMOR.AI" small caps.
**Photo-led:** full-bleed hero photos with a dark gradient on every page; homepage = hero → slim black "Trending now" ticker → "In the spotlight" (3 large photo cards; `spotlight` block with `ids`, chosen because their photos genuinely match the product) → finder → "Shop by person" photo tiles → "Browse by category" (8 photo tiles) → "How we pick" (big numbered steps) → journal posts. **Every gadget card has a photo** (`img` in data/gadgets.json): free-licence Unsplash, credited in the card details, labelled "illustrative" in the finder note. When a photo clearly shows a different product, prefer a neutral one (e.g. iPhone Duo uses a generic iPhone shot, not Android phones). Finder bar is sticky on desktop; chip rows swipe sideways on mobile. Dark footer. Checked at 375px (no horizontal scroll) and 1440px. The blog is labelled "Journal" in the menu (URL stays /blog/).

## Commands (run here)
```bash
node tools/build.js           # rebuild after ANY change to content/, data/, templates/ or shmor-site.json
node tools/serve.js 4011      # local preview (preview config "viralgadgets")
```
After changing `shmor-site.json`, also run `node tools/sync-network.js` in `../../shmor-ai`.

## Kit hook added for this site
`tools/build.js` (kit) loads `tools/blocks.js` if a site has one: `{ typeName: (block, page, kit) => html }`. Added to the kit master and copied to every site on 2026-10-14 (no output change for sites without blocks.js).

## Ideas / next
Amazon Associates (US, UK, DE) tags · Awin/CJ/Impact programmes for Currys, Argos, Best Buy, John Lewis · weekly "what's trending" post (scheduled task, like TravelDeals) · audio and wellness type pages · a gift quiz.
