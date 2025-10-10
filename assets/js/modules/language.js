// ============================
// LANGUAGE CONTROLLER
// ============================

class LanguageController {
    constructor() {
        this.languageToggle = document.getElementById('language-toggle');
        this.languageDropdown = this.languageToggle?.closest('.dropdown');
        this.languageMenu = this.languageDropdown?.querySelector('.dropdown-menu');
        this.currentLanguage = this.getSavedLanguage() || 'es';

        this.init();
    }

    init() {
        if (!this.languageToggle || !this.languageMenu) {
            console.warn('⚠️ Elementos de idioma no encontrados');
            return;
        }

        this.setupAccessibility();
        this.bindEvents();
        this.applyLanguage(this.currentLanguage);

        console.log('✅ Language controller inicializado');
    }

    setupAccessibility() {
        this.languageToggle.setAttribute('aria-haspopup', 'true');
        this.languageToggle.setAttribute('aria-expanded', 'false');
        this.languageToggle.setAttribute('aria-label', 'Seleccionar idioma');
    }

    bindEvents() {
        // Toggle del dropdown
        this.languageToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!this.languageDropdown.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Navegación con teclado
        this.languageMenu.addEventListener('keydown', (e) => this.handleDropdownNavigation(e));

        // Eventos de los items del lenguaje
        this.languageMenu.querySelectorAll('a, button').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = item.getAttribute('data-lang') || item.getAttribute('href')?.replace('#', '');
                if (lang) {
                    this.setLanguage(lang);
                }
            });
        });
    }

    toggleDropdown() {
        const expanded = this.languageMenu.classList.toggle('show');
        this.languageToggle.setAttribute('aria-expanded', expanded.toString());

        if (expanded) {
            const firstItem = this.languageMenu.querySelector('a, button');
            firstItem?.focus();
        }
    }

    closeDropdown() {
        this.languageMenu.classList.remove('show');
        this.languageToggle.setAttribute('aria-expanded', 'false');
    }

    handleDropdownNavigation(e) {
        if (e.key === 'Escape') {
            this.closeDropdown();
            this.languageToggle.focus();
            return;
        }

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const items = Array.from(this.languageMenu.querySelectorAll('a, button'));
            const currentIndex = items.indexOf(document.activeElement);
            let nextIndex;

            if (e.key === 'ArrowDown') {
                nextIndex = (currentIndex + 1) % items.length;
            } else {
                nextIndex = (currentIndex - 1 + items.length) % items.length;
            }

            items[nextIndex]?.focus();
        }
    }

    applyLanguage(lang) {
        this.currentLanguage = lang;
        this.saveLanguage(lang);
        this.updateDropdownState();

        // Disparar evento para que otros componentes reaccionen
        window.dispatchEvent(new CustomEvent('language:changed', {
            detail: { language: lang }
        }));

        console.log(`🌐 Idioma cambiado a: ${lang}`);
    }

    updateDropdownState() {
        // Actualizar estado visual del dropdown
        const items = this.languageMenu.querySelectorAll('a, button');
        items.forEach(item => {
            const itemLang = item.getAttribute('data-lang') || item.getAttribute('href')?.replace('#', '');
            const isActive = itemLang === this.currentLanguage;

            item.classList.toggle('active', isActive);
            item.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
    }

    getSavedLanguage() {
        return localStorage.getItem('preferred-language');
    }

    saveLanguage(lang) {
        localStorage.setItem('preferred-language', lang);
    }

    // Métodos públicos
    setLanguage(lang) {
        this.applyLanguage(lang);
        this.closeDropdown();
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    toggle() {
        this.toggleDropdown();
    }

    destroy() {
        this.closeDropdown();
    }
}