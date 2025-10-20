// ============================
// TOOLTIPS CONTROLLER
// ============================

class TooltipsController {
    constructor() {
        this.init();
    }

    init() {
        if (typeof tippy === 'undefined') {
            console.warn('⚠️ Tippy.js no está cargado');
            return;
        }

        this.initializeTooltips();
        this.setupThemeListener();

        console.log('✅ Tooltips controller inicializado');
    }

    initializeTooltips() {
        tippy('[data-tippy-content]', {
            animation: 'shift-away',
            theme: this.getCurrentTheme(),
            delay: [100, 50],
            arrow: true,
            placement: 'top',
            interactive: true,
            appendTo: document.body
        });
    }

    getCurrentTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        return (['dark', 'high-contrast'].includes(currentTheme)) ? 'material' : 'light';
    }

    setupThemeListener() {
        // Actualizar tooltips cuando cambie el tema
        window.addEventListener('theme:changed', () => {
            this.updateTooltipsTheme();
        });
    }

    updateTooltipsTheme() {
        const newTheme = this.getCurrentTheme();
        document.querySelectorAll('[data-tippy-content]').forEach(el => {
            if (el._tippy) {
                el._tippy.setProps({ theme: newTheme });
            }
        });
    }

    destroy() {
        // Destruir todas las instancias de tooltips
        document.querySelectorAll('[data-tippy-content]').forEach(el => {
            if (el._tippy) {
                el._tippy.destroy();
            }
        });
    }
}