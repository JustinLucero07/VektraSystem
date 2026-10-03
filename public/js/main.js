(function () {
  'use strict';

  // ---- Current Year in Footer ----
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Sticky Nav on Scroll ----
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScrollNav = function () {
      if (window.scrollY > 30) {
        nav.classList.add('is-scrolled');
      } else {
        nav.classList.remove('is-scrolled');
      }
    };
    window.addEventListener('scroll', onScrollNav, { passive: true });
    onScrollNav();
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

  // ---- Interactive Project Price Calculator ----
  var calcContainer = document.getElementById('interactive-calc');
  if (calcContainer) {
    var selectedService = 'web';
    var serviceBasePrices = {
      'web': { name: 'Página Web Profesional', price: 95 },
      'ecommerce': { name: 'Tienda Online E-commerce', price: 175 },
      'sistema': { name: 'Sistema Gestor Empresarial', price: 290 },
      'app': { name: 'App / Software a Medida', price: 450 }
    };

    var typeChips = calcContainer.querySelectorAll('[data-calc-type]');
    var addonChips = calcContainer.querySelectorAll('[data-calc-addon]');
    var totalAmountEl = document.getElementById('calc-total-val');
    var originalAmountEl = document.getElementById('calc-original-val');
    var calcWspBtn = document.getElementById('calc-wsp-btn');
    var calcSummaryText = document.getElementById('calc-summary-details');

    function updateCalc() {
      var currentConfig = serviceBasePrices[selectedService] || serviceBasePrices['web'];
      var base = currentConfig.price;
      var addonsTotal = 0;
      var addonsNames = [];

      addonChips.forEach(function (chip) {
        var key = chip.getAttribute('data-calc-addon');
        var price = parseInt(chip.getAttribute('data-price'), 10) || 0;
        if (chip.classList.contains('active')) {
          addonsTotal += price;
          var labelEl = chip.querySelector('.chip-title');
          addonsNames.push(labelEl ? labelEl.textContent.trim() : key);
        }
      });

      var total = base + addonsTotal;

      if (totalAmountEl) totalAmountEl.textContent = '$' + total;
      if (originalAmountEl) originalAmountEl.textContent = 'Desde $' + base;

      var serviceName = currentConfig.name;
      var summaryMsg = serviceName;
      if (addonsNames.length > 0) {
        summaryMsg += ' + ' + addonsNames.join(', ');
      }
      if (calcSummaryText) calcSummaryText.textContent = summaryMsg;

      if (calcWspBtn) {
        var text = 'Hola Vektra Systems, coticé en su sitio web la solución: ' +
          summaryMsg + ' (Presupuesto base estimado: $' + total + ' USD). Deseo coordinar el alcance técnico y tiempos de entrega.';
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

  // ---- Portfolio Filter (on /portafolio) ----
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

  // ---- Contact Form Handler (Direct WhatsApp / Email Payload) ----
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (document.getElementById('formName') || {}).value || '';
      var email = (document.getElementById('formEmail') || {}).value || '';
      var phone = (document.getElementById('formPhone') || {}).value || '';
      var service = (document.getElementById('formService') || {}).value || 'Desarrollo General';
      var message = (document.getElementById('formMessage') || {}).value || '';

      var text = 'Hola Vektra Systems,\n' +
        'Nombre: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Teléfono/WhatsApp: ' + phone + '\n' +
        'Servicio de interés: ' + service + '\n' +
        'Detalle del proyecto: ' + message;

      var wspUrl = 'https://wa.me/593992555864?text=' + encodeURIComponent(text);
      window.open(wspUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // ---- Smooth Reveals & Parallax (Respects prefers-reduced-motion) ----
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initAnimations() {
    if (prefersReducedMotion) {
      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    var gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST) {
      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        el.style.opacity = '1';
      });
      return;
    }

    gsap.registerPlugin(ST);

    // Section reveal animations
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.fromTo(el, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.75, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    // Hero image smooth expand
    var heroSec = document.querySelector('[data-hero-section]');
    var heroExpand = document.querySelector('[data-hero-expand]');
    var heroInner = document.querySelector('[data-hero-inner]');
    if (heroSec && heroExpand) {
      gsap.fromTo(heroExpand, { width: '80%', borderRadius: 24 }, {
        width: '100%', borderRadius: 12, ease: 'none',
        scrollTrigger: { trigger: heroSec, start: 'top 80%', end: 'top 20%', scrub: 0.8 }
      });
      if (heroInner) {
        gsap.fromTo(heroInner, { scale: 1.2 }, {
          scale: 1, ease: 'none',
          scrollTrigger: { trigger: heroSec, start: 'top 80%', end: 'top 20%', scrub: 0.8 }
        });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
  } else {
    initAnimations();
  }

})();
