/* =====================================================================
   ViralGadgets: site-specific block types for tools/build.js (kit hook).

   "gadgets" block: the gadget finder. Renders every matching gadget from
   data/gadgets.json as static, crawlable HTML (cards carry data-* filter
   values); assets/site.js adds the filter chips, search, region switch,
   "Surprise me" and saved hearts on top.

     { "type": "gadgets", "title": "...", "intro": "...",
       "preset": { "trend": "tiktok" } | { "who": "her" } | { "age": "teens" }
               | { "type": "gaming" } | { "price": "budget" },   (optional, page filter)
       "ids": ["gadget-id", ...],                                  (optional, curated list in this order)
       "limit": 12 }                                               (optional)

   "Check price" uses the gadget's "link" (referral slug in shmor-site.json
   "links", via shmor.ai/go/) when it has one, otherwise a plain retailer
   search from shmor-site.json "retail" (add Amazon Associates tags there
   only when the user supplies them).
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'gadgets.json'), 'utf8'));
const DIMS = [
  { key: 'who', label: 'Gift for', field: 'who', values: { him: 'Him', her: 'Her' } },
  { key: 'age', label: 'Age', field: 'ages', values: DATA.ages },
  { key: 'type', label: 'Type', field: 'type', values: Object.fromEntries(Object.entries(DATA.types).map(([k, v]) => [k, v.label])) },
  { key: 'price', label: 'Price', field: 'price', values: { budget: 'Under $50', mid: '$50–200', premium: '$200+' } },
  { key: 'trend', label: 'Trending on', field: 'trend', values: DATA.trends },
];

const P = d => `<path d="${d}"/>`;
const C = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}"/>`;
const ART = {
  phones: P('M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z') + P('M12 18h.01'),
  audio: P('M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3'),
  creator: P('M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z') + C(12, 13, 3),
  gaming: P('M6 11h4') + P('M8 9v4') + P('M15 12h.01') + P('M18 10h.01') + P('M17.32 5H6.68a4 4 0 0 0-3.978 3.59C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258A4 4 0 0 0 17.32 5z'),
  smarthome: P('M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5') + P('M9 18h6') + P('M10 22h4'),
  kitchen: P('M2 12h20') + P('M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8') + P('m4 8 16-4') + P('m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8'),
  wellness: P('M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z') + P('M20 3v4') + P('M22 5h-4'),
  desk: P('M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z'),
};
const svg = (inner, size = 24, cls = '') => `<svg${cls ? ` class="${cls}"` : ''} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
const ICO = {
  search: C(11, 11, 8) + P('m21 21-4.3-4.3'),
  shuffle: P('M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22') + P('m18 2 4 4-4 4') + P('M2 6h1.9c1.5 0 2.9.9 3.6 2.2') + P('M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8') + P('m18 14 4 4-4 4'),
  heart: P('M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'),
  play: P('m6 3 14 9-14 9V3z'),
};

// Card photo: Unsplash URLs are resized by their CDN (srcset for sharp cards on every screen)
function photo(it, { esc, imgSrc }, w = 640, ratio = 0.75, sizes = "(max-width: 640px) 100vw, 360px") {
  if (!it.img) return "";
  const set = [360, 640, 960].map(x => `${esc(imgSrc(it.img, x, Math.round(x * ratio)))} ${x}w`).join(", ");
  return `<img src="${esc(imgSrc(it.img, w, Math.round(w * ratio)))}" srcset="${set}" sizes="${sizes}" width="${w}" height="${Math.round(w * ratio)}" alt="${esc(it.img.alt || "")}" loading="lazy" decoding="async">`;
}

function matches(it, preset) {
  return Object.entries(preset || {}).every(([k, v]) => {
    const d = DIMS.find(x => x.key === k);
    const val = it[d.field];
    return Array.isArray(val) ? val.includes(v) : val === v;
  });
}

module.exports.gadgets = function gadgets(b, p, kit) {
  const { esc, pagePath, bySlug, goHref, LINKS, AFF, site, errors } = kit;
  const preset = b.preset || {};
  for (const k of Object.keys(preset)) if (!DIMS.some(d => d.key === k)) errors.push(`${p._file}: gadgets preset "${k}" isn't one of ${DIMS.map(d => d.key).join(', ')}`);
  let items = b.ids ? b.ids.map(id => DATA.items.find(it => it.id === id) || (errors.push(`${p._file}: gadget id "${id}" isn't in data/gadgets.json`), null)).filter(Boolean) : DATA.items.filter(it => matches(it, preset));
  if (b.limit) items = items.slice(0, b.limit);
  const retail = site.retail || {};
  const us = retail.us || { host: 'www.amazon.com' };
  const src = (p.slug || 'home').replace(/\//g, '-');

  const card = it => {
    const t = DATA.types[it.type];
    if (!t) errors.push(`data/gadgets.json: "${it.id}" has unknown type "${it.type}"`);
    if (it.link && !LINKS[it.link]) errors.push(`data/gadgets.json: "${it.id}" link "${it.link}" isn't in shmor-site.json "links"`);
    if (it.guide && !bySlug.has(it.guide)) errors.push(`data/gadgets.json: "${it.id}" guide "${it.guide}" isn't a page`);
    const q = encodeURIComponent(it.q || it.name);
    const deal = it.link && LINKS[it.link]
      ? `<a class="gz-deal" href="${goHref(it.link, src)}" ${AFF}>Check today's price →</a>`
      : `<a class="gz-deal" data-q="${esc(it.q || it.name)}" href="https://${us.host}/s?k=${q}${us.tag ? `&tag=${encodeURIComponent(us.tag)}` : ''}" rel="nofollow noopener sponsored" target="_blank">Check today's price →</a>`;
    const ages = it.ages.map(a => DATA.ages[a]).join(' · ');
    const who = it.who.length === 1 ? DATA.who[it.who[0]] : DATA.who.anyone;
    return `<article class="gz" id="g-${esc(it.id)}" data-who="${esc(it.who.join(' '))}" data-age="${esc(it.ages.join(' '))}" data-type="${esc(it.type)}" data-price="${esc(it.price)}" data-trend="${esc(it.trend.join(' '))}" data-name="${esc((it.name + ' ' + it.brand + ' ' + (t ? t.label : '')).toLowerCase())}" style="--c:${esc(t ? t.color : '#FF2D55')}">
  <div class="gz-media">${photo(it, kit) || `<span class="gz-art">${svg(ART[it.type] || '', 54, 'gz-ico')}</span>`}<ul class="gz-trend" aria-label="Trending on">${it.trend.map(x => `<li class="tr-${esc(x)}">${esc(DATA.trends[x])}</li>`).join('')}</ul>${it.added ? '<span class="gz-new">New</span>' : ''}
    <button type="button" class="gz-save" data-save="${esc(it.id)}" aria-pressed="false" aria-label="Save ${esc(it.name)}" hidden>${svg(ICO.heart, 18)}</button></div>
  <div class="gz-body">
    <p class="gz-kind">${esc(t ? t.label : '')} <span>·</span> ${esc(it.brand)}</p>
    <h3>${esc(it.name)}</h3>
    <p class="gz-blurb">${esc(it.blurb)}</p>
    <details class="gz-more"><summary>Why it's trending</summary><p>${esc(it.why)}</p>${it.note ? `<p class="gz-note"><strong>Heads-up:</strong> ${esc(it.note)}</p>` : ''}${it.guide ? `<p><a href="${pagePath(bySlug.get(it.guide) || { slug: it.guide })}">Read our guide →</a></p>` : ''}${it.img?.credit ? `<p class="gz-credit">Illustrative photo: <a href="${esc(it.img.creditUrl)}?utm_source=shmor&amp;utm_medium=referral" rel="nofollow noopener" target="_blank">${esc(it.img.credit)}</a> on Unsplash</p>` : ''}</details>
    <ul class="gz-meta"><li>${esc(DATA.prices[it.price])}</li><li>${esc(who)}</li><li>${esc(ages)}</li></ul>
    <div class="gz-foot">${deal}
      <a class="gz-rev" href="https://www.youtube.com/results?search_query=${q}+review" rel="nofollow noopener" target="_blank">${svg(ICO.play, 12)} YouTube reviews</a>
      <a class="gz-rev" href="https://www.tiktok.com/search?q=${q}%20review" rel="nofollow noopener" target="_blank">TikTok reviews</a></div>
  </div>
</article>`;
  };

  const groups = DIMS.filter(d => !(d.key in preset)).map(d => `<div class="fz-group" role="group" aria-label="${esc(d.label)}"><span class="fz-label">${esc(d.label)}</span><div class="fz-chips">${Object.entries(d.values).map(([v, l]) =>
    `<button type="button" class="fz-chip" data-dim="${d.key}" data-val="${esc(v)}" aria-pressed="false">${esc(l)}</button>`).join('')}</div></div>`).join('');

  const head = b.title ? `<div class="block-head"><h2>${esc(b.title)}</h2>${b.intro ? `<p>${b.intro}</p>` : ''}</div>` : '';
  return `<section class="blocks blocks-gadgets${b.class ? ` ${esc(b.class)}` : ''}" id="finder"><div class="wrap">${head}
<div class="finder" data-finder data-retail="${esc(JSON.stringify(retail))}">
  <div class="fz-bar" data-finder-ui hidden>
    <div class="fz-top">
      <label class="fz-search">${svg(ICO.search, 18)}<input type="search" data-fz-q placeholder="Search ${items.length} gadgets…" aria-label="Search gadgets"></label>
      <label class="fz-region"><span>Shop in</span><select data-fz-region aria-label="Shop in"><option value="us">US</option><option value="uk">UK</option><option value="eu">EU</option></select></label>
      <button type="button" class="fz-btn fz-surprise" data-fz-surprise>${svg(ICO.shuffle, 18)} Surprise me</button>
      <button type="button" class="fz-btn fz-saved" data-fz-saved aria-pressed="false">${svg(ICO.heart, 18)} Saved <span data-fz-saved-n>0</span></button>
    </div>
    <div class="fz-groups">${groups}</div>
    <p class="fz-status"><span data-fz-count>${items.length} gadgets</span> <button type="button" class="fz-reset" data-fz-reset hidden>Clear filters</button></p>
  </div>
  <div class="gz-grid">${items.map(card).join('\n')}</div>
  <p class="gz-empty" data-fz-empty hidden>No gadgets match all of those filters. Try removing one, or <button type="button" data-fz-reset>clear them all</button>.</p>
  <p class="aff-note">Prices change constantly, so we never list them here: “Check today's price” opens a live retailer search. Photos are illustrative and may not show the exact model. We may earn a commission from some links, at no extra cost to you. <a href="https://shmor.ai/affiliate-disclosure/">How we make money</a>.</p>
</div></div></section>`;
};

/* "ticker" block: a scrolling strip of what's trending (newest launches first), linking to the cards on the homepage. */
module.exports.ticker = function ticker(b, p, kit) {
  const { esc } = kit;
  const list = [...DATA.items.filter(it => it.added), ...DATA.items.filter(it => !it.added && it.trend.includes('tiktok'))].slice(0, b.limit || 14);
  const row = list.map(it => `<li><a href="/#g-${esc(it.id)}"><span class="tk-dot" style="background:${esc(DATA.types[it.type].color)}"></span>${esc(it.name)}${it.added ? ' <em>new</em>' : ''}</a></li>`).join('');
  return `<section class="blocks blocks-ticker" aria-label="${esc(b.title || 'Trending right now')}"><div class="tk"><span class="tk-label">${esc(b.title || 'Trending now')}</span><div class="tk-track"><ul>${row}</ul><ul aria-hidden="true">${row.replace(/<a /g, '<a tabindex="-1" ')}</ul></div></div></section>`;
};

/* "spotlight" block: large photo cards for the newest launches (items with "added", or "ids"), linking to their finder card. */
module.exports.spotlight = function spotlight(b, p, kit) {
  const { esc } = kit;
  const list = (b.ids ? b.ids.map(id => DATA.items.find(it => it.id === id)).filter(Boolean) : DATA.items.filter(it => it.added).sort((x, y) => y.added.localeCompare(x.added))).slice(0, b.limit || 4);
  if (!list.length) return "";
  const head = b.title ? `<div class="block-head"><h2>${esc(b.title)}</h2>${b.intro ? `<p>${b.intro}</p>` : ""}</div>` : "";
  return `<section class="blocks blocks-spotlight"><div class="wrap">${head}<div class="spot-grid">${list.map((it, n) => `<a class="spot${n === 0 ? " spot-lead" : ""}" href="${p.slug ? "/" : ""}#g-${esc(it.id)}">${photo(it, kit, n === 0 ? 1200 : 640, n === 0 ? 0.62 : 0.75, n === 0 ? "(max-width: 900px) 100vw, 60vw" : "(max-width: 900px) 100vw, 30vw")}<span class="spot-shade"></span><span class="spot-body"><span class="spot-kind">${it.added ? "New · " : ""}${esc(DATA.types[it.type].label)}</span><h3>${esc(it.name)}</h3><p>${esc(it.blurb)}</p></span></a>`).join("")}</div></div></section>`;
};
