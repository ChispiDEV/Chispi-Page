// assets/js/theme-manager.js - Sistema completo de temas
class ThemeManager {
    constructor() {
        this.availableThemes = [
            'light',
            'dark',
            'high-contrast',
            'gray-scale',
            'sepia',
            'reduced-motion'
        ];
        this.currentTheme = this.getSavedTheme() || this.getSystemTheme();
        this.particlesEnabled = true;

        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
        this.setupParticleThemes();

        console.log('🎨 Gestor de temas inicializado - Tema actual:', this.currentTheme);
    }

    getSavedTheme() {
        return localStorage.getItem('preferred-theme');
    }

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    applyTheme(theme) {
        if (!this.availableThemes.includes(theme)) {
            theme = 'light';
        }

        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('preferred-theme', theme);

        // Aplicar configuraciones específicas del tema
        this.applyThemeSpecifics(theme);

        // Notificar a otros componentes
        this.notifyThemeChange(theme);
    }

    applyThemeSpecifics(theme) {
        // Configuraciones específicas para cada tema
        const specifics = {
            'high-contrast': {
                particles: false,
                animations: 'reduce'
            },
            'dark': {
                particles: true,
                animations: 'normal'
            },
            'light': {
                particles: true,
                animations: 'normal'
            },
            'sepia': {
                particles: true,
                animations: 'normal'
            }
        };

        const config = specifics[theme] || specifics.light;

        // Aplicar configuración de partículas
        this.particlesEnabled = config.particles;
        this.toggleParticles(config.particles);

        // Aplicar preferencias de animación
        if (config.animations === 'reduce') {
            document.documentElement.style.setProperty('--reduce-motion', 'reduce');
        } else {
            document.documentElement.style.removeProperty('--reduce-motion');
        }
    }

    toggleParticles(enabled) {
        const particlesContainer = document.querySelector('.particles-container');
        if (particlesContainer) {
            particlesContainer.style.display = enabled ? 'block' : 'none';
        }

        if (window.particleSystem) {
            if (enabled && !window.particleSystem.isInitialized) {
                window.particleSystem.init();
            }
        }
    }

    setupParticleThemes() {
        // Configuraciones de partículas por tema
        const particleThemes = {
            'light': {
                colors: [
                    'rgba(60, 200, 143, 0.15)',
                    'rgba(51, 91, 154, 0.12)',
                    'rgba(87, 196, 220, 0.1)',
                    'rgba(40, 169, 123, 0.12)',
                    'rgba(255, 255, 255, 0.08)',
                    'rgba(200, 220, 255, 0.1)'
                ]
            },
            'dark': {
                colors: [
                    'rgba(60, 200, 143, 0.2)',
                    'rgba(51, 91, 154, 0.18)',
                    'rgba(87, 196, 220, 0.15)',
                    'rgba(40, 169, 123, 0.18)',
                    'rgba(255, 255, 255, 0.12)',
                    'rgba(200, 220, 255, 0.15)'
                ]
            },
            'sepia': {
                colors: [
                    'rgba(139, 109, 66, 0.2)',
                    'rgba(174, 136, 82, 0.18)',
                    'rgba(205, 170, 125, 0.15)',
                    'rgba(160, 120, 70, 0.16)',
                    'rgba(240, 220, 180, 0.12)',
                    'rgba(210, 180, 140, 0.14)'
                ]
            },
            'high-contrast': {
                colors: [
                    'rgba(255, 255, 255, 0.1)',
                    'rgba(255, 255, 255, 0.08)',
                    'rgba(255, 255, 255, 0.06)',
                    'rgba(255, 255, 255, 0.08)',
                    'rgba(255, 255, 255, 0.05)',
                    'rgba(255, 255, 255, 0.07)'
                ]
            }
        };

        window.particleThemes = particleThemes;
    }

    setupEventListeners() {
        // Escuchar cambios del sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.getSavedTheme()) { // Solo si el usuario no ha elegido manualmente
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });

        // Escuchar cambios de contraste
        window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
            if (e.matches && !this.getSavedTheme()) {
                this.applyTheme('high-contrast');
            }
        });
    }

    notifyThemeChange(theme) {
        // Disparar evento personalizado
        const event = new CustomEvent('themechange', {
            detail: { theme, particlesEnabled: this.particlesEnabled }
        });
        document.dispatchEvent(event);

        // Notificar a las partículas
        if (window.particleSystem && typeof window.particleSystem.onThemeChange === 'function') {
            window.particleSystem.onThemeChange(theme);
        }
    }

    // API pública
    setTheme(theme) {
        this.applyTheme(theme);
    }

    getTheme() {
        return this.currentTheme;
    }

    cycleThemes() {
        const currentIndex = this.availableThemes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.availableThemes.length;
        this.applyTheme(this.availableThemes[nextIndex]);
    }
}

// Inicializar gestor de temas
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();

    // Comandos de consola para desarrollo
    console.log('🎨 Comandos de tema:');
    console.log('- themeManager.setTheme("dark")');
    console.log('- themeManager.cycleThemes()');
    console.log('- themeManager.getTheme()');
});