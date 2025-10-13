// ============================
// APP CONTROLLER - CON CARGA AUTOMÁTICA
// ============================

class AppController {
    constructor() {
        this.modules = {};
        this.BASE_URL = '{{ site.baseurl }}';
        this.moduleStatus = new Map();
        this.init();
    }

    async init() {
        try {
            // Esperar a que el DOM esté listo
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.startApp());
            } else {
                this.startApp();
            }
        } catch (error) {
            console.error('❌ Error inicializando la app:', error);
        }
    }

    async startApp() {
        // Registrar módulos disponibles
        this.registerModules();

        // Inicializar módulos en orden
        await this.initModules();

        // Configurar eventos globales
        this.setupGlobalEvents();

        console.log('✅ App inicializada correctamente');
    }

    registerModules() {
        // Módulos core (siempre presentes)
        this.availableModules = {
            'sidebar': 'SidebarController',
            'scroll': 'ScrollController',
            'theme': 'ThemeController',
            'language': 'LanguageController',
            'particles': 'ParticlesController',
            'tooltips': 'TooltipsController',
            'popups': 'PopupsController'
        };

        // Verificar qué módulos están realmente cargados
        this.detectLoadedModules();
    }

    detectLoadedModules() {
        Object.keys(this.availableModules).forEach(moduleName => {
            const className = this.availableModules[moduleName];
            if (window[className]) {
                this.moduleStatus.set(moduleName, 'available');
            } else {
                this.moduleStatus.set(moduleName, 'missing');
                console.warn(`⚠️ Módulo ${moduleName} no encontrado`);
            }
        });
    }

    async initModules() {
        const initQueue = [];

        // Crear instancias solo de módulos disponibles
        for (const [moduleName, status] of this.moduleStatus) {
            if (status === 'available') {
                const className = this.availableModules[moduleName];
                initQueue.push(this.createModuleInstance(moduleName, className));
            }
        }

        // Inicializar módulos en paralelo
        await Promise.allSettled(initQueue);

        // Esperar a módulos críticos
        await this.waitForCriticalModules();
    }

    async createModuleInstance(moduleName, className) {
        try {
            const ModuleClass = window[className];
            this.modules[moduleName] = new ModuleClass();

            // Si el módulo tiene una promesa ready, esperarla
            if (this.modules[moduleName].ready) {
                await this.modules[moduleName].ready;
            }

            this.moduleStatus.set(moduleName, 'initialized');
            console.log(`✅ Módulo ${moduleName} inicializado`);

        } catch (error) {
            console.error(`❌ Error inicializando módulo ${moduleName}:`, error);
            this.moduleStatus.set(moduleName, 'error');
        }
    }

    async waitForCriticalModules() {
        const criticalModules = ['theme', 'sidebar'];
        const criticalPromises = criticalModules
            .filter(module => this.moduleStatus.get(module) === 'initialized')
            .map(module => this.modules[module].ready);

        await Promise.allSettled(criticalPromises);
    }

    setupGlobalEvents() {
        // Eventos globales del documento
        document.addEventListener('keydown', this.handleGlobalKeys.bind(this));

        // Botones en el HTML para abrir popups
        this.setupPopupTriggers();

        // Exponer módulos globalmente para debugging
        window.app = this;
    }

    setupPopupTriggers() {
        // Botón de accesibilidad
        const accessibilityBtn = document.getElementById('accessibility-btn');
        if (accessibilityBtn && this.modules.popups) {
            accessibilityBtn.addEventListener('click', () => {
                this.modules.popups.showAccessibilityPopup();
            });
        }

        // Botón de contacto
        const contactBtn = document.getElementById('contact-btn');
        if (contactBtn && this.modules.popups) {
            contactBtn.addEventListener('click', () => {
                this.modules.popups.showContactPopup();
            });
        }

        // Botón de descargar CV
        const downloadBtn = document.getElementById('download-cv-btn');
        if (downloadBtn && this.modules.popups) {
            downloadBtn.addEventListener('click', () => {
                this.modules.popups.showDownloadPopup();
            });
        }

        // Botones rápidos del sidebar
        document.querySelectorAll('[data-action="accessibility"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.modules.popups) {
                    this.modules.popups.showAccessibilityPopup();
                }
            });
        });

        document.querySelectorAll('[data-action="contact"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.modules.popups) {
                    this.modules.popups.showContactPopup();
                }
            });
        });
    }

    handleGlobalKeys(event) {
        // Atajos globales de teclado
        if (event.altKey) {
            switch(event.key) {
                case 'a': // Alt + A para accesibilidad
                    event.preventDefault();
                    if (this.modules.popups) this.modules.popups.showAccessibilityPopup();
                    break;
                case 'c': // Alt + C para contacto
                    event.preventDefault();
                    if (this.modules.popups) this.modules.popups.showContactPopup();
                    break;
                case 'd': // Alt + D para descargar CV
                    event.preventDefault();
                    if (this.modules.popups) this.modules.popups.showDownloadPopup();
                    break;
            }
        }

        if (event.ctrlKey && event.altKey) {
            switch(event.key) {
                case 'm':
                    event.preventDefault();
                    if (this.modules.sidebar) this.modules.sidebar.toggle();
                    break;
                case 't':
                    event.preventDefault();
                    if (this.modules.theme) this.modules.theme.cycleThemes();
                    break;
                case 'l':
                    event.preventDefault();
                    if (this.modules.language) this.modules.language.toggle();
                    break;
            }
        }
    }

    // Métodos utilitarios
    getModule(name) {
        return this.modules[name];
    }

    isModuleLoaded(name) {
        return this.moduleStatus.get(name) === 'initialized';
    }

    getLoadedModules() {
        return Array.from(this.moduleStatus.entries())
            .filter(([_, status]) => status === 'initialized')
            .map(([name]) => name);
    }

    async loadModule(moduleName) {
        if (this.moduleStatus.get(moduleName) === 'initialized') {
            return this.modules[moduleName];
        }

        // Aquí podrías implementar carga dinámica de módulos
        console.warn(`Carga dinámica no implementada para: ${moduleName}`);
        return null;
    }

    destroy() {
        // Cleanup de todos los módulos
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.destroy === 'function') {
                module.destroy();
            }
        });

        this.modules = {};
        this.moduleStatus.clear();
    }
}

// Inicialización automática
window.appController = new AppController();