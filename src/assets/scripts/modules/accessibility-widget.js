// accessibility-widget.js
class AccessibilityWidget {
    constructor() {
        this.widget = document.getElementById('accessibility-widget');
        this.toggleBtn = this.widget.querySelector('.accessibility-toggle');
        this.panel = this.widget.querySelector('.accessibility-panel');
        this.closeBtn = this.widget.querySelector('.accessibility-close');
        this.themeSelector = document.getElementById('theme-selector');
        this.motionCheckbox = document.getElementById('motion-reduced');
        this.readingCheckbox = document.getElementById('reading-mode');

        this.init();
    }

    init() {
        this.loadSavedPreferences();
        this.setupEventListeners();
        this.setupQuickActions();
    }

    setupEventListeners() {
        // Toggle panel
        this.toggleBtn.addEventListener('click', () => this.togglePanel());

        // Cerrar panel
        this.closeBtn.addEventListener('click', () => this.closePanel());

        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!this.widget.contains(e.target)) {
                this.closePanel();
            }
        });

        // Cambio de tema
        this.themeSelector.addEventListener('change', (e) => {
            this.applyTheme(e.target.value);
        });

        // Modificadores
        this.motionCheckbox.addEventListener('change', (e) => {
            this.toggleModifier('reduced-motion', e.target.checked);
        });

        this.readingCheckbox.addEventListener('change', (e) => {
            this.toggleModifier('reading-mode', e.target.checked);
        });
    }

    setupQuickActions() {
        // Acciones rápidas
        document.querySelectorAll('.accessibility-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    togglePanel() {
        this.widget.classList.toggle('active');
    }

    closePanel() {
        this.widget.classList.remove('active');
    }

    applyTheme(theme) {
        // Remover todos los temas
        document.documentElement.removeAttribute('data-theme');

        // Aplicar nuevo tema (excepto light que es por defecto)
        if (theme !== 'light') {
            document.documentElement.setAttribute('data-theme', theme);
        }

        this.savePreference('theme', theme);
    }

    toggleModifier(modifier, enabled) {
        if (enabled) {
            document.documentElement.setAttribute('data-modifier', modifier);
        } else {
            document.documentElement.removeAttribute('data-modifier');
        }

        this.savePreference(`modifier-${modifier}`, enabled);
    }

    handleQuickAction(action) {
        switch (action) {
            case 'increase-text':
                this.increaseTextSize();
                break;
            case 'decrease-text':
                this.decreaseTextSize();
                break;
            case 'reset-all':
                this.resetAll();
                break;
        }
    }

    increaseTextSize() {
        const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        document.documentElement.style.fontSize = (currentSize * 1.1) + 'px';
        this.savePreference('textSize', 'large');
    }

    decreaseTextSize() {
        document.documentElement.style.fontSize = '';
        this.savePreference('textSize', 'normal');
    }

    resetAll() {
        // Reset tema
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.removeAttribute('data-modifier');
        document.documentElement.style.fontSize = '';

        // Reset controles
        this.themeSelector.value = 'light';
        this.motionCheckbox.checked = false;
        this.readingCheckbox.checked = false;

        // Limpiar almacenamiento
        localStorage.removeItem('accessibility-theme');
        localStorage.removeItem('accessibility-modifier-reduced-motion');
        localStorage.removeItem('accessibility-modifier-reading-mode');
        localStorage.removeItem('accessibility-textSize');
    }

    savePreference(key, value) {
        localStorage.setItem(`accessibility-${key}`, value);
    }

    loadSavedPreferences() {
        // Cargar tema
        const savedTheme = localStorage.getItem('accessibility-theme') || 'light';
        this.themeSelector.value = savedTheme;
        this.applyTheme(savedTheme);

        // Cargar modificadores
        const motionEnabled = localStorage.getItem('accessibility-modifier-reduced-motion') === 'true';
        const readingEnabled = localStorage.getItem('accessibility-modifier-reading-mode') === 'true';

        this.motionCheckbox.checked = motionEnabled;
        this.readingCheckbox.checked = readingEnabled;

        if (motionEnabled) this.toggleModifier('reduced-motion', true);
        if (readingEnabled) this.toggleModifier('reading-mode', true);

        // Cargar tamaño de texto
        const textSize = localStorage.getItem('accessibility-textSize');
        if (textSize === 'large') {
            this.increaseTextSize();
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new AccessibilityWidget();
});