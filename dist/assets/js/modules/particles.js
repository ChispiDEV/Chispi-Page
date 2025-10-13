// ============================
// PARTICLES CONTROLLER
// ============================

class ParticlesController {
    constructor() {
        this.containerId = 'particles-js';
        this.container = document.getElementById(this.containerId);
        this.instance = null;
        this.currentTheme = 'light';

        this.init();
    }

    init() {
        if (!this.container) {
            console.warn('⚠️ Contenedor de particles no encontrado:', this.containerId);
            return;
        }

        if (typeof particlesJS === 'undefined') {
            console.error('❌ particles.js no está cargado');
            return;
        }

        this.setupThemeListener();
        this.loadParticles(this.currentTheme);

        console.log('✅ Particles controller inicializado');
    }

    setupThemeListener() {
        // Escuchar cambios de tema
        window.addEventListener('theme:changed', (e) => {
            this.currentTheme = e.detail.theme;
            this.reloadParticles();
        });

        // Escuchar preferencia de movimiento reducido
        window.matchMedia('(prefers-reduced-motion: reduce)').addListener((e) => {
            if (e.matches && this.instance) {
                this.pauseAnimation();
            }
        });
    }

    loadParticles(theme) {
        if (!this.container) return;

        try {
            // Destruir instancia anterior si existe
            if (this.instance && window.pJSDom && window.pJSDom.length > 0) {
                this.destroyParticles();
            }

            // Obtener configuración para el tema actual
            const config = this.getParticlesConfig(theme);

            // Cargar particles
            this.instance = particlesJS(this.containerId, config);

            console.log(`🎨 Particles cargadas para tema: ${theme}`);

        } catch (error) {
            console.error('❌ Error cargando particles:', error);
        }
    }

    getParticlesConfig(theme) {
        // Usar configuración modular si está disponible
        if (typeof ParticlesConfig !== 'undefined') {
            return ParticlesConfig.getConfig(theme);
        }

        // Configuración de respaldo
        return this.getFallbackConfig(theme);
    }

    getFallbackConfig(theme) {
        const isDark = ['dark', 'high-contrast', 'photophobia'].includes(theme);
        const isReducedMotion = theme === 'reduced-motion';

        return {
            particles: {
                number: {
                    value: isReducedMotion ? 30 : 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: isDark ? "#3cc88f" : "#3cc88f"
                },
                shape: {
                    type: "circle"
                },
                opacity: {
                    value: isReducedMotion ? 0.3 : 0.5,
                    random: !isReducedMotion,
                    anim: {
                        enable: !isReducedMotion,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: !isReducedMotion,
                    anim: {
                        enable: !isReducedMotion,
                        speed: 2,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: isDark ? "#3cc88f" : "#3cc88f",
                    opacity: isReducedMotion ? 0.2 : 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: isReducedMotion ? 0 : 2,
                    direction: "none",
                    random: !isReducedMotion,
                    straight: false,
                    out_mode: "out",
                    bounce: false
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: !isReducedMotion,
                        mode: "grab"
                    },
                    onclick: {
                        enable: !isReducedMotion,
                        mode: "push"
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 200,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        };
    }

    reloadParticles() {
        if (this.container) {
            // Pequeño delay para asegurar que el tema se aplicó
            setTimeout(() => {
                this.loadParticles(this.currentTheme);
            }, 100);
        }
    }

    destroyParticles() {
        if (window.pJSDom && window.pJSDom.length > 0) {
            window.pJSDom[0].pJS.fn.vendors.destroypJS();
            window.pJSDom = [];
            this.instance = null;
        }
    }

    pauseAnimation() {
        if (this.instance && window.pJSDom && window.pJSDom.length > 0) {
            window.pJSDom[0].pJS.fn.pause();
        }
    }

    resumeAnimation() {
        if (this.instance && window.pJSDom && window.pJSDom.length > 0) {
            window.pJSDom[0].pJS.fn.resume();
        }
    }

    // Métodos públicos
    updateTheme(theme) {
        this.currentTheme = theme;
        this.reloadParticles();
    }

    getInstance() {
        return this.instance;
    }

    destroy() {
        this.destroyParticles();
    }
}