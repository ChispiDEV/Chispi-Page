// Gestión mejorada de accesibilidad
class AccessibilityManager {
    constructor() {
        this.settings = this.loadSettings();
        this.init();
    }

    loadSettings() {
        return JSON.parse(localStorage.getItem('accessibilitySettings')) || {
            reducedMotion: false,
            motionIntensity: 0,
            dyslexiaMode: false,
            dyslexiaIntensity: 3,
            readingMode: false,
            readingIntensity: 3,
            photophobiaMode: false,
            photophobiaIntensity: 3,
            fontSize: 3,
            fontSizeEnabled: false
        };
    }

    saveSettings() {
        localStorage.setItem('accessibilitySettings', JSON.stringify(this.settings));
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
        this.setupToggleWithIntensity('photophobia-mode-toggle', 'photophobia-intensity', 'photophobiaMode', 'photophobiaIntensity');
        this.setupToggleWithIntensity('font-size-toggle', 'font-size', 'fontSizeEnabled', 'fontSize');
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
        }
    }

    setupToggleWithIntensity(toggleId, sliderId, toggleKey, sliderKey) {
        const toggle = document.getElementById(toggleId);
        const slider = document.getElementById(sliderId);
        const valueDisplay = slider?.nextElementSibling;
        const intensityControl = slider?.closest('.intensity-control');

        if (toggle && slider && valueDisplay && intensityControl) {
            // Ocultar control de intensidad inicialmente
            intensityControl.style.display = 'none';

            toggle.checked = this.settings[toggleKey];
            slider.value = this.settings[sliderKey];
            valueDisplay.textContent = this.settings[sliderKey];

            toggle.addEventListener('change', (e) => {
                this.settings[toggleKey] = e.target.checked;

                // Mostrar/ocultar control de intensidad
                this.toggleIntensityControl(intensityControl, e.target.checked);

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
                // Forzar tema gris-sepia cuando modo lectura está activo
                if (this.settings.readingMode) {
                    this.forceReadingTheme();
                }
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

        if (this.settings.reducedMotion && this.settings.motionIntensity > 0) {
            root.setAttribute('data-reduced-motion', this.settings.motionIntensity.toString());
        } else {
            root.removeAttribute('data-reduced-motion');
        }
    }

    forceReadingTheme() {
        // Aplicar tema optimizado para lectura
        document.documentElement.style.setProperty('--bg-primary', '#2d3748');
        document.documentElement.style.setProperty('--bg-secondary', '#4a5568');
        document.documentElement.style.setProperty('--text-primary', '#e2e8f0');
        document.documentElement.style.setProperty('--text-secondary', '#cbd5e0');
        document.documentElement.style.setProperty('--border-color', '#4a5568');

        // Aplicar filtro sepia suave
        document.body.style.filter = 'sepia(0.3) brightness(0.9) contrast(1.1)';
    }

    updateUI() {
        // Actualizar controles de intensidad basado en estados de toggle
        this.toggleIntensityControl(
            document.getElementById('motion-intensity-control'),
            this.settings.reducedMotion
        );

        this.toggleIntensityControl(
            document.getElementById('dyslexia-intensity').closest('.intensity-control'),
            this.settings.dyslexiaMode
        );

        this.toggleIntensityControl(
            document.getElementById('reading-intensity').closest('.intensity-control'),
            this.settings.readingMode
        );

        this.toggleIntensityControl(
            document.getElementById('photophobia-intensity').closest('.intensity-control'),
            this.settings.photophobiaMode
        );

        this.toggleIntensityControl(
            document.getElementById('font-size').closest('.intensity-control'),
            this.settings.fontSizeEnabled
        );
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    new AccessibilityManager();
});