// Gestión simple de accesibilidad
class AccessibilityManager {
    constructor() {
        this.settings = this.loadSettings();
        this.init();
    }

    loadSettings() {
        return JSON.parse(localStorage.getItem('accessibilitySettings')) || {
            reducedMotion: false,
            dyslexiaMode: false,
            dyslexiaIntensity: 3,
            readingMode: false,
            readingIntensity: 3,
            photophobiaMode: false,
            photophobiaIntensity: 3,
            fontSize: 3
        };
    }

    saveSettings() {
        localStorage.setItem('accessibilitySettings', JSON.stringify(this.settings));
    }

    init() {
        this.setupEventListeners();
        this.applyAllSettings();
    }

    setupEventListeners() {
        // Configurar todos los toggles y sliders
        this.setupToggle('reduced-motion-toggle', 'reducedMotion');
        this.setupToggleWithIntensity('dyslexia-mode-toggle', 'dyslexia-intensity', 'dyslexiaMode', 'dyslexiaIntensity');
        this.setupToggleWithIntensity('reading-mode-toggle', 'reading-intensity', 'readingMode', 'readingIntensity');
        this.setupToggleWithIntensity('photophobia-mode-toggle', 'photophobia-intensity', 'photophobiaMode', 'photophobiaIntensity');
        this.setupToggleWithIntensity('font-size-toggle', 'font-size', 'fontSizeEnabled', 'fontSize');
    }

    setupToggle(toggleId, settingKey) {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
            toggle.checked = this.settings[settingKey];
            toggle.addEventListener('change', (e) => {
                this.settings[settingKey] = e.target.checked;
                this.applySetting(settingKey);
                this.saveSettings();
            });
        }
    }

    setupToggleWithIntensity(toggleId, sliderId, toggleKey, sliderKey) {
        const toggle = document.getElementById(toggleId);
        const slider = document.getElementById(sliderId);
        const valueDisplay = slider?.nextElementSibling;

        if (toggle && slider && valueDisplay) {
            toggle.checked = this.settings[toggleKey];
            slider.value = this.settings[sliderKey];
            valueDisplay.textContent = this.settings[sliderKey];

            toggle.addEventListener('change', (e) => {
                this.settings[toggleKey] = e.target.checked;
                this.applySetting(toggleKey);
                this.saveSettings();
            });

            slider.addEventListener('input', (e) => {
                this.settings[sliderKey] = parseInt(e.target.value);
                valueDisplay.textContent = e.target.value;
                this.applySetting(sliderKey);
                this.saveSettings();
            });
        }
    }

    applyAllSettings() {
        Object.keys(this.settings).forEach(key => this.applySetting(key));
    }

    applySetting(key) {
        const root = document.documentElement;

        switch(key) {
            case 'reducedMotion':
                root.setAttribute('data-reduced-motion', this.settings.reducedMotion);
                break;
            case 'dyslexiaMode':
                root.setAttribute('data-dyslexia-mode', this.settings.dyslexiaMode);
                break;
            case 'dyslexiaIntensity':
                root.setAttribute('data-dyslexia-intensity', this.settings.dyslexiaIntensity);
                break;
            case 'readingMode':
                root.setAttribute('data-reading-mode', this.settings.readingMode);
                break;
            case 'readingIntensity':
                root.setAttribute('data-reading-intensity', this.settings.readingIntensity);
                break;
            case 'photophobiaMode':
                root.setAttribute('data-photophobia-mode', this.settings.photophobiaMode);
                break;
            case 'photophobiaIntensity':
                root.setAttribute('data-photophobia-intensity', this.settings.photophobiaIntensity);
                break;
            case 'fontSize':
                root.setAttribute('data-font-size', this.settings.fontSize);
                break;
        }
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    new AccessibilityManager();
});