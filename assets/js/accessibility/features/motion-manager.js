// assets/js/accessibility/features/motion-manager.js

import { BaseFeatureManager } from '../core/base-feature-manager.js';

export class MotionManager extends BaseFeatureManager {
    constructor(logger) {
        super('motion', logger);
        // Usar getDefaultSettings para mantener consistencia
        this.settings = this.getDefaultSettings();
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
            this.toggleIntensityControl('motion-intensity-control', e.target.checked);
        });

        this.setupSlider('motion-intensity', 'intensity', (e) => {
            if (this.settings.enabled) {
                this.applySettings();
            }
        });

        this.logger.debug('Event listeners de motion configurados');
    }

    getIntensityLevel() {
        const intensity = this.settings.intensity;
        const levelMap = {
            1: 1, // Reducción leve
            2: 2, // Reducción media  
            3: 2, // Reducción media (valor por defecto)
            4: 3, // Reducción alta
            5: 4  // Sin movimiento
        };
        return levelMap[intensity] || 2;
    }

    getIntensityInfo() {
        const level = this.getIntensityLevel();
        const levelInfo = {
            1: {
                name: 'Leve',
                description: 'Reducción mínima de animaciones',
                effects: ['Animaciones más lentas', 'Transiciones suaves']
            },
            2: {
                name: 'Media',
                description: 'Reducción moderada de movimiento',
                effects: ['Animaciones significativamente reducidas', 'Efectos hover limitados']
            },
            3: {
                name: 'Alta',
                description: 'Reducción extensa de movimiento',
                effects: ['Solo animaciones esenciales', 'Efectos hover eliminados']
            },
            4: {
                name: 'Extrema',
                description: 'Sin movimiento',
                effects: ['Todas las animaciones desactivadas', 'Scroll instantáneo']
            }
        };

        return {
            level: level,
            intensity: this.settings.intensity,
            info: levelInfo[level] || levelInfo[2]
        };
    }

    applySettings() {
        const root = document.documentElement;

        if (this.settings.enabled) {
            const level = this.getIntensityLevel();
            root.setAttribute('data-reduced-motion', level.toString());
            this.applyMotionReduction(level);
            this.logger.info('Movimiento reducido activado', {
                intensity: this.settings.intensity,
                level: level
            });
        } else {
            root.removeAttribute('data-reduced-motion');
            this.removeMotionReduction();
            this.logger.info('Movimiento reducido desactivado');
        }
    }

    applyMotionReduction(level) {
        const root = document.documentElement;
        root.setAttribute('data-reduced-motion', level.toString());
        this.controlParticles(level);
        this.logger.debug(`Reducción de movimiento aplicada - Nivel ${level}`);
    }

    controlParticles(level) {
        if (!window.particleSystem) return;

        const particleConfigs = {
            1: { speed: 0.7, opacity: 1.0, shouldStop: false },
            2: { speed: 0.4, opacity: 0.6, shouldStop: false },
            3: { speed: 0.2, opacity: 0.3, shouldStop: false },
            4: { speed: 0, opacity: 0, shouldStop: true }
        };

        const config = particleConfigs[level] || particleConfigs[2];

        if (config.shouldStop) {
            window.particleSystem.stopAnimation();
        } else {
            window.particleSystem.startAnimation();
            window.particleSystem.setReducedSpeed?.(config.speed);
            window.particleSystem.setReducedOpacity?.(config.opacity);
        }
    }

    removeMotionReduction() {
        const root = document.documentElement;
        root.removeAttribute('data-reduced-motion');

        if (window.particleSystem && window.themeManager?.particlesEnabled) {
            window.particleSystem.startAnimation?.();
            window.particleSystem.setNormalSpeed?.();
            window.particleSystem.setNormalOpacity?.();
        }

        this.logger.debug('Reducción de movimiento removida');
    }
}