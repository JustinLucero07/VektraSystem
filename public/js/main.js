(function () {
  'use strict';

  // ---- Current Year in Footer ----
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Sticky Nav on Scroll ----
  var nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 40) {
        nav.classList.add('is-scrolled');
      } else {
        nav.classList.remove('is-scrolled');
      }
    });
  }

  // ---- Hide floating WhatsApp button near footer ----
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

  // ---- Mobile Nav Burger & Backdrop Overlay ----
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
  var navHeader = document.querySelector('.nav');

  if (burger && navLinks) {
    var overlay = document.querySelector('.nav-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'nav-overlay';
      if (navHeader) {
        navHeader.appendChild(overlay);
      } else {
        document.body.appendChild(overlay);
      }
    }

    function closeMenu() {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
      overlay.classList.remove('open');
      document.body.classList.remove('menu-open');
      burger.setAttribute('aria-expanded', 'false');
    }

    function toggleMenu() {
      var isOpen = navLinks.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      overlay.classList.toggle('open', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    burger.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);

    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  // ---- Dynamic 48-Hour Urgency Countdown Timer ----
  function pad(n) { return String(n).padStart(2, '0'); }

  var promoStorageKey = 'vektra_promo_end_v2';
  var targetTime = localStorage.getItem(promoStorageKey);
  if (!targetTime || parseInt(targetTime, 10) < Date.now()) {
    targetTime = Date.now() + (2 * 24 * 60 * 60 * 1000) - (12 * 60 * 1000);
    localStorage.setItem(promoStorageKey, targetTime);
  } else {
    targetTime = parseInt(targetTime, 10);
  }

  function updateCountdowns() {
    var now = Date.now();
    var diff = Math.max(0, targetTime - now);

    if (diff <= 0) {
      targetTime = Date.now() + (2 * 24 * 60 * 60 * 1000);
      localStorage.setItem(promoStorageKey, targetTime);
      diff = targetTime - now;
    }

    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);

    var pD = document.getElementById('promo-cd-d');
    var pH = document.getElementById('promo-cd-h');
    var pM = document.getElementById('promo-cd-m');
    var pS = document.getElementById('promo-cd-s');
    if (pH && pM && pS) {
      if (pD) pD.textContent = pad(d);
      pH.textContent = pad(h);
      pM.textContent = pad(m);
      pS.textContent = pad(s);
    }

    var cdD = document.getElementById('cd-d');
    var cdH = document.getElementById('cd-h');
    var cdM = document.getElementById('cd-m');
    var cdS = document.getElementById('cd-s');
    if (cdD && cdH && cdM && cdS) {
      cdD.textContent = pad(d);
      cdH.textContent = pad(h);
      cdM.textContent = pad(m);
      cdS.textContent = pad(s);
    }
  }
  updateCountdowns();
  setInterval(updateCountdowns, 1000);

  // ---- Animated Stat Counters ----
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

  // ---- Interactive Project Price Calculator ----
  var calcContainer = document.getElementById('interactive-calc');
  if (calcContainer) {
    var selectedService = 'web';
    var serviceBasePrices = {
      'web': { name: 'Página Web Corporativa', price: 95 },
      'ecommerce': { name: 'Tienda E-commerce', price: 175 },
      'sistema': { name: 'Sistema Gestor', price: 290 },
      'app': { name: 'App a Medida', price: 450 }
    };

    var typeChips = calcContainer.querySelectorAll('[data-calc-type]');
    var addonChips = calcContainer.querySelectorAll('[data-calc-addon]');
    var totalAmountEl = document.getElementById('calc-total-val');
    var originalAmountEl = document.getElementById('calc-original-val');
    var calcWspBtn = document.getElementById('calc-wsp-btn');
    var calcSummaryText = document.getElementById('calc-summary-details');

    function updateCalc() {
      var base = serviceBasePrices[selectedService].price;
      var addonsTotal = 0;
      var addonsNames = [];

      addonChips.forEach(function (chip) {
        var key = chip.getAttribute('data-calc-addon');
        var price = parseInt(chip.getAttribute('data-price'), 10) || 0;
        if (chip.classList.contains('active')) {
          addonsTotal += price;
          var label = chip.querySelector('.chip-title') ? chip.querySelector('.chip-title').textContent : key;
          addonsNames.push(label);
        }
      });

      var originalTotal = base + addonsTotal;
      var discountedTotal = Math.round(originalTotal * 0.85);

      if (totalAmountEl) totalAmountEl.textContent = '$' + discountedTotal;
      if (originalAmountEl) originalAmountEl.textContent = '$' + originalTotal;

      var serviceName = serviceBasePrices[selectedService].name;
      var summaryMsg = serviceName;
      if (addonsNames.length > 0) {
        summaryMsg += ' + ' + addonsNames.join(', ');
      }
      if (calcSummaryText) calcSummaryText.textContent = summaryMsg;

      if (calcWspBtn) {
        var text = 'Hola Vektra Systems, quiero aprovechar el 15% de descuento para mi proyecto: ' +
          summaryMsg + '. Precio estimado con oferta: $' + discountedTotal + ' USD (Antes: $' + originalTotal + ' USD). ¿Podemos empezar?';
        calcWspBtn.href = 'https://wa.me/593992555864?text=' + encodeURIComponent(text);
      }
    }

    typeChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        typeChips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        selectedService = chip.getAttribute('data-calc-type');
        updateCalc();
      });
    });

    addonChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chip.classList.toggle('active');
        updateCalc();
      });
    });

    updateCalc();
  }

  // ---- Social Proof Toast Ticker ----
  var socialToasts = [
    { name: 'Karla R. (Quito)', action: 'solicitó cotización para Plan Impacto Web', time: 'hace 6 min' },
    { name: 'Empresa Agro (Guayaquil)', action: 'reservó cupo con 15% de descuento', time: 'hace 12 min' },
    { name: 'Andrés P. (Cuenca)', action: 'inició proyecto de Sistema Gestor', time: 'hace 19 min' },
    { name: 'Restaurante Gourmet (Ambato)', action: 'solicitó demo de E-commerce', time: 'hace 27 min' }
  ];

  var toastEl = document.createElement('div');
  toastEl.className = 'social-toast';
  toastEl.innerHTML = '<div class="social-toast-icon">•</div><div><div class="social-toast-title" id="toast-title"></div><div class="social-toast-sub" id="toast-sub"></div></div>';
  document.body.appendChild(toastEl);

  var toastIndex = 0;
  function showNextToast() {
    var item = socialToasts[toastIndex];
    document.getElementById('toast-title').textContent = item.name;
    document.getElementById('toast-sub').textContent = item.action + ' • ' + item.time;
    toastEl.classList.add('show');

    setTimeout(function () {
      toastEl.classList.remove('show');
    }, 5500);

    toastIndex = (toastIndex + 1) % socialToasts.length;
  }

  setTimeout(function () {
    showNextToast();
    setInterval(showNextToast, 18000);
  }, 4000);

  // ---- GSAP & ScrollTrigger Parallax Smooth Expansion Effects ----
  function initGSAP() {
    var gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    gsap.registerPlugin(ST);

    // Section reveal animations
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.fromTo(el, { y: 45, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    // Hero image smooth expand parallax on scroll
    var heroSec = document.querySelector('[data-hero-section]');
    var heroExpand = document.querySelector('[data-hero-expand]');
    var heroInner = document.querySelector('[data-hero-inner]');
    if (heroSec && heroExpand) {
      gsap.fromTo(heroExpand, { width: '75%', borderRadius: 24 }, {
        width: '100%', borderRadius: 0, ease: 'none',
        scrollTrigger: { trigger: heroSec, start: 'top 85%', end: 'top 15%', scrub: 0.8 }
      });
      if (heroInner) {
        gsap.fromTo(heroInner, { scale: 1.35 }, {
          scale: 1, ease: 'none',
          scrollTrigger: { trigger: heroSec, start: 'top 85%', end: 'top 15%', scrub: 0.8 }
        });
      }
    }

    // Portfolio Card Images Expansion & Parallax ScrollTrigger Effect
    gsap.utils.toArray('.portfolio-item').forEach(function (card) {
      var img = card.querySelector('img');
      if (img) {
        gsap.fromTo(img, { scale: 1.35, yPercent: -12 }, {
          scale: 1, yPercent: 0, ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1 }
        });
      }
    });

    gsap.utils.toArray('.portfolio-card-visual img').forEach(function (img) {
      gsap.fromTo(img, { scale: 1.3, yPercent: -10 }, {
        scale: 1, yPercent: 0, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    });

    ST.refresh();
  }

  function waitForGSAP(attempts) {
    if (window.gsap && window.ScrollTrigger) { initGSAP(); return; }
    if (attempts > 30) {
      document.querySelectorAll('[data-reveal]').forEach(function (el) { el.style.opacity = 1; });
      return;
    }
    setTimeout(function () { waitForGSAP(attempts + 1); }, 75);
  }
  waitForGSAP(0);

  // ---- Portfolio Filter (only on /portafolio) ----
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
