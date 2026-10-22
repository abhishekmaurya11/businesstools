(function () {
  'use strict';

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* Homepage search + filter */
  var searchInput = document.getElementById('toolSearch');
  if (!searchInput) return;

  var searchForm = document.getElementById('toolSearchForm');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-tool]'));
  var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var countEl = document.getElementById('toolCount');
  var emptyEl = document.getElementById('toolsEmpty');
  var activeCat = 'all';

  function applyFilters() {
    var q = searchInput.value.trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (card) {
      var cats = (card.getAttribute('data-category') || '').split(' ');
      var hay = ((card.getAttribute('data-keywords') || '') + ' ' + card.textContent).toLowerCase();
      var matchCat = activeCat === 'all' || cats.indexOf(activeCat) !== -1;
      var matchQ = !q || hay.indexOf(q) !== -1;
      var visible = matchCat && matchQ;
      card.hidden = !visible;
      if (visible) shown++;
    });
    if (countEl) countEl.textContent = String(shown);
    if (emptyEl) emptyEl.hidden = shown !== 0;
    filters.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-filter') === activeCat ? 'true' : 'false');
    });
  }

  filters.forEach(function (b) {
    b.addEventListener('click', function () {
      activeCat = b.getAttribute('data-filter') || 'all';
      applyFilters();
      if (b.hasAttribute('data-scroll')) {
        var t = document.getElementById('tools');
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  searchInput.addEventListener('input', applyFilters);
  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      applyFilters();
      var t = document.getElementById('tools');
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  applyFilters();
})();
