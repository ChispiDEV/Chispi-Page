// assets/js/accessibility/features/reading-manager.js

import { BaseFeatureManager } from '../core/base-feature-manager.js';

export class ReadingManager extends BaseFeatureManager {
    constructor(logger) {
        super('reading', logger);
        this.originalTheme = null;
    }

    getDefaultSettings() {
        return {
            enabled: false,
            intensity: 3,
            theme: 'sepia',
            contrast: 1.1,
            brightness: 0.9
        };
    }

    async setupEventListeners() {
        this.setupToggle('reading-mode-toggle', (e) => {
            const control = document.getElementById('reading-intensity')?.closest('.intensity-control');
            this.toggleElementVisibility(control?.id, e.target.checked);
        });

        this.setupSlider('reading-intensity', 'intensity');

        this.logger.debug('Event listeners de reading configurados');
    }

    applySettings() {
        const root = document.documentElement;

        if (this.settings.enabled) {
            // Guardar tema original si es la primera vez
            if (!this.originalTheme) {
                this.originalTheme = window.themeManager?.getTheme() || 'light';
            }

            root.setAttribute('data-reading-mode', 'true');
            root.setAttribute('data-reading-intensity', this.settings.intensity.toString());
            this.applyReadingTheme();
            this.logger.info('Modo lectura activado', {
                intensity: this.settings.intensity,
                theme: this.settings.theme
            });
        } else {
            root.removeAttribute('data-reading-mode');
            root.removeAttribute('data-reading-intensity');
            this.restoreOriginalTheme();
            this.logger.info('Modo lectura desactivado');
        }
    }

    applyReadingTheme() {
        const intensity = this.settings.intensity / 10;

        // Aplicar tema de lectura
        document.documentElement.style.setProperty('--bg-primary', '#2d3748');
        document.documentElement.style.setProperty('--bg-secondary', '#4a5568');
        document.documentElement.style.setProperty('--text-primary', '#e2e8f0');
        document.documentElement.style.setProperty('--text-secondary', '#cbd5e0');
        document.documentElement.style.setProperty('--border-color', '#4a5568');

        // Aplicar filtros basados en intensidad
        const sepiaValue = intensity * 0.5;
        const brightnessValue = 0.9 + (intensity * 0.1);
        const contrastValue = 1.0 + (intensity * 0.1);

        document.body.style.filter = `sepia(${sepiaValue}) brightness(${brightnessValue}) contrast(${contrastValue})`;

        // Inyectar CSS adicional para mejor lectura
        this.injectReadingStyles();

        this.logger.debug('Tema de lectura aplicado', {
            sepia: sepiaValue,
            brightness: brightnessValue,
            contrast: contrastValue
        });
    }

    restoreOriginalTheme() {
        // Remover filtros
        document.body.style.filter = '';

        // Restaurar tema original
        if (this.originalTheme && window.themeManager) {
            window.themeManager.applyTheme(this.originalTheme);
        }

        // Remover estilos de lectura
        this.removeReadingStyles();

        this.logger.debug('Tema original restaurado', { theme: this.originalTheme });
    }

    injectReadingStyles() {
        const styleId = 'reading-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                [data-reading-mode] {
                    /* Mejorar contraste y legibilidad */
                    --text-primary: #e2e8f0 !important;
                    --text-secondary: #cbd5e0 !important;
                    --bg-primary: #2d3748 !important;
                    --bg-secondary: #4a5568 !important;
                }

                [data-reading-mode] .container {
                    max-width: 65ch !important; /* Óptimo para lectura */
                    margin: 0 auto !important;
                }

                [data-reading-mode] p {
                    text-align: justify !important;
                    hyphens: auto !important;
                    margin-bottom: 1.5em !important;
                }

                [data-reading-mode] h1, 
                [data-reading-mode] h2, 
                [data-reading-mode] h3 {
                    text-align: left !important;
                    margin: 2em 0 1em 0 !important;
                }

                [data-reading-intensity="1"] body {
                    filter: sepia(0.3) brightness(0.95) contrast(1.05) !important;
                }

                [data-reading-intensity="2"] body {
                    filter: sepia(0.4) brightness(0.92) contrast(1.1) !important;
                }

                [data-reading-intensity="3"] body {
                    filter: sepia(0.5) brightness(0.9) contrast(1.15) !important;
                }
            `;
            document.head.appendChild(style);
            this.logger.debug('Estilos de lectura aplicados');
        }
    }

    removeReadingStyles() {
        const style = document.getElementById('reading-styles');
        if (style) {
            style.remove();
            this.logger.debug('Estilos de lectura removidos');
        }
    }

    // Método para cambiar el tema de lectura
    setReadingTheme(theme) {
        this.settings.theme = theme;
        if (this.settings.enabled) {
            this.applyReadingTheme();
            this.saveSettings();
        }
        this.logger.info('Tema de lectura actualizado', { theme });
    }
}