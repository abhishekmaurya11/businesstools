(function () {
  'use strict';
  var form = document.getElementById('discountForm');
  if (!form) return;

  var MAX = 1e9;
  var inr = new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', minimumFractionDigits:2, maximumFractionDigits:2 });
  var dec = new Intl.NumberFormat('en-IN', { minimumFractionDigits:2, maximumFractionDigits:2 });

  var priceEl = document.getElementById('originalPrice');
  var pctEl = document.getElementById('discountPercent');
  var emptyEl = document.getElementById('discResultEmpty');
  var bodyEl = document.getElementById('discResultBody');
  var submitted = false;

  function parseNum(i) { var r = i.value.trim(); if (r === '') return null; var n = Number(r); return isFinite(n) ? n : NaN; }
  function setErr(i, msg) {
    var el = document.getElementById(i.id + '-error');
    if (msg) { i.setAttribute('aria-invalid','true'); if (el) { el.textContent = msg; el.classList.add('show'); } }
    else { i.removeAttribute('aria-invalid'); if (el) { el.textContent = ''; el.classList.remove('show'); } }
  }
  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

  function validate(show) {
    var invalid = 0;
    var p = parseNum(priceEl), pMsg = null;
    if (p === null) { if (show) { pMsg = 'Original price is required.'; invalid++; } p = 0; }
    else if (isNaN(p)) pMsg = 'Enter a valid number.';
    else if (p < 0) pMsg = 'Price cannot be negative.';
    else if (p > MAX) pMsg = 'Price is too large.';
    if (pMsg) invalid++;
    setErr(priceEl, pMsg);

    var d = parseNum(pctEl), dMsg = null;
    if (d === null) { if (show) { dMsg = 'Discount is required.'; invalid++; } d = 0; }
    else if (isNaN(d)) dMsg = 'Enter a valid number.';
    else if (d < 0) dMsg = 'Discount cannot be negative.';
    else if (d > 100) dMsg = 'Discount cannot exceed 100%.';
    if (dMsg) invalid++;
    setErr(pctEl, dMsg);
    return { price: p, pct: d, valid: invalid === 0 };
  }

  function render() {
    var r = validate(submitted);
    if (!r.valid) {
      bodyEl.hidden = true; emptyEl.hidden = false;
      emptyEl.textContent = submitted ? 'Fix the highlighted fields to see results.' : 'Enter an original price and discount to see the sale price.';
      return;
    }
    var disc = round2(r.price * r.pct / 100);
    var finalPrice = round2(r.price - disc);
    emptyEl.hidden = true; bodyEl.hidden = false;
    document.getElementById('discFinalPrice').textContent = inr.format(finalPrice);
    document.getElementById('discNote').textContent = r.pct === 0
      ? 'No discount applied — final price equals the original price.'
      : 'You save ' + inr.format(disc) + ' (' + dec.format(r.pct) + '% off).';
    document.getElementById('discOriginal').textContent = inr.format(r.price);
    document.getElementById('discPercent').textContent = dec.format(r.pct) + '%';
    document.getElementById('discSavings').textContent = inr.format(disc);
  }

  form.addEventListener('input', function (e) { if (e.target && e.target.tagName === 'INPUT') render(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); submitted = true; render(); });
  form.addEventListener('reset', function () {
    submitted = false;
    setTimeout(function () {
      setErr(priceEl, null); setErr(pctEl, null);
      bodyEl.hidden = true; emptyEl.hidden = false;
      emptyEl.textContent = 'Enter an original price and discount to see the sale price.';
    }, 0);
  });
})();
