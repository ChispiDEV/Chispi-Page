// ChispiPage JS Bundle

// src\assets\scripts\vendors\tippy.js
// ============================
// TIPPY.JS - Versión simplificada
// ============================

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.tippy = {}));
}(this, (function (exports) {
    'use strict';

    // Versión simplificada de Tippy.js para tooltips básicos
    class Tippy {
        constructor(reference, options = {}) {
            this.reference = reference;
            this.options = Object.assign({}, Tippy.defaults, options);
            this.state = { visible: false };
            this.popperInstance = null;
            this.init();
        }

        static defaults = {
            content: '',
            placement: 'top',
            animation: 'shift-away',
            theme: 'light',
            delay: [100, 50],
            arrow: true,
            interactive: false,
            appendTo: document.body,
            onShow: () => {},
            onHide: () => {}
        };

        init() {
            this.createTooltip();
            this.bindEvents();
        }

        createTooltip() {
            this.tooltip = document.createElement('div');
            this.tooltip.className = `tippy-box ${this.getThemeClass()}`;
            this.tooltip.setAttribute('role', 'tooltip');
            this.tooltip.setAttribute('aria-hidden', 'true');

            if (this.options.arrow) {
                const arrow = document.createElement('div');
                arrow.className = 'tippy-arrow';
                this.tooltip.appendChild(arrow);
            }

            const content = document.createElement('div');
            content.className = 'tippy-content';
            content.innerHTML = this.options.content;
            this.tooltip.appendChild(content);

            this.options.appendTo.appendChild(this.tooltip);
        }

        getThemeClass() {
            return `tippy-theme-${this.options.theme}`;
        }

        bindEvents() {
            this.reference.addEventListener('mouseenter', () => this.show());
            this.reference.addEventListener('mouseleave', () => this.hide());
            this.reference.addEventListener('focus', () => this.show());
            this.reference.addEventListener('blur', () => this.hide());
        }

        show() {
            if (this.state.visible) return;

            clearTimeout(this.hideTimeout);
            this.showTimeout = setTimeout(() => {
                this.tooltip.style.display = 'block';
                this.tooltip.setAttribute('aria-hidden', 'false');
                this.state.visible = true;
                this.updatePosition();
                this.options.onShow(this);
            }, this.options.delay[0]);
        }

        hide() {
            if (!this.state.visible) return;

            clearTimeout(this.showTimeout);
            this.hideTimeout = setTimeout(() => {
                this.tooltip.style.display = 'none';
                this.tooltip.setAttribute('aria-hidden', 'true');
                this.state.visible = false;
                this.options.onHide(this);
            }, this.options.delay[1]);
        }

        updatePosition() {
            // Posicionamiento simple (sin Popper.js)
            const rect = this.reference.getBoundingClientRect();
            const tooltipRect = this.tooltip.getBoundingClientRect();

            let top, left;

            switch (this.options.placement) {
                case 'top':
                    top = rect.top - tooltipRect.height - 8;
                    left = rect.left + (rect.width - tooltipRect.width) / 2;
                    break;
                case 'bottom':
                    top = rect.bottom + 8;
                    left = rect.left + (rect.width - tooltipRect.width) / 2;
                    break;
                case 'left':
                    top = rect.top + (rect.height - tooltipRect.height) / 2;
                    left = rect.left - tooltipRect.width - 8;
                    break;
                case 'right':
                    top = rect.top + (rect.height - tooltipRect.height) / 2;
                    left = rect.right + 8;
                    break;
                default:
                    top = rect.top - tooltipRect.height - 8;
                    left = rect.left + (rect.width - tooltipRect.width) / 2;
            }

            this.tooltip.style.top = `${top}px`;
            this.tooltip.style.left = `${left}px`;
        }

        setProps(newProps) {
            Object.assign(this.options, newProps);

            if (newProps.theme) {
                this.tooltip.className = `tippy-box ${this.getThemeClass()}`;
            }

            if (newProps.content) {
                this.tooltip.querySelector('.tippy-content').innerHTML = newProps.content;
            }

            if (this.state.visible) {
                this.updatePosition();
            }
        }

        destroy() {
            this.hide();
            if (this.tooltip && this.tooltip.parentNode) {
                this.tooltip.parentNode.removeChild(this.tooltip);
            }
            this.reference._tippy = null;
        }
    }

    function tippy(targets, options) {
        const elements = typeof targets === 'string'
            ? document.querySelectorAll(targets)
            : targets.length ? targets : [targets];

        const instances = [];

        elements.forEach(el => {
            if (el._tippy) {
                el._tippy.destroy();
            }

            const content = el.getAttribute('data-tippy-content');
            if (content) {
                const instance = new Tippy(el, { ...options, content });
                el._tippy = instance;
                instances.push(instance);
            }
        });

        return instances.length === 1 ? instances[0] : instances;
    }

    tippy.setDefaultProps = (props) => {
        Object.assign(Tippy.defaults, props);
    };

    exports.tippy = tippy;
    exports.default = tippy;

})));

// src\assets\scripts\vendors\particles.js
// ============================
// PARTICLES.JS - Versión simplificada
// ============================

var particlesJS = function(tag_id, params) {
    'use strict';

    var canvas = document.getElementById(tag_id);
    if (!canvas) return;

    // Configuración por defecto
    var pJS = {
        canvas: {
            el: canvas,
            w: canvas.offsetWidth,
            h: canvas.offsetHeight,
            ctx: canvas.getContext('2d')
        },
        particles: {
            array: [],
            color: { value: '#3cc88f' },
            opacity: { value: 0.5 },
            size: { value: 3 },
            move: { speed: 2 }
        }
    };

    // Aplicar configuración personalizada
    if (params) {
        pJS = deepMerge(pJS, params);
    }

    // Inicializar canvas
    function initCanvas() {
        pJS.canvas.el.width = pJS.canvas.w;
        pJS.canvas.el.height = pJS.canvas.h;

        window.addEventListener('resize', function() {
            pJS.canvas.w = pJS.canvas.el.offsetWidth;
            pJS.canvas.h = pJS.canvas.el.offsetHeight;
            pJS.canvas.el.width = pJS.canvas.w;
            pJS.canvas.el.height = pJS.canvas.h;
        });
    }

    // Crear partículas
    function createParticles() {
        var number = pJS.particles.number.value;
        for (var i = 0; i < number; i++) {
            var p = {
                x: Math.random() * pJS.canvas.w,
                y: Math.random() * pJS.canvas.h,
                vx: (Math.random() - 0.5) * pJS.particles.move.speed,
                vy: (Math.random() - 0.5) * pJS.particles.move.speed,
                color: pJS.particles.color.value,
                opacity: pJS.particles.opacity.value,
                size: pJS.particles.size.value
            };
            pJS.particles.array.push(p);
        }
    }

    // Dibujar partículas
    function drawParticles() {
        pJS.canvas.ctx.clearRect(0, 0, pJS.canvas.w, pJS.canvas.h);

        for (var i = 0; i < pJS.particles.array.length; i++) {
            var p = pJS.particles.array[i];

            // Dibujar partícula
            pJS.canvas.ctx.beginPath();
            pJS.canvas.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            pJS.canvas.ctx.fillStyle = p.color;
            pJS.canvas.ctx.globalAlpha = p.opacity;
            pJS.canvas.ctx.fill();

            // Líneas entre partículas
            if (pJS.particles.line_linked && pJS.particles.line_linked.enable) {
                for (var j = i + 1; j < pJS.particles.array.length; j++) {
                    var p2 = pJS.particles.array[j];
                    var dx = p.x - p2.x;
                    var dy = p.y - p2.y;
                    var distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < pJS.particles.line_linked.distance) {
                        pJS.canvas.ctx.beginPath();
                        pJS.canvas.ctx.moveTo(p.x, p.y);
                        pJS.canvas.ctx.lineTo(p2.x, p2.y);
                        pJS.canvas.ctx.strokeStyle = pJS.particles.line_linked.color;
                        pJS.canvas.ctx.globalAlpha = pJS.particles.line_linked.opacity * (1 - distance / pJS.particles.line_linked.distance);
                        pJS.canvas.ctx.lineWidth = pJS.particles.line_linked.width;
                        pJS.canvas.ctx.stroke();
                    }
                }
            }
        }
    }

    // Actualizar partículas
    function updateParticles() {
        for (var i = 0; i < pJS.particles.array.length; i++) {
            var p = pJS.particles.array[i];

            // Movimiento
            p.x += p.vx;
            p.y += p.vy;

            // Rebotes en los bordes
            if (p.x < 0 || p.x > pJS.canvas.w) p.vx = -p.vx;
            if (p.y < 0 || p.y > pJS.canvas.h) p.vy = -p.vy;

            // Mantener dentro del canvas
            p.x = Math.max(0, Math.min(pJS.canvas.w, p.x));
            p.y = Math.max(0, Math.min(pJS.canvas.h, p.y));
        }
    }

    // Loop de animación
    function animate() {
        drawParticles();
        updateParticles();
        requestAnimationFrame(animate);
    }

    // Inicializar
    initCanvas();
    createParticles();
    animate();

    // Guardar instancia globalmente
    if (!window.pJSDom) window.pJSDom = [];
    window.pJSDom.push({ pJS: pJS });

    return pJS;
};

// Función auxiliar para merge profundo
function deepMerge(target, source) {
    var output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(function(key) {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = deepMerge(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

// Export para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = particlesJS;
}

// src\assets\scripts\particles\particles-config.js
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

// src\assets\scripts\modules\tooltips.js
// ============================
// TOOLTIPS CONTROLLER
// ============================

class TooltipsController {
    constructor() {
        this.init();
    }

    init() {
        if (typeof tippy === 'undefined') {
            console.warn('⚠️ Tippy.js no está cargado');
            return;
        }

        this.initializeTooltips();
        this.setupThemeListener();

        console.log('✅ Tooltips controller inicializado');
    }

    initializeTooltips() {
        tippy('[data-tippy-content]', {
            animation: 'shift-away',
            theme: this.getCurrentTheme(),
            delay: [100, 50],
            arrow: true,
            placement: 'top',
            interactive: true,
            appendTo: document.body
        });
    }

    getCurrentTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        return (['dark', 'high-contrast'].includes(currentTheme)) ? 'material' : 'light';
    }

    setupThemeListener() {
        // Actualizar tooltips cuando cambie el tema
        window.addEventListener('theme:changed', () => {
            this.updateTooltipsTheme();
        });
    }

    updateTooltipsTheme() {
        const newTheme = this.getCurrentTheme();
        document.querySelectorAll('[data-tippy-content]').forEach(el => {
            if (el._tippy) {
                el._tippy.setProps({ theme: newTheme });
            }
        });
    }

    destroy() {
        // Destruir todas las instancias de tooltips
        document.querySelectorAll('[data-tippy-content]').forEach(el => {
            if (el._tippy) {
                el._tippy.destroy();
            }
        });
    }
}

// src\assets\scripts\modules\theme.js
// ============================
// THEME CONTROLLER (Actualizado)
// ============================

class ThemeController {
    constructor() {
        this.themes = [
            'light', 'dark', 'high-contrast', 'sepia',
            'photophobia', 'daltonism', 'dyslexia',
            'reading', 'reduced-motion', 'grayscale'
        ];
        this.currentTheme = this.getSavedTheme() || 'light';
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeDropdown = document.getElementById('theme-dropdown');
        this.themeMenu = this.themeDropdown?.querySelector('.dropdown-menu');

        this.ready = this.init();
    }

    async init() {
        this.applyTheme(this.currentTheme);
        this.bindEvents();
        this.setupThemeSelector();
        this.detectSystemPreferences();

        console.log('✅ Theme controller inicializado');
    }

    bindEvents() {
        // Eventos del dropdown de tema (compatibilidad con tu código)
        if (this.themeToggle && this.themeMenu) {
            this.setupLegacyThemeDropdown();
        }

        // Atajos de teclado globales
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Escuchar cambios del sistema
        this.setupMediaQueryListeners();
    }

    setupLegacyThemeDropdown() {
        this.themeToggle.setAttribute('aria-haspopup', 'true');
        this.themeToggle.setAttribute('aria-expanded', 'false');

        // Configurar botones del dropdown legacy
        const themeButtons = this.themeMenu.querySelectorAll('[data-theme-choice]');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.getAttribute('data-theme-choice');
                this.setTheme(theme);
                this.closeLegacyDropdown();
            });
        });

        // Toggle del dropdown
        this.themeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleLegacyDropdown();
        });

        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!this.themeDropdown?.contains(e.target)) {
                this.closeLegacyDropdown();
            }
        });

        // Navegación con teclado
        this.themeMenu.addEventListener('keydown', (e) => this.handleDropdownNavigation(e));
    }

    setupThemeSelector() {
        // Crear selector moderno si no existe
        if (!document.getElementById('theme-selector')) {
            this.createModernThemeSelector();
        }
    }

    createModernThemeSelector() {
        const selector = document.createElement('div');
        selector.id = 'theme-selector';
        selector.className = 'theme-selector';
        selector.innerHTML = `
            <label for="theme-select" class="theme-selector__label">Tema:</label>
            <select id="theme-select" class="theme-selector__select">
                ${this.themes.map(theme => `
                    <option value="${theme}">${this.getThemeDisplayName(theme)}</option>
                `).join('')}
            </select>
            <button class="theme-selector__reset" aria-label="Restablecer tema por defecto">↺</button>
        `;

        // Insertar en el DOM
        const headerActions = document.querySelector('.header__actions');
        if (headerActions) {
            headerActions.appendChild(selector);
        } else {
            document.body.insertBefore(selector, document.body.firstChild);
        }

        // Event listeners
        document.getElementById('theme-select').addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        document.querySelector('.theme-selector__reset').addEventListener('click', () => {
            this.resetTheme();
        });

        this.updateThemeSelector();
    }

    setupMediaQueryListeners() {
        // Detectar preferencia de modo oscuro
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeMediaQuery.addListener((e) => this.handleSystemPreferenceChange(e));

        // Detectar movimiento reducido
        const reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce');
        reducedMotionMediaQuery.addListener((e) => this.handleReducedMotionPreference(e));
    }

    handleSystemPreferenceChange(e) {
        if (!this.getSavedTheme()) {
            this.applyTheme(e.matches ? 'dark' : 'light');
        }
    }

    handleReducedMotionPreference(e) {
        if (e.matches) {
            document.documentElement.setAttribute('data-reduced-motion', 'true');
        } else {
            document.documentElement.removeAttribute('data-reduced-motion');
        }
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey && e.altKey) {
            switch(e.key) {
                case '1': this.setTheme('light'); break;
                case '2': this.setTheme('dark'); break;
                case '3': this.setTheme('high-contrast'); break;
                case '4': this.setTheme('sepia'); break;
                case '0': this.cycleThemes(); break;
                case 'r': this.resetTheme(); break;
            }
        }
    }

    // === MÉTODOS PRINCIPALES ===

    applyTheme(theme) {
        if (!this.themes.includes(theme)) {
            console.warn(`Tema "${theme}" no válido`);
            return;
        }

        // Remover temas anteriores
        this.themes.forEach(t => {
            document.documentElement.classList.remove(`theme-${t}`);
        });
        document.documentElement.removeAttribute('data-theme');

        // Aplicar nuevo tema
        document.documentElement.classList.add(`theme-${theme}`);
        document.documentElement.setAttribute('data-theme', theme);

        // Atributos específicos
        if (theme === 'reduced-motion') {
            document.documentElement.setAttribute('data-reduced-motion', 'true');
        }

        this.currentTheme = theme;
        this.saveTheme(theme);
        this.updateThemeSelector();
        this.updateLegacyDropdown();
        this.updateThemeDependentContent();

        // Disparar evento
        window.dispatchEvent(new CustomEvent('theme:changed', {
            detail: { theme: theme, controller: this }
        }));

        console.log(`🎨 Tema cambiado a: ${theme}`);
    }

    updateThemeDependentContent() {
        this.updateImagesForTheme(this.currentTheme);
        this.updateParticles(this.currentTheme);
        this.updateTippyTheme(this.currentTheme);
    }

    // === MÉTODOS DE ACTUALIZACIÓN DE CONTENIDO (de tu código original) ===

    updateImagesForTheme(theme) {
        const heroHeader = document.querySelector('header.hero');
        if (heroHeader?.dataset.imgDark && heroHeader?.dataset.imgLight) {
            heroHeader.style.transition = 'background-image 0.5s ease-in-out';
            heroHeader.style.backgroundImage = `url('${theme === 'dark' ? heroHeader.dataset.imgDark : heroHeader.dataset.imgLight}')`;
        }

        const heroPost = document.querySelector('.post-hero-image');
        if (heroPost?.dataset.bgDark && heroPost?.dataset.bgLight) {
            heroPost.style.transition = 'background-image 0.5s ease-in-out';
            heroPost.style.backgroundImage = `url('${theme === 'dark' ? heroPost.dataset.bgDark : heroPost.dataset.bgLight}')`;
        }

        // Actualizar imágenes con data attributes
        const themeImgs = document.querySelectorAll('[data-img-dark][data-img-light]');
        themeImgs.forEach(img => {
            if (img.tagName === 'IMG') {
                img.style.transition = 'opacity 0.5s ease-in-out';
                img.style.opacity = '0';
                setTimeout(() => {
                    img.src = theme === 'dark' ? img.dataset.imgDark : img.dataset.imgLight;
                    img.style.opacity = '1';
                }, 200);
            }
        });

        const bgImgs = document.querySelectorAll('[data-bg-dark][data-bg-light]');
        bgImgs.forEach(el => {
            if (!el.classList.contains('post-hero-image')) {
                el.style.transition = 'background-image 0.5s ease-in-out';
                el.style.backgroundImage = `url('${theme === 'dark' ? el.dataset.bgDark : el.dataset.bgLight}')`;
            }
        });
    }

    updateParticles(theme) {
        const configFile = theme === 'dark' ? 'particles-dark.json' : 'particles-light.json';

        if (window.pJSDom && window.pJSDom.length > 0) {
            window.pJSDom[0].pJS.fn.vendors.destroypJS();
            window.pJSDom = [];
        }

        // Cargar nueva configuración de particles
        if (typeof particlesJS !== 'undefined') {
            particlesJS.load('particles-js', `${this.BASE_URL}/assets/particles/${configFile}`);
        }
    }

    updateTippyTheme(theme) {
        const tippyTheme = (['dark', 'high-contrast'].includes(theme)) ? 'material' : 'light';
        document.querySelectorAll('[data-tippy-content]').forEach(el => {
            if (el._tippy) {
                el._tippy.setProps({ theme: tippyTheme });
            }
        });
    }

    // === MÉTODOS DEL DROPDOWN LEGACY ===

    toggleLegacyDropdown() {
        const expanded = this.themeMenu.classList.toggle('show');
        this.themeToggle.setAttribute('aria-expanded', expanded.toString());

        if (expanded) {
            const firstBtn = this.themeMenu.querySelector('button');
            firstBtn?.focus();
        }
    }

    closeLegacyDropdown() {
        this.themeMenu.classList.remove('show');
        this.themeToggle.setAttribute('aria-expanded', 'false');
        this.themeToggle.focus();
    }

    handleDropdownNavigation(e) {
        if (e.key === 'Escape') {
            this.closeLegacyDropdown();
            return;
        }

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const items = Array.from(this.themeMenu.querySelectorAll('button'));
            const currentIndex = items.indexOf(document.activeElement);
            let nextIndex;

            if (e.key === 'ArrowDown') {
                nextIndex = (currentIndex + 1) % items.length;
            } else {
                nextIndex = (currentIndex - 1 + items.length) % items.length;
            }

            items[nextIndex]?.focus();
        }
    }

    updateLegacyDropdown() {
        const themeButtons = this.themeMenu?.querySelectorAll('[data-theme-choice]');
        themeButtons?.forEach(btn => {
            const isActive = btn.getAttribute('data-theme-choice') === this.currentTheme;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
    }

    // === MÉTODOS UTILITARIOS ===

    getThemeDisplayName(theme) {
        const names = {
            'light': 'Claro',
            'dark': 'Oscuro',
            'high-contrast': 'Alto Contraste',
            'sepia': 'Sepia',
            'photophobia': 'Fotofobia',
            'daltonism': 'Daltonismo',
            'dyslexia': 'Dislexia',
            'reading': 'Lectura',
            'reduced-motion': 'Mov. Reducido',
            'grayscale': 'Escala Grises'
        };
        return names[theme] || theme;
    }

    updateThemeSelector() {
        const select = document.getElementById('theme-select');
        if (select) {
            select.value = this.currentTheme;
        }
    }

    getSavedTheme() {
        return localStorage.getItem('preferred-theme');
    }

    saveTheme(theme) {
        localStorage.setItem('preferred-theme', theme);
    }

    // === MÉTODOS PÚBLICOS ===

    setTheme(theme) {
        this.applyTheme(theme);
    }

    cycleThemes() {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.setTheme(this.themes[nextIndex]);
    }

    resetTheme() {
        localStorage.removeItem('preferred-theme');
        this.applyTheme('light');
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    isDarkTheme() {
        return ['dark', 'high-contrast'].includes(this.currentTheme);
    }

    destroy() {
        // Cleanup de event listeners
        document.removeEventListener('keydown', this.handleKeyboardShortcuts);
    }
}

// src\assets\scripts\modules\sidebar.js
// ============================
// SIDEBAR CONTROLLER
// ============================

class SidebarController {
    constructor() {
        this.sidebar = document.getElementById('sidebar-wrapper');
        this.menuToggle = document.getElementById('menu-toggle');
        this.closeToggle = document.getElementById('close-menu-toggle');
        this.isOpen = false;

        this.ready = this.init();
    }

    async init() {
        if (!this.sidebar || !this.menuToggle) {
            console.warn('⚠️ Elementos del sidebar no encontrados');
            return;
        }

        this.setupAccessibility();
        this.bindEvents();

        console.log('✅ Sidebar controller inicializado');
    }

    setupAccessibility() {
        // Configurar atributos ARIA
        this.sidebar.setAttribute('tabindex', '-1');
        this.sidebar.setAttribute('aria-hidden', 'true');
        this.sidebar.setAttribute('aria-label', 'Menú lateral de navegación');

        this.menuToggle.setAttribute('aria-controls', 'sidebar-wrapper');
        this.menuToggle.setAttribute('aria-expanded', 'false');
        this.menuToggle.setAttribute('aria-label', 'Abrir menú lateral');

        if (this.closeToggle) {
            this.closeToggle.setAttribute('aria-label', 'Cerrar menú lateral');
            this.closeToggle.style.display = 'none';
        }
    }

    bindEvents() {
        // Evento abrir sidebar
        this.menuToggle.addEventListener('click', () => this.open());

        // Evento cerrar sidebar
        if (this.closeToggle) {
            this.closeToggle.addEventListener('click', () => this.close());
        }

        // Cerrar al hacer click en enlaces
        this.sidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => this.close());
        });

        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (this.isOpen &&
                !this.sidebar.contains(e.target) &&
                !this.menuToggle.contains(e.target)) {
                this.close();
            }
        });

        // Cerrar con Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Trap focus dentro del sidebar
        this.sidebar.addEventListener('keydown', (e) => this.trapFocus(e));
    }

    open() {
        this.sidebar.classList.add('active');
        this.sidebar.setAttribute('aria-hidden', 'false');

        this.menuToggle.style.display = 'none';
        this.menuToggle.setAttribute('aria-expanded', 'true');

        if (this.closeToggle) {
            this.closeToggle.style.display = 'flex';
        }

        this.sidebar.focus();
        this.isOpen = true;

        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('sidebar:open'));
    }

    close() {
        this.sidebar.classList.remove('active');
        this.sidebar.setAttribute('aria-hidden', 'true');

        this.menuToggle.style.display = 'flex';
        this.menuToggle.setAttribute('aria-expanded', 'false');

        if (this.closeToggle) {
            this.closeToggle.style.display = 'none';
        }

        this.menuToggle.focus();
        this.isOpen = false;

        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('sidebar:close'));
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    trapFocus(event) {
        if (event.key !== 'Tab') return;

        const focusableElements = this.getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    getFocusableElements() {
        return Array.from(this.sidebar.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        )).filter(el => !el.disabled && el.offsetParent !== null);
    }

    // Métodos públicos
    isSidebarOpen() {
        return this.isOpen;
    }

    destroy() {
        // Cleanup de event listeners si es necesario
        this.close();
    }
}

// src\assets\scripts\modules\scroll.js
// ============================
// SCROLL CONTROLLER
// ============================

class ScrollController {
    constructor() {
        this.scrollToTop = document.querySelector('.scroll-to-top');
        this.isVisible = false;
        this.scrollThreshold = 100;

        this.init();
    }

    init() {
        if (!this.scrollToTop) {
            console.warn('⚠️ Botón scroll-to-top no encontrado');
            return;
        }

        this.bindEvents();
        this.checkScrollPosition(); // Verificar posición inicial

        console.log('✅ Scroll controller inicializado');
    }

    bindEvents() {
        // Evento de scroll
        window.addEventListener('scroll', () => {
            this.throttle(this.checkScrollPosition.bind(this), 100)();
        });

        // Click en botón scroll-to-top
        this.scrollToTop.addEventListener('click', () => this.scrollToTopHandler());
    }

    checkScrollPosition() {
        const shouldShow = window.scrollY > this.scrollThreshold;

        if (shouldShow !== this.isVisible) {
            this.isVisible = shouldShow;
            shouldShow ? this.show() : this.hide();
        }
    }

    show() {
        this.fadeIn(this.scrollToTop);
        window.dispatchEvent(new CustomEvent('scrollToTop:show'));
    }

    hide() {
        this.fadeOut(this.scrollToTop);
        window.dispatchEvent(new CustomEvent('scrollToTop:hide'));
    }

    scrollToTopHandler() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Enfocar el header después del scroll
        setTimeout(() => {
            const header = document.querySelector('header');
            if (header) {
                header.setAttribute('tabindex', '-1');
                header.focus();
            }
        }, 500);
    }

    // Animaciones de fade
    fadeIn(element) {
        element.style.display = 'flex';
        element.style.opacity = '0';

        let opacity = 0;
        const fade = () => {
            opacity += 0.1;
            element.style.opacity = opacity.toString();

            if (opacity < 1) {
                requestAnimationFrame(fade);
            }
        };

        fade();
    }

    fadeOut(element) {
        let opacity = 1;
        const fade = () => {
            opacity -= 0.1;
            element.style.opacity = opacity.toString();

            if (opacity > 0) {
                requestAnimationFrame(fade);
            } else {
                element.style.display = 'none';
            }
        };

        fade();
    }

    // Throttle para optimizar performance
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Métodos públicos
    setThreshold(threshold) {
        this.scrollThreshold = threshold;
        this.checkScrollPosition();
    }

    getScrollPosition() {
        return window.scrollY;
    }
}

// src\assets\scripts\modules\popups.js
// ============================
// POPUPS CONTROLLER
// ============================

class PopupsController {
    constructor() {
        this.popups = new Map();
        this.activePopup = null;
        this.focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

        this.init();
    }

    init() {
        this.createPopupContainers();
        this.bindGlobalEvents();
        this.setupAccessibilityShortcuts();

        console.log('✅ Popups controller inicializado');
    }

    createPopupContainers() {
        // Contenedor principal para popups
        const popupsContainer = document.createElement('div');
        popupsContainer.id = 'popups-container';
        popupsContainer.className = 'popups-container';
        popupsContainer.setAttribute('aria-live', 'polite');
        document.body.appendChild(popupsContainer);

        // Overlay para fondo
        const overlay = document.createElement('div');
        overlay.id = 'popup-overlay';
        overlay.className = 'popup-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.setAttribute('tabindex', '-1');
        document.body.appendChild(overlay);
    }

    bindGlobalEvents() {
        // Cerrar popup con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activePopup) {
                this.closeCurrentPopup();
            }
        });

        // Cerrar popup haciendo click en overlay
        document.getElementById('popup-overlay').addEventListener('click', () => {
            this.closeCurrentPopup();
        });

        // Manejar cambios de tema
        window.addEventListener('theme:changed', () => {
            this.updatePopupsForTheme();
        });
    }

    setupAccessibilityShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch(e.key) {
                    case 'a': // Alt + A para accesibilidad
                        e.preventDefault();
                        this.showAccessibilityPopup();
                        break;
                    case 'c': // Alt + C para contacto
                        e.preventDefault();
                        this.showContactPopup();
                        break;
                    case 'd': // Alt + D para descargar CV
                        e.preventDefault();
                        this.showDownloadPopup();
                        break;
                }
            }
        });
    }

    // === POPUP DE ACCESIBILIDAD ===

    showAccessibilityPopup() {
        const content = `
            <div class="accessibility-popup">
                <h2 class="popup__title">🎯 Configuración de Accesibilidad</h2>
                
                <div class="accessibility-options">
                    <div class="option-group">
                        <h3>Temas de Accesibilidad</h3>
                        <div class="theme-buttons">
                            <button class="theme-btn" data-theme="dyslexia" aria-pressed="false">
                                <span class="theme-icon">📖</span>
                                <span>Modo Dislexia</span>
                            </button>
                            <button class="theme-btn" data-theme="high-contrast" aria-pressed="false">
                                <span class="theme-icon">⚫</span>
                                <span>Alto Contraste</span>
                            </button>
                            <button class="theme-btn" data-theme="reduced-motion" aria-pressed="false">
                                <span class="theme-icon">🎬</span>
                                <span>Menos Animación</span>
                            </button>
                            <button class="theme-btn" data-theme="reading" aria-pressed="false">
                                <span class="theme-icon">👓</span>
                                <span>Modo Lectura</span>
                            </button>
                        </div>
                    </div>

                    <div class="option-group">
                        <h3>Controles de Texto</h3>
                        <div class="text-controls">
                            <button class="text-btn" id="increase-font" aria-label="Aumentar tamaño de texto">
                                <span class="text-icon">A+</span>
                                <span>Agrandar Texto</span>
                            </button>
                            <button class="text-btn" id="decrease-font" aria-label="Reducir tamaño de texto">
                                <span class="text-icon">A-</span>
                                <span>Reducir Texto</span>
                            </button>
                            <button class="text-btn" id="reset-font" aria-label="Restablecer tamaño de texto">
                                <span class="text-icon">A↺</span>
                                <span>Texto Normal</span>
                            </button>
                        </div>
                    </div>

                    <div class="option-group">
                        <h3>Navegación por Teclado</h3>
                        <div class="shortcuts-list">
                            <div class="shortcut-item">
                                <kbd>Alt</kbd> + <kbd>A</kbd> - Accesibilidad
                            </div>
                            <div class="shortcut-item">
                                <kbd>Alt</kbd> + <kbd>C</kbd> - Contacto
                            </div>
                            <div class="shortcut-item">
                                <kbd>Alt</kbd> + <kbd>D</kbd> - Descargar CV
                            </div>
                            <div class="shortcut-item">
                                <kbd>Tab</kbd> - Navegar
                            </div>
                            <div class="shortcut-item">
                                <kbd>Escape</kbd> - Cerrar
                            </div>
                        </div>
                    </div>
                </div>

                <div class="popup__actions">
                    <button class="btn btn--secondary" data-action="reset-all">
                        Restablecer Todo
                    </button>
                    <button class="btn btn--primary" data-action="close">
                        Aplicar y Cerrar
                    </button>
                </div>
            </div>
        `;

        this.showPopup('accessibility', content, 'Configuración de Accesibilidad');
        this.setupAccessibilityEvents();
    }

    setupAccessibilityEvents() {
        // Botones de tema
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.getAttribute('data-theme');
                this.applyAccessibilityTheme(theme, btn);
            });
        });

        // Controles de texto
        document.getElementById('increase-font').addEventListener('click', () => {
            this.adjustFontSize(1);
        });

        document.getElementById('decrease-font').addEventListener('click', () => {
            this.adjustFontSize(-1);
        });

        document.getElementById('reset-font').addEventListener('click', () => {
            this.resetFontSize();
        });

        // Botones de acción
        document.querySelector('[data-action="reset-all"]').addEventListener('click', () => {
            this.resetAllAccessibility();
        });
    }

    applyAccessibilityTheme(theme, button) {
        const themeController = window.appController?.getModule('theme');
        if (themeController) {
            themeController.setTheme(theme);
        }

        // Actualizar estado visual del botón
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.setAttribute('aria-pressed', 'false');
            btn.classList.remove('active');
        });
        button.setAttribute('aria-pressed', 'true');
        button.classList.add('active');
    }

    adjustFontSize(direction) {
        const html = document.documentElement;
        const currentSize = parseFloat(getComputedStyle(html).fontSize);
        const newSize = currentSize + (direction * 2);

        // Limitar entre 12px y 24px
        if (newSize >= 12 && newSize <= 24) {
            html.style.fontSize = `${newSize}px`;
            this.saveFontSize(newSize);
        }
    }

    resetFontSize() {
        document.documentElement.style.fontSize = '';
        localStorage.removeItem('user-font-size');
    }

    saveFontSize(size) {
        localStorage.setItem('user-font-size', size.toString());
    }

    resetAllAccessibility() {
        this.resetFontSize();

        const themeController = window.appController?.getModule('theme');
        if (themeController) {
            themeController.resetTheme();
        }

        // Resetear botones
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.setAttribute('aria-pressed', 'false');
            btn.classList.remove('active');
        });

        this.showNotification('Configuración restablecida');
    }

    // === POPUP DE CONTACTO ===

    showContactPopup() {
        const content = `
            <div class="contact-popup">
                <h2 class="popup__title">💬 ¿Hablamos?</h2>
                <p class="popup__subtitle">Elijo la forma que más te convenga</p>
                
                <div class="contact-options">
                    <div class="contact-option" data-action="email">
                        <div class="contact-icon">📧</div>
                        <div class="contact-info">
                            <h3>Email Directo</h3>
                            <p>Enviar un correo ahora</p>
                        </div>
                    </div>

                    <div class="contact-option" data-action="whatsapp">
                        <div class="contact-icon">💬</div>
                        <div class="contact-info">
                            <h3>WhatsApp</h3>
                            <p>Chat inmediato</p>
                        </div>
                    </div>

                    <div class="contact-option" data-action="linkedin">
                        <div class="contact-icon">💼</div>
                        <div class="contact-info">
                            <h3>LinkedIn</h3>
                            <p>Conectemos profesionalmente</p>
                        </div>
                    </div>

                    <div class="contact-option" data-action="calendly">
                        <div class="contact-icon">📅</div>
                        <div class="contact-info">
                            <h3>Reunión</h3>
                            <p>Agendar una videollamada</p>
                        </div>
                    </div>
                </div>

                <div class="contact-footer">
                    <p class="contact-note">💡 <strong>Tip:</strong> También puedes usar el formulario de contacto principal</p>
                </div>

                <div class="popup__actions">
                    <button class="btn btn--secondary" data-action="close">
                        Quizás después
                    </button>
                </div>
            </div>
        `;

        this.showPopup('contact', content, 'Opciones de Contacto');
        this.setupContactEvents();
    }

    setupContactEvents() {
        const contactOptions = {
            email: () => window.open('mailto:tu-email@dominio.com?subject=Contacto desde Portfolio&body=Hola, me interesa ponerme en contacto contigo...'),
            whatsapp: () => window.open('https://wa.me/1234567890?text=Hola!%20Vi%20tu%20portfolio%20y%20me%20gustaría%20contactarte'),
            linkedin: () => window.open('https://linkedin.com/in/tu-perfil', '_blank'),
            calendly: () => window.open('https://calendly.com/tu-usuario', '_blank')
        };

        document.querySelectorAll('.contact-option').forEach(option => {
            option.addEventListener('click', () => {
                const action = option.getAttribute('data-action');
                if (contactOptions[action]) {
                    contactOptions[action]();
                    this.closeCurrentPopup();
                    this.showNotification(`Redirigiendo a ${action}...`);
                }
            });
        });
    }

    // === POPUP DE DESCARGAR CV ===

    showDownloadPopup() {
        const content = `
            <div class="download-popup">
                <h2 class="popup__title">📄 Descargar CV</h2>
                <p class="popup__subtitle">Elige el formato que prefieras</p>
                
                <div class="download-options">
                    <div class="download-option" data-format="pdf">
                        <div class="download-icon">📋</div>
                        <div class="download-info">
                            <h3>PDF Estándar</h3>
                            <p>Formato universal · 250KB</p>
                            <span class="download-badge">Recomendado</span>
                        </div>
                    </div>

                    <div class="download-option" data-format="pdf-accessible">
                        <div class="download-icon">♿</div>
                        <div class="download-info">
                            <h3>PDF Accesible</h3>
                            <p>Optimizado para lectores de pantalla · 280KB</p>
                        </div>
                    </div>

                    <div class="download-option" data-format="txt">
                        <div class="download-icon">📝</div>
                        <div class="download-info">
                            <h3>Texto Plano</h3>
                            <p>Sin formato · 15KB</p>
                        </div>
                    </div>
                </div>

                <div class="download-additional">
                    <label class="checkbox-label">
                        <input type="checkbox" id="include-portfolio">
                        <span class="checkmark"></span>
                        Incluir enlace al portfolio en el CV
                    </label>
                    
                    <label class="checkbox-label">
                        <input type="checkbox" id="email-copy">
                        <span class="checkmark"></span>
                        Enviarme una copia por email
                    </span>
                </div>

                <div class="popup__actions">
                    <button class="btn btn--secondary" data-action="preview">
                        👁️ Vista Previa
                    </button>
                    <button class="btn btn--primary" data-action="download">
                        ⬇️ Descargar
                    </button>
                </div>
            </div>
        `;

        this.showPopup('download', content, 'Descargar Curriculum Vitae');
        this.setupDownloadEvents();
    }

    setupDownloadEvents() {
        let selectedFormat = 'pdf';

        // Selección de formato
        document.querySelectorAll('.download-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.download-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                selectedFormat = option.getAttribute('data-format');
            });
        });

        // Botones de acción
        document.querySelector('[data-action="preview"]').addEventListener('click', () => {
            this.previewCV(selectedFormat);
        });

        document.querySelector('[data-action="download"]').addEventListener('click', () => {
            const includePortfolio = document.getElementById('include-portfolio').checked;
            const emailCopy = document.getElementById('email-copy').checked;
            this.downloadCV(selectedFormat, includePortfolio, emailCopy);
        });
    }

    previewCV(format) {
        // Simular vista previa
        this.showNotification(`Generando vista previa en ${format.toUpperCase()}...`);
        // Aquí iría la lógica real de vista previa
    }

    downloadCV(format, includePortfolio, emailCopy) {
        const cvFiles = {
            'pdf': '/assets/cv/cv-estandar.pdf',
            'pdf-accessible': '/assets/cv/cv-accesible.pdf',
            'txt': '/assets/cv/cv-texto.txt'
        };

        const filename = `CV_${new Date().getFullYear()}_${format}.${format === 'txt' ? 'txt' : 'pdf'}`;

        // Simular descarga
        this.showNotification(`Descargando CV en formato ${format.toUpperCase()}...`);

        // Aquí iría la lógica real de descarga
        setTimeout(() => {
            this.showNotification('✅ CV descargado correctamente');
            this.closeCurrentPopup();

            if (emailCopy) {
                this.showNotification('📧 Copia enviada a tu email');
            }
        }, 1500);
    }

    // === MÉTODOS BASE DE POPUPS ===

    showPopup(id, content, title) {
        this.closeCurrentPopup();

        const popup = document.createElement('div');
        popup.id = `popup-${id}`;
        popup.className = 'popup';
        popup.setAttribute('role', 'dialog');
        popup.setAttribute('aria-labelledby', `popup-title-${id}`);
        popup.setAttribute('aria-modal', 'true');

        popup.innerHTML = `
            <div class="popup__header">
                <h3 id="popup-title-${id}" class="popup__title">${title}</h3>
                <button class="popup__close" aria-label="Cerrar diálogo">
                    <span aria-hidden="true">×</span>
                </button>
            </div>
            <div class="popup__content">
                ${content}
            </div>
        `;

        document.getElementById('popups-container').appendChild(popup);
        this.setupPopupEvents(popup, id);
        this.openPopup(popup);
    }

    setupPopupEvents(popup, id) {
        // Botón cerrar
        popup.querySelector('.popup__close').addEventListener('click', () => {
            this.closePopup(popup);
        });

        // Trap focus dentro del popup
        popup.addEventListener('keydown', (e) => this.trapFocus(e, popup));

        this.popups.set(id, popup);
    }

    openPopup(popup) {
        this.activePopup = popup;

        // Mostrar overlay
        const overlay = document.getElementById('popup-overlay');
        overlay.setAttribute('aria-hidden', 'false');
        overlay.classList.add('active');

        // Mostrar popup
        popup.classList.add('active');

        // Enfocar primer elemento enfocable
        setTimeout(() => {
            const firstFocusable = popup.querySelector(this.focusableElements);
            if (firstFocusable) firstFocusable.focus();
        }, 100);

        // Deshabilitar scroll del body
        document.body.style.overflow = 'hidden';

        // Disparar evento
        window.dispatchEvent(new CustomEvent('popup:open', {
            detail: { popup: popup }
        }));
    }

    closePopup(popup) {
        popup.classList.remove('active');

        // Ocultar overlay si no hay más popups
        setTimeout(() => {
            if (!this.activePopup) {
                document.getElementById('popup-overlay').classList.remove('active');
                document.getElementById('popup-overlay').setAttribute('aria-hidden', 'true');
            }
        }, 300);

        // Re-enable body scroll
        document.body.style.overflow = '';

        // Disparar evento
        window.dispatchEvent(new CustomEvent('popup:close', {
            detail: { popup: popup }
        }));
    }

    closeCurrentPopup() {
        if (this.activePopup) {
            this.closePopup(this.activePopup);
            this.activePopup = null;
        }
    }

    trapFocus(event, popup) {
        if (event.key !== 'Tab') return;

        const focusableElements = popup.querySelectorAll(this.focusableElements);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    updatePopupsForTheme() {
        // Los popups heredan los estilos del tema actual automáticamente
        console.log('Popups actualizados para el tema actual');
    }

    showNotification(message) {
        // Notificación toast simple
        const notification = document.createElement('div');
        notification.className = 'popup-notification';
        notification.textContent = message;
        notification.setAttribute('aria-live', 'polite');

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Métodos públicos
    getActivePopup() {
        return this.activePopup;
    }

    isPopupOpen() {
        return this.activePopup !== null;
    }

    destroy() {
        this.closeCurrentPopup();
        this.popups.forEach(popup => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        });
        this.popups.clear();
    }
}

// src\assets\scripts\modules\particles.js
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

// src\assets\scripts\modules\language.js
// ============================
// LANGUAGE CONTROLLER - ADAPTADO
// ============================

class LanguageController {
    constructor() {
        this.languageToggle = document.getElementById('language-toggle');
        this.languageDropdown = this.languageToggle?.closest('.dropdown');
        this.languageMenu = this.languageDropdown?.querySelector('.dropdown-menu');
        this.currentLanguage = this.detectCurrentLanguage();
        this.supportedLanguages = ['es', 'en'];

        this.init();
    }

    init() {
        if (!this.languageToggle || !this.languageMenu) {
            console.warn('⚠️ Elementos de idioma no encontrados');
            return;
        }

        this.setupAccessibility();
        this.bindEvents();
        this.applyLanguage(this.currentLanguage, false); // No redirigir en inicialización

        console.log('✅ Language controller inicializado - Lenguaje actual:', this.currentLanguage);
    }

    detectCurrentLanguage() {
        // 1. Primero verificar si hay un lenguaje guardado
        const savedLang = this.getSavedLanguage();
        if (savedLang) return savedLang;

        // 2. Detectar basado en la URL
        const path = window.location.pathname;
        if (path.startsWith('/en')) return 'en';

        // 3. Detectar basado en el HTML
        const htmlLang = document.documentElement.lang;
        if (htmlLang && this.supportedLanguages.includes(htmlLang)) return htmlLang;

        // 4. Default
        return 'es';
    }

    setupAccessibility() {
        this.languageToggle.setAttribute('aria-haspopup', 'true');
        this.languageToggle.setAttribute('aria-expanded', 'false');
        this.updateAccessibilityLabel();
    }

    updateAccessibilityLabel() {
        const labels = {
            'es': 'Seleccionar idioma - Actual: Español',
            'en': 'Select language - Current: English'
        };
        this.languageToggle.setAttribute('aria-label', labels[this.currentLanguage] || labels.es);
    }

    bindEvents() {
        // Toggle del dropdown
        this.languageToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (this.languageDropdown && !this.languageDropdown.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Navegación con teclado
        this.languageMenu.addEventListener('keydown', (e) => this.handleDropdownNavigation(e));

        // Eventos de los items del lenguaje
        this.languageMenu.querySelectorAll('.language-option, [data-lang]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = item.getAttribute('data-lang');
                if (lang && this.supportedLanguages.includes(lang)) {
                    this.setLanguage(lang);
                }
            });
        });

        // Escuchar eventos de otros componentes
        window.addEventListener('popstate', () => {
            this.handleUrlChange();
        });
    }

    handleUrlChange() {
        const newLang = this.detectCurrentLanguage();
        if (newLang !== this.currentLanguage) {
            this.applyLanguage(newLang, false);
        }
    }

    toggleDropdown() {
        const expanded = this.languageMenu.classList.toggle('show');
        this.languageToggle.setAttribute('aria-expanded', expanded.toString());

        if (expanded) {
            const firstItem = this.languageMenu.querySelector('.language-option, [data-lang]');
            firstItem?.focus();
        }
    }

    closeDropdown() {
        this.languageMenu.classList.remove('show');
        this.languageToggle.setAttribute('aria-expanded', 'false');
    }

    handleDropdownNavigation(e) {
        if (e.key === 'Escape') {
            this.closeDropdown();
            this.languageToggle.focus();
            return;
        }

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const items = Array.from(this.languageMenu.querySelectorAll('.language-option, [data-lang]'));
            const currentIndex = items.indexOf(document.activeElement);
            let nextIndex;

            if (e.key === 'ArrowDown') {
                nextIndex = (currentIndex + 1) % items.length;
            } else {
                nextIndex = (currentIndex - 1 + items.length) % items.length;
            }

            items[nextIndex]?.focus();
        }

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const activeElement = document.activeElement;
            const lang = activeElement.getAttribute('data-lang');
            if (lang) {
                this.setLanguage(lang);
            }
        }
    }

    applyLanguage(lang, redirect = true) {
        if (lang === this.currentLanguage) return;

        this.currentLanguage = lang;
        this.saveLanguage(lang);
        this.updateUI();
        this.updateAccessibilityLabel();

        if (redirect) {
            this.redirectToLanguage(lang);
        }

        // Disparar evento para que otros componentes reaccionen
        window.dispatchEvent(new CustomEvent('language:changed', {
            detail: {
                language: lang,
                previousLanguage: this.currentLanguage
            }
        }));

        console.log(`🌐 Idioma cambiado a: ${lang}`);
    }

    updateUI() {
        // Actualizar estado visual del dropdown
        const items = this.languageMenu.querySelectorAll('.language-option, [data-lang]');
        items.forEach(item => {
            const itemLang = item.getAttribute('data-lang');
            const isActive = itemLang === this.currentLanguage;

            item.classList.toggle('active', isActive);
            item.setAttribute('aria-current', isActive ? 'true' : 'false');
        });

        // Actualizar bandera en el toggle
        this.updateFlagIcon();

        // Actualizar elementos de la página según el idioma
        this.updatePageContent();
    }

    updateFlagIcon() {
        const flagElement = document.getElementById('current-language-flag');
        if (flagElement) {
            const flags = {
                'es': '/assets/icons/es-flag.svg',
                'en': '/assets/icons/gb-flag.svg'
            };
            flagElement.src = flags[this.currentLanguage];
            flagElement.alt = this.currentLanguage === 'es' ? 'Español' : 'English';
        }
    }

    updatePageContent() {
        // Mostrar/ocultar elementos según idioma
        document.querySelectorAll('[data-lang-specific]').forEach(element => {
            const targetLang = element.getAttribute('data-lang-specific');
            element.style.display = targetLang === this.currentLanguage ? 'block' : 'none';
        });

        // Actualizar textos con data-i18n
        this.updateInternationalizedTexts();
    }

    updateInternationalizedTexts() {
        // Esto puede expandirse con un sistema completo de i18n
        const translations = {
            'es': {
                'nav_home': 'Inicio',
                'nav_about': 'Sobre mí',
                'nav_projects': 'Proyectos',
                'nav_blog': 'Devlogs',
                'nav_contact': 'Contacto',
                'spanish': 'Español',
                'english': 'English',
                'theme_light': 'Claro',
                'theme_dark': 'Oscuro',
                'theme_contrast': 'Alto Contraste'
            },
            'en': {
                'nav_home': 'Home',
                'nav_about': 'About Me',
                'nav_projects': 'Projects',
                'nav_blog': 'Devlogs',
                'nav_contact': 'Contact',
                'spanish': 'Español',
                'english': 'English',
                'theme_light': 'Light',
                'theme_dark': 'Dark',
                'theme_contrast': 'High Contrast'
            }
        };

        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[this.currentLanguage] && translations[this.currentLanguage][key]) {
                element.textContent = translations[this.currentLanguage][key];
            }
        });
    }

    redirectToLanguage(lang) {
        const currentPath = window.location.pathname;
        let newPath;

        if (lang === 'es') {
            // Quitar /en del path
            newPath = currentPath.replace(/^\/en/, '') || '/';
        } else {
            // Agregar /en al path, asegurando no duplicar
            newPath = currentPath === '/' ? '/en' : `/en${currentPath.replace(/^\/en/, '')}`;
        }

        // Mantener query parameters
        const search = window.location.search;
        const hash = window.location.hash;

        window.location.href = newPath + search + hash;
    }

    getSavedLanguage() {
        return localStorage.getItem('preferred-language');
    }

    saveLanguage(lang) {
        localStorage.setItem('preferred-language', lang);
    }

    // ========== MÉTODOS PÚBLICOS ==========

    setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`⚠️ Idioma no soportado: ${lang}`);
            return;
        }
        this.applyLanguage(lang, true); // Redirigir cuando se cambia manualmente
        this.closeDropdown();
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getSupportedLanguages() {
        return [...this.supportedLanguages];
    }

    toggle() {
        this.toggleDropdown();
    }

    refresh() {
        this.handleUrlChange();
    }

    destroy() {
        this.closeDropdown();
        // Limpiar event listeners si es necesario
    }
}

// Inicialización automática cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.languageController = new LanguageController();
});

export default LanguageController;

// src\assets\scripts\core\theme.js


// src\assets\scripts\core\router.js


// src\assets\scripts\core\app.js
// ============================
// APP CONTROLLER - CON CARGA AUTOMÁTICA
// ============================

class AppController {
    constructor() {
        this.modules = {};
        this.BASE_URL = '{{ site.baseurl }}';
        this.moduleStatus = new Map();
        this.init();
    }

    async init() {
        try {
            // Esperar a que el DOM esté listo
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.startApp());
            } else {
                this.startApp();
            }
        } catch (error) {
            console.error('❌ Error inicializando la app:', error);
        }
    }

    async startApp() {
        // Registrar módulos disponibles
        this.registerModules();

        // Inicializar módulos en orden
        await this.initModules();

        // Configurar eventos globales
        this.setupGlobalEvents();

        console.log('✅ App inicializada correctamente');
    }

    registerModules() {
        // Módulos core (siempre presentes)
        this.availableModules = {
            'sidebar': 'SidebarController',
            'scroll': 'ScrollController',
            'theme': 'ThemeController',
            'language': 'LanguageController',
            'particles': 'ParticlesController',
            'tooltips': 'TooltipsController',
            'popups': 'PopupsController'
        };

        // Verificar qué módulos están realmente cargados
        this.detectLoadedModules();
    }

    detectLoadedModules() {
        Object.keys(this.availableModules).forEach(moduleName => {
            const className = this.availableModules[moduleName];
            if (window[className]) {
                this.moduleStatus.set(moduleName, 'available');
            } else {
                this.moduleStatus.set(moduleName, 'missing');
                console.warn(`⚠️ Módulo ${moduleName} no encontrado`);
            }
        });
    }

    async initModules() {
        const initQueue = [];

        // Crear instancias solo de módulos disponibles
        for (const [moduleName, status] of this.moduleStatus) {
            if (status === 'available') {
                const className = this.availableModules[moduleName];
                initQueue.push(this.createModuleInstance(moduleName, className));
            }
        }

        // Inicializar módulos en paralelo
        await Promise.allSettled(initQueue);

        // Esperar a módulos críticos
        await this.waitForCriticalModules();
    }

    async createModuleInstance(moduleName, className) {
        try {
            const ModuleClass = window[className];
            this.modules[moduleName] = new ModuleClass();

            // Si el módulo tiene una promesa ready, esperarla
            if (this.modules[moduleName].ready) {
                await this.modules[moduleName].ready;
            }

            this.moduleStatus.set(moduleName, 'initialized');
            console.log(`✅ Módulo ${moduleName} inicializado`);

        } catch (error) {
            console.error(`❌ Error inicializando módulo ${moduleName}:`, error);
            this.moduleStatus.set(moduleName, 'error');
        }
    }

    async waitForCriticalModules() {
        const criticalModules = ['theme', 'sidebar'];
        const criticalPromises = criticalModules
            .filter(module => this.moduleStatus.get(module) === 'initialized')
            .map(module => this.modules[module].ready);

        await Promise.allSettled(criticalPromises);
    }

    setupGlobalEvents() {
        // Eventos globales del documento
        document.addEventListener('keydown', this.handleGlobalKeys.bind(this));

        // Botones en el HTML para abrir popups
        this.setupPopupTriggers();

        // Exponer módulos globalmente para debugging
        window.app = this;
    }

    setupPopupTriggers() {
        // Botón de accesibilidad
        const accessibilityBtn = document.getElementById('accessibility-btn');
        if (accessibilityBtn && this.modules.popups) {
            accessibilityBtn.addEventListener('click', () => {
                this.modules.popups.showAccessibilityPopup();
            });
        }

        // Botón de contacto
        const contactBtn = document.getElementById('contact-btn');
        if (contactBtn && this.modules.popups) {
            contactBtn.addEventListener('click', () => {
                this.modules.popups.showContactPopup();
            });
        }

        // Botón de descargar CV
        const downloadBtn = document.getElementById('download-cv-btn');
        if (downloadBtn && this.modules.popups) {
            downloadBtn.addEventListener('click', () => {
                this.modules.popups.showDownloadPopup();
            });
        }

        // Botones rápidos del sidebar
        document.querySelectorAll('[data-action="accessibility"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.modules.popups) {
                    this.modules.popups.showAccessibilityPopup();
                }
            });
        });

        document.querySelectorAll('[data-action="contact"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.modules.popups) {
                    this.modules.popups.showContactPopup();
                }
            });
        });
    }

    handleGlobalKeys(event) {
        // Atajos globales de teclado
        if (event.altKey) {
            switch(event.key) {
                case 'a': // Alt + A para accesibilidad
                    event.preventDefault();
                    if (this.modules.popups) this.modules.popups.showAccessibilityPopup();
                    break;
                case 'c': // Alt + C para contacto
                    event.preventDefault();
                    if (this.modules.popups) this.modules.popups.showContactPopup();
                    break;
                case 'd': // Alt + D para descargar CV
                    event.preventDefault();
                    if (this.modules.popups) this.modules.popups.showDownloadPopup();
                    break;
            }
        }

        if (event.ctrlKey && event.altKey) {
            switch(event.key) {
                case 'm':
                    event.preventDefault();
                    if (this.modules.sidebar) this.modules.sidebar.toggle();
                    break;
                case 't':
                    event.preventDefault();
                    if (this.modules.theme) this.modules.theme.cycleThemes();
                    break;
                case 'l':
                    event.preventDefault();
                    if (this.modules.language) this.modules.language.toggle();
                    break;
            }
        }
    }

    // Métodos utilitarios
    getModule(name) {
        return this.modules[name];
    }

    isModuleLoaded(name) {
        return this.moduleStatus.get(name) === 'initialized';
    }

    getLoadedModules() {
        return Array.from(this.moduleStatus.entries())
            .filter(([_, status]) => status === 'initialized')
            .map(([name]) => name);
    }

    async loadModule(moduleName) {
        if (this.moduleStatus.get(moduleName) === 'initialized') {
            return this.modules[moduleName];
        }

        // Aquí podrías implementar carga dinámica de módulos
        console.warn(`Carga dinámica no implementada para: ${moduleName}`);
        return null;
    }

    destroy() {
        // Cleanup de todos los módulos
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.destroy === 'function') {
                module.destroy();
            }
        });

        this.modules = {};
        this.moduleStatus.clear();
    }
}

// Inicialización automática
window.appController = new AppController();
