// assets/js/accessibility/features/photophobia-manager.js

import { BaseFeatureManager } from '../core/base-feature-manager.js';

export class PhotophobiaManager extends BaseFeatureManager {
    constructor(logger) {
        super('photophobia', logger);
        this.settings = {
            enabled: false,
            colorTemperature: 5,
            brightness: 5,
            refreshRate: 5
        };
    }

    async initialize() {
        this.loadSettings();
        this.setupEventListeners();
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

            const filters = [];
            root.setAttribute('data-photophobia-intensity', this.settings.intensity.toString());

            this.applyCustomFilters();

            this.logger.info('Modo fotofobia activado', this.settings);
        } else {
            root.removeAttribute('data-photophobia-mode');
            root.removeAttribute('data-photophobia-intensity');
            this.removeCustomFilters();
            this.logger.info('Modo fotofobia desactivado');
        }
    }

    applyCustomFilters() {
        // Los filtros de temperatura y brillo necesitan JS porque son dinámicos
        const filters = [];

        // Temperatura de color (0=frio, 10=calido)
        const tempValue = (this.settings.colorTemperature - 5) * 12; // -60 a 60 grados
        filters.push(`hue-rotate(${tempValue}deg)`);

        // Brillo (0=oscuro, 10=brillante)
        const brightnessValue = 0.7 + (this.settings.brightness * 0.03); // 0.7 a 1.0
        filters.push(`brightness(${brightnessValue})`);

        // Aplicar filtros al body
        document.body.style.filter = filters.join(' ');
    }

    removeCustomFilters() {
        document.body.style.filter = '';
    }
    
    enable(intensity = 5) {
        this.settings.enabled = true;
        this.settings.colorTemperature = intensity;
        this.settings.brightness = intensity;
        this.applySettings();
        this.saveSettings();
        this.logger.info('Fotofobia activada', { intensity });
    }

    disable() {
        this.settings.enabled = false;
        this.applySettings();
        this.saveSettings();
        this.logger.info('Fotofobia desactivada');
    }
}