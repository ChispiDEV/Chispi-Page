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
            this.toggleIntensityControl(e.target.checked);
        });

        this.setupSlider('reading-intensity', 'intensity', (e) => {
            if (this.settings.enabled) {
                this.applySettings();
            }
        });

        this.logger.debug('Event listeners de Reading-Mode configurados');
    }

    toggleIntensityControl(show) {
        const control = document.getElementById('motion-intensity-control');
        if (control) {
            if (show) {
                control.classList.add('visible');
                control.style.display = 'flex';
            } else {
                control.classList.remove('visible');
                control.style.display = 'none';
            }
            this.logger.debug(`Control de intensidad ${show ? 'mostrado' : 'ocultado'}`);
        }
    }
    
    applySettings() {
        const root = document.documentElement;

        if (this.settings.enabled) {
            // SOLO establecer atributos - el SCSS hace el resto
            root.setAttribute('data-reading-mode', 'true');
            root.setAttribute('data-reading-intensity', this.settings.intensity.toString());

            this.logger.info('Modo lectura activado', {
                intensity: this.settings.intensity
            });
        } else {
            // SOLO remover atributos - el SCSS hace el resto
            root.removeAttribute('data-reading-mode');
            root.removeAttribute('data-reading-intensity');

            this.logger.info('Modo lectura desactivado');
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