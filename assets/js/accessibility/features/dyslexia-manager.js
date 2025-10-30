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
            this.toggleIntensityControl(e.target.checked);
        });

        this.setupSlider('dyslexia-intensity', 'intensity', (e) => {
            if (this.settings.enabled) {
                this.applySettings();
            }
        });

        this.logger.debug('Event listeners de dyslexia configurados');
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
            root.setAttribute('data-dyslexia-mode', 'true');
            root.setAttribute('data-dyslexia-intensity', this.settings.intensity.toString());
            // EL SCSS SE ENCARGA DE TODO - no necesitamos injectar CSS
            this.logger.info('Modo dislexia activado', {
                intensity: this.settings.intensity
            });
        } else {
            root.removeAttribute('data-dyslexia-mode');
            root.removeAttribute('data-dyslexia-intensity');
            // EL SCSS SE ENCARGA DE TODO - no necesitamos remover CSS
            this.logger.info('Modo dislexia desactivado');
        }
    }
}