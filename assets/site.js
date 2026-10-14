/* Shmor site kit: menu toggle + on-site search (pages are found via /search-index.json) */
(function () {
  'use strict';
  var btn = document.querySelector('[data-menu]'), nav = document.querySelector('[data-nav]');
  if (btn && nav) btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });

  var out = document.getElementById('search-results');
  if (!out) return;
  var q = (new URLSearchParams(location.search).get('q') || '').trim();
  var input = document.querySelector('.search input[name=q]');
  if (input) input.value = q;
  if (!q) return;
  document.getElementById('search-title').textContent = 'Results for “' + q + '”';
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var words = q.toLowerCase().split(/\s+/).filter(function (w) { return w.length > 1; });
  fetch('/search-index.json').then(function (r) { return r.json(); }).then(function (pages) {
    var hits = pages.map(function (p) {
      var score = words.reduce(function (s, w) { return s + (p.terms.indexOf(w) > -1 ? 1 : 0); }, 0);
      return { p: p, score: score };
    }).filter(function (h) { return h.score > 0; }).sort(function (a, b) { return b.score - a.score; });
    out.innerHTML = hits.length
      ? hits.map(function (h) { return '<a class="card' + (h.p.img ? ' has-img' : '') + '" href="' + h.p.path + '">' + (h.p.img ? '<img class="card-img" src="' + esc(h.p.img) + '" alt="" loading="lazy" width="600" height="360">' : '') + '<h3>' + esc(h.p.title) + '</h3><p>' + esc(h.p.text) + '</p><span class="cta">Explore →</span></a>'; }).join('')
      : '<p class="empty">No pages matched. Try a broader search, or browse the guides below.</p>' +
        pages.slice(0, 6).map(function (p) { return '<a class="card" href="' + p.path + '"><h3>' + esc(p.title) + '</h3><p>' + esc(p.text) + '</p></a>'; }).join('');
  }).catch(function () { out.innerHTML = '<p class="empty">Search is unavailable right now.</p>'; });
})();

/* "specs" blocks with "tabs": filter the cards by data-tag (every card shows without JS) */
(function () {
  'use strict';
  document.querySelectorAll('[data-tabs]').forEach(function (bar) {
    var grid = bar.nextElementSibling;
    bar.hidden = false;
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-tab]');
      if (!b) return;
      var id = b.getAttribute('data-tab');
      bar.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      grid.querySelectorAll('[data-tag]').forEach(function (c) { c.hidden = id !== 'all' && c.getAttribute('data-tag') !== id; });
    });
  });
})();

/* ViralGadgets finder: filter chips (OR within a group, AND across groups), search,
   region switch for "Check today's price", Surprise me, saved hearts. Every card is
   already in the HTML, so the page works without JS. Filters sync to ?who=&age=… */
(function () {
  'use strict';
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage off */ } }
  };
  var HOSTS = { us: 'www.amazon.com', uk: 'www.amazon.co.uk', eu: 'www.amazon.de' };

  document.querySelectorAll('[data-finder]').forEach(function (root) {
    var ui = root.querySelector('[data-finder-ui]');
    var cards = [].slice.call(root.querySelectorAll('.gz'));
    var chips = [].slice.call(root.querySelectorAll('.fz-chip'));
    var qInput = root.querySelector('[data-fz-q]');
    var countEl = root.querySelector('[data-fz-count]');
    var empty = root.querySelector('[data-fz-empty]');
    var resetBtns = root.querySelectorAll('[data-fz-reset]');
    var savedBtn = root.querySelector('[data-fz-saved]');
    var savedN = root.querySelector('[data-fz-saved-n]');
    var region = root.querySelector('[data-fz-region]');
    var retail = {}; try { retail = JSON.parse(root.getAttribute('data-retail') || '{}'); } catch (e) { /* defaults */ }
    var saved = store.get('vg-saved') || [];
    var savedOnly = false;
    ui.hidden = false;

    // Restore filters from the URL (?type=gaming&age=teens,kids&q=...)
    var params = new URLSearchParams(location.search);
    chips.forEach(function (c) {
      var v = (params.get(c.dataset.dim) || '').split(',');
      if (v.indexOf(c.dataset.val) > -1) c.setAttribute('aria-pressed', 'true');
    });
    if (params.get('q')) qInput.value = params.get('q');

    function selected() {
      var s = {};
      chips.forEach(function (c) { if (c.getAttribute('aria-pressed') === 'true') (s[c.dataset.dim] = s[c.dataset.dim] || []).push(c.dataset.val); });
      return s;
    }
    // Pages: the full catalogue spreads over 5 pages (min 12 per page); "Show all" puts everything on one.
    var grid = root.querySelector('.gz-grid'), pager = root.querySelector('[data-fz-pager]');
    var PER = Math.max(12, Math.ceil(cards.length / 5)), page = 1, showAll = false, matched = [];
    var voltSrc = (root.querySelector('[data-fz-volt] img') || {}).getAttribute ? root.querySelector('[data-fz-volt] img').getAttribute('src') : '';
    var QUIPS = ['Psst. Prices change all the time, so always hit “Check today’s price”.', 'Volt’s golden rule: read the heads-up before the hype.',
      'Spotted something you like? Tap the heart and I’ll remember it for you.', 'Subscriptions are sneaky. I always check for them first.',
      'Buying a gift? Check the return window before you wrap it.', 'Battery claims are like my dance moves: best-case scenario only.',
      'Filters stack up: try a type plus an age for a tighter shortlist.', 'Can’t choose? “Surprise me” is my favourite button. Just saying.',
      'Fun fact: I have no hands, so I read every review instead.', 'If a big-brand gadget is suspiciously cheap on a social ad, it’s probably fake.'];
    function breakCard(text) {
      var el = document.createElement('div');
      el.className = 'gz-break';
      el.innerHTML = (voltSrc ? '<img src="' + voltSrc + '" width="96" height="96" alt="">' : '') + '<p class="gzb-kicker">Volt says</p><p class="gzb-text"></p>';
      el.querySelector('.gzb-text').textContent = text;
      return el;
    }
    function renderPager(pages) {
      if (!pager) return;
      pager.hidden = matched.length <= PER;
      if (pager.hidden) return;
      var h = '';
      if (!showAll) {
        h += '<button type="button" data-fz-page="' + (page - 1) + '"' + (page === 1 ? ' disabled' : '') + ' aria-label="Previous page">←</button>';
        for (var i = 1; i <= pages; i++) h += '<button type="button" data-fz-page="' + i + '"' + (i === page ? ' aria-current="page"' : '') + '>' + i + '</button>';
        h += '<button type="button" data-fz-page="' + (page + 1) + '"' + (page === pages ? ' disabled' : '') + ' aria-label="Next page">→</button>';
      }
      h += '<button type="button" class="fz-all" data-fz-all aria-pressed="' + showAll + '">' + (showAll ? 'Show in pages' : 'Show all ' + matched.length) + '</button>';
      pager.innerHTML = h;
    }
    function apply(sync, keepPage) {
      var s = selected(), q = qInput.value.trim().toLowerCase();
      if (!keepPage) page = 1;
      matched = cards.filter(function (card) {
        var ok = Object.keys(s).every(function (dim) {
          var vals = (card.getAttribute('data-' + dim) || '').split(' ');
          return s[dim].some(function (v) { return vals.indexOf(v) > -1; });
        });
        if (ok && q) ok = q.split(/\s+/).every(function (w) { return (card.dataset.name + ' ' + card.textContent.toLowerCase()).indexOf(w) > -1; });
        if (ok && savedOnly) ok = saved.indexOf(card.id.slice(2)) > -1;
        return ok;
      });
      var n = matched.length, pages = showAll ? 1 : Math.max(1, Math.ceil(n / PER));
      page = Math.min(Math.max(1, page), pages);
      var shown = showAll ? matched : matched.slice((page - 1) * PER, page * PER);
      cards.forEach(function (card) { card.hidden = shown.indexOf(card) < 0; });
      // Volt pops in between the cards: after the 5th and 12th card shown, a different quip on every page
      grid.querySelectorAll('.gz-break').forEach(function (b) { b.remove(); });
      [5, 12, 20, 28, 36, 44, 52, 60, 68, 76].forEach(function (at, k) {
        if (shown.length > at) shown[at - 1].after(breakCard(QUIPS[((page - 1) * 2 + k) % QUIPS.length]));
      });
      renderPager(pages);
      countEl.textContent = n + (n === 1 ? ' gadget' : ' gadgets') + (savedOnly ? ' saved' : '') + (pages > 1 ? ' · page ' + page + ' of ' + pages : '');
      empty.hidden = n > 0;
      var any = Object.keys(s).length || q || savedOnly;
      resetBtns.forEach(function (b) { b.hidden = !any; });
      empty.querySelector('[data-fz-reset]').hidden = false;
      if (sync && history.replaceState) {
        var p = new URLSearchParams();
        Object.keys(s).forEach(function (d) { p.set(d, s[d].join(',')); });
        if (q) p.set('q', q);
        var qs = p.toString();
        history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
      }
    }

    root.addEventListener('click', function (e) {
      var chip = e.target.closest('.fz-chip');
      if (chip) { chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true')); apply(true); return; }
      if (e.target.closest('[data-fz-reset]')) {
        chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
        qInput.value = ''; savedOnly = false; savedBtn.setAttribute('aria-pressed', 'false'); apply(true); return;
      }
      var pg = e.target.closest('[data-fz-page]');
      if (pg && !pg.disabled) { page = +pg.dataset.fzPage; apply(false, true); grid.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      if (e.target.closest('[data-fz-all]')) { showAll = !showAll; apply(false); grid.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      if (e.target.closest('[data-fz-surprise]')) {
        if (!matched.length) return;
        var pick = matched[Math.floor(Math.random() * matched.length)];
        if (pick.hidden) { page = Math.floor(matched.indexOf(pick) / PER) + 1; apply(false, true); }
        cards.forEach(function (c) { c.classList.remove('zap'); });
        pick.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(function () { pick.classList.add('zap'); var d = pick.querySelector('details'); if (d) d.open = true; }, 350);
        var toast = root.querySelector('[data-fz-volt]');
        if (toast) {
          var lines = ['Ooh! How about the %?', 'Volt picks… the %!', 'Beep boop: the % is calling.', 'Trust me on this one: the %.', 'Spin complete. Behold, the %!'];
          toast.querySelector('p').textContent = lines[Math.floor(Math.random() * lines.length)].replace('%', pick.querySelector('h3').textContent);
          toast.hidden = false; toast.classList.remove('pop'); void toast.offsetWidth; toast.classList.add('pop');
          clearTimeout(toast._t); toast._t = setTimeout(function () { toast.hidden = true; }, 4200);
        }
        return;
      }
      if (e.target.closest('[data-fz-saved]')) {
        savedOnly = !savedOnly; savedBtn.setAttribute('aria-pressed', String(savedOnly)); apply(false); return;
      }
      var heart = e.target.closest('[data-save]');
      if (heart) {
        var id = heart.dataset.save, i = saved.indexOf(id);
        if (i > -1) saved.splice(i, 1); else saved.push(id);
        store.set('vg-saved', saved); paintSaved(); if (savedOnly) apply(false);
      }
    });
    qInput.addEventListener('input', function () { apply(true); });

    function paintSaved() {
      root.querySelectorAll('[data-save]').forEach(function (h) { h.hidden = false; h.setAttribute('aria-pressed', String(saved.indexOf(h.dataset.save) > -1)); });
      savedN.textContent = saved.length;
    }

    // Region: remembered choice, else a guess from the browser language
    function setRegion(r) {
      var cfg = retail[r] || {}, host = cfg.host || HOSTS[r] || HOSTS.us;
      root.querySelectorAll('a.gz-deal[data-q]').forEach(function (a) {
        a.href = 'https://' + host + '/s?k=' + encodeURIComponent(a.dataset.q) + (cfg.tag ? '&tag=' + encodeURIComponent(cfg.tag) : '');
      });
    }
    var lang = (navigator.language || 'en-US').toLowerCase();
    var guess = /-gb$|-ie$/.test(lang) ? 'uk' : /^(de|fr|es|it|nl|pt|pl|sv|da|fi)/.test(lang) ? 'eu' : 'us';
    region.value = store.get('vg-region') || guess;
    setRegion(region.value);
    region.addEventListener('change', function () { store.set('vg-region', region.value); setRegion(region.value); });

    paintSaved();
    apply(false);
    if (location.hash.indexOf('#g-') === 0) {
      var t = document.getElementById(location.hash.slice(1));
      if (t && matched.indexOf(t) > -1) { page = Math.floor(matched.indexOf(t) / PER) + 1; apply(false, true); }
      if (t) { t.hidden = false; setTimeout(function () { t.scrollIntoView({ block: 'center' }); t.classList.add('zap'); var d = t.querySelector('details'); if (d) d.open = true; }, 400); }
    }
  });
})();

/* "Check today's price" links outside the finder (review pages): use the visitor's saved or guessed region */
(function () {
  "use strict";
  var links = [].slice.call(document.querySelectorAll("a.gz-deal[data-q]")).filter(function (a) { return !a.closest("[data-finder]"); });
  if (!links.length) return;
  var HOSTS = { us: "www.amazon.com", uk: "www.amazon.co.uk", eu: "www.amazon.de" }, r;
  try { r = JSON.parse(localStorage.getItem("vg-region")); } catch (e) { r = null; }
  var lang = (navigator.language || "en-US").toLowerCase();
  r = r || (/-gb$|-ie$/.test(lang) ? "uk" : /^(de|fr|es|it|nl|pt|pl|sv|da|fi)/.test(lang) ? "eu" : "us");
  links.forEach(function (a) { a.href = "https://" + HOSTS[r] + "/s?k=" + encodeURIComponent(a.dataset.q); });
})();

/* Volt's Weekly sign-up. Checks the email + consent, then saves the sign-up:
   1. on a mailing-list provider when the form has an action (templates/layout.html), else
   2. in the private claude.ai preview's database (collection "signups"), else
   3. on the local preview server (tools/serve.js → subscribers/signups.csv, git-ignored).
   It only says "you're in" when one of those actually saved the address. */
(function () {
  'use strict';
  function viaPreviewDb(row) {
    if (!window.claude || !window.claude.use) return Promise.reject();
    return window.claude.use('db').then(function (db) { if (!db) throw new Error('no db'); return db.collection('signups').add(row); });
  }
  function viaLocalServer(row) {
    return fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(row) })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); });
  }
  document.querySelectorAll('form[data-newsletter]').forEach(function (form) {
    var msg = form.querySelector('[data-newsletter-msg]'), btn = form.querySelector('button[type=submit]');
    var say = function (t) { msg.textContent = t; msg.hidden = false; };
    form.addEventListener('submit', function (e) {
      var email = form.querySelector('input[type=email]'), consent = form.querySelector('input[name=consent]');
      if (!email.value || !email.checkValidity()) { e.preventDefault(); say('Volt needs a valid email address to send you anything.'); email.focus(); return; }
      if (!consent.checked) { e.preventDefault(); say('Please tick the box to say you’re happy to get Volt’s Weekly.'); return; }
      if (form.getAttribute('action')) { say('Almost there! Check your inbox to confirm your subscription.'); return; }
      e.preventDefault();
      var row = { email: email.value.trim().toLowerCase(), consent: true, list: 'volts-weekly', page: location.pathname, signedUpAt: new Date().toISOString() };
      btn.disabled = true; say('Saving…');
      viaPreviewDb(row).catch(function () { return viaLocalServer(row); }).then(function () {
        form.classList.add('is-done'); email.value = ''; consent.checked = false;
        say('You’re in! Volt’s Weekly will land in your inbox soon. Beep boop.');
      }).catch(function () {
        say('Volt couldn’t save that just now. Please try again in a moment.');
      }).then(function () { btn.disabled = false; });
    });
  });
})();
