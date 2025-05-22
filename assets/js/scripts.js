window.addEventListener('DOMContentLoaded', () => {
  const html = document.documentElement;
  const menuToggle = document.getElementById('menu-toggle');
  const closeMenuToggle = document.getElementById('close-menu-toggle');
  const sidebarWrapper = document.getElementById('sidebar-wrapper');
  const scrollToTop = document.querySelector('.scroll-to-top');
  const themeToggle = document.getElementById('theme-toggle');
  const languageToggle = document.getElementById('language-toggle');
  const languageDropdown = languageToggle?.closest('.dropdown');
  const languageMenu = languageDropdown?.querySelector('.dropdown-menu');
  let scrollToTopVisible = false;

  const BASE_URL = '/Chispi-Page';

  // === MENÚ LATERAL ===
  if (menuToggle && closeMenuToggle && sidebarWrapper) {
    // Asegurarse que sidebar puede recibir foco para accesibilidad
    if (!sidebarWrapper.hasAttribute('tabindex')) {
      sidebarWrapper.setAttribute('tabindex', '-1');
    }

    // Inicializa aria-expanded y aria-labels para accesibilidad
    menuToggle.setAttribute('aria-controls', 'sidebar-wrapper');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú lateral');
    closeMenuToggle.setAttribute('aria-label', 'Cerrar menú lateral');

    const closeSidebar = () => {
      sidebarWrapper.classList.remove('active');
      sidebarWrapper.setAttribute('aria-hidden', 'true');
      closeMenuToggle.style.display = 'none';
      menuToggle.style.display = 'flex';
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.focus();

      // Remover focus trap
      sidebarWrapper.removeEventListener('keydown', trapFocus);
    };

    const trapFocus = (e) => {
      if (e.key === 'Tab') {
        const focusableElements = sidebarWrapper.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    };

    menuToggle.addEventListener('click', () => {
      sidebarWrapper.classList.add('active');
      sidebarWrapper.setAttribute('aria-hidden', 'false');
      menuToggle.style.display = 'none';
      closeMenuToggle.style.display = 'flex';
      menuToggle.setAttribute('aria-expanded', 'true');
      sidebarWrapper.focus();

      // Añadir focus trap
      sidebarWrapper.addEventListener('keydown', trapFocus);
    });

    closeMenuToggle.addEventListener('click', closeSidebar);

    sidebarWrapper.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeSidebar);
    });

    document.addEventListener('click', (e) => {
      const isClickInside = sidebarWrapper.contains(e.target);
      const isClickToggle = menuToggle.contains(e.target);
      const isOpen = sidebarWrapper.classList.contains('active');
      if (!isClickInside && !isClickToggle && isOpen) closeSidebar();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebarWrapper.classList.contains('active')) {
        closeSidebar();
      }
    });
  }

  // === SCROLL TO TOP ===
  if (scrollToTop) {
    window.addEventListener('scroll', () => {
      const shouldShow = window.scrollY > 100;
      if (shouldShow !== scrollToTopVisible) {
        scrollToTopVisible = shouldShow;
        shouldShow ? fadeIn(scrollToTop) : fadeOut(scrollToTop);
      }
    });

    scrollToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function fadeIn(el) {
    el.style.display = 'flex';
    el.style.opacity = 0;
    (function fade() {
      let val = parseFloat(el.style.opacity);
      if (!((val += 0.1) > 1)) {
        el.style.opacity = val;
        requestAnimationFrame(fade);
      }
    })();
  }

  function fadeOut(el) {
    (function fade() {
      if ((el.style.opacity -= 0.1) < 0) {
        el.style.display = 'none';
      } else {
        requestAnimationFrame(fade);
      }
    })();
  }

  // === CAMBIO DE TEMA ===
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      updateImagesForTheme(next);
      loadParticles(next);
      try {
        localStorage.setItem('theme', next);
      } catch {}
    });
  }

  // === CAMBIO DE IDIOMA ===
  if (languageToggle && languageMenu && languageDropdown) {
    languageToggle.setAttribute('aria-haspopup', 'true');
    languageToggle.setAttribute('aria-expanded', 'false');

    languageToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const expanded = languageMenu.classList.toggle('show');
      languageToggle.setAttribute('aria-expanded', expanded);

      const first = languageMenu.querySelector('a, button');
      if (first && expanded) first.focus();
    });

    document.addEventListener('click', (e) => {
      if (!languageDropdown.contains(e.target)) {
        languageMenu.classList.remove('show');
        languageToggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && languageMenu.classList.contains('show')) {
        languageMenu.classList.remove('show');
        languageToggle.setAttribute('aria-expanded', 'false');
        languageToggle.focus();
      }
    });

    languageMenu.addEventListener('keydown', (e) => {
      const items = [...languageMenu.querySelectorAll('a, button')];
      const i = items.indexOf(document.activeElement);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[(i + 1) % items.length]?.focus();
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[(i - 1 + items.length) % items.length]?.focus();
      }
    });
  }


  // === CARGAR PARTICULAS SEGÚN TEMA ===
  function loadParticles(theme) {
    const configFile = theme === 'dark' ? 'particles-dark.json' : 'particles-light.json';
    if (window.pJSDom && window.pJSDom.length > 0) {
      window.pJSDom[0].pJS.fn.vendors.destroypJS();
      window.pJSDom = [];
    }
    particlesJS.load('particles-js', `${BASE_URL}/assets/particles/${configFile}`);
  }

  // === ACTUALIZAR IMÁGENES Y FONDOS ===
  function updateImagesForTheme(theme) {
    const heroHeader = document.querySelector('header.hero');
    if (heroHeader?.dataset.imgDark && heroHeader?.dataset.imgLight) {
      heroHeader.style.transition = 'background-image 0.5s ease-in-out';
      heroHeader.style.backgroundImage = `url('${theme === 'dark' ? heroHeader.dataset.imgDark : heroHeader.dataset.imgLight}')`;
    }

    const heroPost = document.querySelector('.post-hero-image');
    if (heroPost?.dataset.bgDark && heroPost?.dataset.bgLight) {
      heroPost.style.transition = 'background-image 0.5s ease-in-out';
      heroPost.style.backgroundImage = `url('${theme === 'dark' ? heroPost.dataset.bgDark : heroPost.dataset.bgLight}')`;
    }

    const themeImgs = document.querySelectorAll('[data-img-dark][data-img-light]');
    themeImgs.forEach(img => {
      if (img.tagName === 'IMG') {
        img.style.transition = 'opacity 0.5s ease-in-out';
        img.style.opacity = 0;
        setTimeout(() => {
          img.src = theme === 'dark' ? img.dataset.imgDark : img.dataset.imgLight;
          img.style.opacity = 1;
        }, 200);
      }
    });

    const bgImgs = document.querySelectorAll('[data-bg-dark][data-bg-light]');
    bgImgs.forEach(el => {
      if (!el.classList.contains('post-hero-image')) {
        el.style.transition = 'background-image 0.5s ease-in-out';
        el.style.backgroundImage = `url('${theme === 'dark' ? el.dataset.bgDark : el.dataset.bgLight}')`;
      }
    });
  }

  // === INICIALIZACIÓN ===
  let initialTheme = 'dark';
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') initialTheme = stored;
  } catch {}
  html.setAttribute('data-theme', initialTheme);
  updateImagesForTheme(initialTheme);
  loadParticles(initialTheme);
});
