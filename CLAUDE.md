# ViralGadgets (viralgadgets.shmor.ai)

A Shmor marketplace (shared rules in `../../CLAUDE.md`): its own brand, design and SEO. The gadgets everyone's talking about on TikTok, Amazon and YouTube, filtered by age, who it's for and type, with honest guides and deal timing. Repo: `Shmorai/shmor-viralgadgets` (private until launch). Status: **building**.

## Where things are
| What | Where |
|---|---|
| Card on shmor.ai, search keywords, **referral links**, offers, SEO defaults | `shmor-site.json` |
| Pages (1 JSON file = 1 Google landing page) | `content/` (`home.json` = homepage) |
| Design: header, logo, footer | `templates/layout.html` |
| Design: styles | `assets/site.css` (kit defaults; add this site's theme block at the bottom) |
| Generated output (don't edit by hand) | `index.html`, `*/index.html`, `sitemap.xml`, `robots.txt`, `404.html`, `search/` |

## Design
Not designed yet: still the kit's default theme. Give it its own look (see `../shmor-traveldeals/` for a finished example) and record the palette here.

## Commands (run here)
```bash
node tools/build.js           # rebuild after ANY change to content/, templates/ or shmor-site.json
node tools/serve.js <port>    # local preview (see the "viralgadgets" preview config)
```
After changing `shmor-site.json`, also run `node tools/sync-network.js` in `../../shmor-ai`.

## Referral links
Add to `shmor-site.json` → `"links"`, list slugs in a page's `"partners"` (or add `"offers"`), rebuild, sync the master, then commit both repos.
