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
    const closeSidebar = () => {
      sidebarWrapper.classList.remove('active');
      closeMenuToggle.style.display = 'none';
      menuToggle.style.display = 'flex';
    };

    menuToggle.addEventListener('click', () => {
      sidebarWrapper.classList.add('active');
      menuToggle.style.display = 'none';
      closeMenuToggle.style.display = 'flex';
    });

    closeMenuToggle.addEventListener('click', closeSidebar);

    sidebarWrapper.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeSidebar);
    });

    // ✅ Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
      const isClickInsideSidebar = sidebarWrapper.contains(e.target);
      const isClickOnMenuToggle = menuToggle.contains(e.target);
      const isSidebarOpen = sidebarWrapper.classList.contains('active');

      if (!isClickInsideSidebar && !isClickOnMenuToggle && isSidebarOpen) {
        closeSidebar();
      }
    });

    // ✅ Cerrar menú con tecla Escape
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
      loadParticles(newTheme);
    });
  }

  // === CAMBIO DE IDIOMA ===
  if (languageToggle && languageMenu) {
    languageToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      languageMenu.classList.toggle('show');
    });

    // Cierra el menú si haces clic fuera
    document.addEventListener('click', (e) => {
      if (!languageDropdown.contains(e.target)) {
        languageMenu.classList.remove('show');
      }
    });

    // Cierra el menú con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        languageMenu.classList.remove('show');
      }
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
  loadParticles(initialTheme);

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
