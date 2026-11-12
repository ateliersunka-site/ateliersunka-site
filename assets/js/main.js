// atelier Sunka 公式サイト：ヘッダー・メニュー・ファーストビュー・スクロールの動き・商品スライダー・目次
// どのブラウザでも動く方法（IntersectionObserver と scroll イベント）で作っています。
// 「動きを減らす」設定の端末では、写真の切り替え・寄り・フェードインを止めます。
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.site-header');

  // ヘッダーの高さを CSS に伝える（目次の位置合わせに使う）
  var setH = function () { if (header) document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px'); };
  setH(); window.addEventListener('resize', setH);

  // 写真の上では透明、写真を過ぎたら白い帯にする
  var first = document.querySelector('.hero, .page-hero');
  if (header && first && document.body.classList.contains('has-hero')) {
    var solid = function () {
      header.classList.toggle('is-solid', first.getBoundingClientRect().bottom <= header.offsetHeight + 1);
    };
    window.addEventListener('scroll', solid, { passive: true });
    window.addEventListener('resize', solid);
    solid();
  }

  // スマホのメニュー（≡）
  var btn = document.querySelector('.menu-btn');
  var panel = document.getElementById('menu-panel');
  if (btn && panel) {
    var setMenu = function (open) {
      panel.hidden = !open;
      header.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    };
    btn.addEventListener('click', function () { setMenu(panel.hidden); });
    panel.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { setMenu(false); btn.focus(); } });
    window.addEventListener('resize', function () { if (getComputedStyle(btn).display === 'none') setMenu(false); });
  }

  // ファーストビュー：写真3枚がゆっくり切り替わる
  var hero = document.querySelector('[data-hero]');
  if (hero && !reduce) {
    var slides = hero.querySelectorAll('.hero-slide');
    var idx = 0;
    if (slides.length > 1) {
      setInterval(function () {
        slides[idx].classList.remove('is-active');
        idx = (idx + 1) % slides.length;
        slides[idx].classList.add('is-active');
      }, 6000);
    }
  }

  // スクロールでふわっと表示（カードは CSS の d1・d2 で時間差）
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // 写真がスクロールに合わせてゆっくり寄る（画面に入るときは少し大きく、通り過ぎると等倍）
  var zooms = Array.prototype.slice.call(document.querySelectorAll('.zoom'));
  if (zooms.length && !reduce) {
    var ticking = false;
    var update = function () {
      var vh = window.innerHeight;
      zooms.forEach(function (el) {
        var r = (el.parentElement || el).getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = (vh - r.top) / (vh + r.height);          // 0：画面の下から入る → 1：上へ出る
        p = Math.min(1, Math.max(0, p));
        el.style.transform = 'scale(' + (1.12 - 0.12 * p).toFixed(4) + ')';
      });
      ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // 購入前に知りたいこと：目次の「いま見ている項目」に印をつける
  var toc = document.querySelector('[data-toc]');
  if (toc) {
    document.body.setAttribute('data-toc-page', '');
    var links = toc.querySelectorAll('a');
    var secs = [];
    links.forEach(function (a) { var t = document.querySelector(a.getAttribute('href')); if (t) secs.push([t, a]); });
    var mark = function () {
      var line = header.offsetHeight + toc.offsetHeight + 60, cur = null;
      secs.forEach(function (p) { if (p[0].getBoundingClientRect().top <= line) cur = p; });
      if (cur && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = secs[secs.length - 1];
      links.forEach(function (a) { a.setAttribute('aria-current', cur && a === cur[1] ? 'true' : 'false'); });
    };
    window.addEventListener('scroll', mark, { passive: true });
    mark();
  }

  // 商品の横スライダー（3秒ごとに1枚ずつ進む／矢印／指でスワイプ／最後まで行くと最初に戻る）
  var slider = document.querySelector('[data-slider]');
  if (slider) {
    var track = slider.querySelector('.product-track');
    var cards = track.querySelectorAll('.product-card');
    var nav = slider.querySelector('.product-nav');
    if (cards.length < 2) {
      nav.hidden = true;
    } else {
      var autoTimer = null, paused = false, resumeTimer = null;
      var step = function () {
        var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        return cards[0].getBoundingClientRect().width + gap;
      };
      var atEnd = function () { return track.scrollLeft + track.clientWidth >= track.scrollWidth - 4; };
      var go = function (dir) {
        if (dir > 0 && atEnd()) { track.scrollTo({ left: 0 }); return; }
        if (dir < 0 && track.scrollLeft <= 4) { track.scrollTo({ left: track.scrollWidth }); return; }
        track.scrollBy({ left: dir * step() });
      };
      var startAuto = function () {
        if (reduce) return;
        clearInterval(autoTimer);
        autoTimer = setInterval(function () { if (!paused) go(1); }, 3000);
      };
      var pause = function () { paused = true; clearTimeout(resumeTimer); };
      var resume = function (delay) {
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(function () { paused = false; }, delay || 0);
      };
      slider.querySelector('.product-arrow.prev').addEventListener('click', function () { go(-1); startAuto(); });
      slider.querySelector('.product-arrow.next').addEventListener('click', function () { go(1); startAuto(); });
      slider.addEventListener('mouseenter', pause);
      slider.addEventListener('mouseleave', function () { resume(0); });
      slider.addEventListener('focusin', pause);
      slider.addEventListener('focusout', function () { resume(0); });
      track.addEventListener('touchstart', pause, { passive: true });
      track.addEventListener('touchend', function () { resume(6000); }, { passive: true });
      startAuto();
    }
  }
})();
