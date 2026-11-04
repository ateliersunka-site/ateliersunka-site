// atelier Sunka 公式サイト：スライドとフェードイン
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
