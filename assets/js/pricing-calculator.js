(function () {
  'use strict';
  var form = document.getElementById('pricingForm');
  if (!form) return;

  var MAX = 1e9;
  var inr = new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', minimumFractionDigits:2, maximumFractionDigits:2 });
  var dec = new Intl.NumberFormat('en-IN', { minimumFractionDigits:2, maximumFractionDigits:2 });

  var F = {
    pCost: document.getElementById('pCost'),
    pPackaging: document.getElementById('pPackaging'),
    pOther: document.getElementById('pOther'),
    pFee: document.getElementById('pFee'),
    pMargin: document.getElementById('pMargin')
  };
  var emptyEl = document.getElementById('priceResultEmpty');
  var bodyEl = document.getElementById('priceResultBody');
  var submitted = false;

  function parseNum(i) { var r = i.value.trim(); if (r === '') return null; var n = Number(r); return isFinite(n) ? n : NaN; }
  function setErr(i, msg) {
    var el = document.getElementById(i.id + '-error');
    if (msg) { i.setAttribute('aria-invalid','true'); if (el) { el.textContent = msg; el.classList.add('show'); } }
    else { i.removeAttribute('aria-invalid'); if (el) { el.textContent = ''; el.classList.remove('show'); } }
  }
  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

  function validate(show) {
    var invalid = 0, v = {};
    function check(i, label, opts) {
      opts = opts || {};
      var n = parseNum(i), msg = null;
      if (n === null) { if (opts.required) { invalid++; if (show) msg = label + ' is required.'; } n = 0; }
      else if (isNaN(n)) msg = 'Enter a valid number.';
      else if (n < 0) msg = label + ' cannot be negative.';
      else if (n > MAX) msg = label + ' is too large.';
      else if (opts.max !== undefined && n > opts.max) msg = label + ' cannot exceed ' + opts.max + (opts.unit || '') + '.';
      if (msg) invalid++;
      setErr(i, msg);
      v[i.id] = n;
    }
    check(F.pCost, 'Product cost', { required:true });
    check(F.pPackaging, 'Packaging/shipping');
    check(F.pOther, 'Other expenses');
    check(F.pFee, 'Fee', { max:99, unit:'%' });
    check(F.pMargin, 'Margin', { required:true, max:99, unit:'%' });

    if (v.pFee + v.pMargin >= 100) {
      setErr(F.pMargin, 'Fee % + margin % must be less than 100%.');
      invalid++;
    }
    return { values: v, total: v.pCost + v.pPackaging + v.pOther, valid: invalid === 0 };
  }

  function render() {
    var r = validate(submitted);
    if (!r.valid) {
      bodyEl.hidden = true; emptyEl.hidden = false;
      emptyEl.textContent = submitted ? 'Fix the highlighted fields to see results.' : 'Enter your costs and target margin to see the recommended selling price.';
      return;
    }
    var v = r.values;
    var denom = 1 - v.pFee / 100 - v.pMargin / 100;
    if (denom <= 0) {
      bodyEl.hidden = true; emptyEl.hidden = false;
      emptyEl.textContent = 'No valid price exists with these inputs.';
      return;
    }
    var price = round2(r.total / denom);
    var fees = round2(price * v.pFee / 100);
    var profit = round2(price - fees - r.total);
    var achieved = price > 0 ? (profit / price) * 100 : 0;

    emptyEl.hidden = true; bodyEl.hidden = false;
    document.getElementById('priceRec').textContent = inr.format(price);
    document.getElementById('priceNote').textContent = 'At this price you earn ' + inr.format(profit) + ' per sale.';
    document.getElementById('priceTotalCost').textContent = inr.format(r.total);
    document.getElementById('priceFees').textContent = inr.format(fees) + ' (' + dec.format(v.pFee) + '%)';
    document.getElementById('priceProfit').textContent = inr.format(profit);
    document.getElementById('priceMargin').textContent = dec.format(achieved) + '%';
  }

  form.addEventListener('input', function (e) { if (e.target && e.target.tagName === 'INPUT') render(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); submitted = true; render(); });
  form.addEventListener('reset', function () {
    submitted = false;
    setTimeout(function () {
      Object.keys(F).forEach(function (k) { setErr(F[k], null); });
      bodyEl.hidden = true; emptyEl.hidden = false;
      emptyEl.textContent = 'Enter your costs and target margin to see the recommended selling price.';
    }, 0);
  });
})();
