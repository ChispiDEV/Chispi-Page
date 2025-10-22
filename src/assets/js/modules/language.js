// ============================
// LANGUAGE CONTROLLER - ADAPTADO
// ============================

class LanguageController {
    constructor() {
        this.languageToggle = document.getElementById('language-toggle');
        this.languageDropdown = this.languageToggle?.closest('.dropdown');
        this.languageMenu = this.languageDropdown?.querySelector('.dropdown-menu');
        this.currentLanguage = this.detectCurrentLanguage();
        this.supportedLanguages = ['es', 'en'];

        this.init();
    }

    init() {
        if (!this.languageToggle || !this.languageMenu) {
            console.warn('⚠️ Elementos de idioma no encontrados');
            return;
        }

        this.setupAccessibility();
        this.bindEvents();
        this.applyLanguage(this.currentLanguage, false); // No redirigir en inicialización

        console.log('✅ Language controller inicializado - Lenguaje actual:', this.currentLanguage);
    }

    detectCurrentLanguage() {
        // 1. Primero verificar si hay un lenguaje guardado
        const savedLang = this.getSavedLanguage();
        if (savedLang) return savedLang;

        // 2. Detectar basado en la URL
        const path = window.location.pathname;
        if (path.startsWith('/en')) return 'en';

        // 3. Detectar basado en el HTML
        const htmlLang = document.documentElement.lang;
        if (htmlLang && this.supportedLanguages.includes(htmlLang)) return htmlLang;

        // 4. Default
        return 'es';
    }

    setupAccessibility() {
        this.languageToggle.setAttribute('aria-haspopup', 'true');
        this.languageToggle.setAttribute('aria-expanded', 'false');
        this.updateAccessibilityLabel();
    }

    updateAccessibilityLabel() {
        const labels = {
            'es': 'Seleccionar idioma - Actual: Español',
            'en': 'Select language - Current: English'
        };
        this.languageToggle.setAttribute('aria-label', labels[this.currentLanguage] || labels.es);
    }

    bindEvents() {
        // Toggle del dropdown
        this.languageToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (this.languageDropdown && !this.languageDropdown.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Navegación con teclado
        this.languageMenu.addEventListener('keydown', (e) => this.handleDropdownNavigation(e));

        // Eventos de los items del lenguaje
        this.languageMenu.querySelectorAll('.language-option, [data-lang]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = item.getAttribute('data-lang');
                if (lang && this.supportedLanguages.includes(lang)) {
                    this.setLanguage(lang);
                }
            });
        });

        // Escuchar eventos de otros componentes
        window.addEventListener('popstate', () => {
            this.handleUrlChange();
        });
    }

    handleUrlChange() {
        const newLang = this.detectCurrentLanguage();
        if (newLang !== this.currentLanguage) {
            this.applyLanguage(newLang, false);
        }
    }

    toggleDropdown() {
        const expanded = this.languageMenu.classList.toggle('show');
        this.languageToggle.setAttribute('aria-expanded', expanded.toString());

        if (expanded) {
            const firstItem = this.languageMenu.querySelector('.language-option, [data-lang]');
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
            const items = Array.from(this.languageMenu.querySelectorAll('.language-option, [data-lang]'));
            const currentIndex = items.indexOf(document.activeElement);
            let nextIndex;

            if (e.key === 'ArrowDown') {
                nextIndex = (currentIndex + 1) % items.length;
            } else {
                nextIndex = (currentIndex - 1 + items.length) % items.length;
            }

            items[nextIndex]?.focus();
        }

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const activeElement = document.activeElement;
            const lang = activeElement.getAttribute('data-lang');
            if (lang) {
                this.setLanguage(lang);
            }
        }
    }

    applyLanguage(lang, redirect = true) {
        if (lang === this.currentLanguage) return;

        this.currentLanguage = lang;
        this.saveLanguage(lang);
        this.updateUI();
        this.updateAccessibilityLabel();

        if (redirect) {
            this.redirectToLanguage(lang);
        }

        // Disparar evento para que otros componentes reaccionen
        window.dispatchEvent(new CustomEvent('language:changed', {
            detail: {
                language: lang,
                previousLanguage: this.currentLanguage
            }
        }));

        console.log(`🌐 Idioma cambiado a: ${lang}`);
    }

    updateUI() {
        // Actualizar estado visual del dropdown
        const items = this.languageMenu.querySelectorAll('.language-option, [data-lang]');
        items.forEach(item => {
            const itemLang = item.getAttribute('data-lang');
            const isActive = itemLang === this.currentLanguage;

            item.classList.toggle('active', isActive);
            item.setAttribute('aria-current', isActive ? 'true' : 'false');
        });

        // Actualizar bandera en el toggle
        this.updateFlagIcon();

        // Actualizar elementos de la página según el idioma
        this.updatePageContent();
    }

    updateFlagIcon() {
        const flagElement = document.getElementById('current-language-flag');
        if (flagElement) {
            const flags = {
                'es': '/assets/icons/es-flag.svg',
                'en': '/assets/icons/gb-flag.svg'
            };
            flagElement.src = flags[this.currentLanguage];
            flagElement.alt = this.currentLanguage === 'es' ? 'Español' : 'English';
        }
    }

    updatePageContent() {
        // Mostrar/ocultar elementos según idioma
        document.querySelectorAll('[data-lang-specific]').forEach(element => {
            const targetLang = element.getAttribute('data-lang-specific');
            element.style.display = targetLang === this.currentLanguage ? 'block' : 'none';
        });

        // Actualizar textos con data-i18n
        this.updateInternationalizedTexts();
    }

    updateInternationalizedTexts() {
        // Esto puede expandirse con un sistema completo de i18n
        const translations = {
            'es': {
                'nav_home': 'Inicio',
                'nav_about': 'Sobre mí',
                'nav_projects': 'Proyectos',
                'nav_blog': 'Devlogs',
                'nav_contact': 'Contacto',
                'spanish': 'Español',
                'english': 'English',
                'theme_light': 'Claro',
                'theme_dark': 'Oscuro',
                'theme_contrast': 'Alto Contraste'
            },
            'en': {
                'nav_home': 'Home',
                'nav_about': 'About Me',
                'nav_projects': 'Projects',
                'nav_blog': 'Devlogs',
                'nav_contact': 'Contact',
                'spanish': 'Español',
                'english': 'English',
                'theme_light': 'Light',
                'theme_dark': 'Dark',
                'theme_contrast': 'High Contrast'
            }
        };

        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[this.currentLanguage] && translations[this.currentLanguage][key]) {
                element.textContent = translations[this.currentLanguage][key];
            }
        });
    }

    redirectToLanguage(lang) {
        const currentPath = window.location.pathname;
        let newPath;

        if (lang === 'es') {
            // Quitar /en del path
            newPath = currentPath.replace(/^\/en/, '') || '/';
        } else {
            // Agregar /en al path, asegurando no duplicar
            newPath = currentPath === '/' ? '/en' : `/en${currentPath.replace(/^\/en/, '')}`;
        }

        // Mantener query parameters
        const search = window.location.search;
        const hash = window.location.hash;

        window.location.href = newPath + search + hash;
    }

    getSavedLanguage() {
        return localStorage.getItem('preferred-language');
    }

    saveLanguage(lang) {
        localStorage.setItem('preferred-language', lang);
    }

    // ========== MÉTODOS PÚBLICOS ==========

    setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`⚠️ Idioma no soportado: ${lang}`);
            return;
        }
        this.applyLanguage(lang, true); // Redirigir cuando se cambia manualmente
        this.closeDropdown();
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getSupportedLanguages() {
        return [...this.supportedLanguages];
    }

    toggle() {
        this.toggleDropdown();
    }

    refresh() {
        this.handleUrlChange();
    }

    destroy() {
        this.closeDropdown();
        // Limpiar event listeners si es necesario
    }
}

// Inicialización automática cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.languageController = new LanguageController();
});

export default LanguageController;