// ============================
// SIDEBAR CONTROLLER
// ============================

class SidebarController {
    constructor() {
        this.sidebar = document.getElementById('sidebar-wrapper');
        this.menuToggle = document.getElementById('menu-toggle');
        this.closeToggle = document.getElementById('close-menu-toggle');
        this.isOpen = false;

        this.ready = this.init();
    }

    async init() {
        if (!this.sidebar || !this.menuToggle) {
            console.warn('⚠️ Elementos del sidebar no encontrados');
            return;
        }

        this.setupAccessibility();
        this.bindEvents();

        console.log('✅ Sidebar controller inicializado');
    }

    setupAccessibility() {
        // Configurar atributos ARIA
        this.sidebar.setAttribute('tabindex', '-1');
        this.sidebar.setAttribute('aria-hidden', 'true');
        this.sidebar.setAttribute('aria-label', 'Menú lateral de navegación');

        this.menuToggle.setAttribute('aria-controls', 'sidebar-wrapper');
        this.menuToggle.setAttribute('aria-expanded', 'false');
        this.menuToggle.setAttribute('aria-label', 'Abrir menú lateral');

        if (this.closeToggle) {
            this.closeToggle.setAttribute('aria-label', 'Cerrar menú lateral');
            this.closeToggle.style.display = 'none';
        }
    }

    bindEvents() {
        // Evento abrir sidebar
        this.menuToggle.addEventListener('click', () => this.open());

        // Evento cerrar sidebar
        if (this.closeToggle) {
            this.closeToggle.addEventListener('click', () => this.close());
        }

        // Cerrar al hacer click en enlaces
        this.sidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => this.close());
        });

        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (this.isOpen &&
                !this.sidebar.contains(e.target) &&
                !this.menuToggle.contains(e.target)) {
                this.close();
            }
        });

        // Cerrar con Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Trap focus dentro del sidebar
        this.sidebar.addEventListener('keydown', (e) => this.trapFocus(e));
    }

    open() {
        this.sidebar.classList.add('active');
        this.sidebar.setAttribute('aria-hidden', 'false');

        this.menuToggle.style.display = 'none';
        this.menuToggle.setAttribute('aria-expanded', 'true');

        if (this.closeToggle) {
            this.closeToggle.style.display = 'flex';
        }

        this.sidebar.focus();
        this.isOpen = true;

        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('sidebar:open'));
    }

    close() {
        this.sidebar.classList.remove('active');
        this.sidebar.setAttribute('aria-hidden', 'true');

        this.menuToggle.style.display = 'flex';
        this.menuToggle.setAttribute('aria-expanded', 'false');

        if (this.closeToggle) {
            this.closeToggle.style.display = 'none';
        }

        this.menuToggle.focus();
        this.isOpen = false;

        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('sidebar:close'));
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    trapFocus(event) {
        if (event.key !== 'Tab') return;

        const focusableElements = this.getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    getFocusableElements() {
        return Array.from(this.sidebar.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        )).filter(el => !el.disabled && el.offsetParent !== null);
    }

    // Métodos públicos
    isSidebarOpen() {
        return this.isOpen;
    }

    destroy() {
        // Cleanup de event listeners si es necesario
        this.close();
    }
}