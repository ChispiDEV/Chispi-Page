// Gestión simple de dropdowns
class DropdownManager {
    constructor() {
        this.init();
    }

    init() {
        // Configurar todos los dropdowns
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            this.setupDropdown(dropdown);
        });

        // Cerrar dropdowns al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                this.closeAllDropdowns();
            }
        });
    }

    setupDropdown(dropdown) {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');

        if (!toggle || !menu) return;

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown(dropdown);
        });

        // Prevenir que el menú se cierre al hacer clic dentro
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    toggleDropdown(dropdown) {
        const isOpen = dropdown.classList.contains('open');

        // Cerrar todos primero
        this.closeAllDropdowns();

        // Abrir si no estaba abierto
        if (!isOpen) {
            dropdown.classList.add('open');
            dropdown.querySelector('.dropdown-menu').classList.add('show');
            dropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'true');
        }
    }

    closeAllDropdowns() {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.classList.remove('open');
            dropdown.querySelector('.dropdown-menu').classList.remove('show');
            dropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
        });
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    new DropdownManager();
});