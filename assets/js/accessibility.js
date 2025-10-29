class AccessibilityManager {
    constructor() {
        this.settings = this.loadSettings();
        this.init();
    }

    loadSettings() {
        return JSON.parse(localStorage.getItem('accessibilitySettings')) || {
            reducedMotion: false,
            motionIntensity: 3,
            dyslexiaMode: false,
            dyslexiaIntensity: 3,
            readingMode: false,
            readingIntensity: 3,
            photophobiaMode: false,
            colorTemperature: 5,
            brightness: 5,
            refreshRate: 5,
            fontSize: 3,
            fontSizeEnabled: false
        };
    }

    saveSettings() {
        localStorage.setItem('accessibilitySettings', JSON.stringify(this.settings));
        this.applyAllSettings();
    }

    init() {
        this.setupEventListeners();
        this.applyAllSettings();
        this.updateUI();
        console.log('♿ AccessibilityManager inicializado');
    }

    setupEventListeners() {
        // Configurar todos los controles
        this.setupToggle('reduced-motion-toggle', 'reducedMotion', () => {
            this.toggleIntensityControl('motion-intensity-control', this.settings.reducedMotion);
            this.applyMotionSettings();
        });

        this.setupToggleWithIntensity('dyslexia-mode-toggle', 'dyslexia-intensity', 'dyslexiaMode', 'dyslexiaIntensity');
        this.setupToggleWithIntensity('reading-mode-toggle', 'reading-intensity', 'readingMode', 'readingIntensity');
        this.setupToggleWithIntensity('font-size-toggle', 'font-size', 'fontSizeEnabled', 'fontSize');

        // Nuevos controles para fotofobia - CORREGIDO
        this.setupPhotophobiaControls();
    }

    setupPhotophobiaControls() {
        const toggle = document.getElementById('photophobia-mode-toggle');
        const container = document.getElementById('photophobia-controls');

        if (toggle && container) {
            toggle.checked = this.settings.photophobiaMode;
            container.style.display = this.settings.photophobiaMode ? 'block' : 'none';

            toggle.addEventListener('change', (e) => {
                this.settings.photophobiaMode = e.target.checked;
                container.style.display = e.target.checked ? 'block' : 'none';
                this.applyPhotophobiaSettings();
                this.saveSettings();
            });

            // Configurar sliders de fotofobia - CORREGIDO: usar arrow functions
            this.setupSlider('color-temperature', 'colorTemperature', () => {
                this.updateColorTemperature();
            });
            this.setupSlider('brightness', 'brightness', () => {
                this.updateBrightness();
            });
            this.setupSlider('refresh-rate', 'refreshRate', () => {
                this.updateRefreshRate();
            });
        } else {
            console.warn('❌ Controles de fotofobia no encontrados en el DOM');
        }
    }

    setupSlider(sliderId, settingKey, onChange) {
        const slider = document.getElementById(sliderId);
        const sliderContainer = slider?.closest('.slider-container');
        const valueDisplay = sliderContainer?.querySelector('.slider-value');

        if (slider && valueDisplay) {
            slider.value = this.settings[settingKey];
            valueDisplay.textContent = this.settings[settingKey];

            slider.addEventListener('input', (e) => {
                this.settings[settingKey] = parseInt(e.target.value);
                valueDisplay.textContent = e.target.value;
                if (onChange) onChange();
                this.saveSettings();
            });
        } else {
            console.warn(`❌ Slider no encontrado: ${sliderId}`);
        }
    }

    setupToggle(toggleId, settingKey, onChange) {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
            toggle.checked = this.settings[settingKey];
            toggle.addEventListener('change', (e) => {
                this.settings[settingKey] = e.target.checked;
                if (onChange) onChange();
                this.saveSettings();
                this.updateUI();
            });
        } else {
            console.warn(`❌ Toggle no encontrado: ${toggleId}`);
        }
    }

    setupToggleWithIntensity(toggleId, sliderId, toggleKey, sliderKey) {
        const toggle = document.getElementById(toggleId);
        const slider = document.getElementById(sliderId);
        const sliderContainer = slider?.closest('.intensity-control');
        const valueDisplay = sliderContainer?.querySelector('.slider-value');

        if (toggle && slider && valueDisplay && sliderContainer) {
            sliderContainer.style.display = 'none';

            toggle.checked = this.settings[toggleKey];
            slider.value = this.settings[sliderKey];
            valueDisplay.textContent = this.settings[sliderKey];

            toggle.addEventListener('change', (e) => {
                this.settings[toggleKey] = e.target.checked;
                this.toggleIntensityControl(sliderContainer, e.target.checked);
                this.applySetting(toggleKey);
                this.saveSettings();
            });

            slider.addEventListener('input', (e) => {
                this.settings[sliderKey] = parseInt(e.target.value);
                valueDisplay.textContent = e.target.value;
                this.applySetting(sliderKey);
                this.saveSettings();
            });
        } else {
            console.warn(`❌ Toggle con intensidad no encontrado: ${toggleId}`);
        }
    }

    toggleIntensityControl(controlElement, show) {
        if (controlElement) {
            controlElement.style.display = show ? 'flex' : 'none';
        }
    }

    applyAllSettings() {
        Object.keys(this.settings).forEach(key => this.applySetting(key));
        this.updateUI();
    }

    applySetting(key) {
        const root = document.documentElement;

        switch(key) {
            case 'reducedMotion':
            case 'motionIntensity':
                this.applyMotionSettings();
                break;
            case 'dyslexiaMode':
                root.setAttribute('data-dyslexia-mode', this.settings.dyslexiaMode);
                break;
            case 'dyslexiaIntensity':
                root.setAttribute('data-dyslexia-intensity', this.settings.dyslexiaIntensity);
                break;
            case 'readingMode':
                root.setAttribute('data-reading-mode', this.settings.readingMode);
                if (this.settings.readingMode) {
                    this.forceReadingTheme();
                } else {
                    this.restoreOriginalTheme();
                }
                break;
            case 'readingIntensity':
                root.setAttribute('data-reading-intensity', this.settings.readingIntensity);
                break;
            case 'photophobiaMode':
            case 'colorTemperature':
            case 'brightness':
            case 'refreshRate':
                this.applyPhotophobiaSettings();
                break;
            case 'fontSize':
            case 'fontSizeEnabled':
                if (this.settings.fontSizeEnabled) {
                    root.setAttribute('data-font-size', this.settings.fontSize);
                } else {
                    root.removeAttribute('data-font-size');
                }
                break;
        }
    }

    applyMotionSettings() {
        const root = document.documentElement;

        if (this.settings.reducedMotion) {
            root.setAttribute('data-reduced-motion', this.settings.motionIntensity.toString());

            // Detener animaciones de partículas si están activas
            if (window.particleSystem && this.settings.motionIntensity <= 2) {
                window.particleSystem.stopAnimation();
            } else if (window.particleSystem && this.settings.motionIntensity > 2) {
                window.particleSystem.startAnimation();
            }

            console.log('🚫 Movimiento reducido activado:', this.settings.motionIntensity);
        } else {
            root.removeAttribute('data-reduced-motion');
            // Reanudar partículas si están habilitadas
            if (window.particleSystem && window.themeManager?.particlesEnabled) {
                window.particleSystem.startAnimation();
            }
            console.log('🎬 Movimiento normal');
        }
    }

    applyPhotophobiaSettings() {
        const root = document.documentElement;

        if (this.settings.photophobiaMode) {
            root.setAttribute('data-photophobia-mode', 'true');

            // Aplicar filtros basados en los sliders
            const filters = [];

            // Temperatura de color (0=frio, 10=calido)
            const tempValue = (this.settings.colorTemperature - 5) * 12; // -60 a 60 grados
            filters.push(`hue-rotate(${tempValue}deg)`);

            // Brillo (0=oscuro, 10=brillante)
            const brightnessValue = 0.7 + (this.settings.brightness * 0.03); // 0.7 a 1.0
            filters.push(`brightness(${brightnessValue})`);

            // Contraste mejorado para fotofobia
            filters.push('contrast(1.05)');

            // Aplicar filtros al body
            document.body.style.filter = filters.join(' ');

            // Controlar frecuencia de refresco
            if (this.settings.refreshRate <= 3) {
                root.setAttribute('data-low-refresh', 'true');
                // Reducir FPS de animaciones
                if (window.particleSystem && window.particleSystem.setLowRefreshRate) {
                    window.particleSystem.setLowRefreshRate(true);
                }
            } else {
                root.removeAttribute('data-low-refresh');
                if (window.particleSystem && window.particleSystem.setLowRefreshRate) {
                    window.particleSystem.setLowRefreshRate(false);
                }
            }

            console.log('🕶️ Modo fotofobia activado:', {
                temperatura: this.settings.colorTemperature,
                brillo: this.settings.brightness,
                refresco: this.settings.refreshRate
            });

        } else {
            root.removeAttribute('data-photophobia-mode');
            root.removeAttribute('data-low-refresh');
            document.body.style.filter = '';

            if (window.particleSystem && window.particleSystem.setLowRefreshRate) {
                window.particleSystem.setLowRefreshRate(false);
            }

            console.log('👁️ Modo fotofobia desactivado');
        }
    }

    // Métodos para fotofobia - CORREGIDOS: usar arrow functions o bind
    updateColorTemperature = () => {
        if (this.settings.photophobiaMode) {
            this.applyPhotophobiaSettings();
        }
    }

    updateBrightness = () => {
        if (this.settings.photophobiaMode) {
            this.applyPhotophobiaSettings();
        }
    }

    updateRefreshRate = () => {
        if (this.settings.photophobiaMode) {
            this.applyPhotophobiaSettings();

            // Afectar animaciones de partículas
            if (window.particleSystem) {
                if (this.settings.refreshRate <= 3) {
                    if (window.particleSystem.setLowRefreshRate) {
                        window.particleSystem.setLowRefreshRate(true);
                    }
                } else {
                    if (window.particleSystem.setLowRefreshRate) {
                        window.particleSystem.setLowRefreshRate(false);
                    }
                }
            }
        }
    }

    forceReadingTheme() {
        // Aplicar tema optimizado para lectura
        document.documentElement.style.setProperty('--bg-primary', '#2d3748');
        document.documentElement.style.setProperty('--bg-secondary', '#4a5568');
        document.documentElement.style.setProperty('--text-primary', '#e2e8f0');
        document.documentElement.style.setProperty('--text-secondary', '#cbd5e0');
        document.documentElement.style.setProperty('--border-color', '#4a5568');

        // Aplicar filtro sepia suave basado en intensidad
        const intensity = this.settings.readingIntensity / 10;
        document.body.style.filter = `sepia(${intensity * 0.5}) brightness(${0.9 + intensity * 0.1}) contrast(1.1)`;

        console.log('📖 Modo lectura activado');
    }

    restoreOriginalTheme() {
        // Restaurar tema original cuando se desactiva modo lectura
        document.body.style.filter = '';
        if (window.themeManager) {
            window.themeManager.applyTheme(window.themeManager.currentTheme);
        }
        console.log('📖 Modo lectura desactivado');
    }

    updateUI() {
        // Actualizar controles de intensidad basado en estados de toggle
        this.toggleIntensityControl(
            document.getElementById('motion-intensity-control'),
            this.settings.reducedMotion
        );

        const dyslexiaControl = document.getElementById('dyslexia-intensity')?.closest('.intensity-control');
        if (dyslexiaControl) {
            this.toggleIntensityControl(dyslexiaControl, this.settings.dyslexiaMode);
        }

        const readingControl = document.getElementById('reading-intensity')?.closest('.intensity-control');
        if (readingControl) {
            this.toggleIntensityControl(readingControl, this.settings.readingMode);
        }

        const fontSizeControl = document.getElementById('font-size')?.closest('.intensity-control');
        if (fontSizeControl) {
            this.toggleIntensityControl(fontSizeControl, this.settings.fontSizeEnabled);
        }

        // Actualizar controles de fotofobia
        const photophobiaContainer = document.getElementById('photophobia-controls');
        if (photophobiaContainer) {
            photophobiaContainer.style.display = this.settings.photophobiaMode ? 'block' : 'none';
        }
    }
}

// Inicializar con manejo de errores
document.addEventListener('DOMContentLoaded', () => {
    try {
        new AccessibilityManager();
        console.log('✅ AccessibilityManager inicializado correctamente');
    } catch (error) {
        console.error('❌ Error inicializando AccessibilityManager:', error);
    }
});