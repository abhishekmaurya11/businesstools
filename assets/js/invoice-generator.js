(function () {
  'use strict';
  var form = document.getElementById('invoiceForm');
  if (!form) return;

  var inr = new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', minimumFractionDigits:2, maximumFractionDigits:2 });
  var itemRows = document.getElementById('itemRows');
  var addBtn = document.getElementById('addItemBtn');
  var printBtn = document.getElementById('printBtn');

  function isoDate(d) {
    var y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
    return y + '-' + m + '-' + day;
  }
  function escHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]; });
  }

  var today = new Date(), in14 = new Date(today); in14.setDate(in14.getDate() + 14);
  document.getElementById('invDate').value = isoDate(today);
  document.getElementById('invDue').value = isoDate(in14);

  function rowHtml() {
    return '<div class="item-row">' +
      '<input type="text" class="item-desc" placeholder="Product or service">' +
      '<input type="number" class="item-qty" placeholder="1" min="0" step="1" value="1">' +
      '<input type="number" class="item-price" placeholder="0.00" min="0" step="0.01">' +
      '<span class="item-total">₹0.00</span>' +
      '<button type="button" class="btn-remove" aria-label="Remove item" title="Remove item">×</button>' +
      '</div>';
  }
  function addRow() { itemRows.insertAdjacentHTML('beforeend', rowHtml()); recalc(); }

  function recalc() {
    var rows = itemRows.querySelectorAll('.item-row');
    var subtotal = 0, html = '';
    rows.forEach(function (row) {
      var desc = row.querySelector('.item-desc').value.trim();
      var qty = parseFloat(row.querySelector('.item-qty').value) || 0;
      var price = parseFloat(row.querySelector('.item-price').value) || 0;
      var line = qty * price;
      subtotal += line;
      row.querySelector('.item-total').textContent = inr.format(line);
      if (desc || line > 0) html += '<tr><td>' + escHtml(desc || '—') + '</td><td>' + qty + '</td><td>' + inr.format(price) + '</td><td>' + inr.format(line) + '</td></tr>';
    });
    if (!html) html = '<tr><td colspan="4" style="color:var(--muted);text-align:center">No items yet</td></tr>';
    document.getElementById('dispItems').innerHTML = html;

    var discInput = parseFloat(document.getElementById('invDiscount').value) || 0;
    var discType = document.getElementById('invDiscountType').value;
    var discAmt = discType === 'pct' ? subtotal * discInput / 100 : discInput;
    if (discAmt > subtotal) discAmt = subtotal;
    var afterDisc = subtotal - discAmt;

    var taxInput = parseFloat(document.getElementById('invTax').value) || 0;
    var taxType = document.getElementById('invTaxType').value;
    var taxAmt = taxType === 'pct' ? afterDisc * taxInput / 100 : taxInput;
    var grand = afterDisc + taxAmt;

    document.getElementById('dispSubtotal').textContent = inr.format(subtotal);
    document.getElementById('dispDiscount').textContent = discAmt > 0 ? '− ' + inr.format(discAmt) : inr.format(0);
    document.getElementById('dispTax').textContent = inr.format(taxAmt);
    document.getElementById('dispGrand').textContent = inr.format(grand);

    syncText();
  }

  function syncText() {
    function v(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
    function put(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
    put('dispSellerName', v('invSellerName') || 'Your Business');
    put('dispSellerAddr', v('invSellerAddr'));
    put('dispSellerEmail', v('invSellerEmail'));
    put('dispSellerPhone', v('invSellerPhone'));
    put('dispCustomerName', v('invCustomerName') || 'Customer name');
    put('dispCustomerAddr', v('invCustomerAddr'));
    put('dispCustomerEmail', v('invCustomerEmail'));
    put('dispNumber', v('invNumber') || 'INV-001');
    put('dispStatus', v('invStatus') || 'Unpaid');
    var d = v('invDate'), due = v('invDue');
    put('dispDate', d ? new Date(d).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' }) : '—');
    put('dispDue', due ? new Date(due).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' }) : '—');
    put('dispNote', v('invNote'));
  }

  addRow();
  addBtn.addEventListener('click', addRow);
  itemRows.addEventListener('input', recalc);
  itemRows.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-remove')) {
      var row = e.target.closest('.item-row');
      if (!row) return;
      if (itemRows.querySelectorAll('.item-row').length > 1) { row.remove(); recalc(); }
      else {
        row.querySelector('.item-desc').value = '';
        row.querySelector('.item-qty').value = '1';
        row.querySelector('.item-price').value = '';
        recalc();
      }
    }
  });

  ['invSellerName','invSellerAddr','invSellerEmail','invSellerPhone','invCustomerName','invCustomerAddr','invCustomerEmail','invNumber','invDate','invDue','invStatus','invNote','invDiscount','invDiscountType','invTax','invTaxType'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) { el.addEventListener('input', recalc); el.addEventListener('change', recalc); }
  });

  form.addEventListener('submit', function (e) { e.preventDefault(); });
  form.addEventListener('reset', function () {
    setTimeout(function () {
      itemRows.innerHTML = '';
      addRow();
      var t = new Date(), t14 = new Date(t); t14.setDate(t14.getDate() + 14);
      document.getElementById('invDate').value = isoDate(t);
      document.getElementById('invDue').value = isoDate(t14);
      recalc();
    }, 0);
  });
  printBtn.addEventListener('click', function () { window.print(); });
  recalc();
})();
