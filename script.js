/* ==========================================================================
   Revelation Models — script.js
   Čistý JavaScript bez knihoven. Data modelek jsou v data.js.
   Navigace mezi úvodem a galerií běží přes adresu s # (funguje na každém
   hostingu bez nastavování):
     (nic) / #/            úvodní stránka
     #o-nas, #kontakt ...  úvodní stránka + posun na sekci
     #/galerie             přehled všech modelek
     #/galerie/<id>        fotogalerie jedné modelky
   ========================================================================== */
(function () {
  'use strict';

  var EXT = window.IMG_EXT || '.jpg';
  // data.js má kompaktní řádky; tady se rozbalí na objekty s cestami a rozměry fotek
  var ALL = (window.PORTFOLIO_MODELS || []).map(function (r) {
    var dims = r[3] ? r[3].split(' ').map(function (s) { var p = s.split('x'); return [+p[0], +p[1]]; }) : [];
    var gallery = [];
    for (var i = 1; i <= dims.length; i++) gallery.push('img/g/modelka-' + r[0] + '-' + i + EXT);
    return { id: r[0], name: r[1], category: r[2], height: '', cover: 'img/c/modelka-' + r[0] + EXT, gallery: gallery, dims: dims };
  });
  var FEATURED = (window.FEATURED_IDS || []).map(function (id) {
    for (var i = 0; i < ALL.length; i++) if (ALL[i].id === id) return ALL[i];
    return null;
  }).filter(Boolean);

  /* ---------- pomocné funkce ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function icon(name, size, sw, cls) {
    return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' width="' + size + '" height="' + size +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 2) +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  }
  function findModel(id) {
    for (var i = 0; i < ALL.length; i++) if (ALL[i].id === id) return ALL[i];
    return null;
  }
  function scrollTop() { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }

  /* Chybějící fotka nesmí rozbít vzhled (skryje se rozbitý obrázek) */
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (!t || t.tagName !== 'IMG') return;
    t.classList.add('img-missing');
  }, true);

  /* ---------- horní lišta: průhledná -> tmavá po odscrollování ---------- */
  var header = $('#site-header');
  var HEADER_TOP = ['bg-[#0a0a0a]/40', 'backdrop-blur-sm', 'py-5'];
  var HEADER_SCROLLED = ['bg-[#0a0a0a]/95', 'backdrop-blur-md', 'py-4', 'shadow-lg', 'shadow-black/50'];
  var scrolled = false;
  function onScroll() {
    var s = window.scrollY > 60;
    if (s === scrolled) return;
    scrolled = s;
    HEADER_TOP.forEach(function (c) { header.classList.toggle(c, !s); });
    HEADER_SCROLLED.forEach(function (c) { header.classList.toggle(c, s); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobilní menu ---------- */
  var menu = $('#mobile-menu');
  var menuOpenBtn = $('#menu-open');
  function setMenu(open) {
    menu.classList.toggle('translate-x-0', open);
    menu.classList.toggle('translate-x-full', !open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    menu.inert = !open;
    menuOpenBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) $('#menu-close').focus();
  }
  menuOpenBtn.addEventListener('click', function () { setMenu(true); });
  $('#menu-close').addEventListener('click', function () { setMenu(false); menuOpenBtn.focus(); });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });

  /* ---------- odhalení při scrollu ---------- */
  var observers = [];
  function observeReveals(root) {
    $$('[data-reveal]', root).forEach(function (el) {
      var scope = el.closest('[data-reveal-scope]') || el;
      if (scope.classList.contains('is-in')) return;
      if (!('IntersectionObserver' in window)) { scope.classList.add('is-in'); return; }
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { scope.classList.add('is-in'); io.disconnect(); }
      }, { threshold: parseFloat(el.getAttribute('data-reveal')) || 0.15 });
      io.observe(el);
      observers.push(io);
    });
  }
  var hero = $('#hero');
  var heroTimer;
  function replayHome() {
    observers.forEach(function (o) { o.disconnect(); });
    observers = [];
    $$('#page-home .is-in').forEach(function (el) { el.classList.remove('is-in'); });
    observeReveals($('#page-home'));
    clearTimeout(heroTimer);
    heroTimer = setTimeout(function () { hero.classList.add('is-in'); }, 100);
  }

  /* ---------- úvod: mřížka „Tváře agentury“ + náhled ---------- */
  var featuredGrid = $('#featured-grid');
  var haveIds = $$('[data-model]', featuredGrid).map(function (b) { return b.getAttribute('data-model'); }).join(',');
  if (haveIds !== FEATURED.map(function (m) { return m.id; }).join(',')) featuredGrid.innerHTML = FEATURED.map(function (m, i) {
    return '<button type="button" class="group block w-full cursor-pointer text-left rv rv-up" data-model="' + esc(m.id) +
      '" style="--d:' + (0.1 + i * 0.08).toFixed(2) + 's">' +
      '<span class="img-zoom relative block aspect-[3/4] overflow-hidden bg-neutral-900">' +
        '<img src="' + esc(m.cover) + '" alt="' + esc(m.name) + ' — modelka" width="600" height="900" loading="lazy" decoding="async" class="faces-img h-full w-full object-cover object-[50%_15%]">' +
        '<span class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80"></span>' +
        '<span class="absolute bottom-0 left-0 right-0 flex items-center justify-between p-4">' +
          '<span class="block">' +
            '<span class="block text-[10px] uppercase tracking-wide text-gold opacity-0 transition-all duration-500 group-hover:opacity-100">' + esc(m.category) + '</span>' +
            '<span class="block font-serif text-lg font-light text-white sm:text-xl">' + esc(m.name) + '</span>' +
          '</span>' +
          '<span class="flex items-center gap-1 text-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100">' +
            icon('Images', 16, 1.5) + '<span class="text-xs">' + m.gallery.length + '</span>' +
          '</span>' +
        '</span>' +
        '<span class="absolute inset-0 border border-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>' +
      '</span>' +
    '</button>';
  }).join('');

  var overlay = null;      // otevřený náhled / lightbox
  var overlayOpener = null;
  var overlayKind = null;  // 'preview' | 'lightbox'

  function closeOverlay(restoreFocus) {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    overlayKind = null;
    if (restoreFocus !== false && overlayOpener && document.body.contains(overlayOpener)) overlayOpener.focus();
    overlayOpener = null;
  }
  function trapTab(e) {
    if (e.key !== 'Tab' || !overlay) return;
    var f = $$('button, a[href]', overlay);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function openPreview(model, opener) {
    closeOverlay(false);
    overlayOpener = opener;
    overlayKind = 'preview';
    overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-6 animate-fade-in';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', model.name);
    overlay.innerHTML =
      '<button type="button" class="absolute top-6 right-6 text-gold transition-colors hover:text-white" data-close aria-label="Zavřít">' + icon('X', 32) + '</button>' +
      '<div class="flex max-w-4xl flex-col items-center gap-6 md:flex-row" data-panel>' +
        '<img src="' + esc(model.cover) + '" alt="' + esc(model.name) + '" class="max-h-[70vh] w-auto object-cover">' +
        '<div class="text-center md:text-left">' +
          '<p class="text-xs uppercase tracking-luxe text-gold">' + esc(model.category) + '</p>' +
          '<h3 class="mt-3 font-serif text-4xl font-light text-white">' + esc(model.name) + '</h3>' +
          '<p class="mt-4 text-sm text-neutral-400">' + (model.height ? 'Výška: ' + esc(model.height) + ' · ' : '') + model.gallery.length + ' ' + (model.gallery.length === 1 ? 'fotografie' : (model.gallery.length < 5 ? 'fotografie' : 'fotografií')) + '</p>' +
          '<a href="#/galerie/' + encodeURIComponent(model.id) + '" data-open-gallery class="mt-8 inline-flex items-center gap-2 border border-gold px-8 py-3 text-xs uppercase tracking-wide-luxe text-gold transition-all hover:bg-gold hover:text-black">' +
            icon('Images', 14, 1.5) + 'Otevřít galerii</a>' +
        '</div>' +
      '</div>';
    overlay.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]') || !e.target.closest('[data-panel]')) closeOverlay();
      else if (e.target.closest('[data-open-gallery]')) closeOverlay(false);
    });
    document.body.appendChild(overlay);
    $('[data-close]', overlay).focus();
  }
  featuredGrid.addEventListener('click', function (e) {
    var b = e.target.closest('[data-model]');
    if (!b) return;
    var m = findModel(b.getAttribute('data-model'));
    if (m) openPreview(m, b);
  });

  /* ---------- galerie ---------- */
  var galRoot = $('#gallery-root');
  var gal = { search: '', model: null, lightbox: 0 };
  var BACK = 'mb-10 flex items-center gap-2 text-xs uppercase tracking-wide-luxe text-neutral-400 transition-colors hover:text-gold';

  function pluralModels(n) { return n === 1 ? 'modelka' : (n >= 2 && n <= 4 ? 'modelky' : 'modelek'); }

  function cardHtml(m) {
    return '<a href="#/galerie/' + encodeURIComponent(m.id) + '" class="group block cursor-pointer">' +
      '<div class="img-zoom relative aspect-[3/4] overflow-hidden bg-neutral-900">' +
        '<img src="' + esc(m.cover) + '" alt="' + esc(m.name) + ' — modelka" width="600" height="900" loading="lazy" class="h-full w-full object-cover object-[50%_15%]">' +
        '<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80"></div>' +
        '<div class="absolute bottom-0 left-0 right-0 p-4">' +
          (m.category ? '<p class="text-[10px] uppercase tracking-wide text-gold opacity-0 transition-all duration-500 group-hover:opacity-100">' + esc(m.category) + '</p>' : '') +
          '<h2 class="font-serif text-base font-light text-white sm:text-lg">' + esc(m.name) + '</h2>' +
          '<div class="mt-1 flex items-center gap-1.5 text-neutral-400">' + icon('Images', 12, 1.5) +
            '<span class="text-[11px]">' + m.gallery.length + ' fotek</span></div>' +
        '</div>' +
        '<div class="absolute inset-0 border border-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>' +
      '</div></a>';
  }

  function renderOverview() {
    gal.model = null;
    galRoot.innerHTML =
      '<div class="min-h-screen bg-[#080808] pt-24"><div class="mx-auto max-w-7xl px-6 lg:px-10">' +
        '<a href="#/" data-nav="home" class="' + BACK + '">' + icon('ArrowLeft', 16, 1.5) + 'Zpět na hlavní stránku</a>' +
        '<div class="rv rv-up mb-12 text-center" data-reveal="0.05">' +
          '<p class="mb-4 text-xs uppercase tracking-luxe text-gold">Foto galerie</p>' +
          '<h1 class="font-serif text-5xl font-light leading-tight text-white sm:text-6xl md:text-7xl">Galerie <span class="block italic text-gold">Revelation Models</span></h1>' +
          '<p class="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-neutral-400">Vyberte modelku a otevřete její fotogalerii. Kliknutím fotku zvětšíte.</p>' +
        '</div>' +
        '<div class="mb-10 flex flex-col items-center gap-4">' +
          '<div class="relative w-full max-w-md">' +
            icon('Search', 18, 1.5, 'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500') +
            '<input id="gallery-search" type="text" aria-label="Hledat modelku" placeholder="Hledat modelku…" autocomplete="off" class="w-full border border-neutral-700 bg-neutral-900/50 py-3 pl-12 pr-4 text-sm text-neutral-200 placeholder:text-neutral-500 outline-none transition-colors focus:border-gold">' +
          '</div>' +
          '<p id="gallery-count" aria-live="polite" class="text-xs uppercase tracking-wide-luxe text-neutral-500"></p>' +
        '</div>' +
        '<div id="models-grid" class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6"></div>' +
        '<div id="gallery-empty" class="py-20 text-center" hidden><p class="text-sm text-neutral-500"></p></div>' +
      '</div></div>';

    var input = $('#gallery-search');
    input.value = gal.search;
    input.addEventListener('input', function () { gal.search = input.value; updateGrid(); });
    updateGrid();
    observeReveals(galRoot);
  }

  function updateGrid() {
    var q = gal.search.trim().toLowerCase();
    var list = q ? ALL.filter(function (m) { return m.name.toLowerCase().indexOf(q) !== -1; }) : ALL;
    $('#models-grid').innerHTML = list.map(cardHtml).join('');
    $('#gallery-count').textContent = list.length + ' ' + pluralModels(list.length);
    var empty = $('#gallery-empty');
    empty.hidden = list.length !== 0;
    $('p', empty).textContent = 'Pro „' + gal.search + '" jsme nenašli žádnou modelku.';
  }

  function renderDetail(m) {
    gal.model = m;
    var n = m.gallery.length;
    galRoot.innerHTML =
      '<div class="min-h-screen bg-[#080808] pt-24"><div class="mx-auto max-w-7xl px-6 lg:px-10">' +
        '<a href="#/galerie" class="' + BACK + '">' + icon('ArrowLeft', 16, 1.5) + 'Zpět na všechny modelky</a>' +
        '<div class="mb-12 flex flex-col items-start gap-6 border-b border-neutral-800 pb-10 md:flex-row md:items-end md:justify-between"><div>' +
          (m.category ? '<p class="mb-3 text-xs uppercase tracking-luxe text-gold">' + esc(m.category) + '</p>' : '') +
          '<h1 class="font-serif text-5xl font-light text-white sm:text-6xl">' + esc(m.name) + '</h1>' +
          '<p class="mt-4 text-sm text-neutral-400">' + (m.height ? 'Výška: ' + esc(m.height) + ' · ' : '') + n + ' fotografií</p>' +
        '</div></div>' +
        '<div id="masonry" class="columns-1 gap-4 sm:columns-2 lg:columns-3">' +
          m.gallery.map(function (src, i) {
            return '<button type="button" data-photo="' + i + '" class="img-zoom relative mb-4 block w-full overflow-hidden bg-neutral-900 break-inside-avoid" aria-label="' + esc(m.name) + ' — foto ' + (i + 1) + ' (zvětšit)">' +
              '<img src="' + esc(src) + '" alt="' + esc(m.name) + ' — fotografie ' + (i + 1) + '" width="' + m.dims[i][0] + '" height="' + m.dims[i][1] + '" loading="lazy" decoding="async" class="w-full cursor-pointer object-cover">' +
              '<span class="absolute inset-0 cursor-pointer bg-black/0 transition-colors duration-300 hover:bg-black/20"></span>' +
              '<span class="absolute bottom-0 left-0 right-0 flex items-center justify-between p-4 opacity-0 transition-opacity duration-500 hover:opacity-100">' +
                '<span class="text-xs text-white/80">' + (i + 1) + ' / ' + n + '</span></span>' +
            '</button>';
          }).join('') +
        '</div>' +
      '</div></div>';
  }

  galRoot.addEventListener('click', function (e) {
    var p = e.target.closest('[data-photo]');
    if (p && gal.model) openLightbox(parseInt(p.getAttribute('data-photo'), 10), p);
  });

  function openLightbox(index, opener) {
    closeOverlay(false);
    overlayOpener = opener;
    overlayKind = 'lightbox';
    gal.lightbox = index;
    var m = gal.model;
    overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[90] flex items-center justify-center bg-black/95 p-4 animate-fade-in';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', m.name);
    overlay.innerHTML =
      '<button type="button" class="absolute top-6 right-6 text-gold transition-colors hover:text-white" data-close aria-label="Zavřít">' + icon('X', 32) + '</button>' +
      '<button type="button" class="absolute left-4 text-gold transition-colors hover:text-white md:left-8" data-prev aria-label="Předchozí">' + icon('ChevronLeft', 40) + '</button>' +
      '<img data-img alt="" class="max-h-[85vh] max-w-[90vw] object-contain">' +
      '<button type="button" class="absolute right-4 text-gold transition-colors hover:text-white md:right-8" data-next aria-label="Další">' + icon('ChevronRight', 40) + '</button>' +
      '<div data-counter class="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-neutral-500"></div>';
    overlay.addEventListener('click', function (e) {
      if (e.target.closest('[data-prev]')) { e.stopPropagation(); stepLightbox(-1); }
      else if (e.target.closest('[data-next]')) { e.stopPropagation(); stepLightbox(1); }
      else if (e.target.closest('[data-close]') || e.target.tagName !== 'IMG') closeOverlay();
    });
    document.body.appendChild(overlay);
    updateLightbox();
    $('[data-close]', overlay).focus();
  }
  function updateLightbox() {
    var m = gal.model, i = gal.lightbox;
    var img = $('[data-img]', overlay);
    img.src = m.gallery[i];
    img.alt = m.name + ' — foto ' + (i + 1);
    img.classList.remove('img-missing');
    $('[data-counter]', overlay).textContent = (i + 1) + ' / ' + m.gallery.length;
  }
  function stepLightbox(d) {
    var n = gal.model.gallery.length;
    gal.lightbox = (gal.lightbox + d + n) % n;
    updateLightbox();
  }

  /* ---------- klávesy ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (overlay) closeOverlay();
      else if (menu.classList.contains('translate-x-0')) { setMenu(false); menuOpenBtn.focus(); }
      return;
    }
    if (overlayKind === 'lightbox') {
      if (e.key === 'ArrowRight') stepLightbox(1);
      else if (e.key === 'ArrowLeft') stepLightbox(-1);
    }
    trapTab(e);
  });

  /* ---------- směrování ---------- */
  var HOME_TITLE = document.title;
  var pageHome = $('#page-home');
  var pageGallery = $('#page-gallery');
  var currentPage = null;
  var lastKey = null;

  function parseHash() {
    var h = location.hash;
    var m = h.match(/^#\/galerie(?:\/([^\/?#]+))?\/?$/);
    if (m) return { page: 'gallery', id: m[1] ? decodeURIComponent(m[1]) : null };
    return { page: 'home', anchor: (h.length > 1 && h.charAt(1) !== '/') ? decodeURIComponent(h.slice(1)) : null };
  }

  function route(force) {
    var r = parseHash();
    var key = r.page + '|' + (r.id || '') + '|' + (r.anchor || '');
    if (key === lastKey && !force) return;
    lastKey = key;

    var was = currentPage;
    closeOverlay(false);
    setMenu(false);
    currentPage = r.page;
    document.body.setAttribute('data-page', r.page);
    pageHome.hidden = r.page !== 'home';
    pageGallery.hidden = r.page !== 'gallery';
    var pm = r.page === 'gallery' && r.id ? findModel(r.id) : null;
    document.title = r.page === 'home' ? HOME_TITLE
      : (pm ? pm.name + ' — fotogalerie modelky | Revelation Models' : 'Galerie modelek | Revelation Models');

    if (r.page === 'gallery') {
      var m = r.id ? findModel(r.id) : null;
      if (m) renderDetail(m); else renderOverview();
      scrollTop();
      return;
    }

    if (was !== 'home') replayHome();
    var target = r.anchor ? document.getElementById(r.anchor) : null;
    if (target) {
      if (was === 'home') target.scrollIntoView({ behavior: 'smooth' });
      else setTimeout(function () { target.scrollIntoView({ behavior: 'smooth' }); }, 200);
    } else if (was !== 'home') {
      scrollTop();
    }
  }

  function goHome() {
    if (location.hash) {
      try { history.pushState(null, '', location.pathname + location.search); }
      catch (err) { location.hash = ''; return; }
    }
    route();
    scrollTop();
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (href === '#') { e.preventDefault(); return; }
    if (href === '#obsah') { e.preventDefault(); var mn = $('#obsah'); mn.focus({ preventScroll: true }); mn.scrollIntoView(); return; }           // odkazy na sítě (zatím prázdné)
    var nav = a.getAttribute('data-nav');
    if (nav === 'home') { e.preventDefault(); goHome(); }
    else if (nav === 'gallery') {                                // „Galerie“ / „Modelky“ vždy začne přehledem
      e.preventDefault();
      gal.search = '';
      if (location.hash === '#/galerie') { route(true); } else { location.hash = '#/galerie'; }
    }
  });

  window.addEventListener('hashchange', function () { route(); });
  window.addEventListener('popstate', function () { route(); });

  /* ---------- kontaktní formulář (stejné chování jako původní web) ---------- */
  var form = $('#contact-form');
  var submitBtn = $('#contact-submit');
  var submitLabel = $('#contact-label');
  var submitIcon = $('svg', submitBtn);
  var BTN_IDLE = ['border-gold', 'bg-gold', 'text-black', 'hover:bg-transparent', 'hover:text-gold'];
  var BTN_SENT = ['border-green-600', 'text-green-500'];
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    submitBtn.disabled = true;
    BTN_IDLE.forEach(function (c) { submitBtn.classList.remove(c); });
    BTN_SENT.forEach(function (c) { submitBtn.classList.add(c); });
    submitLabel.textContent = 'Zpráva odeslána ✓';
    submitIcon.style.display = 'none';
    setTimeout(function () {
      submitBtn.disabled = false;
      BTN_SENT.forEach(function (c) { submitBtn.classList.remove(c); });
      BTN_IDLE.forEach(function (c) { submitBtn.classList.add(c); });
      submitLabel.textContent = 'Odeslat zprávu';
      submitIcon.style.display = '';
      form.reset();
    }, 4000);
  });


  /* ---------- sdílení: tlačítko se zobrazí jen tam, kde prohlížeč umí systémové sdílení ---------- */
  if (navigator.share) {
    $$('[data-native-share]').forEach(function (b) {
      b.hidden = false; b.classList.add('flex');
      b.addEventListener('click', function () {
        navigator.share({ title: 'Revelation Models', text: 'Revelation Models — modelingová agentura', url: 'https://models.public-revelation.com/' }).catch(function () {});
      });
    });
  }

  /* ---------- start ---------- */
  $('#year').textContent = new Date().getFullYear();
  route(true);
})();
