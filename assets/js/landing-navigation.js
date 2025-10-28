// Navegación específica para Landing Page
console.log('🔧 Inicializando navegación de landing...');

class LandingNavigation {
    constructor() {
        this.mobileMenu = document.getElementById('mobile-menu');
        this.menuToggle = document.getElementById('menu-toggle');
        this.closeToggle = document.getElementById('close-menu-toggle');
        this.menuOverlay = document.getElementById('menu-overlay');

        this.isInitialized = false;

        console.log('📋 Elementos encontrados en landing:', {
            mobileMenu: !!this.mobileMenu,
            menuToggle: !!this.menuToggle,
            closeToggle: !!this.closeToggle,
            menuOverlay: !!this.menuOverlay
        });

        this.init();
    }

    init() {
        if (this.isInitialized) return;

        this.setupMobileMenu();
        this.isInitialized = true;

        console.log('✅ Navegación de landing inicializada');
    }

    setupMobileMenu() {
        if (!this.menuToggle || !this.mobileMenu) {
            console.error('❌ Elementos del menú móvil no encontrados en landing');
            return;
        }

        console.log('📱 Configurando menú móvil de landing...');

        // Toggle del menú móvil
        this.menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMobileMenu(!this.mobileMenu.classList.contains('active'));
        });

        if (this.closeToggle) {
            this.closeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMobileMenu(false);
            });
        }

        if (this.menuOverlay) {
            this.menuOverlay.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu(false);
            });
        }

        // Cerrar menú al hacer clic en enlaces
        if (this.mobileMenu) {
            this.mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    this.toggleMobileMenu(false);
                });
            });
        }

        // Cerrar menú con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mobileMenu && this.mobileMenu.classList.contains('active')) {
                this.toggleMobileMenu(false);
                if (this.menuToggle) this.menuToggle.focus();
            }
        });
    }

    toggleMobileMenu(show) {
        console.log('🍔 Toggle menú móvil landing:', show);

        if (show) {
            if (this.mobileMenu) this.mobileMenu.classList.add('active');
            if (this.menuOverlay) this.menuOverlay.classList.add('active');
            if (this.menuToggle) this.menuToggle.setAttribute('aria-expanded', 'true');
            if (this.mobileMenu) this.mobileMenu.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            // Mover foco al botón de cerrar
            setTimeout(() => {
                if (this.closeToggle) this.closeToggle.focus();
            }, 100);
        } else {
            if (this.mobileMenu) this.mobileMenu.classList.remove('active');
            if (this.menuOverlay) this.menuOverlay.classList.remove('active');
            if (this.menuToggle) this.menuToggle.setAttribute('aria-expanded', 'false');
            if (this.mobileMenu) this.mobileMenu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';

            // Mover foco al botón de menú
            if (this.menuToggle) this.menuToggle.focus();
        }
    }
}

// Inicialización robusta para landing
function initializeLandingNavigation() {
    console.log('🚀 Iniciando sistema de navegación de landing...');

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.landingNav = new LandingNavigation();
        });
    } else {
        window.landingNav = new LandingNavigation();
    }
}

// Iniciar inmediatamente
initializeLandingNavigation();