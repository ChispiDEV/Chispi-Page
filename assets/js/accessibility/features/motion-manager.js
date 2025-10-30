// assets/js/accessibility/features/motion-manager.js

import { BaseFeatureManager } from '../core/base-feature-manager.js';

export class MotionManager extends BaseFeatureManager {
    constructor(logger) {
        super('motion', logger);
    }

    getDefaultSettings() {
        return {
            enabled: false,
            intensity: 1, // Cambiado a 1 para que coincida con el slider (1-4)
            reduceParticles: true
        };
    }

    async setupEventListeners() {
        // CORREGIDO: Pasar la función correcta para mostrar/ocultar
        this.setupToggle('reduced-motion-toggle', (e) => {
            this.toggleIntensityControl(e.target.checked);
        });

        this.setupSlider('motion-intensity', 'intensity', (e) => {
            // Actualizar inmediatamente cuando se mueve el slider
            if (this.settings.enabled) {
                this.applySettings();
            }
        });

        this.logger.debug('Event listeners de motion configurados');
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
            root.setAttribute('data-reduced-motion', this.settings.intensity.toString());
            this.applyMotionReduction();
            this.logger.info('Movimiento reducido activado', {
                intensity: this.settings.intensity,
                level: this.getIntensityLevel()
            });
        } else {
            root.removeAttribute('data-reduced-motion');
            this.removeMotionReduction();
            this.logger.info('Movimiento reducido desactivado');
        }
    }

    applyMotionReduction() {
        const level = this.getIntensityLevel();
        const root = document.documentElement;

        // SOLO establecer el atributo data-reduced-motion - el SCSS se encarga del resto
        root.setAttribute('data-reduced-motion', level.toString());

        // Controlar partículas mediante JavaScript (ya que no hay clases CSS para ellas)
        this.controlParticles(level);

        this.logger.debug(`Reducción de movimiento aplicada - Nivel ${level}`);
    }

    controlParticles(level) {
        if (!window.particleSystem) return;

        switch (level) {
            case 1:
                // Nivel 1: Reducción leve - el SCSS se encarga mediante .particle
                window.particleSystem.setReducedSpeed(0.7);
                break;
            case 2:
                // Nivel 2: Reducción media
                window.particleSystem.setReducedSpeed(0.4);
                window.particleSystem.setReducedOpacity(0.6);
                break;
            case 3:
                // Nivel 3: Reducción alta
                window.particleSystem.setReducedSpeed(0.2);
                window.particleSystem.setReducedOpacity(0.3);
                break;
            case 4:
                // Nivel 4: Sin movimiento - el SCSS oculta las partículas
                window.particleSystem.stopAnimation();
                break;
        }
    }

    removeMotionReduction() {
        const root = document.documentElement;
        root.removeAttribute('data-reduced-motion');

        // Reanudar partículas
        if (window.particleSystem && window.themeManager?.particlesEnabled) {
            window.particleSystem.startAnimation();
            window.particleSystem.setNormalSpeed();
            window.particleSystem.setNormalOpacity();
        }

        // ELIMINADO: No necesitamos remover CSS inline porque usamos SCSS
        this.logger.debug('Reducción de movimiento removida');
    }
}