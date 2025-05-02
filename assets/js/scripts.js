window.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const sidebarWrapper = document.getElementById('sidebar-wrapper');
  const scrollToTop = document.querySelector('.scroll-to-top');
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  let scrollToTopVisible = false;

  // === MENÚ LATERAL ===
  if (menuToggle && sidebarWrapper) {
    menuToggle.addEventListener('click', () => {
      sidebarWrapper.classList.toggle('active');
    });

    document.querySelectorAll('#sidebar-wrapper a').forEach(link => {
      link.addEventListener('click', () => {
        sidebarWrapper.classList.remove('active');
      });
    });
  }

  // === BOTÓN SCROLL TO TOP ===
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

  // === CAMBIO DE TEMA CLARO/OSCURO ===
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', newTheme);
      updateImagesForTheme(newTheme);
    });
  }

  // === CONFIGURACIÓN INICIAL ===
  const initialTheme = html.getAttribute('data-theme') || 'dark';
  html.setAttribute('data-theme', initialTheme);
  updateImagesForTheme(initialTheme);

  // === ACTUALIZACIÓN DE IMÁGENES SEGÚN EL TEMA ===
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
