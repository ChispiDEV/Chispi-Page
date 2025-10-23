// assets/js/navigation.js - SISTEMA CORREGIDO
console.log('🔧 Inicializando navegación...');

class AccessibleNavigation {
    constructor() {
        this.mobileMenu = document.getElementById('mobile-menu');
        this.menuToggle = document.getElementById('menu-toggle');
        this.closeToggle = document.getElementById('close-menu-toggle');
        this.menuOverlay = document.getElementById('menu-overlay');
        this.languageDropdown = document.getElementById('language-dropdown');
        this.themeDropdown = document.getElementById('theme-dropdown');

        this.isInitialized = false;

        console.log('📋 Elementos encontrados:', {
            mobileMenu: !!this.mobileMenu,
            menuToggle: !!this.menuToggle,
            closeToggle: !!this.closeToggle,
            menuOverlay: !!this.menuOverlay,
            languageDropdown: !!this.languageDropdown,
            themeDropdown: !!this.themeDropdown
        });

        this.init();
    }

    init() {
        if (this.isInitialized) return;

        this.setupMobileMenu();
        this.setupDropdowns();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.isInitialized = true;

        console.log('✅ Navegación accesible inicializada');
    }

    setupMobileMenu() {
        if (!this.menuToggle || !this.mobileMenu) {
            console.error('❌ Elementos del menú móvil no encontrados');
            return;
        }

        // Toggle del menú móvil
        this.menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMobileMenu(true);
        });

        this.closeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMobileMenu(false);
        });

        this.menuOverlay.addEventListener('click', (e) => {
            e.stopPropagation();
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
            if (e.key === 'Escape' && this.mobileMenu.classList.contains('active')) {
                this.toggleMobileMenu(false);
                this.menuToggle.focus();
            }
        });

        // Prevenir que el clic en el menú lo cierre
        this.mobileMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    toggleMobileMenu(show) {
        console.log('🍔 Toggle menú móvil:', show);

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
                const firstFocusable = this.mobileMenu.querySelector('a, button');
                if (firstFocusable) firstFocusable.focus();
            }, 100);
        } else {
            this.mobileMenu.classList.remove('active');
            this.menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    setupDropdowns() {
        // Dropdown de idioma
        if (this.languageDropdown) {
            const languageToggle = this.languageDropdown.querySelector('.dropdown-toggle');
            languageToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown(this.languageDropdown);
            });
        }

        // Dropdown de tema
        if (this.themeDropdown) {
            const themeToggle = this.themeDropdown.querySelector('.dropdown-toggle');
            themeToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown(this.themeDropdown);
            });

            // Selección de tema
            const themeMenu = this.themeDropdown.querySelector('.dropdown-menu');
            themeMenu.querySelectorAll('[data-theme]').forEach(item => {
                item.addEventListener('click', () => {
                    const theme = item.getAttribute('data-theme');
                    this.changeTheme(theme);
                    this.toggleDropdown(this.themeDropdown, false);
                });
            });
        }

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
        if (!dropdown) return;

        const isOpen = dropdown.classList.contains('open');
        const shouldOpen = force !== undefined ? force : !isOpen;

        this.closeAllDropdowns();

        if (shouldOpen) {
            dropdown.classList.add('open');
            dropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'true');

            // Mover foco al primer elemento
            setTimeout(() => {
                const firstItem = dropdown.querySelector('.dropdown-item');
                if (firstItem) firstItem.focus();
            }, 50);
        }
    }

    closeAllDropdowns() {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.classList.remove('open');
            const toggle = dropdown.querySelector('.dropdown-toggle');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
        });
    }

    changeTheme(theme) {
        console.log('🎨 Cambiando tema a:', theme);
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('preferred-theme', theme);

        // Notificar a las partículas del cambio de tema
        if (window.particleSystem && typeof window.particleSystem.onThemeChange === 'function') {
            window.particleSystem.onThemeChange(theme);
        }

        // Disparar evento personalizado
        const event = new CustomEvent('themechange', { detail: { theme } });
        document.dispatchEvent(event);
    }

    setupKeyboardNavigation() {
        // Navegación por teclado en dropdowns
        document.addEventListener('keydown', (e) => {
            const dropdown = e.target.closest('.dropdown');
            if (!dropdown || !dropdown.classList.contains('open')) return;

            const items = Array.from(dropdown.querySelectorAll('.dropdown-item'));
            const currentIndex = items.indexOf(e.target);

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
            if (!this.mobileMenu.classList.contains('active')) return;

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

// Inicialización robusta
function initializeNavigation() {
    console.log('🚀 Iniciando sistema de navegación...');

    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.accessibleNav = new AccessibleNavigation();
        });
    } else {
        window.accessibleNav = new AccessibleNavigation();
    }
}

// Iniciar inmediatamente
initializeNavigation();

// Comandos de debug
console.log('🔧 Comandos de navegación:');
console.log('- accessibleNav.toggleMobileMenu(true/false)');
console.log('- accessibleNav.changeTheme("dark")');