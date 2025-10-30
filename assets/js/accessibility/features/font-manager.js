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
            const control = document.getElementById('font-size')?.closest('.intensity-control');
            this.toggleElementVisibility(control?.id, e.target.checked);
        });

        this.setupSlider('font-size', 'fontSize');

        this.logger.debug('Event listeners de font configurados');
    }

    applySettings() {
        const root = document.documentElement;

        if (this.settings.enabled) {
            root.setAttribute('data-font-size', this.settings.fontSize.toString());
            this.applyFontScaling();
            this.logger.info('Escalado de fuente activado', {
                fontSize: this.settings.fontSize,
                scale: this.getCurrentScale()
            });
        } else {
            root.removeAttribute('data-font-size');
            this.removeFontScaling();
            this.logger.info('Escalado de fuente desactivado');
        }
    }

    applyFontScaling() {
        const scale = this.getCurrentScale();
        const styleId = 'font-scaling-styles';

        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }

        const style = document.getElementById(styleId);
        style.textContent = `
            [data-font-size] body {
                font-size: ${scale * 100}% !important;
            }

            [data-font-size] h1 {
                font-size: ${scale * 2.5}rem !important;
            }

            [data-font-size] h2 {
                font-size: ${scale * 2}rem !important;
            }

            [data-font-size] h3 {
                font-size: ${scale * 1.75}rem !important;
            }

            [data-font-size] p, 
            [data-font-size] li, 
            [data-font-size] span {
                font-size: ${scale * 1}rem !important;
            }

            /* Ajustar contenedores para texto más grande */
            [data-font-size] .container {
                max-width: ${scale * 100}% !important;
            }
        `;

        this.logger.debug('Escalado de fuente aplicado', { scale });
    }

    removeFontScaling() {
        const style = document.getElementById('font-scaling-styles');
        if (style) {
            style.remove();
            this.logger.debug('Escalado de fuente removido');
        }
    }

    getCurrentScale() {
        const index = Math.min(Math.max(0, this.settings.fontSize), this.availableFontSizes.length - 1);
        return this.availableFontSizes[index];
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