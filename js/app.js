// ============================
// APP CONTROLLER - COORDINADOR PRINCIPAL
// ============================

class AppController {
    constructor() {
        this.modules = {};
        this.BASE_URL = '/Chispi-Page';
        this.init();
    }

    async init() {
        try {
            // Inicializar módulos en orden
            await this.initModules();

            // Configurar eventos globales
            this.setupGlobalEvents();

            console.log('✅ App inicializada correctamente');
        } catch (error) {
            console.error('❌ Error inicializando la app:', error);
        }
    }

    async initModules() {
        // Inicializar módulos en orden de dependencia
        this.modules.sidebar = new SidebarController();
        this.modules.scroll = new ScrollController();
        this.modules.theme = new ThemeController();
        this.modules.language = new LanguageController();
        this.modules.particles = new ParticlesController();
        this.modules.tooltips = new TooltipsController();

        // Esperar a que los módulos estén listos
        await Promise.all([
            this.modules.sidebar.ready,
            this.modules.theme.ready
        ]);
    }

    setupGlobalEvents() {
        // Eventos globales del documento
        document.addEventListener('keydown', this.handleGlobalKeys.bind(this));

        // Exponer módulos globalmente para debugging
        window.app = this;
    }

    handleGlobalKeys(event) {
        // Atajos globales de teclado
        if (event.ctrlKey && event.altKey) {
            switch(event.key) {
                case 'm':
                    event.preventDefault();
                    this.modules.sidebar.toggle();
                    break;
                case 't':
                    event.preventDefault();
                    this.modules.theme.cycleThemes();
                    break;
                case 'l':
                    event.preventDefault();
                    this.modules.language.toggle();
                    break;
            }
        }
    }

    // Métodos utilitarios
    getModule(name) {
        return this.modules[name];
    }

    destroy() {
        // Cleanup de todos los módulos
        Object.values(this.modules).forEach(module => {
            if (module.destroy) module.destroy();
        });
    }
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    window.appController = new AppController();
});