// assets/js/accessibility/features/dyslexia-manager.js

import { BaseFeatureManager } from '../core/base-feature-manager.js';

export class DyslexiaManager extends BaseFeatureManager {
    constructor(logger) {
        super('dyslexia', logger);
    }

    getDefaultSettings() {
        return {
            enabled: false,
            intensity: 3,
            fontFamily: 'OpenDyslexic, Arial, sans-serif',
            letterSpacing: '0.12em',
            wordSpacing: '0.16em',
            lineHeight: '1.6'
        };
    }

    async setupEventListeners() {
        this.setupToggle('dyslexia-mode-toggle', (e) => {
            const control = document.getElementById('dyslexia-intensity')?.closest('.intensity-control');
            this.toggleElementVisibility(control?.id, e.target.checked);
        });

        this.setupSlider('dyslexia-intensity', 'intensity');

        this.logger.debug('Event listeners de dyslexia configurados');
    }

    applySettings() {
        const root = document.documentElement;

        if (this.settings.enabled) {
            root.setAttribute('data-dyslexia-mode', 'true');
            root.setAttribute('data-dyslexia-intensity', this.settings.intensity.toString());
            this.applyDyslexiaStyles();
            this.logger.info('Modo dislexia activado', {
                intensity: this.settings.intensity,
                fontFamily: this.settings.fontFamily
            });
        } else {
            root.removeAttribute('data-dyslexia-mode');
            root.removeAttribute('data-dyslexia-intensity');
            this.removeDyslexiaStyles();
            this.logger.info('Modo dislexia desactivado');
        }
    }

    applyDyslexiaStyles() {
        const styleId = 'dyslexia-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                [data-dyslexia-mode] {
                    --font-family-primary: ${this.settings.fontFamily} !important;
                    --letter-spacing: ${this.settings.letterSpacing} !important;
                    --word-spacing: ${this.settings.wordSpacing} !important;
                    --line-height: ${this.settings.lineHeight} !important;
                }

                [data-dyslexia-mode] body {
                    font-family: ${this.settings.fontFamily} !important;
                    letter-spacing: ${this.settings.letterSpacing} !important;
                    word-spacing: ${this.settings.wordSpacing} !important;
                    line-height: ${this.settings.lineHeight} !important;
                }

                [data-dyslexia-intensity="1"] {
                    --letter-spacing: 0.08em !important;
                    --word-spacing: 0.12em !important;
                }

                [data-dyslexia-intensity="2"] {
                    --letter-spacing: 0.12em !important;
                    --word-spacing: 0.16em !important;
                }

                [data-dyslexia-intensity="3"] {
                    --letter-spacing: 0.16em !important;
                    --word-spacing: 0.20em !important;
                }

                /* Mejorar legibilidad para dislexia */
                [data-dyslexia-mode] p {
                    margin-bottom: 1.5em !important;
                }

                [data-dyslexia-mode] h1, 
                [data-dyslexia-mode] h2, 
                [data-dyslexia-mode] h3 {
                    font-weight: bold !important;
                    margin-bottom: 1em !important;
                }
            `;
            document.head.appendChild(style);
            this.logger.debug('Estilos de dislexia aplicados');
        }
    }

    removeDyslexiaStyles() {
        const style = document.getElementById('dyslexia-styles');
        if (style) {
            style.remove();
            this.logger.debug('Estilos de dislexia removidos');
        }
    }

    // Método específico para cambiar la fuente
    setFontFamily(fontFamily) {
        this.settings.fontFamily = fontFamily;
        if (this.settings.enabled) {
            this.applyDyslexiaStyles();
            this.saveSettings();
        }
        this.logger.info('Fuente de dislexia actualizada', { fontFamily });
    }
}