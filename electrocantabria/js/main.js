/* ============================================================
   ELECTROCANTABRIA — main.js
   Vanilla JS — Sin dependencias
   ============================================================ */

'use strict';

/* ============================================================
   1. STICKY HEADER (sombra al hacer scroll)
   ============================================================ */

(function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // estado inicial
})();


/* ============================================================
   2. MENÚ MOBILE (burger)
   ============================================================ */

(function initMobileMenu() {
  const burger   = document.getElementById('burger');
  const navMobile = document.getElementById('nav-mobile');
  if (!burger || !navMobile) return;

  const close = () => {
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    navMobile.classList.remove('open');
    navMobile.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  burger.addEventListener('click', () => {
    const isOpen = burger.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(isOpen));
    navMobile.classList.toggle('open', isOpen);
    navMobile.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Cerrar al hacer click en un enlace del menú mobile
  navMobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', close);
  });

  // Cerrar al hacer ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
})();


/* ============================================================
   3. SMOOTH SCROLL para anclas internas
   ============================================================ */

(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* ============================================================
   4. CONTADORES ANIMADOS (IntersectionObserver)
   ============================================================ */

(function initCounters() {
  const counters = document.querySelectorAll('.stat-card__number');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target  = parseFloat(el.dataset.target);
    const isDecimal = el.classList.contains('stat-card__number--decimal');
    const duration = 1800;
    const start    = performance.now();

    const step = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current  = easeOut(progress) * target;

      el.textContent = isDecimal
        ? current.toFixed(1)
        : Math.round(current).toString();

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = isDecimal ? target.toFixed(1) : target.toString();
      }
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(counter => observer.observe(counter));
})();


/* ============================================================
   5. FAQ ACCORDION
   ============================================================ */

(function initFAQ() {
  const triggers = document.querySelectorAll('.faq-item__trigger');
  if (!triggers.length) return;

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      const bodyId   = trigger.getAttribute('aria-controls');
      const body     = document.getElementById(bodyId);
      if (!body) return;

      // Opcionalmente cerrar el resto
      triggers.forEach(other => {
        if (other !== trigger) {
          other.setAttribute('aria-expanded', 'false');
          const otherBodyId = other.getAttribute('aria-controls');
          const otherBody   = document.getElementById(otherBodyId);
          if (otherBody) otherBody.hidden = true;
        }
      });

      trigger.setAttribute('aria-expanded', String(!expanded));
      body.hidden = expanded;
    });
  });
})();


/* ============================================================
   6. BOTÓN FLOTANTE — siempre visible en mobile
   ============================================================ */

// El botón flotante (#floating-call) siempre es visible en mobile — sin lógica adicional.


/* ============================================================
   7. ANIMACIÓN DE ENTRADA (fade-up) para elementos clave
   ============================================================ */

(function initFadeIn() {
  // Solo animar si el usuario no prefiere reducción de movimiento
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const style = document.createElement('style');
  style.textContent = `
    .fade-up {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity .5s ease, transform .5s ease;
    }
    .fade-up.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  const targets = document.querySelectorAll(
    '.service-card, .trust__item, .testimonial-card, .stat-card, .faq-item'
  );

  targets.forEach((el, i) => {
    el.classList.add('fade-up');
    el.style.transitionDelay = `${(i % 3) * 80}ms`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach(el => observer.observe(el));
})();
