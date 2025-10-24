// assets/js/navigation.js - VERSIÓN MEJORADA
console.log('🔧 Inicializando sistema de navegación...');

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
        this.setupEventListeners();
        this.isInitialized = true;

        console.log('✅ Navegación accesible inicializada');
    }

    setupMobileMenu() {
        if (!this.menuToggle || !this.mobileMenu) {
            console.error('❌ Elementos del menú móvil no encontrados');
            return;
        }

        console.log('📱 Configurando menú móvil...');

        // Toggle del menú móvil
        this.menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMobileMenu(!this.mobileMenu.classList.contains('active'));
        });

        this.closeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMobileMenu(false);
        });

        this.menuOverlay.addEventListener('click', (e) => {
            e.preventDefault();
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
    }

    toggleMobileMenu(show) {
        console.log('🍔 Toggle menú móvil:', show);

        if (show) {
            this.mobileMenu.classList.add('active');
            this.menuOverlay.classList.add('active');
            this.menuToggle.setAttribute('aria-expanded', 'true');
            this.mobileMenu.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            // Mover foco al botón de cerrar
            setTimeout(() => {
                this.closeToggle.focus();
            }, 100);
        } else {
            this.mobileMenu.classList.remove('active');
            this.menuOverlay.classList.remove('active');
            this.menuToggle.setAttribute('aria-expanded', 'false');
            this.mobileMenu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';

            // Mover foco al botón de menú
            this.menuToggle.focus();
        }
    }

    setupDropdowns() {
        // Dropdown de idioma
        if (this.languageDropdown) {
            const languageToggle = this.languageDropdown.querySelector('.dropdown-toggle');
            const languageMenu = this.languageDropdown.querySelector('.dropdown-menu');

            languageToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleDropdown(this.languageDropdown);
            });

            // Cerrar al hacer clic en items
            languageMenu.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.closeAllDropdowns();
                });
            });
        }

        // Dropdown de tema
        if (this.themeDropdown) {
            const themeToggle = this.themeDropdown.querySelector('.dropdown-toggle');
            const themeMenu = this.themeDropdown.querySelector('.dropdown-menu');

            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleDropdown(this.themeDropdown);
            });

            // Selección de tema
            themeMenu.querySelectorAll('[data-theme]').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const theme = item.getAttribute('data-theme');
                    console.log('🎨 Seleccionado tema:', theme);
                    this.changeTheme(theme);
                    this.closeAllDropdowns();
                });
            });
        }

        // Cerrar dropdowns al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                this.closeAllDropdowns();
            }
        });

        // Selector de tema móvil
        const mobileThemeSelector = document.getElementById('mobile-theme-selector');
        if (mobileThemeSelector) {
            mobileThemeSelector.addEventListener('change', (e) => {
                const theme = e.target.value;
                console.log('📱 Tema móvil seleccionado:', theme);
                this.changeTheme(theme);
            });

            // Sincronizar con el tema actual
            this.syncMobileThemeSelector();
        }
    }

    toggleDropdown(dropdown) {
        if (!dropdown) return;

        const isOpen = dropdown.classList.contains('open');

        this.closeAllDropdowns();

        if (!isOpen) {
            dropdown.classList.add('open');
            dropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'true');
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

        // Aplicar tema
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('preferred-theme', theme);

        // Sincronizar selectores
        this.syncMobileThemeSelector();

        // Notificar a las partículas
        if (window.particleSystem && typeof window.particleSystem.onThemeChange === 'function') {
            window.particleSystem.onThemeChange(theme);
        }

        // Disparar evento personalizado
        const event = new CustomEvent('themechange', { detail: { theme } });
        document.dispatchEvent(event);
    }

    syncMobileThemeSelector() {
        const mobileThemeSelector = document.getElementById('mobile-theme-selector');
        if (mobileThemeSelector) {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            mobileThemeSelector.value = currentTheme;
        }
    }

    setupEventListeners() {
        // Escuchar cambios de tema externos
        document.addEventListener('themechange', (e) => {
            this.syncMobileThemeSelector();
        });

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

                case 'Tab':
                    if (!e.shiftKey && currentIndex === items.length - 1) {
                        e.preventDefault();
                        this.closeAllDropdowns();
                    }
                    break;
            }
        });

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

// Debug helpers
console.log('🔧 Comandos de navegación:');
console.log('- accessibleNav.toggleMobileMenu(true/false)');
console.log('- accessibleNav.changeTheme("dark")');
console.log('- accessibleNav.closeAllDropdowns()');