// ============================
// PARTICLES CONFIGURATION
// ============================

const ParticlesConfig = {
    // Configuración base que se adapta a los temas
    getConfig(theme = 'light') {
        const baseConfig = {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: this.getParticleColor(theme)
                },
                shape: {
                    type: "circle",
                    stroke: {
                        width: 0,
                        color: "#000000"
                    }
                },
                opacity: {
                    value: 0.5,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: this.getLineColor(theme),
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: true,
                        mode: "grab"
                    },
                    onclick: {
                        enable: true,
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

        // Ajustes específicos por tema
        return this.applyThemeAdjustments(baseConfig, theme);
    },

    getParticleColor(theme) {
        const colors = {
            'light': '#3cc88f',
            'dark': '#3cc88f',
            'high-contrast': '#000000',
            'sepia': '#8b4513',
            'photophobia': '#2a6e4f',
            'daltonism': '#0066cc',
            'dyslexia': '#3cc88f',
            'reading': '#2c2c2c',
            'reduced-motion': '#3cc88f',
            'grayscale': '#666666'
        };
        return colors[theme] || colors['light'];
    },

    getLineColor(theme) {
        const colors = {
            'light': '#3cc88f',
            'dark': '#3cc88f',
            'high-contrast': '#000000',
            'sepia': '#a0522d',
            'photophobia': '#2a6e4f',
            'daltonism': '#0066cc',
            'dyslexia': '#3cc88f',
            'reading': '#2c2c2c',
            'reduced-motion': '#3cc88f',
            'grayscale': '#888888'
        };
        return colors[theme] || colors['light'];
    },

    applyThemeAdjustments(config, theme) {
        const adjustments = {
            'high-contrast': {
                particles: {
                    opacity: { value: 0.8 },
                    line_linked: { opacity: 0.8 }
                }
            },
            'photophobia': {
                particles: {
                    opacity: { value: 0.3 },
                    line_linked: { opacity: 0.2 }
                }
            },
            'reduced-motion': {
                particles: {
                    move: { speed: 0 },
                    opacity: { anim: { enable: false } },
                    size: { anim: { enable: false } }
                }
            },
            'grayscale': {
                particles: {
                    color: { value: '#666666' },
                    line_linked: { color: '#888888' }
                }
            }
        };

        return adjustments[theme]
            ? this.deepMerge(config, adjustments[theme])
            : config;
    },

    deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    },

    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }
};

// Export para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticlesConfig;
} else {
    window.ParticlesConfig = ParticlesConfig;
}