// Gestión simple de accesibilidad
class AccessibilityManager {
    constructor() {
        this.settings = this.loadSettings();
        this.motionLevels = this.getMotionLevels();
        this.init();
    }
    
    getMotionLevels() {
        return {
            0: { // Normal
                animations: 'normal',
                transitions: 'normal',
                particleSpeed: 1,
                hoverEffects: 'normal'
            },
            1: { // Reducción leve
                animations: 'reduced',
                transitions: '0.3s',
                particleSpeed: 0.7,
                hoverEffects: 'reduced'
            },
            2: { // Reducción media
                animations: 'minimal',
                transitions: '0.15s',
                particleSpeed: 0.4,
                hoverEffects: 'minimal'
            },
            3: { // Reducción alta
                animations: 'essential',
                transitions: '0.05s',
                particleSpeed: 0.2,
                hoverEffects: 'none'
            },
            4: { // Sin movimiento
                animations: 'none',
                transitions: 'none',
                particleSpeed: 0,
                hoverEffects: 'none'
            }
        };
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
        // Movimiento reducido con intensidad
        this.setupMotionControls();

        // Configurar otros controles
        this.setupToggleWithIntensity('dyslexia-mode-toggle', 'dyslexia-intensity', 'dyslexiaMode', 'dyslexiaIntensity');
        this.setupToggleWithIntensity('reading-mode-toggle', 'reading-intensity', 'readingMode', 'readingIntensity');
        this.setupToggleWithIntensity('photophobia-mode-toggle', 'photophobia-intensity', 'photophobiaMode', 'photophobiaIntensity');
        this.setupToggleWithIntensity('font-size-toggle', 'font-size', 'fontSizeEnabled', 'fontSize');
    }


    setupMotionControls() {
        const toggle = document.getElementById('reduced-motion-toggle');
        const slider = document.getElementById('motion-intensity');
        const valueDisplay = slider?.nextElementSibling;

        if (toggle && slider && valueDisplay) {
            toggle.checked = this.settings.reducedMotion;
            slider.value = this.settings.motionIntensity;
            valueDisplay.textContent = this.settings.motionIntensity;

            // Habilitar/deshabilitar slider según el toggle
            slider.disabled = !this.settings.reducedMotion;

            toggle.addEventListener('change', (e) => {
                this.settings.reducedMotion = e.target.checked;
                slider.disabled = !e.target.checked;

                // Si se desactiva el movimiento reducido, resetear intensidad
                if (!e.target.checked) {
                    this.settings.motionIntensity = 0;
                    slider.value = 0;
                    valueDisplay.textContent = '0';
                }

                this.applyMotionSettings();
                this.saveSettings();
            });

            slider.addEventListener('input', (e) => {
                this.settings.motionIntensity = parseInt(e.target.value);
                valueDisplay.textContent = e.target.value;
                this.applyMotionSettings();
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

            // Habilitar/deshabilitar slider según el toggle
            slider.disabled = !this.settings[toggleKey];

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

    applyMotionSettings() {
        const root = document.documentElement;
        const motionLevel = this.motionLevels[this.settings.motionIntensity];

        if (!this.settings.reducedMotion || this.settings.motionIntensity === 0) {
            // Movimiento normal
            root.style.setProperty('--animation-duration', '1s');
            root.style.setProperty('--transition-duration', '0.3s');
            root.style.setProperty('--particle-speed', '1');
            root.removeAttribute('data-reduced-motion');
        } else {
            // Aplicar niveles de reducción
            root.setAttribute('data-reduced-motion', this.settings.motionIntensity.toString());
            root.style.setProperty('--animation-duration', this.getAnimationDuration(motionLevel.animations));
            root.style.setProperty('--transition-duration', motionLevel.transitions);
            root.style.setProperty('--particle-speed', motionLevel.particleSpeed.toString());

            // Aplicar a elementos específicos
            this.applyMotionToElements(motionLevel);
        }
    }

    getAnimationDuration(level) {
        const durations = {
            'normal': '1s',
            'reduced': '0.5s',
            'minimal': '0.2s',
            'essential': '0.1s',
            'none': '0s'
        };
        return durations[level] || '1s';
    }

    applyMotionToElements(motionLevel) {
        // Aplicar a partículas si existen
        if (window.particleSystem) {
            window.particleSystem.setSpeed(motionLevel.particleSpeed);
        }

        // Aplicar a efectos hover
        const hoverElements = document.querySelectorAll('[data-hover-effect]');
        hoverElements.forEach(el => {
            if (motionLevel.hoverEffects === 'none') {
                el.style.transition = 'none';
            } else if (motionLevel.hoverEffects === 'minimal') {
                el.style.transitionDuration = '0.1s';
            }
        });
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    new AccessibilityManager();
});