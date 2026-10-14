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
    function apply(sync) {
      var s = selected(), q = qInput.value.trim().toLowerCase(), n = 0;
      cards.forEach(function (card) {
        var ok = Object.keys(s).every(function (dim) {
          var vals = (card.getAttribute('data-' + dim) || '').split(' ');
          return s[dim].some(function (v) { return vals.indexOf(v) > -1; });
        });
        if (ok && q) ok = q.split(/\s+/).every(function (w) { return (card.dataset.name + ' ' + card.textContent.toLowerCase()).indexOf(w) > -1; });
        if (ok && savedOnly) ok = saved.indexOf(card.id.slice(2)) > -1;
        card.hidden = !ok; if (ok) n++;
      });
      countEl.textContent = n + (n === 1 ? ' gadget' : ' gadgets') + (savedOnly ? ' saved' : '');
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
      if (e.target.closest('[data-fz-surprise]')) {
        var pool = cards.filter(function (c) { return !c.hidden; });
        if (!pool.length) return;
        var pick = pool[Math.floor(Math.random() * pool.length)];
        cards.forEach(function (c) { c.classList.remove('zap'); });
        pick.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(function () { pick.classList.add('zap'); var d = pick.querySelector('details'); if (d) d.open = true; }, 350);
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
      if (t) { t.hidden = false; setTimeout(function () { t.classList.add('zap'); var d = t.querySelector('details'); if (d) d.open = true; }, 400); }
    }
  });
})();
