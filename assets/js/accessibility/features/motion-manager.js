// assets/js/accessibility/features/motion-manager.js

import { BaseFeatureManager } from '../core/base-feature-manager.js';

export class MotionManager extends BaseFeatureManager {
    constructor(logger) {
        super('motion', logger);
    }

    getDefaultSettings() {
        return {
            enabled: false,
            intensity: 3,
            reduceParticles: true
        };
    }

    async setupEventListeners() {
        this.setupToggle('reduced-motion-toggle', (e) => {
            this.toggleElementVisibility('motion-intensity-control', e.target.checked);
        });

        this.setupSlider('motion-intensity', 'intensity');

        this.logger.debug('Event listeners de motion configurados');
    }

    applySettings() {
        const root = document.documentElement;

        if (this.settings.enabled) {
            root.setAttribute('data-reduced-motion', this.settings.intensity.toString());
            this.applyMotionReduction();
            this.logger.info('Movimiento reducido activado', {
                intensity: this.settings.intensity,
                reduceParticles: this.settings.reduceParticles
            });
        } else {
            root.removeAttribute('data-reduced-motion');
            this.removeMotionReduction();
            this.logger.info('Movimiento reducido desactivado');
        }
    }

    applyMotionReduction() {
        // Aplicar reducción de movimiento a partículas
        if (this.settings.reduceParticles && window.particleSystem) {
            if (this.settings.intensity <= 2) {
                window.particleSystem.stopAnimation();
                this.logger.debug('Animación de partículas detenida');
            } else if (this.settings.intensity > 2) {
                window.particleSystem.startAnimation();
                this.logger.debug('Animación de partículas reducida');
            }
        }

        // Aplicar a CSS animations
        this.injectMotionReductionCSS();
    }

    removeMotionReduction() {
        // Reanudar partículas si están habilitadas
        if (window.particleSystem && window.themeManager?.particlesEnabled) {
            window.particleSystem.startAnimation();
            this.logger.debug('Animación de partículas reanudada');
        }

        // Remover CSS de reducción de movimiento
        this.removeMotionReductionCSS();
    }

    injectMotionReductionCSS() {
        const styleId = 'motion-reduction-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                [data-reduced-motion] * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
                
                [data-reduced-motion="1"] * {
                    animation-play-state: paused !important;
                    transition: none !important;
                }
                
                [data-reduced-motion="2"] {
                    --particles-speed: 0.1 !important;
                    --particles-move-speed: 0.2 !important;
                }
                
                [data-reduced-motion="3"] {
                    --particles-speed: 0.3 !important;
                    --particles-move-speed: 0.5 !important;
                }
            `;
            document.head.appendChild(style);
            this.logger.debug('CSS de reducción de movimiento inyectado');
        }
    }

    removeMotionReductionCSS() {
        const style = document.getElementById('motion-reduction-styles');
        if (style) {
            style.remove();
            this.logger.debug('CSS de reducción de movimiento removido');
        }
    }
}