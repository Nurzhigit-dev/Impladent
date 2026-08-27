/* ==========================================================================
   Impladent — интерактив
   Без зависимостей. Каждый блок работает независимо: если один упадёт,
   остальные продолжат работать.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Мобильное меню ---------- */
  (function initMenu() {
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;

    var scrollY = 0;

    function open() {
      scrollY = window.scrollY;
      menu.setAttribute('data-open', 'true');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Закрыть меню');
      // блокируем прокрутку страницы под меню, не теряя позицию
      root.classList.add('menu-open');
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + scrollY + 'px';
      document.body.style.width = '100%';
    }

    function close() {
      if (menu.getAttribute('data-open') !== 'true') return;
      menu.setAttribute('data-open', 'false');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Открыть меню');
      root.classList.remove('menu-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    }

    toggle.addEventListener('click', function () {
      menu.getAttribute('data-open') === 'true' ? close() : open();
    });

    // клик по пункту меню — закрыть и проскроллить к секции
    menu.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      e.preventDefault();
      var target = document.querySelector(link.getAttribute('href'));
      close();
      if (target) {
        // ждём снятия position:fixed, иначе прокрутка не сработает
        requestAnimationFrame(function () {
          target.scrollIntoView({
            behavior: reduceMotion ? 'auto' : 'smooth',
            block: 'start'
          });
        });
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    // при переходе на десктоп меню должно закрыться
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) {
      if (e.matches) close();
    });
  })();

  /* ---------- 2. Нижняя панель действий (моб.) ---------- */
  (function initActionBar() {
    var bar = document.getElementById('actionBar');
    if (!bar) return;

    var desktop = window.matchMedia('(min-width: 1024px)');

    // резервируем место под панель, чтобы она не перекрывала подвал
    function reserve() {
      if (desktop.matches) {
        root.style.setProperty('--bar-h', '0px');
      } else {
        root.style.setProperty('--bar-h', bar.offsetHeight + 'px');
      }
    }

    function update() {
      if (desktop.matches) return;
      bar.setAttribute('data-show', window.scrollY > 420 ? 'true' : 'false');
    }

    reserve();
    update();

    // Намеренно без requestAnimationFrame: здесь всего одна запись атрибута,
    // троттлинг через rAF ничего не экономит, но добавляет режим, в котором
    // панель залипает, если кадры не отрисовываются (фоновая вкладка и т.п.).
    window.addEventListener('scroll', update, { passive: true });

    window.addEventListener('resize', function () {
      reserve();
      update();
    }, { passive: true });

    window.addEventListener('orientationchange', reserve);
    desktop.addEventListener('change', function () {
      reserve();
      update();
    });
  })();

  /* ---------- 3. Биографии врачей ---------- */
  (function initBios() {
    var toggles = document.querySelectorAll('.doc-toggle');
    Array.prototype.forEach.call(toggles, function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var label = btn.querySelector('.doc-toggle-label');
      if (!panel) return;

      btn.addEventListener('click', function () {
        var isOpen = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!isOpen));
        panel.hidden = isOpen;
        if (label) label.textContent = isOpen ? 'Подробнее' : 'Свернуть';
      });
    });
  })();

  /* ---------- 4. Появление секций при прокрутке ---------- */
  (function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    // нет поддержки или выключена анимация — показываем сразу
    if (reduceMotion || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    Array.prototype.forEach.call(items, function (el, i) {
      // лёгкая каскадная задержка внутри одной группы
      el.style.transitionDelay = (i % 4) * 60 + 'ms';
      io.observe(el);
    });
  })();

  /* ---------- 5. Год в подвале ---------- */
  (function initYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  })();

})();
