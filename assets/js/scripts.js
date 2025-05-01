window.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const sidebarWrapper = document.getElementById('sidebar-wrapper');
  const scrollToTop = document.querySelector('.scroll-to-top');
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  let scrollToTopVisible = false;

  // Menú lateral
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

  // Scroll to top
  if (scrollToTop) {
    document.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        if (!scrollToTopVisible) {
          fadeIn(scrollToTop);
          scrollToTopVisible = true;
        }
      } else {
        if (scrollToTopVisible) {
          fadeOut(scrollToTop);
          scrollToTopVisible = false;
        }
      }
    });

    scrollToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function fadeIn(element) {
    if (!element) return;
    element.style.display = 'block';
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
    if (!element) return;
    (function fade() {
      if ((element.style.opacity -= 0.1) < 0) {
        element.style.display = 'none';
      } else {
        requestAnimationFrame(fade);
      }
    })();
  }

  // Cambia entre temas claro/oscuro
  themeToggle?.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    updateImagesForTheme(newTheme);
  });

  // Establece modo oscuro por defecto
  html.setAttribute('data-theme', 'dark');
  updateImagesForTheme('dark');

  // Cambia las imágenes con atributos data-img-dark y data-img-light
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
