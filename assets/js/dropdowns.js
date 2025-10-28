// Gestión mejorada de dropdowns
class DropdownManager {
    constructor() {
        this.dropdowns = new Map();
        this.init();
    }

    init() {
        this.setupDropdowns();
        this.setupEventListeners();
        console.log('✅ DropdownManager inicializado');
    }

    setupDropdowns() {
        document.querySelectorAll('.dropdown').forEach((dropdown, index) => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');

            if (toggle && menu) {
                const dropdownId = `dropdown-${index}`;
                this.dropdowns.set(dropdownId, { dropdown, toggle, menu });

                this.setupDropdown(dropdown, toggle, menu);
            }
        });
    }

    setupDropdown(dropdown, toggle, menu) {
        // Click en el toggle
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleDropdown(dropdown);
        });

        // Prevenir cierre al hacer clic dentro del menú
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Manejar items del menú
        menu.querySelectorAll('.dropdown-item, .theme-option, .accessibility-option input, .accessibility-option .intensity-slider').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();

                // No cerrar si es un input o slider
                if (item.type === 'checkbox' || item.type === 'range') {
                    return;
                }

                // Cerrar después de un breve delay para permitir la acción
                setTimeout(() => {
                    this.closeDropdown(dropdown);
                }, 100);
            });
        });
    }

    toggleDropdown(targetDropdown) {
        const isOpen = targetDropdown.classList.contains('open');

        // Cerrar todos los dropdowns primero
        this.closeAllDropdowns();

        // Abrir el dropdown objetivo si no estaba abierto
        if (!isOpen) {
            this.openDropdown(targetDropdown);
        }
    }

    openDropdown(dropdown) {
        dropdown.classList.add('open');
        const menu = dropdown.querySelector('.dropdown-menu');
        const toggle = dropdown.querySelector('.dropdown-toggle');

        if (menu) menu.classList.add('show');
        if (toggle) toggle.setAttribute('aria-expanded', 'true');

        // Enfocar el primer elemento del menú
        setTimeout(() => {
            const firstItem = menu.querySelector('a, button, input');
            if (firstItem) firstItem.focus();
        }, 100);
    }

    closeDropdown(dropdown) {
        dropdown.classList.remove('open');
        const menu = dropdown.querySelector('.dropdown-menu');
        const toggle = dropdown.querySelector('.dropdown-toggle');

        if (menu) menu.classList.remove('show');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }

    closeAllDropdowns() {
        this.dropdowns.forEach(({ dropdown }) => {
            this.closeDropdown(dropdown);
        });
    }

    setupEventListeners() {
        // Cerrar dropdowns al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                this.closeAllDropdowns();
            }
        });

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
        });

        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            const openDropdown = document.querySelector('.dropdown.open');
            if (!openDropdown) return;

            const menu = openDropdown.querySelector('.dropdown-menu');
            if (!menu) return;

            const items = Array.from(menu.querySelectorAll('a, button, [tabindex="0"]'));
            const currentIndex = items.indexOf(document.activeElement);

            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % items.length;
                    items[nextIndex]?.focus();
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = (currentIndex - 1 + items.length) % items.length;
                    items[prevIndex]?.focus();
                    break;

                case 'Home':
                    e.preventDefault();
                    items[0]?.focus();
                    break;

                case 'End':
                    e.preventDefault();
                    items[items.length - 1]?.focus();
                    break;
            }
        });
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    window.dropdownManager = new DropdownManager();
});