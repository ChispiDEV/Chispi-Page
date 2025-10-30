// assets/js/accessibility/features/photophobia-manager.js

import { BaseFeatureManager } from '../core/base-feature-manager.js';

export class PhotophobiaManager extends BaseFeatureManager {
    constructor(logger) {
        super('photophobia', logger);
        this.settings = {
            enabled: false,
            colorTemperature: 5,
            brightness: 5,
            refreshRate: 7  // Valor por defecto más usable
        };
    }

    async initialize() {
        this.loadSettings();
        this.setupEventListeners();
        this.applySettings(); // Aplicar settings al inicializar
        this.logger.info('PhotophobiaManager inicializado');
    }

    setupEventListeners() {
        const toggle = document.getElementById('photophobia-mode-toggle');
        const container = document.getElementById('photophobia-controls');

        if (toggle && container) {
            toggle.checked = this.settings.enabled;
            container.style.display = this.settings.enabled ? 'block' : 'none';

            toggle.addEventListener('change', (e) => {
                this.settings.enabled = e.target.checked;
                container.style.display = e.target.checked ? 'block' : 'none';
                this.applySettings();
                this.saveSettings();
            });

            this.setupSlider('color-temperature', 'colorTemperature');
            this.setupSlider('brightness', 'brightness');
            this.setupSlider('refresh-rate', 'refreshRate');
        }
    }

    setupSlider(sliderId, settingKey) {
        const slider = document.getElementById(sliderId);
        const valueDisplay = slider?.closest('.slider-container')?.querySelector('.slider-value');

        if (slider && valueDisplay) {
            slider.value = this.settings[settingKey];
            valueDisplay.textContent = this.settings[settingKey];

            slider.addEventListener('input', (e) => {
                this.settings[settingKey] = parseInt(e.target.value);
                valueDisplay.textContent = e.target.value;
                this.applySettings();
                this.saveSettings();
            });
        }
    }

    applySettings() {
        const root = document.documentElement;

        if (this.settings.enabled) {
            root.setAttribute('data-photophobia-mode', 'true');
            this.applyCustomFilters();
            this.applyRefreshRateEffects();

            this.logger.info('Modo fotofobia activado', this.settings);
        } else {
            root.removeAttribute('data-photophobia-mode');
            root.removeAttribute('data-photophobia-intensity');
            this.removeCustomFilters();
            this.removeRefreshRateEffects();
            this.logger.info('Modo fotofobia desactivado');
        }
    }

    applyCustomFilters() {
        // Los filtros de temperatura y brillo necesitan JS porque son dinámicos
        const filters = [];

        // Temperatura de color (0=frio, 10=calido)
        const tempValue = (this.settings.colorTemperature - 5) * 12; // -60 a 60 grados
        if (tempValue !== 0) {
            filters.push(`hue-rotate(${tempValue}deg)`);
        }

        // Brillo (0=oscuro, 10=brillante)
        const brightnessValue = 0.7 + (this.settings.brightness * 0.03); // 0.7 a 1.0
        if (brightnessValue !== 1.0) {
            filters.push(`brightness(${brightnessValue})`);
        }

        // Aplicar filtros al body solo si hay cambios
        if (filters.length > 0) {
            document.body.style.filter = filters.join(' ');
        } else {
            document.body.style.filter = '';
        }
    }

    applyRefreshRateEffects() {
        const root = document.documentElement;

        // Remover atributos previos de refresh rate
        this.removeRefreshRateEffects();

        // Aplicar el nivel de refresh rate específico (0-10)
        if (this.settings.enabled) {
            root.setAttribute('data-refresh-rate', this.settings.refreshRate.toString());

            // Log informativo sobre el nivel aplicado
            const levelInfo = this.getRefreshRateLevelInfo(this.settings.refreshRate);
            this.logger.info('Refresh rate aplicado', {
                level: this.settings.refreshRate,
                description: levelInfo.description,
                effects: levelInfo.effects
            });
        }
    }

    removeRefreshRateEffects() {
        const root = document.documentElement;
        root.removeAttribute('data-refresh-rate');
        root.removeAttribute('data-low-refresh');
        root.removeAttribute('data-reduced-motion');
    }

    removeCustomFilters() {
        document.body.style.filter = '';
        this.removeRefreshRateEffects();
    }

    getRefreshRateLevelInfo(level) {
        const levels = {
            0: {
                description: 'Máxima reducción - Sin animaciones',
                effects: ['Elimina todas las animaciones', 'Desactiva elementos dinámicos', 'Cursor sin parpadeo']
            },
            1: {
                description: 'Reducción extrema - Mínimo movimiento',
                effects: ['Animaciones casi eliminadas', 'Elementos dinámicos ocultos', 'Transiciones mínimas']
            },
            2: {
                description: 'Reducción crítica - Movimiento muy limitado',
                effects: ['Animaciones muy reducidas', 'Efectos hover eliminados', 'Videos optimizados']
            },
            3: {
                description: 'Reducción alta - Movimiento limitado',
                effects: ['Animaciones significativamente reducidas', 'Efectos hover mínimos', 'Partículas desactivadas']
            },
            4: {
                description: 'Reducción media-alta - Movimiento controlado',
                effects: ['Animaciones reducidas a 0.1s', 'Efectos hover reducidos', 'Partículas muy atenuadas']
            },
            5: {
                description: 'Reducción media - Movimiento moderado',
                effects: ['Animaciones a 0.1s', 'Transiciones controladas', 'Partículas atenuadas']
            },
            6: {
                description: 'Reducción baja - Movimiento suave',
                effects: ['Animaciones a 0.3s', 'Efectos hover suaves', 'Partículas limitadas']
            },
            7: {
                description: 'Reducción mínima - Movimiento casi normal',
                effects: ['Animaciones a 0.5s', 'Transiciones normales', 'Partículas visibles']
            },
            8: {
                description: 'Casi normal - Movimiento fluido',
                effects: ['Animaciones normales', 'Todos los efectos activos', 'Experiencia completa']
            },
            9: {
                description: 'Normal - Sin restricciones',
                effects: ['Animaciones completas', 'Todos los efectos', 'Máxima fluidez']
            },
            10: {
                description: 'Máximo - Experiencia completa',
                effects: ['Sin restricciones', 'Animaciones a máxima velocidad', 'Todos los efectos activos']
            }
        };

        return levels[level] || levels[7];
    }

    enable(intensity = 5) {
        this.settings.enabled = true;
        this.settings.colorTemperature = intensity;
        this.settings.brightness = intensity;
        this.settings.refreshRate = Math.max(3, intensity); // Refresh rate mínimo 3 para activación automática
        this.applySettings();
        this.saveSettings();
        this.logger.info('Fotofobia activada', {
            intensity,
            refreshRate: this.settings.refreshRate
        });
    }

    disable() {
        this.settings.enabled = false;
        this.applySettings();
        this.saveSettings();
        this.logger.info('Fotofobia desactivada');
    }

    // Método específico para ajustar solo el refresh rate
    setRefreshRate(rate) {
        this.settings.refreshRate = Math.min(10, Math.max(0, parseInt(rate)));
        if (this.settings.enabled) {
            this.applyRefreshRateEffects();
            this.saveSettings();
        }
        this.logger.info('Refresh rate actualizado', { rate: this.settings.refreshRate });
    }

    // Método para obtener el estado actual del refresh rate
    getRefreshRateState() {
        return {
            level: this.settings.refreshRate,
            info: this.getRefreshRateLevelInfo(this.settings.refreshRate),
            enabled: this.settings.enabled
        };
    }
}