// assets/js/accessibility/accessibility-main.js

// Punto de entrada principal del sistema de accesibilidad
import { AccessibilityManager } from './core/accessibility-manager.js';

class AccessibilitySystem {
    constructor() {
        this.manager = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            console.log('♿ Inicializando sistema de accesibilidad...');

            this.manager = new AccessibilityManager();
            await this.manager.initialize();

            // Migrar configuraciones antiguas si existen
            await this.manager.migrateFromOldSettings();

            this.isInitialized = true;
            console.log('✅ Sistema de accesibilidad completamente inicializado');

            // Exponer para debugging
            window.accessibilitySystem = this;

        } catch (error) {
            console.error('❌ Error crítico inicializando sistema de accesibilidad:', error);
        }
    }

    // Métodos de conveniencia
    enable(feature, intensity) {
        return this.manager?.enableFeature(feature, intensity);
    }

    disable(feature) {
        return this.manager?.disableFeature(feature);
    }

    status() {
        return this.manager?.getStatus();
    }
}

// Inicialización automática
const accessibilitySystem = new AccessibilitySystem();

document.addEventListener('DOMContentLoaded', async () => {
    await accessibilitySystem.initialize();
});

// Exportar para uso modular
export { accessibilitySystem };
export default accessibilitySystem;