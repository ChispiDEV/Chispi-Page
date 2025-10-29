// assets/js/particles.js
class EnhancedParticleSystem {
    constructor(canvasId) {
        console.log('🚀 Iniciando sistema de partículas mejorado...');

        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('❌ Canvas no encontrado:', canvasId);
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.isInitialized = false;
        this.currentTheme = 'light';

        // Configuración inicial
        this.config = {
            count: 60,
            colors: this.getParticleColors(),
            sizeMin: 1,
            sizeMax: 2.5,
            speed: 0.5,
            opacity: 0.4,
            moveSpeed: 1
        };

        console.log('✅ Sistema de partículas creado');
        this.init();
    }

    init() {
        this.setupCanvas();
        this.createParticles();
        this.startAnimation();
        this.isInitialized = true;

        // Escuchar cambios de tema
        this.setupThemeListener();

        console.log('🎉 Partículas inicializadas con tema:', this.currentTheme);
    }

    getCSSVariable(name, defaultValue) {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name);
        return value ? parseFloat(value.trim()) : defaultValue;
    }

    getParticleColors() {
        // Obtener colores del CSS variable
        const colorsArray = getComputedStyle(document.documentElement).getPropertyValue('--particles-colors-array');
        if (colorsArray) {
            try {
                // Limpiar y parsear el array
                const cleanArray = colorsArray.trim().replace(/^\[|\]$/g, '');
                return JSON.parse(`[${cleanArray}]`);
            } catch (e) {
                console.warn('❌ No se pudieron parsear los colores CSS, usando defaults');
            }
        }

        // Colores por defecto más suaves
        return [
            'rgba(100, 200, 255, 0.2)',
            'rgba(120, 180, 240, 0.15)',
            'rgba(140, 220, 255, 0.18)',
            'rgba(160, 230, 255, 0.12)',
            'rgba(180, 240, 255, 0.1)'
        ];
    }

    setupCanvas() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
            opacity: ${this.config.opacity};
        `;

        console.log('📐 Canvas configurado:', width, 'x', height);
    }

    createParticles() {
        this.particles = [];

        // Obtener configuración actualizada del CSS
        this.updateConfigFromCSS();

        for (let i = 0; i < this.config.count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * (this.config.sizeMax - this.config.sizeMin) + this.config.sizeMin,
                speedX: (Math.random() - 0.5) * this.config.speed * this.config.moveSpeed,
                speedY: (Math.random() - 0.5) * this.config.speed * this.config.moveSpeed,
                color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
                originalColor: this.config.colors[Math.floor(Math.random() * this.config.colors.length)]
            });
        }

        console.log(`✨ ${this.particles.length} partículas creadas`);
    }

    updateConfigFromCSS() {
        this.config.count = this.getCSSVariable('--particles-count', 60);
        this.config.opacity = this.getCSSVariable('--particles-opacity', 0.4);
        this.config.speed = this.getCSSVariable('--particles-speed', 0.5);
        this.config.moveSpeed = this.getCSSVariable('--particles-move-speed', 1);
        this.config.sizeMin = this.getCSSVariable('--particles-size-min', 1);
        this.config.sizeMax = this.getCSSVariable('--particles-size-max', 2.5);

        // Actualizar colores
        this.config.colors = this.getParticleColors();

        // Aplicar opacidad al canvas
        if (this.canvas) {
            this.canvas.style.opacity = this.config.opacity;
        }
    }

    updateParticles() {
        const reducedMotion = document.documentElement.hasAttribute('data-reduced-motion');

        this.particles.forEach(particle => {
            if (!reducedMotion) {
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                // Rebote en bordes
                if (particle.x <= 0 || particle.x >= this.canvas.width) {
                    particle.speedX *= -0.95;
                    particle.x = Math.max(1, Math.min(this.canvas.width - 1, particle.x));
                }

                if (particle.y <= 0 || particle.y >= this.canvas.height) {
                    particle.speedY *= -0.95;
                    particle.y = Math.max(1, Math.min(this.canvas.height - 1, particle.y));
                }

                // Movimiento orgánico reducido
                particle.speedX += (Math.random() - 0.5) * 0.01;
                particle.speedY += (Math.random() - 0.5) * 0.01;

                // Limitar velocidad
                const maxSpeed = this.config.speed * 1.5;
                const speed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);
                if (speed > maxSpeed) {
                    particle.speedX = (particle.speedX / speed) * maxSpeed;
                    particle.speedY = (particle.speedY / speed) * maxSpeed;
                }
            }
            // En reduced motion, las partículas no se mueven
        });
    }

    drawParticles() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujar partículas
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
        });
    }

    animate() {
        this.updateParticles();
        this.drawParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    startAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.animate();
    }

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    setLowRefreshRate(enabled) {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (enabled) {
            // Animación a 30 FPS para bajo refresco
            this.animate = () => {
                this.updateParticles();
                this.drawParticles();
                setTimeout(() => {
                    this.animationId = requestAnimationFrame(() => this.animate());
                }, 33); // ~30 FPS
            };
        } else {
            // Animación normal a 60 FPS
            this.animate = () => {
                this.updateParticles();
                this.drawParticles();
                this.animationId = requestAnimationFrame(() => this.animate());
            };
        }

        this.startAnimation();
    }

    setupThemeListener() {
        // Observar cambios en data-theme
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    const newTheme = document.documentElement.getAttribute('data-theme') || 'light';
                    this.onThemeChange(newTheme);
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        // También observar cambios en atributos de accesibilidad
        const accessibilityObserver = new MutationObserver(() => {
            this.updateConfigFromCSS();
        });

        accessibilityObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-reduced-motion', 'data-photophobia-mode']
        });
    }

    onThemeChange(newTheme) {
        console.log('🎨 Cambio de tema detectado:', newTheme);
        this.currentTheme = newTheme;

        // Pequeño delay para asegurar que CSS está aplicado
        setTimeout(() => {
            this.updateConfigFromCSS();
            this.createParticles();
        }, 100);
    }

    restart() {
        this.createParticles();
        this.startAnimation();
    }

    // Métodos públicos para debugging
    makeBrighter() {
        this.particles.forEach(particle => {
            const newColor = particle.color.replace(/[\d\.]+\)$/g, '0.6)');
            particle.color = newColor;
        });
        console.log('💡 Partículas hechas más brillantes');
    }

    makeLarger() {
        this.particles.forEach(particle => {
            particle.size *= 1.5;
        });
        console.log('🔍 Partículas agrandadas');
    }
}

// Inicialización global
function initializeParticles() {
    console.log('🌊 Inicializando partículas...');

    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.particleSystem = new EnhancedParticleSystem('particles-canvas');
        });
    } else {
        window.particleSystem = new EnhancedParticleSystem('particles-canvas');
    }
}

// Comandos de debug
window.makeParticlesBrighter = () => {
    if (window.particleSystem) window.particleSystem.makeBrighter();
};

window.makeParticlesLarger = () => {
    if (window.particleSystem) window.particleSystem.makeLarger();
};

window.restartParticles = () => {
    if (window.particleSystem) window.particleSystem.restart();
};

// Iniciar
initializeParticles();