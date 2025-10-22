// ============================
// THEME CONTROLLER (Actualizado)
// ============================

class ThemeController {
    constructor() {
        this.themes = [
            'light', 'dark', 'high-contrast', 'sepia',
            'photophobia', 'daltonism', 'dyslexia',
            'reading', 'reduced-motion', 'grayscale'
        ];
        this.currentTheme = this.getSavedTheme() || 'light';
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeDropdown = document.getElementById('theme-dropdown');
        this.themeMenu = this.themeDropdown?.querySelector('.dropdown-menu');

        this.ready = this.init();
    }

    async init() {
        this.applyTheme(this.currentTheme);
        this.bindEvents();
        this.setupThemeSelector();
        this.detectSystemPreferences();

        console.log('✅ Theme controller inicializado');
    }

    bindEvents() {
        // Eventos del dropdown de tema (compatibilidad con tu código)
        if (this.themeToggle && this.themeMenu) {
            this.setupLegacyThemeDropdown();
        }

        // Atajos de teclado globales
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Escuchar cambios del sistema
        this.setupMediaQueryListeners();
    }

    setupLegacyThemeDropdown() {
        this.themeToggle.setAttribute('aria-haspopup', 'true');
        this.themeToggle.setAttribute('aria-expanded', 'false');

        // Configurar botones del dropdown legacy
        const themeButtons = this.themeMenu.querySelectorAll('[data-theme-choice]');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.getAttribute('data-theme-choice');
                this.setTheme(theme);
                this.closeLegacyDropdown();
            });
        });

        // Toggle del dropdown
        this.themeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleLegacyDropdown();
        });

        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!this.themeDropdown?.contains(e.target)) {
                this.closeLegacyDropdown();
            }
        });

        // Navegación con teclado
        this.themeMenu.addEventListener('keydown', (e) => this.handleDropdownNavigation(e));
    }

    setupThemeSelector() {
        // Crear selector moderno si no existe
        if (!document.getElementById('theme-selector')) {
            this.createModernThemeSelector();
        }
    }

    createModernThemeSelector() {
        const selector = document.createElement('div');
        selector.id = 'theme-selector';
        selector.className = 'theme-selector';
        selector.innerHTML = `
            <label for="theme-select" class="theme-selector__label">Tema:</label>
            <select id="theme-select" class="theme-selector__select">
                ${this.themes.map(theme => `
                    <option value="${theme}">${this.getThemeDisplayName(theme)}</option>
                `).join('')}
            </select>
            <button class="theme-selector__reset" aria-label="Restablecer tema por defecto">↺</button>
        `;

        // Insertar en el DOM
        const headerActions = document.querySelector('.header__actions');
        if (headerActions) {
            headerActions.appendChild(selector);
        } else {
            document.body.insertBefore(selector, document.body.firstChild);
        }

        // Event listeners
        document.getElementById('theme-select').addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        document.querySelector('.theme-selector__reset').addEventListener('click', () => {
            this.resetTheme();
        });

        this.updateThemeSelector();
    }

    setupMediaQueryListeners() {
        // Detectar preferencia de modo oscuro
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeMediaQuery.addListener((e) => this.handleSystemPreferenceChange(e));

        // Detectar movimiento reducido
        const reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce');
        reducedMotionMediaQuery.addListener((e) => this.handleReducedMotionPreference(e));
    }

    handleSystemPreferenceChange(e) {
        if (!this.getSavedTheme()) {
            this.applyTheme(e.matches ? 'dark' : 'light');
        }
    }

    handleReducedMotionPreference(e) {
        if (e.matches) {
            document.documentElement.setAttribute('data-reduced-motion', 'true');
        } else {
            document.documentElement.removeAttribute('data-reduced-motion');
        }
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey && e.altKey) {
            switch(e.key) {
                case '1': this.setTheme('light'); break;
                case '2': this.setTheme('dark'); break;
                case '3': this.setTheme('high-contrast'); break;
                case '4': this.setTheme('sepia'); break;
                case '0': this.cycleThemes(); break;
                case 'r': this.resetTheme(); break;
            }
        }
    }

    // === MÉTODOS PRINCIPALES ===

    applyTheme(theme) {
        if (!this.themes.includes(theme)) {
            console.warn(`Tema "${theme}" no válido`);
            return;
        }

        // Remover temas anteriores
        this.themes.forEach(t => {
            document.documentElement.classList.remove(`theme-${t}`);
        });
        document.documentElement.removeAttribute('data-theme');

        // Aplicar nuevo tema
        document.documentElement.classList.add(`theme-${theme}`);
        document.documentElement.setAttribute('data-theme', theme);

        // Atributos específicos
        if (theme === 'reduced-motion') {
            document.documentElement.setAttribute('data-reduced-motion', 'true');
        }

        this.currentTheme = theme;
        this.saveTheme(theme);
        this.updateThemeSelector();
        this.updateLegacyDropdown();
        this.updateThemeDependentContent();

        // Disparar evento
        window.dispatchEvent(new CustomEvent('theme:changed', {
            detail: { theme: theme, controller: this }
        }));

        console.log(`🎨 Tema cambiado a: ${theme}`);
    }

    updateThemeDependentContent() {
        this.updateImagesForTheme(this.currentTheme);
        this.updateParticles(this.currentTheme);
        this.updateTippyTheme(this.currentTheme);
    }

    // === MÉTODOS DE ACTUALIZACIÓN DE CONTENIDO (de tu código original) ===

    updateImagesForTheme(theme) {
        const heroHeader = document.querySelector('header.hero');
        if (heroHeader?.dataset.imgDark && heroHeader?.dataset.imgLight) {
            heroHeader.style.transition = 'background-image 0.5s ease-in-out';
            heroHeader.style.backgroundImage = `url('${theme === 'dark' ? heroHeader.dataset.imgDark : heroHeader.dataset.imgLight}')`;
        }

        const heroPost = document.querySelector('.post-hero-image');
        if (heroPost?.dataset.bgDark && heroPost?.dataset.bgLight) {
            heroPost.style.transition = 'background-image 0.5s ease-in-out';
            heroPost.style.backgroundImage = `url('${theme === 'dark' ? heroPost.dataset.bgDark : heroPost.dataset.bgLight}')`;
        }

        // Actualizar imágenes con data attributes
        const themeImgs = document.querySelectorAll('[data-img-dark][data-img-light]');
        themeImgs.forEach(img => {
            if (img.tagName === 'IMG') {
                img.style.transition = 'opacity 0.5s ease-in-out';
                img.style.opacity = '0';
                setTimeout(() => {
                    img.src = theme === 'dark' ? img.dataset.imgDark : img.dataset.imgLight;
                    img.style.opacity = '1';
                }, 200);
            }
        });

        const bgImgs = document.querySelectorAll('[data-bg-dark][data-bg-light]');
        bgImgs.forEach(el => {
            if (!el.classList.contains('post-hero-image')) {
                el.style.transition = 'background-image 0.5s ease-in-out';
                el.style.backgroundImage = `url('${theme === 'dark' ? el.dataset.bgDark : el.dataset.bgLight}')`;
            }
        });
    }

    updateParticles(theme) {
        const configFile = theme === 'dark' ? 'particles-dark.json' : 'particles-light.json';

        if (window.pJSDom && window.pJSDom.length > 0) {
            window.pJSDom[0].pJS.fn.vendors.destroypJS();
            window.pJSDom = [];
        }

        // Cargar nueva configuración de particles
        if (typeof particlesJS !== 'undefined') {
            particlesJS.load('particles-js', `${this.BASE_URL}/assets/particles/${configFile}`);
        }
    }

    updateTippyTheme(theme) {
        const tippyTheme = (['dark', 'high-contrast'].includes(theme)) ? 'material' : 'light';
        document.querySelectorAll('[data-tippy-content]').forEach(el => {
            if (el._tippy) {
                el._tippy.setProps({ theme: tippyTheme });
            }
        });
    }

    // === MÉTODOS DEL DROPDOWN LEGACY ===

    toggleLegacyDropdown() {
        const expanded = this.themeMenu.classList.toggle('show');
        this.themeToggle.setAttribute('aria-expanded', expanded.toString());

        if (expanded) {
            const firstBtn = this.themeMenu.querySelector('button');
            firstBtn?.focus();
        }
    }

    closeLegacyDropdown() {
        this.themeMenu.classList.remove('show');
        this.themeToggle.setAttribute('aria-expanded', 'false');
        this.themeToggle.focus();
    }

    handleDropdownNavigation(e) {
        if (e.key === 'Escape') {
            this.closeLegacyDropdown();
            return;
        }

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const items = Array.from(this.themeMenu.querySelectorAll('button'));
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

    updateLegacyDropdown() {
        const themeButtons = this.themeMenu?.querySelectorAll('[data-theme-choice]');
        themeButtons?.forEach(btn => {
            const isActive = btn.getAttribute('data-theme-choice') === this.currentTheme;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
    }

    // === MÉTODOS UTILITARIOS ===

    getThemeDisplayName(theme) {
        const names = {
            'light': 'Claro',
            'dark': 'Oscuro',
            'high-contrast': 'Alto Contraste',
            'sepia': 'Sepia',
            'photophobia': 'Fotofobia',
            'daltonism': 'Daltonismo',
            'dyslexia': 'Dislexia',
            'reading': 'Lectura',
            'reduced-motion': 'Mov. Reducido',
            'grayscale': 'Escala Grises'
        };
        return names[theme] || theme;
    }

    updateThemeSelector() {
        const select = document.getElementById('theme-select');
        if (select) {
            select.value = this.currentTheme;
        }
    }

    getSavedTheme() {
        return localStorage.getItem('preferred-theme');
    }

    saveTheme(theme) {
        localStorage.setItem('preferred-theme', theme);
    }

    // === MÉTODOS PÚBLICOS ===

    setTheme(theme) {
        this.applyTheme(theme);
    }

    cycleThemes() {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.setTheme(this.themes[nextIndex]);
    }

    resetTheme() {
        localStorage.removeItem('preferred-theme');
        this.applyTheme('light');
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    isDarkTheme() {
        return ['dark', 'high-contrast'].includes(this.currentTheme);
    }

    destroy() {
        // Cleanup de event listeners
        document.removeEventListener('keydown', this.handleKeyboardShortcuts);
    }
}