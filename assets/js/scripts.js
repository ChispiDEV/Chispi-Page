window.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebarWrapper = document.getElementById('sidebar-wrapper');
    const scrollToTop = document.querySelector('.scroll-to-top');
    let scrollToTopVisible = false;
  
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
  });
  