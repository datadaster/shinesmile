(function () {
  'use strict';

  /* ================================================================
    1. CARRUSEL DE TESTIMONIOS
  ================================================================ */

  const track       = document.getElementById('testimoniosTrack');
  const prevBtn     = document.getElementById('testimonioPrev');
  const nextBtn     = document.getElementById('testimonioNext');
  const dotsWrap    = document.getElementById('testimonioDots');

  if (track && prevBtn && nextBtn && dotsWrap) {

    const cards        = Array.from(track.children);
    const totalCards   = cards.length;
    let currentIndex   = 0;
    let autoPlayTimer  = null;

    /* Calcular cuántas tarjetas son visibles según el ancho del viewport */
    function visibleCount() {
      if (window.innerWidth >= 992) return 3;
      if (window.innerWidth >= 575) return 2;
      return 1;
    }

    /* Calcular el máximo índice posible */
    function maxIndex() {
      return Math.max(0, totalCards - visibleCount());
    }

    /* Crear dots */
    function buildDots() {
      dotsWrap.innerHTML = '';
      const count = maxIndex() + 1;
      for (let i = 0; i < count; i++) {
        const btn = document.createElement('button');
        btn.className  = 'carousel-dot' + (i === currentIndex ? ' active' : '');
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-label', 'Testimonio ' + (i + 1));
        btn.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
        btn.addEventListener('click', function () { goTo(i); });
        dotsWrap.appendChild(btn);
      }
    }

    /* Ir a un índice concreto */
    function goTo(index) {
      currentIndex = Math.min(Math.max(index, 0), maxIndex());
      const cardWidth = cards[0].getBoundingClientRect().width;
      const gap       = 20; // debe coincidir con el gap del CSS
      track.scrollTo({ left: currentIndex * (cardWidth + gap), behavior: 'smooth' });
      updateUI();
    }

    /* Actualizar estado de botones y dots */
    function updateUI() {
      const dots = dotsWrap.querySelectorAll('.carousel-dot');
      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === currentIndex);
        d.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
      });
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex >= maxIndex();
    }

    /* Auto-play cada 5 s */
    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(function () {
        goTo(currentIndex >= maxIndex() ? 0 : currentIndex + 1);
      }, 5000);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    /* Sincronizar el índice al hacer scroll manual */
    function onScroll() {
      const cardWidth = cards[0].getBoundingClientRect().width;
      const gap       = 20;
      const newIndex  = Math.round(track.scrollLeft / (cardWidth + gap));
      if (newIndex !== currentIndex) {
        currentIndex = Math.min(newIndex, maxIndex());
        updateUI();
      }
    }

    /* Eventos */
    prevBtn.addEventListener('click', function () { stopAutoPlay(); goTo(currentIndex - 1); startAutoPlay(); });
    nextBtn.addEventListener('click', function () { stopAutoPlay(); goTo(currentIndex + 1); startAutoPlay(); });
    track.addEventListener('scroll', onScroll, { passive: true });
    track.addEventListener('mouseenter', stopAutoPlay);
    track.addEventListener('mouseleave', startAutoPlay);
    track.addEventListener('touchstart', stopAutoPlay, { passive: true });

    /* Reconstruir al cambiar tamaño */
    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        buildDots();
        goTo(0);
      }, 200);
    });

    /* Inicializar */
    buildDots();
    updateUI();
    startAutoPlay();

    /* Parar autoplay cuando la sección no es visible */
    if ('IntersectionObserver' in window) {
      const sectionObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          entry.isIntersecting ? startAutoPlay() : stopAutoPlay();
        });
      }, { threshold: 0.2 });

      const testimoniosSection = document.getElementById('testimonios');
      if (testimoniosSection) sectionObs.observe(testimoniosSection);
    }
  }


  /* ================================================================
    2. ACORDEÓN DE FAQ
  ================================================================ */

  const faqToggles = document.querySelectorAll('[data-faq-toggle]');

  faqToggles.forEach(function (btn) {
    const answerId = btn.getAttribute('aria-controls');
    const answer   = document.getElementById(answerId);
    if (!answer) return;

    btn.addEventListener('click', function () {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      /* Cerrar todos los demás */
      faqToggles.forEach(function (otherBtn) {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          const otherId     = otherBtn.getAttribute('aria-controls');
          const otherAnswer = document.getElementById(otherId);
          if (otherAnswer) otherAnswer.hidden = true;
        }
      });

      /* Alternar el actual */
      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.hidden = isOpen;

      /* Scroll suave al ítem abierto en móvil */
      if (!isOpen) {
        setTimeout(function () {
          btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 350);
      }
    });

    /* Soporte de teclado: Escape cierra el panel abierto */
    answer.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        btn.setAttribute('aria-expanded', 'false');
        answer.hidden = true;
        btn.focus();
      }
    });
  });


  /* ================================================================
    3. ANIMACIONES DE ENTRADA (IntersectionObserver)
     — Añade la clase .reveal a cualquier elemento que quieras animar
     — El CSS en style.css maneja la transición visual
  ================================================================ */

  if ('IntersectionObserver' in window) {
    // Añadir clase reveal automáticamente a elementos de las nuevas secciones
    const revealTargets = document.querySelectorAll(
      '.testimonio-card, .faq-item, .blog-card, .stat-item'
    );

    revealTargets.forEach(function (el, i) {
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease ' + (i % 4) * 0.08 + 's, transform 0.5s ease ' + (i % 4) * 0.08 + 's';
    });

    const revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(function (el) { revealObs.observe(el); });
  }

})();
