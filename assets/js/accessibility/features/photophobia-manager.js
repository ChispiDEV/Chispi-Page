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
            const tempValue = (this.settings.colorTemperature - 5) * 12;
            const brightnessValue = 0.7 + (this.settings.brightness * 0.03);

            filters.push(`hue-rotate(${tempValue}deg)`);
            filters.push(`brightness(${brightnessValue})`);
            filters.push('contrast(1.05)');

            document.body.style.filter = filters.join(' ');

            this.logger.info('Configuración de fotofobia aplicada', this.settings);
        } else {
            root.removeAttribute('data-photophobia-mode');
            document.body.style.filter = '';
            this.logger.info('Fotofobia desactivada');
        }
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