(function () {
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Hide floating WhatsApp button near the footer to avoid overlap ----
  var floatBtn = document.querySelector('.float-whatsapp');
  var footer = document.querySelector('.footer');
  if (floatBtn && footer && 'IntersectionObserver' in window) {
    var footerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        floatBtn.classList.toggle('is-hidden', entry.isIntersecting);
      });
    }, { threshold: 0.15 });
    footerObserver.observe(footer);
  }

  // ---- Mobile nav ----
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- Countdown to end of month (only on pages with the offer block) ----
  function pad(n) { return String(n).padStart(2, '0'); }
  var cdD = document.getElementById('cd-d');
  var cdH = document.getElementById('cd-h');
  var cdM = document.getElementById('cd-m');
  var cdS = document.getElementById('cd-s');
  if (cdD && cdH && cdM && cdS) {
    var tickCountdown = function () {
      var now = new Date();
      var end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
      var diff = Math.max(0, end - now);
      var d = Math.floor(diff / 86400000); diff -= d * 86400000;
      var h = Math.floor(diff / 3600000); diff -= h * 3600000;
      var m = Math.floor(diff / 60000); diff -= m * 60000;
      var s = Math.floor(diff / 1000);
      cdD.textContent = pad(d);
      cdH.textContent = pad(h);
      cdM.textContent = pad(m);
      cdS.textContent = pad(s);
    };
    tickCountdown();
    setInterval(tickCountdown, 1000);
  }

  // ---- Animated stat counters ----
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var start = 0;
    var duration = 1400;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(start + (target - start) * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var countEls = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    countEls.forEach(function (el) { countObserver.observe(el); });
  } else {
    countEls.forEach(animateCount);
  }

  // ---- GSAP scroll animations (progressive enhancement) ----
  function initGSAP() {
    var gsap = window.gsap, ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);

    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.fromTo(el, { y: 46, opacity: 0 }, {
        y: 0, opacity: 1, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    var heroSec = document.querySelector('[data-hero-section]');
    var heroExpand = document.querySelector('[data-hero-expand]');
    var heroInner = document.querySelector('[data-hero-inner]');
    if (heroSec && heroExpand) {
      gsap.fromTo(heroExpand, { width: '58%', borderRadius: 22 }, {
        width: '100%', borderRadius: 0, ease: 'none',
        scrollTrigger: { trigger: heroSec, start: 'top 82%', end: 'top 12%', scrub: .6 }
      });
      if (heroInner) {
        gsap.fromTo(heroInner, { scale: 1.25 }, {
          scale: 1, ease: 'none',
          scrollTrigger: { trigger: heroSec, start: 'top 82%', end: 'top 12%', scrub: .6 }
        });
      }
    }

    gsap.utils.toArray('[data-expand]').forEach(function (el) {
      gsap.fromTo(el, { scale: .88, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 92%' }
      });
    });
    gsap.utils.toArray('[data-px]').forEach(function (el) {
      gsap.fromTo(el, { yPercent: -8 }, {
        yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    ST.refresh();
  }

  function waitForGSAP(attempts) {
    if (window.gsap && window.ScrollTrigger) { initGSAP(); return; }
    if (attempts > 40) {
      document.querySelectorAll('[data-reveal]').forEach(function (el) { el.style.opacity = 1; });
      return;
    }
    setTimeout(function () { waitForGSAP(attempts + 1); }, 75);
  }
  waitForGSAP(0);

  // ---- Portfolio filter (only on /portafolio) ----
  var filterBar = document.querySelector('[data-filters]');
  if (filterBar) {
    var filterBtns = filterBar.querySelectorAll('[data-filter]');
    var cards = document.querySelectorAll('[data-category]');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.getAttribute('data-filter');
        cards.forEach(function (card) {
          var match = filter === 'Todos' || card.getAttribute('data-category') === filter;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  }
})();
