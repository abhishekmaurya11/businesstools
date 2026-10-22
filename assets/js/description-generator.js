(function () {
  'use strict';
  var form = document.getElementById('descForm');
  if (!form) return;

  var nameEl = document.getElementById('dName');
  var catEl = document.getElementById('dCategory');
  var featEl = document.getElementById('dFeatures');
  var audEl = document.getElementById('dAudience');
  var toneEl = document.getElementById('dTone');
  var emptyEl = document.getElementById('descEmpty');
  var outEl = document.getElementById('descOutput');

  var benefits = {
    battery:'for all-day use', charge:'to keep you going', wireless:'for a clean, cord-free setup',
    noise:'to tune out distractions', water:'splash- and sweat-resistant', waterproof:'ready for the outdoors',
    light:'comfortable to wear for hours', compact:'easy to carry anywhere', durable:'built to last',
    fast:'saves you time', eco:'kinder to the planet', cotton:'soft on the skin',
    leather:'a premium look and feel', touch:'for effortless control', smart:'that works the way you do',
    memory:'for a custom fit', grip:'for stability during use', soft:'gentle and comfortable',
    adjustable:'to fit just right', warranty:'for peace of mind'
  };
  function benefitFor(f) {
    var low = f.toLowerCase();
    for (var k in benefits) if (low.indexOf(k) !== -1) return benefits[k];
    return '';
  }
  function splitFeatures(raw) {
    return raw.split(/[,;\n]/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
  }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
  function escHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]; });
  }

  function toneTemplates(tone) {
    var T = {
      professional: {
        title: function (n,c,f) { return n + (c ? ' — ' + cap(c) : '') + ' | ' + f; },
        desc: function (n,a,fs) { return n + ' is designed for ' + a + '. With ' + fs + ', it delivers dependable performance for everyday use. Built for people who expect quality and consistency.'; },
        bullet: function (f,b) { return b ? f + ' — ' + b : f; },
        cta: 'Order today to experience the difference.'
      },
      friendly: {
        title: function (n,c,f) { return n + ' — ' + cap(f) + ' that just works'; },
        desc: function (n,a,fs) { return 'Meet ' + n + ', your new favorite for ' + a + '. With ' + fs + ', it is built to make your day a little easier. Simple, reliable, and ready when you are.'; },
        bullet: function (f,b) { return b ? f + ' ' + b : f; },
        cta: 'Grab yours today and see the difference.'
      },
      playful: {
        title: function (n,c,f) { return 'Say hello to ' + n + ' — ' + cap(f) + '!'; },
        desc: function (n,a,fs) { return 'Ready for an upgrade? Say hi to ' + n + '! Packed with ' + fs + ', it is made for ' + a + ' who want more from their gear. Fun to use, easy to love, and built to keep up.'; },
        bullet: function (f,b) { return b ? f + ' ' + b : f; },
        cta: 'Do not wait — add it to your cart!'
      },
      luxury: {
        title: function (n,c,f) { return n + ' — ' + cap(f) + ', redefined'; },
        desc: function (n,a,fs) { return 'Introducing ' + n + ', crafted for ' + a + '. With ' + fs + ', it redefines what everyday quality feels like. Understated, refined, and made to be enjoyed.'; },
        bullet: function (f,b) { return b ? f + ' — ' + b : f; },
        cta: 'Discover the difference. Order yours today.'
      },
      minimal: {
        title: function (n,c,f) { return n + ' | ' + cap(f); },
        desc: function (n,a,fs) { return n + ' for ' + a + '. ' + cap(fs) + '.'; },
        bullet: function (f,b) { return b ? f + ' — ' + b : f; },
        cta: 'Shop now.'
      }
    };
    return T[tone] || T.friendly;
  }

  function setErr(i, msg) {
    var el = document.getElementById(i.id + '-error');
    if (msg) { i.setAttribute('aria-invalid','true'); if (el) { el.textContent = msg; el.classList.add('show'); } }
    else { i.removeAttribute('aria-invalid'); if (el) { el.textContent = ''; el.classList.remove('show'); } }
  }

  function generate() {
    var name = nameEl.value.trim(), cat = catEl.value.trim(), aud = audEl.value.trim(), tone = toneEl.value;
    var feats = splitFeatures(featEl.value);
    if (!name) { setErr(nameEl, 'Product name is required.'); emptyEl.hidden = false; outEl.hidden = true; return; }
    setErr(nameEl, null);
    if (!aud) { setErr(audEl, 'Target audience is required.'); emptyEl.hidden = false; outEl.hidden = true; return; }
    setErr(audEl, null);
    if (!feats.length) feats = ['a standout design'];

    var t = toneTemplates(tone);
    var keyFeature = feats[0];
    var featureList = feats.length > 1 ? feats.slice(0, -1).join(', ') + ', and ' + feats[feats.length - 1] : feats[0];
    var title = t.title(name, cat, keyFeature);
    var desc = t.desc(name, aud, featureList);
    var bullets = feats.map(function (f) { return t.bullet(cap(f), benefitFor(f)); });
    var cta = t.cta;

    var html = '';
    html += '<div class="gen-block"><h3>Product title <button type="button" class="copy-btn" data-copy="' + escHtml(title) + '">Copy</button></h3><div class="gen-content"><p>' + escHtml(title) + '</p></div></div>';
    html += '<div class="gen-block"><h3>Product description <button type="button" class="copy-btn" data-copy="' + escHtml(desc) + '">Copy</button></h3><div class="gen-content"><p>' + escHtml(desc) + '</p></div></div>';
    html += '<div class="gen-block"><h3>Feature bullets <button type="button" class="copy-btn" data-copy="' + escHtml(bullets.map(function (b) { return '• ' + b; }).join('\n')) + '">Copy</button></h3><div class="gen-content"><ul>' + bullets.map(function (b) { return '<li>' + escHtml(b) + '</li>'; }).join('') + '</ul></div></div>';
    html += '<div class="gen-block"><h3>Call to action <button type="button" class="copy-btn" data-copy="' + escHtml(cta) + '">Copy</button></h3><div class="gen-content"><p>' + escHtml(cta) + '</p></div></div>';

    outEl.innerHTML = html;
    emptyEl.hidden = true; outEl.hidden = false;
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); generate(); });

  outEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.copy-btn');
    if (!btn) return;
    var text = btn.getAttribute('data-copy') || '';
    var orig = btn.textContent;
    function done() { btn.textContent = 'Copied!'; setTimeout(function () { btn.textContent = orig; }, 1400); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e2) {}
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  });
})();
