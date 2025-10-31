// assets/js/accessibility/features/motion-manager.js

import { BaseFeatureManager } from '../core/base-feature-manager.js';

export class MotionManager extends BaseFeatureManager {
    constructor(logger) {
        super('motion', logger);
        this.settings = {
            enabled: false,
            intensity: 3
        };
    }

    getDefaultSettings() {
        return {
            enabled: false,
            intensity: 3, // Mantener 3 como valor por defecto para coincidir con el constructor
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

    // MÉTODO FALTANTE - AÑADIR ESTO
    getIntensityLevel() {
        // Convertir intensidad del slider (1-5) a niveles de reducción (1-4)
        const intensity = this.settings.intensity || 3;

        const levelMap = {
            1: 1, // Reducción leve
            2: 2, // Reducción media  
            3: 2, // Reducción media (valor por defecto)
            4: 3, // Reducción alta
            5: 4  // Sin movimiento
        };

        return levelMap[intensity] || 2;
    }

    // MÉTODO FALTANTE - AÑADIR ESTO
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
            this.applyMotionReduction();
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

        this.logger.debug('Reducción de movimiento removida');
    }

    // Métodos adicionales para mejor control
    enable(intensity = null) {
        this.settings.enabled = true;
        if (intensity !== null) {
            this.settings.intensity = this.validateIntensity(intensity);
        }
        this.applySettings();
        this.saveSettings();
        this.logger.info('Movimiento reducido activado', {
            intensity: this.settings.intensity
        });
    }

    disable() {
        this.settings.enabled = false;
        this.applySettings();
        this.saveSettings();
        this.logger.info('Movimiento reducido desactivado');
    }

    setIntensity(intensity) {
        this.settings.intensity = this.validateIntensity(intensity);
        if (this.settings.enabled) {
            this.applySettings();
            this.saveSettings();
        }
        this.logger.info('Intensidad de movimiento actualizada', {
            intensity: this.settings.intensity
        });
    }

    validateIntensity(intensity) {
        return Math.min(5, Math.max(1, parseInt(intensity)));
    }
}