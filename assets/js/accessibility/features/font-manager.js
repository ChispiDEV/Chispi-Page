// assets/js/accessibility/features/font-manager.js

import { BaseFeatureManager } from '../core/base-feature-manager.js';

export class FontManager extends BaseFeatureManager {
    constructor(logger) {
        super('font', logger);
        this.availableFontSizes = [0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5];
    }

    getDefaultSettings() {
        return {
            enabled: false,
            fontSize: 3, // índice del array (1.0 = normal)
            scale: 1.0
        };
    }

    async setupEventListeners() {
        this.setupToggle('font-size-toggle', (e) => {
            this.toggleIntensityControl(e.target.checked);
        });

        this.setupSlider('font-size', 'fontSize', (e) => {
            if (this.settings.enabled) {
                this.applySettings();
            }
        });

        this.logger.debug('Event listeners de tamaño de fuente configurados');
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
            root.setAttribute('data-font-size', this.settings.fontSize.toString());
            // EL SCSS SE ENCARGA DE TODO
            this.logger.info('Escalado de fuente activado', {
                fontSize: this.settings.fontSize
            });
        } else {
            root.removeAttribute('data-font-size');
            // EL SCSS SE ENCARGA DE TODO
            this.logger.info('Escalado de fuente desactivado');
        }
    }

    setFontSize(sizeIndex) {
        const index = Math.min(Math.max(0, sizeIndex), this.availableFontSizes.length - 1);
        this.settings.fontSize = index;
        if (this.settings.enabled) {
            this.applyFontScaling();
            this.saveSettings();
        }
        this.logger.info('Tamaño de fuente actualizado', {
            index: sizeIndex,
            scale: this.getCurrentScale()
        });
    }

    increaseFontSize() {
        const newIndex = Math.min(this.settings.fontSize + 1, this.availableFontSizes.length - 1);
        this.setFontSize(newIndex);
    }

    decreaseFontSize() {
        const newIndex = Math.max(this.settings.fontSize - 1, 0);
        this.setFontSize(newIndex);
    }

    resetFontSize() {
        this.setFontSize(3); // Tamaño normal (1.0)
    }
}