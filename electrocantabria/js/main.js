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
   6. CAPTURA DE UTMs DE GOOGLE ADS
   ============================================================ */

(function captureUTMs() {
  const params = new URLSearchParams(window.location.search);
  const utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

  utmFields.forEach(key => {
    const value = params.get(key);
    if (value) {
      const field = document.getElementById(key);
      if (field) field.value = value;

      // Persistir en sessionStorage para que sobreviva recargas
      sessionStorage.setItem(key, value);
    } else {
      // Recuperar de sessionStorage si ya estaba guardado
      const stored = sessionStorage.getItem(key);
      if (stored) {
        const field = document.getElementById(key);
        if (field) field.value = stored;
      }
    }
  });
})();


/* ============================================================
   7. VALIDACIÓN Y ENVÍO DEL FORMULARIO
   ============================================================ */

(function initContactForm() {
  const form       = document.getElementById('contact-form');
  const successMsg = document.getElementById('form-success');
  if (!form) return;

  const rules = {
    nombre:           { required: true, minLength: 2,  msg: 'Por favor, introduce tu nombre completo.' },
    telefono:         { required: true, pattern: /^[6789]\d{8}$/, msg: 'Introduce un teléfono español válido (9 dígitos).' },
    electrodomestico: { required: true, msg: 'Selecciona el electrodoméstico a reparar.' },
  };

  const showError = (fieldId, msg) => {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(`${fieldId}-error`);
    if (field)  field.classList.add('error');
    if (error)  error.textContent = msg;
  };

  const clearError = (fieldId) => {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(`${fieldId}-error`);
    if (field)  field.classList.remove('error');
    if (error)  error.textContent = '';
  };

  // Validación en tiempo real
  Object.keys(rules).forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.addEventListener('blur', () => validateField(fieldId));
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) validateField(fieldId);
    });
  });

  const validateField = (fieldId) => {
    const rule  = rules[fieldId];
    const field = document.getElementById(fieldId);
    if (!field || !rule) return true;

    const value = field.value.trim();

    if (rule.required && !value) {
      showError(fieldId, rule.msg);
      return false;
    }

    if (rule.minLength && value.length < rule.minLength) {
      showError(fieldId, rule.msg);
      return false;
    }

    if (rule.pattern && !rule.pattern.test(value.replace(/\s/g, ''))) {
      showError(fieldId, rule.msg);
      return false;
    }

    clearError(fieldId);
    return true;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    Object.keys(rules).forEach(fieldId => {
      if (!validateField(fieldId)) valid = false;
    });

    if (!valid) {
      // Scroll al primer error
      const firstError = form.querySelector('.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Simulación de envío — reemplazar con fetch a tu backend/CRM
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'ENVIANDO...';

    setTimeout(() => {
      // Ocultar formulario, mostrar mensaje de éxito
      Array.from(form.elements).forEach(el => {
        if (el.type !== 'hidden') el.closest('.form-group')?.style && (el.closest('.form-group').style.display = 'none');
      });
      submitBtn.style.display = 'none';
      form.querySelector('.form-privacy').style.display = 'none';

      if (successMsg) {
        successMsg.hidden = false;
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Google Ads conversion tracking (descomentar cuando tengas el ID)
      // if (typeof gtag !== 'undefined') {
      //   gtag('event', 'conversion', { 'send_to': 'AW-XXXXXXXXX/YYYYYYYY' });
      // }
    }, 800);
  });
})();


/* ============================================================
   8. BOTÓN FLOTANTE — ocultar cuando formulario está visible
   ============================================================ */

(function initFloatingBtn() {
  const floatingBtn = document.getElementById('floating-call');
  const contactSection = document.getElementById('contacto');
  if (!floatingBtn || !contactSection) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      // Ocultar el botón flotante cuando el formulario de contacto es visible
      floatingBtn.style.opacity = entry.isIntersecting ? '0' : '1';
      floatingBtn.style.pointerEvents = entry.isIntersecting ? 'none' : 'auto';
    },
    { threshold: 0.3 }
  );

  observer.observe(contactSection);
})();


/* ============================================================
   9. ANIMACIÓN DE ENTRADA (fade-up) para elementos clave
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
