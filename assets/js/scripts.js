window.addEventListener('DOMContentLoaded', () => {
  const html = document.documentElement;
  const menuToggle = document.getElementById('menu-toggle');
  const closeMenuToggle = document.getElementById('close-menu-toggle');
  const sidebarWrapper = document.getElementById('sidebar-wrapper');
  const scrollToTop = document.querySelector('.scroll-to-top');
  const themeToggle = document.getElementById('theme-toggle');
  const languageToggle = document.getElementById('language-toggle');
  let scrollToTopVisible = false;

  const BASE_URL = '/Chispi-Page'; // Cambiar si mueves la carpeta

  // === MENÚ LATERAL ===
  if (menuToggle && closeMenuToggle && sidebarWrapper) {
    menuToggle.addEventListener('click', () => {
      sidebarWrapper.classList.add('active');
      menuToggle.style.display = 'none';
      closeMenuToggle.style.display = 'flex';
    });

    closeMenuToggle.addEventListener('click', () => {
      sidebarWrapper.classList.remove('active');
      closeMenuToggle.style.display = 'none';
      menuToggle.style.display = 'flex';
    });

    sidebarWrapper.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        sidebarWrapper.classList.remove('active');
        closeMenuToggle.style.display = 'none';
        menuToggle.style.display = 'flex';
      });
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

  function fadeIn(element) {
    element.style.display = 'flex';
    element.style.opacity = 0;
    (function fade() {
      let val = parseFloat(element.style.opacity);
      if (!((val += 0.1) > 1)) {
        element.style.opacity = val;
        requestAnimationFrame(fade);
      }
    })();
  }

  function fadeOut(element) {
    (function fade() {
      if ((element.style.opacity -= 0.1) < 0) {
        element.style.display = 'none';
      } else {
        requestAnimationFrame(fade);
      }
    })();
  }

  // === CAMBIO DE TEMA ===
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', newTheme);
      updateImagesForTheme(newTheme);
      loadParticles(newTheme); // ACTUALIZADO: cambiar partículas
    });
  }

  // === CAMBIO DE IDIOMA ===
  if (languageToggle) {
    languageToggle.addEventListener('click', () => {
      const currentLang = html.getAttribute('lang') || 'es';
      const newLang = currentLang === 'es' ? 'en' : 'es';

      const path = window.location.pathname.replace(BASE_URL, '');
      const newPath = path.startsWith('/en/')
        ? path.replace('/en/', '/')
        : `/en${path}`;

      html.setAttribute('lang', newLang);
      window.location.href = `${window.location.origin}${BASE_URL}${newPath}`;
    });
  }

  // === CAMBIAR PARTICULAS SEGÚN EL TEMA ===
  function loadParticles(theme) {
    const configFile = theme === 'dark' ? 'particles-dark.json' : 'particles-light.json';
    if (window.pJSDom && window.pJSDom.length > 0) {
      window.pJSDom[0].pJS.fn.vendors.destroypJS();
      window.pJSDom = [];
    }
    particlesJS.load('particles-js', `${BASE_URL}/assets/particles/${configFile}`);
  }

  // === INICIALIZACIÓN ===
  const initialTheme = html.getAttribute('data-theme') || 'dark';
  html.setAttribute('data-theme', initialTheme);
  updateImagesForTheme(initialTheme);
  loadParticles(initialTheme); // ACTUALIZADO: cargar al inicio

  function updateImagesForTheme(theme) {
    const hero = document.querySelector('header.hero');
    if (hero && hero.dataset.imgDark && hero.dataset.imgLight) {
      hero.style.backgroundImage = `url('${theme === 'dark' ? hero.dataset.imgDark : hero.dataset.imgLight}')`;
    }

    const themeImages = document.querySelectorAll('[data-img-dark][data-img-light]');
    themeImages.forEach(img => {
      if (img.tagName === 'IMG') {
        img.src = theme === 'dark' ? img.dataset.imgDark : img.dataset.imgLight;
      }
    });
  }
});
