(function () {
  'use strict';
  var form = document.getElementById('profitForm');
  if (!form) return;

  var MAX = 1e9;
  var inr = new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', minimumFractionDigits:2, maximumFractionDigits:2 });
  var dec = new Intl.NumberFormat('en-IN', { minimumFractionDigits:2, maximumFractionDigits:2 });

  var F = {
    cost: document.getElementById('cost'),
    packaging: document.getElementById('packaging'),
    shipping: document.getElementById('shipping'),
    other: document.getElementById('other'),
    ad: document.getElementById('ad'),
    price: document.getElementById('price'),
    fee: document.getElementById('fee')
  };
  var emptyEl = document.getElementById('profitResultEmpty');
  var bodyEl = document.getElementById('profitResultBody');
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
      else if (opts.gtZero && n <= 0) msg = label + ' must be greater than 0.';
      if (msg) invalid++;
      setErr(i, msg);
      v[i.id] = n;
    }
    check(F.cost, 'Product cost', { required:true });
    check(F.packaging, 'Packaging cost');
    check(F.shipping, 'Shipping cost');
    check(F.other, 'Other expenses');
    check(F.ad, 'Advertising cost');
    check(F.price, 'Selling price', { required:true, gtZero:true });
    check(F.fee, 'Fee', { max:100, unit:'%' });
    return { values: v, valid: invalid === 0 };
  }

  function render() {
    var r = validate(submitted);
    if (!r.valid) {
      bodyEl.hidden = true; emptyEl.hidden = false;
      emptyEl.textContent = submitted ? 'Fix the highlighted fields to see your results.' : 'Enter your product cost and selling price to see your profit.';
      return;
    }
    var v = r.values;
    var totalCost = v.cost + v.packaging + v.shipping + v.other + v.ad;
    var fees = v.price * v.fee / 100;
    var net = round2(v.price - fees - totalCost);
    var margin = v.price > 0 ? (net / v.price) * 100 : 0;
    var roi = totalCost > 0 ? (net / totalCost) * 100 : null;
    var be = v.fee < 100 ? totalCost / (1 - v.fee / 100) : null;

    emptyEl.hidden = true; bodyEl.hidden = false;
    var netEl = document.getElementById('profitNet');
    netEl.textContent = inr.format(net);
    netEl.classList.toggle('is-loss', net < 0);
    document.getElementById('profitNetLabel').textContent = net < 0 ? 'Loss per sale' : 'Net profit per sale';
    var note;
    if (net < 0) note = 'At this price you lose ' + inr.format(Math.abs(net)) + ' on every sale.';
    else if (net === 0) note = 'You break even on every sale — no profit, no loss.';
    else note = 'You keep ' + inr.format(net) + ' on every ' + inr.format(v.price) + ' sale.';
    document.getElementById('profitNote').textContent = note;

    document.getElementById('profitPrice').textContent = inr.format(v.price);
    document.getElementById('profitFees').textContent = inr.format(fees) + ' (' + dec.format(v.fee) + '%)';
    document.getElementById('profitTotalCost').textContent = inr.format(totalCost);

    var m = document.getElementById('profitMargin');
    m.textContent = dec.format(margin) + '%';
    m.classList.toggle('neg', margin < 0); m.classList.toggle('pos', margin >= 0);

    var rEl = document.getElementById('profitRoi');
    if (roi === null) { rEl.textContent = 'Not defined'; rEl.classList.remove('neg','pos'); }
    else { rEl.textContent = dec.format(roi) + '%'; rEl.classList.toggle('neg', roi < 0); rEl.classList.toggle('pos', roi >= 0); }
    document.getElementById('profitBreakEven').textContent = be === null ? 'Not achievable at 100% fees' : inr.format(be);
  }

  form.addEventListener('input', function (e) { if (e.target && e.target.tagName === 'INPUT') render(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); submitted = true; render(); });
  form.addEventListener('reset', function () {
    submitted = false;
    setTimeout(function () {
      Object.keys(F).forEach(function (k) { setErr(F[k], null); });
      bodyEl.hidden = true; emptyEl.hidden = false;
      emptyEl.textContent = 'Enter your product cost and selling price to see your profit.';
    }, 0);
  });
})();
