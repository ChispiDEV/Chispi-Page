// assets/js/accessibility/core/base-feature-manager.js

export class BaseFeatureManager {
    constructor(name, logger) {
        this.name = name;
        this.logger = logger;
        this.settings = {};
        this.isInitialized = false;
    }

    loadSettings() {
        try {
            const allSettings = JSON.parse(localStorage.getItem('accessibility_settings') || '{}');
            this.settings = {
                ...this.getDefaultSettings(),
                ...allSettings[this.name]
            };
            this.logger.debug(`Configuración cargada para ${this.name}`, this.settings);
        } catch (error) {
            this.logger.error(`Error cargando configuración para ${this.name}`, error);
            this.settings = this.getDefaultSettings();
        }
    }

    saveSettings() {
        try {
            const allSettings = JSON.parse(localStorage.getItem('accessibility_settings') || '{}');
            allSettings[this.name] = this.settings;
            localStorage.setItem('accessibility_settings', JSON.stringify(allSettings));
            this.logger.debug(`Configuración guardada para ${this.name}`, this.settings);
        } catch (error) {
            this.logger.error(`Error guardando configuración para ${this.name}`, error);
        }
    }

    getDefaultSettings() {
        return {
            enabled: false,
            intensity: 3
        };
    }

    getStatus() {
        return {
            enabled: this.settings.enabled || false,
            settings: this.settings,
            initialized: this.isInitialized
        };
    }

    async initialize() {
        try {
            this.loadSettings();
            await this.setupEventListeners();
            this.applySettings();
            this.isInitialized = true;
            this.logger.success(`${this.name} inicializado correctamente`);
        } catch (error) {
            this.logger.error(`Error inicializando ${this.name}`, error);
            throw error;
        }
    }

    enable(intensity = null) {
        this.settings.enabled = true;
        if (intensity !== null) {
            this.settings.intensity = intensity;
        }
        this.applySettings();
        this.saveSettings();
        this.logger.info(`${this.name} activado`, { intensity: this.settings.intensity });
    }

    disable() {
        this.settings.enabled = false;
        this.applySettings();
        this.saveSettings();
        this.logger.info(`${this.name} desactivado`);
    }

    setIntensity(intensity) {
        this.settings.intensity = intensity;
        if (this.settings.enabled) {
            this.applySettings();
            this.saveSettings();
        }
        this.logger.debug(`Intensidad de ${this.name} actualizada`, { intensity });
    }

    // Métodos que deben ser implementados por las clases hijas
    async setupEventListeners() {
        throw new Error('Método setupEventListeners debe ser implementado');
    }

    applySettings() {
        throw new Error('Método applySettings debe ser implementado');
    }

    // Métodos utilitarios comunes
    setupToggle(toggleId, onChange = null) {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
            toggle.checked = this.settings.enabled;
            toggle.addEventListener('change', (e) => {
                this.settings.enabled = e.target.checked;
                if (onChange) onChange(e);
                this.applySettings();
                this.saveSettings();
            });
            return true;
        }
        this.logger.warn(`Toggle no encontrado: ${toggleId}`);
        return false;
    }

    setupSlider(sliderId, settingKey, onChange = null) {
        const slider = document.getElementById(sliderId);
        const container = slider?.closest('.slider-container, .intensity-control');
        const valueDisplay = container?.querySelector('.slider-value');

        if (slider && valueDisplay) {
            slider.value = this.settings[settingKey] || this.settings.intensity;
            valueDisplay.textContent = this.settings[settingKey] || this.settings.intensity;

            slider.addEventListener('input', (e) => {
                this.settings[settingKey] = parseInt(e.target.value);
                valueDisplay.textContent = e.target.value;
                if (onChange) onChange(e);
                this.applySettings();
                this.saveSettings();
            });
            return true;
        }
        this.logger.warn(`Slider no encontrado: ${sliderId}`);
        return false;
    }

    toggleElementVisibility(elementId, show) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = show ? 'block' : 'none';
            return true;
        }
        return false;
    }
}