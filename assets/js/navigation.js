// assets/js/navigation.js - Sistema de navegación accesible
class AccessibleNavigation {
    constructor() {
        this.mobileMenu = document.getElementById('mobile-menu');
        this.menuToggle = document.getElementById('menu-toggle');
        this.closeToggle = document.getElementById('close-menu-toggle');
        this.menuOverlay = document.getElementById('menu-overlay');
        this.languageDropdown = document.getElementById('language-dropdown');
        this.themeDropdown = document.getElementById('theme-dropdown');

        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupDropdowns();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();

        console.log('✅ Navegación accesible inicializada');
    }

    setupMobileMenu() {
        // Toggle del menú móvil
        this.menuToggle.addEventListener('click', () => {
            this.toggleMobileMenu(true);
        });

        this.closeToggle.addEventListener('click', () => {
            this.toggleMobileMenu(false);
        });

        this.menuOverlay.addEventListener('click', () => {
            this.toggleMobileMenu(false);
        });

        // Cerrar menú al hacer clic en enlaces
        this.mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                this.toggleMobileMenu(false);
            });
        });

        // Cerrar menú con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mobileMenu.getAttribute('aria-hidden') === 'false') {
                this.toggleMobileMenu(false);
                this.menuToggle.focus();
            }
        });
    }

    toggleMobileMenu(show) {
        const isExpanded = show;

        this.mobileMenu.setAttribute('aria-hidden', !show);
        this.menuToggle.setAttribute('aria-expanded', isExpanded);
        this.menuOverlay.setAttribute('aria-hidden', !show);

        if (show) {
            this.mobileMenu.classList.add('active');
            this.menuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Mover foco al primer elemento del menú
            setTimeout(() => {
                this.mobileMenu.querySelector('a, button').focus();
            }, 100);
        } else {
            this.mobileMenu.classList.remove('active');
            this.menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    setupDropdowns() {
        // Dropdown de idioma
        const languageToggle = document.getElementById('language-toggle');
        const languageMenu = this.languageDropdown.querySelector('.dropdown-menu');

        languageToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown(this.languageDropdown);
        });

        // Dropdown de tema
        const themeToggle = document.getElementById('theme-toggle');
        const themeMenu = this.themeDropdown.querySelector('.dropdown-menu');

        themeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown(this.themeDropdown);
        });

        // Selección de tema
        themeMenu.querySelectorAll('[data-theme]').forEach(item => {
            item.addEventListener('click', () => {
                const theme = item.getAttribute('data-theme');
                this.changeTheme(theme);
                this.toggleDropdown(this.themeDropdown, false);
            });
        });

        // Cerrar dropdowns al hacer clic fuera
        document.addEventListener('click', () => {
            this.closeAllDropdowns();
        });

        // Selector de tema móvil
        const mobileThemeSelector = document.getElementById('mobile-theme-selector');
        if (mobileThemeSelector) {
            mobileThemeSelector.addEventListener('change', (e) => {
                this.changeTheme(e.target.value);
            });
        }
    }

    toggleDropdown(dropdown, force) {
        const isOpen = dropdown.classList.contains('open');
        const shouldOpen = force !== undefined ? force : !isOpen;

        this.closeAllDropdowns();

        if (shouldOpen) {
            dropdown.classList.add('open');
            dropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'true');

            // Mover foco al primer elemento
            setTimeout(() => {
                dropdown.querySelector('.dropdown-item').focus();
            }, 50);
        }
    }

    closeAllDropdowns() {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.classList.remove('open');
            dropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
        });
    }

    changeTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('preferred-theme', theme);

        // Notificar a las partículas del cambio de tema
        if (window.particleSystem && window.particleSystem.onThemeChange) {
            window.particleSystem.onThemeChange(theme);
        }

        console.log('🎨 Tema cambiado a:', theme);
    }

    setupKeyboardNavigation() {
        // Navegación por teclado en dropdowns
        document.addEventListener('keydown', (e) => {
            const dropdown = e.target.closest('.dropdown');
            if (!dropdown || !dropdown.classList.contains('open')) return;

            const items = dropdown.querySelectorAll('.dropdown-item');
            const currentIndex = Array.from(items).indexOf(e.target);

            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % items.length;
                    items[nextIndex].focus();
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = (currentIndex - 1 + items.length) % items.length;
                    items[prevIndex].focus();
                    break;

                case 'Escape':
                    this.closeAllDropdowns();
                    dropdown.querySelector('.dropdown-toggle').focus();
                    break;
            }
        });
    }

    setupFocusManagement() {
        // Trap focus en menú móvil
        this.mobileMenu.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && !this.mobileMenu.classList.contains('active')) return;

            const focusableElements = this.mobileMenu.querySelectorAll(
                'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.accessibleNav = new AccessibleNavigation();
});