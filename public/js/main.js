/**
 * VEKTRA SYSTEMS — CLIENT SCRIPT
 * Sin dependencias externas. Mejora progresiva: todo el contenido es usable sin JS.
 */

(function () {
  'use strict';

  var WA_NUMBER = '593992555864';
  var root = document.documentElement;
  root.classList.add('js');

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---- 1. Año actual en el footer ----
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ---- 2. Cursor personalizado (solo escritorio con puntero fino) ----
  if (finePointer && !prefersReducedMotion) {
    var ring = document.createElement('div');
    ring.className = 'custom-cursor-ring';
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);

    var mouseX = 0, mouseY = 0, ringX = 0, ringY = 0, cursorRunning = false;

    function renderCursor() {
      ringX += (mouseX - ringX) * 0.28;
      ringY += (mouseY - ringY) * 0.28;
      ring.style.transform = 'translate3d(' + ringX + 'px,' + ringY + 'px,0)';
      if (Math.abs(mouseX - ringX) > 0.1 || Math.abs(mouseY - ringY) > 0.1) {
        requestAnimationFrame(renderCursor);
      } else {
        cursorRunning = false;
      }
    }

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      ring.classList.add('is-visible');
      if (!cursorRunning) {
        cursorRunning = true;
        requestAnimationFrame(renderCursor);
      }
    }, { passive: true });

    document.addEventListener('mouseleave', function () { ring.classList.remove('is-visible'); });
    window.addEventListener('mousedown', function () { ring.classList.add('is-down'); });
    window.addEventListener('mouseup', function () { ring.classList.remove('is-down'); });

    // Delegación: funciona también con elementos añadidos después
    var hoverSel = 'a, button, summary, [role="button"], .calc-chip, label';
    var textSel = 'input, textarea, select';
    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      ring.classList.toggle('is-text', !!t.closest(textSel));
      ring.classList.toggle('is-hover', !!t.closest(hoverSel) && !t.closest(textSel));
    });
  }

  // ---- 3. Navbar: sombra al hacer scroll ----
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScrollNav = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScrollNav, { passive: true });
    onScrollNav();
  }

  // ---- 4. Ocultar WhatsApp flotante cerca del footer ----
  var floatEls = document.querySelectorAll('.float-whatsapp, .mobile-cta-bar');
  var footer = document.querySelector('.footer');
  if (floatEls.length && footer && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        floatEls.forEach(function (el) { el.classList.toggle('is-hidden', entry.isIntersecting); });
      });
    }, { threshold: 0.1 }).observe(footer);
  }

  // ---- 5. Menú móvil ----
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');

  if (burger && navLinks) {
    var overlay = document.querySelector('.nav-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'nav-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      document.body.appendChild(overlay);
    }

    var setMenu = function (open) {
      navLinks.classList.toggle('open', open);
      burger.classList.toggle('open', open);
      overlay.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
      if (open) {
        var first = navLinks.querySelector('a');
        if (first) first.focus({ preventScroll: true });
      }
    };

    burger.addEventListener('click', function () {
      setMenu(!navLinks.classList.contains('open'));
    });
    overlay.addEventListener('click', function () { setMenu(false); });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        setMenu(false);
        burger.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1140 && navLinks.classList.contains('open')) setMenu(false);
    });
  }

  // ---- 6. Cotizador "Construye tu proyecto" ----
  var calcContainer = document.getElementById('interactive-calc');
  if (calcContainer) {
    var selectedService = 'web';
    var selectedScope = '';
    var serviceBasePrices = {
      'web': { name: 'Página Web Profesional', price: 95 },
      'ecommerce': { name: 'Tienda Online E-commerce', price: 175 },
      'sistema': { name: 'Sistema Gestor Empresarial (ERP)', price: 290 },
      'app': { name: 'Software / App a Medida', price: 450 }
    };

    var typeChips = calcContainer.querySelectorAll('[data-calc-type]');
    var scopeChips = calcContainer.querySelectorAll('[data-calc-scope]');
    var addonChips = calcContainer.querySelectorAll('[data-calc-addon]');
    var totalAmountEl = document.getElementById('calc-total-val');
    var originalAmountEl = document.getElementById('calc-original-val');
    var calcWspBtn = document.getElementById('calc-wsp-btn');
    var calcSummaryText = document.getElementById('calc-summary-details');
    var sumService = document.getElementById('calc-sum-service');
    var sumScope = document.getElementById('calc-sum-scope');
    var sumAddons = document.getElementById('calc-sum-addons');
    var progressEl = calcContainer.querySelector('.calc-progress');
    var progressLabel = document.getElementById('calc-progress-label');
    var stepItems = calcContainer.querySelectorAll('.calc-step-item');
    var touched = { service: true, scope: false, addons: false };
    var lastTotal = null;

    var updateProgress = function () {
      // 01 servicio, 02 tipo, 03 funcionalidades, 04 presupuesto, 05 resumen, 06 solicitar
      var done = 1 + (touched.scope ? 1 : 0) + (touched.addons ? 1 : 0);
      if (touched.scope && touched.addons) done = 5;
      stepItems.forEach(function (item, i) {
        item.classList.toggle('active', i < done);
      });
      if (progressEl) progressEl.style.setProperty('--progress', Math.round((done / 6) * 100) + '%');
      if (progressLabel) progressLabel.textContent = done + ' / 6';
    };

    var updateCalc = function () {
      var currentConfig = serviceBasePrices[selectedService] || serviceBasePrices.web;
      var base = currentConfig.price;
      var addonsTotal = 0;
      var addonsNames = [];

      addonChips.forEach(function (chip) {
        var key = chip.getAttribute('data-calc-addon');
        var price = parseInt(chip.getAttribute('data-price'), 10) || 0;
        var isActive = chip.classList.contains('active');
        chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        if (isActive) {
          addonsTotal += price;
          var labelEl = chip.querySelector('.chip-title');
          addonsNames.push(labelEl ? labelEl.textContent.trim() : key);
        }
      });

      var total = base + addonsTotal;

      if (totalAmountEl) {
        totalAmountEl.textContent = '$' + total;
        if (lastTotal !== null && lastTotal !== total && !prefersReducedMotion) {
          totalAmountEl.classList.remove('is-bumping');
          void totalAmountEl.offsetWidth;
          totalAmountEl.classList.add('is-bumping');
        }
        lastTotal = total;
      }
      if (originalAmountEl) originalAmountEl.textContent = 'Desde $' + base + ' + extras seleccionados';

      var summaryMsg = currentConfig.name;
      if (addonsNames.length > 0) summaryMsg += ' + ' + addonsNames.join(', ');
      if (calcSummaryText) calcSummaryText.textContent = summaryMsg;
      if (sumService) sumService.textContent = currentConfig.name;
      if (sumScope) sumScope.textContent = selectedScope || 'Por definir';
      if (sumAddons) sumAddons.textContent = addonsNames.length ? addonsNames.length + (addonsNames.length === 1 ? ' seleccionada' : ' seleccionadas') : 'Ninguna';

      if (calcWspBtn) {
        var text = 'Hola Vektra Systems, coticé en su sitio web la solución: ' + summaryMsg +
          (selectedScope ? ' (Tipo de proyecto: ' + selectedScope + ')' : '') +
          ' (Presupuesto base estimado: $' + total + ' USD). Deseo coordinar el alcance técnico y tiempos de entrega.';
        calcWspBtn.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
      }
      updateProgress();
    };

    typeChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        typeChips.forEach(function (c) {
          c.classList.remove('active');
          c.setAttribute('aria-checked', 'false');
        });
        chip.classList.add('active');
        chip.setAttribute('aria-checked', 'true');
        selectedService = chip.getAttribute('data-calc-type');
        touched.service = true;
        updateCalc();
      });
    });

    scopeChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        scopeChips.forEach(function (c) {
          c.classList.remove('active');
          c.setAttribute('aria-checked', 'false');
        });
        chip.classList.add('active');
        chip.setAttribute('aria-checked', 'true');
        var label = chip.querySelector('.chip-title');
        selectedScope = label ? label.textContent.trim() : chip.getAttribute('data-calc-scope');
        touched.scope = true;
        updateCalc();
      });
    });

    addonChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chip.classList.toggle('active');
        touched.addons = true;
        updateCalc();
      });
    });

    updateCalc();
  }

  // ---- 7. Filtros de portafolio (/portafolio) ----
  var portfolioFilters = document.querySelector('[data-filters]');
  if (portfolioFilters) {
    var filterBtns = portfolioFilters.querySelectorAll('[data-filter]');
    var cards = document.querySelectorAll('[data-category]');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        var filter = btn.getAttribute('data-filter');
        cards.forEach(function (card) {
          var cats = (card.getAttribute('data-category') || '').split(',');
          var match = filter === 'Todos' || cats.indexOf(filter) !== -1;
          card.classList.toggle('is-hidden', !match);
          if (match) {
            card.classList.add('is-visible');
          }
        });
      });
    });
  }

  // ---- 8. Filtro de planes (/planes) ----
  var planFilterBar = document.getElementById('planFilterBar');
  if (planFilterBar) {
    var planBtns = planFilterBar.querySelectorAll('[data-plan-filter]');
    var categories = document.querySelectorAll('.plan-category');
    planBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        planBtns.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        var targetCat = btn.getAttribute('data-plan-filter');
        categories.forEach(function (cat) {
          var show = targetCat === 'todos' || cat.getAttribute('data-cat-id') === targetCat;
          cat.style.display = show ? '' : 'none';
          if (show) {
            cat.classList.add('is-visible');
            cat.querySelectorAll('[data-reveal-stagger]').forEach(function (g) { g.classList.add('is-visible'); });
          }
        });
      });
    });
  }

  // ---- 9. Formulario de contacto → WhatsApp ----
  window.handleContactSubmit = function () {
    var val = function (id) { return ((document.getElementById(id) || {}).value || '').trim(); };
    var name = val('cNombre');
    var empresa = val('cEmpresa');
    var whatsapp = val('cWhatsApp');
    var email = val('cEmail');
    var tipo = val('cTipo') || 'Desarrollo General';
    var presupuesto = val('cPresupuesto');
    var mensaje = val('cMensaje');

    var text = 'Hola Vektra Systems, envío mi solicitud de cotización:\n\n' +
      '• Nombre: ' + name + '\n' +
      (empresa ? '• Empresa: ' + empresa + '\n' : '') +
      '• WhatsApp / Tel: ' + whatsapp + '\n' +
      '• Email: ' + email + '\n' +
      '• Solución requerida: ' + tipo + '\n' +
      (presupuesto ? '• Presupuesto estimado: ' + presupuesto + '\n' : '') +
      '• Detalle del proyecto: ' + mensaje;

    window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
  };

  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (typeof contactForm.reportValidity === 'function' && !contactForm.reportValidity()) return;
      window.handleContactSubmit();
    });
  }

  // ---- 10. Filtro del blog (/blog) ----
  var blogFilterBtns = document.querySelectorAll('.blog-filter-btn');
  var blogArticles = document.querySelectorAll('#blogArticlesGrid article[data-category]');
  if (blogFilterBtns.length > 0 && blogArticles.length > 0) {
    blogFilterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        blogFilterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var targetCat = btn.getAttribute('data-filter');
        blogArticles.forEach(function (article) {
          var show = targetCat === 'all' || article.getAttribute('data-category') === targetCat;
          article.style.display = show ? '' : 'none';
          if (show) article.classList.add('is-visible');
        });
      });
    });
  }

  // ---- 11. Pestañas HUD (/productos) ----
  document.querySelectorAll('.hud-tab-strip').forEach(function (strip) {
    var tabs = strip.querySelectorAll('.hud-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
      });
    });
  });

  // ---- 12. FAQ: solo una pregunta abierta por grupo ----
  document.querySelectorAll('.faq-list').forEach(function (list) {
    var items = list.querySelectorAll('details.faq-item');
    items.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        items.forEach(function (other) {
          if (other !== item && other.open) other.open = false;
        });
      });
    });
  });

  // ---- 13. Spotlight en tarjetas bento (sigue el puntero) ----
  if (finePointer) {
    document.querySelectorAll('.bento-item').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  // ---- 14. Parallax sutil del ecosistema del hero ----
  var eco = document.querySelector('.eco');
  if (eco && finePointer && !prefersReducedMotion) {
    var heroEl = eco.closest('.hero') || eco;
    var ecoFrame = null;
    heroEl.addEventListener('pointermove', function (e) {
      if (ecoFrame) return;
      ecoFrame = requestAnimationFrame(function () {
        var r = heroEl.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        var y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        eco.style.setProperty('--px', (x * -8).toFixed(2));
        eco.style.setProperty('--py', (y * -6).toFixed(2));
        ecoFrame = null;
      });
    });
    heroEl.addEventListener('pointerleave', function () {
      eco.style.setProperty('--px', 0);
      eco.style.setProperty('--py', 0);
    });
  }

  // ---- 15. Reveal al hacer scroll + línea de tiempo del proceso ----
  var revealEls = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
  document.querySelectorAll('[data-reveal-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty('--stagger', i);
    });
  });

  var timeline = document.querySelector('.process-timeline');

  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    if (timeline) {
      timeline.style.setProperty('--line', 1);
      timeline.querySelectorAll('.process-step').forEach(function (s) { s.classList.add('is-lit'); });
    }
    return;
  }

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  revealEls.forEach(function (el) { revealObserver.observe(el); });

  if (timeline) {
    var steps = timeline.querySelectorAll('.process-step');
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        timeline.style.setProperty('--line', 1);
        steps.forEach(function (s, i) {
          setTimeout(function () { s.classList.add('is-lit'); }, 250 + i * 280);
        });
        obs.disconnect();
      });
    }, { threshold: 0.35 }).observe(timeline);
  }
})();
