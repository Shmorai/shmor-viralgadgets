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
- **82 gadgets** (30 added 2026-10-14 at the user's request). **Pages:** assets/site.js splits the matching cards into pages of max(12, total ÷ 5), so the full catalogue shows as 5 pages; a "Show all N" button puts everything on one page, filters reset to page 1, and the pager hides when results fit on one page. "Surprise me" and `#g-<id>` links jump to the right page. All cards stay in the HTML for SEO (JS only hides them).
- **Volt break cards:** JS inserts a dark "Volt says" card after the 5th and 12th card on each page (more when showing all), rotating through the `QUIPS` list in assets/site.js. Keep quips playful, honest tips (no invented facts).

## Pages (30)
Home (ticker + full finder, shop-by-person tiles, browse-by-type, how we pick) · tiktok-gadgets · amazon-gadgets · gadgets-under-50 · gift-ideas (+ for-teens, for-kids, for-her, for-him, for-grandparents) · gaming-gadgets · smart-home-gadgets · kitchen-gadgets · cameras-for-creators · tech-deals (sale calendar + how to check a deal) · tech-reviewers (MKBHD, Mrwhosetheboss, Unbox Therapy, LTT, iJustine, JerryRigEverything, Dave2D, Austin Evans: channel links only, no endorsement claimed; FTC/ASA/EU disclosure rules) · blog + 9 posts.
Top menu (navOrder): TikTok finds, Amazon finds, Gift ideas, Gaming, Reviews, Deals, Creators (tech-reviewers page), Journal (the blog). Smart home is in the footer and category tiles.

## Blog (/blog/)
Posts (21 as of 2026-10-14): Apple fall launches (iPhone Duo, 18 Pro, Watch 12, AirPods 5), Kodak Charmera, digicam comeback, Black Friday tech deals guide (27 Nov 2026 / Cyber Monday 30 Nov), spotting fake reviews & paid posts, TikTok-made-me-buy-it worth it?, Christmas tech gifts by age, power banks on planes, smart glasses explained; plus (added at the user's request) ROG Xbox Ally explained, Ninja SLUSHi worth it?, smart rings explained (incl. the Oct 2025 Ultrahuman US import ban), walking pads, record player buying guide, choosing wireless earbuds, Fujifilm X100VI hype + alternatives, galaxy star projector safety, smart bird feeders (Bird Buddy free vs Premium), gaming handhelds compared, is the PS5 Pro worth it?, buying refurbished tech.
Writing rules: research current facts, link sources (`"sources"`), "as of" wording for anything that changes, no year in titles, no invented prices/stats/quotes/reviews, link into the finder or relevant pages, free-licence Unsplash image (check the URL returns 200). When a big launch happens, add it to `data/gadgets.json` with `"added"` and write a post.
Dated facts to re-check: Prime Big Deal Days card on tech-deals (was 6–7 Oct 2026), Black Friday dates, Meta Ray-Ban Display availability, DJI US availability, airline power-bank rules.

## Volt's verdicts (/reviews/)
Added 2026-10-14. The user asked for twice-weekly reviews of trending items by a made-up mascot with star ratings. Because fake reviews are banned (FTC rule, UK DMCC Act, EU law, and our own "no invented reviews" rule), **Volt is an openly fictional robot mascot** (`assets/volt.svg`) and every rating is labelled **research-based**: the team summarises what established outlets and long-term tests say, links them in "sources", and never claims hands-on testing. No structured-data star ratings.
- Hub: `content/reviews.json` (latest verdicts + "How Volt rates" at `#how-volt-rates`). Reviews: `content/reviews/<slug>.json` with `"type": "review"`, `gadget` (id in data/gadgets.json), `date`, `rating` (0–5 halves), `scores` {hype, value, staying}, `verdict`, `pros`, `cons`, `bestFor`, `skipIf`, `sources` (required), blocks `verdict` (top) + `reviewList`. The build fails if gadget, date or sources are missing.
- A gadget with a review shows its stars + "Volt's verdict" link on its finder card; the homepage shows the 3 latest verdicts above the finder.
- First reviews (2026-10-14): Nintendo Switch 2 (4.5), Kindle Paperwhite (4.5), Kodak Charmera (3).

## Volt on the homepage
Added 2026-10-14 to make the site more fun (user request). Volt bobs in the hero with a speech bubble (`heroHtml` in home.json), pops up between sections with "Volt says" bubbles (`voltSays` block: `text` + `side` left/right), leaves a one-line comment on every spotlight card (`comments` map in the spotlight block; shown on hover, and on phones only on the lead card), and appears as a toast when someone hits "Surprise me" (random lines in assets/site.js) and in the finder's empty state. Comments are playful but honest: drawn from the gadgets' notes and reviews, never invented facts or numbers. **Every id in the spotlight `ids` needs a matching comment.**
Homepage order: hero → ticker → In the spotlight (lead + 12) → Volt says → Shop by person → Browse by category → Volt says → Volt's latest verdicts → Volt says → finder → journal posts → how we pick → FAQ.

## Volt's Weekly newsletter (temporary storage)
Added 2026-10-14. A red sign-up band with Volt sits above the footer on every page (`templates/layout.html`, styles `.nl-*`, script at the end of `assets/site.js`): email + an unticked consent box linking to shmor.ai/privacy. The user asked for it to look live and simply store emails for now. The script saves a sign-up to, in order: (1) a mailing-list provider if the form has an `action`; (2) the private preview artifact's database, collection `signups` (rules: read/write admin, so only the owner sees them; read with ArtifactData "list"); (3) the local preview server, `tools/serve.js` POST /api/newsletter → `subscribers/signups.csv` (git-ignored, never served). It only says "You're in!" when one of these saved it; otherwise it asks to try again. **Before launch:** the user has no provider yet; recommended **Kit** (free to 10,000 subscribers, double opt-in). Once they paste Kit's form HTML, set the form `action` (and the email field name Kit uses), import any stored sign-ups, and remove the temporary storage paths. GitHub Pages has no server, so without a provider the live site cannot store sign-ups.

## Automation
**Since 2026-10-14 the updates run inside the pinned "ViralGadgets" chat** (user request): an in-chat recurring job fires Tue + Fri ~10:17 while that chat is open, follows the routine's instructions below, re-checks every photo by viewing it, and republishes the private preview. In-chat jobs expire after 7 days and vanish if the app restarts, so each run renews the job; if it's gone, re-create it (cron `17 10 * * 2,5`). The separate routine below is **paused** (its first run got stuck waiting for permission approval, then failed on a dropped connection) and kept as the step-by-step instructions (`C:\Users\Interent Income\.claude\scheduled-tasks\viralgadgets-twice-weekly\SKILL.md`). First update done 2026-10-14: Apple HomeView/HomePod mini 2/Apple TV 4K explainer + Pixel 11 verdict.
Routine **"ViralGadgets: twice-weekly trending post + review"** (`viralgadgets-twice-weekly`, paused), Tue + Fri ~10:20, so the site gets **2 new journal posts + 2 new reviews every week**. Each run finds gadgets released or going viral in the last 7–14 days (dated, reputable sources), publishes 1 journal post on the newest release/viral trend + 1 Volt review, adds/updates gadgets (with checked photos), links them in, adds keywords, rebuilds, syncs the master, commits, and pushes the **private** site repo only (shmor-ai is committed, not pushed).

## Design
"Editorial" (redesigned 2026-10-14 after the user found the first "sticker pop" look too childish and asked for something more stylish with more photos; the old theme is in git history). Warm paper #F5F3EE, near-black ink #0E0E10, one vermilion accent #E8452C (soft #FF8A73 on dark photos), hairline borders #E0DBD1, no cartoon outlines or icons. Fonts (user asked for a cross: this layout and logo with the first design's type, 2026-10-14): Bricolage Grotesque 800 for headlines, wordmark and buttons, tight letter-spacing, with the highlighted word (`h1Html` <em>) in accent colour over a tilted underline bar; Inter for body and UI. The type overrides are the last block in `assets/site.css`. Logo: black rounded square with a cream "V" chevron and a vermilion dot; wordmark "Viral" + vermilion "Gadgets" in Bricolage, "BY SHMOR.AI" small caps.
**Photo-led:** full-bleed hero photos with a dark gradient on every page; homepage = hero → slim black "Trending now" ticker → "In the spotlight" (lead + 8 photo cards; `spotlight` block with `ids`, chosen because their photos genuinely match the product) → Volt's latest verdicts → finder → "Shop by person" photo tiles → "Browse by category" (8 photo tiles) → "How we pick" (big numbered steps) → journal posts. **Every gadget card has a photo** (`img` in data/gadgets.json): free-licence Unsplash, credited in the card details, labelled "illustrative" in the finder note. When a photo clearly shows a different product, prefer a neutral one (e.g. iPhone Duo uses a generic iPhone shot, not Android phones). Finder bar is sticky on desktop; chip rows swipe sideways on mobile. Dark footer. Checked at 375px (no horizontal scroll) and 1440px. The blog is labelled "Journal" in the menu (URL stays /blog/).

## Private preview link
https://claude.ai/artifact/XBMLPTHQKRKptHKPQhT6EQ (private claude.ai artifact, owner only unless shared from its Share menu; created 2026-10-14). To refresh it: `node tools/build.js`, then `node tools/preview-export.js ../../previews/viralgadgets` (rewrites links to relative, marks pages noindex, downloads every Unsplash photo into assets/img because the viewer blocks external images), then republish `Shmor/previews/viralgadgets/index.html` to that URL with ALL files in `files` (files left out keep their old version).

## Commands (run here)
```bash
node tools/build.js           # rebuild after ANY change to content/, data/, templates/ or shmor-site.json
node tools/serve.js 4011      # local preview (preview config "viralgadgets")
```
After changing `shmor-site.json`, also run `node tools/sync-network.js` in `../../shmor-ai`.

## Kit hook added for this site
`tools/build.js` (kit) loads `tools/blocks.js` if a site has one: `{ typeName: (block, page, kit) => html }`. Added to the kit master and copied to every site on 2026-10-14 (no output change for sites without blocks.js).

## Ideas / next
Amazon Associates (US, UK, DE) tags (note: the review-page price buttons in assets/site.js don't add tags yet; wire them to shmor-site.json retail when tags arrive) · Awin/CJ/Impact programmes for Currys, Argos, Best Buy, John Lewis · weekly "what's trending" post (scheduled task, like TravelDeals) · audio and wellness type pages · a gift quiz.
