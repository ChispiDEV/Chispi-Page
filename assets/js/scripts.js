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
      toggleMenuIcon();
    });

    document.querySelectorAll('#sidebar-wrapper a').forEach(link => {
      link.addEventListener('click', () => {
        sidebarWrapper.classList.remove('active');
        resetMenuIcon();
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

  function toggleMenuIcon() {
    const icon = menuToggle.querySelector('i');
    if (sidebarWrapper.classList.contains('active')) {
      icon.classList.replace('fa-bars', 'fa-xmark');
    } else {
      icon.classList.replace('fa-xmark', 'fa-bars');
    }
  }

  function resetMenuIcon() {
    const icon = menuToggle.querySelector('i');
    icon.classList.replace('fa-xmark', 'fa-bars');
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
    updateHeroBackground(newTheme);
    updateIconForTheme(newTheme);
  });

  // Establece modo oscuro por defecto
  html.setAttribute('data-theme', 'dark');
  updateHeroBackground('dark');

  // Cambia las imágenes con atributos data-img-dark y data-img-light
  function updateImagesForTheme(theme) {
    const themeImages = document.querySelectorAll('[data-img-dark][data-img-light]');
    themeImages.forEach(img => {
      img.src = theme === 'dark' ? img.dataset.imgDark : img.dataset.imgLight;
    });
  }

  // Cambia el fondo del header.hero si tiene data-img-dark / data-img-light
  function updateHeroBackground(theme) {
    const hero = document.querySelector('header.hero');
    if (!hero) return;

    const imgDark = hero.dataset.imgDark;
    const imgLight = hero.dataset.imgLight;

    const imageUrl = theme === 'dark' ? imgDark : imgLight;
    hero.style.backgroundImage = `url('${imageUrl}')`;
  }

  // Cambia el ícono del botón de tema
  function updateIconForTheme(theme) {
    const icon = themeToggle?.querySelector('i');
    if (!icon) return;
    icon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  }
});
