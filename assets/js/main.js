// atelier Sunka 公式サイト：スライド・商品スライダー・フェードイン
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // スクロールでふわっと表示
  var fades = document.querySelectorAll('.fade');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    fades.forEach(function (el) { io.observe(el); });
  } else {
    fades.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // 商品の横スライダー（自動で1枚ずつ進む／矢印／指でスワイプ）
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
        autoTimer = setInterval(function () { if (!paused) go(1); }, 4500);
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

  // トップのスライド
  var hero = document.querySelector('[data-hero]');
  if (!hero) return;
  var slides = hero.querySelectorAll('.hero-slide');
  var dots = hero.querySelectorAll('.hero-dots button');
  var idx = 0, timer = null;

  function show(n) {
    idx = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) {
      s.classList.toggle('is-active', i === idx);
      s.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
    });
    dots.forEach(function (d, i) { d.setAttribute('aria-current', i === idx ? 'true' : 'false'); });
  }
  function restart() {
    if (reduce) return;
    clearInterval(timer);
    timer = setInterval(function () { show(idx + 1); }, 6000);
  }

  hero.querySelector('.hero-arrow.prev').addEventListener('click', function () { show(idx - 1); restart(); });
  hero.querySelector('.hero-arrow.next').addEventListener('click', function () { show(idx + 1); restart(); });
  dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i); restart(); }); });

  show(0);
  restart();
})();
