// assets/js/particles.js
class EnhancedParticleSystem {
    constructor(canvasId) {
        console.log('🚀 Creando sistema de partículas MEJORADO...');

        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('❌ Canvas no encontrado');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.isInitialized = false;
        this.lowRefreshRate = false;
        this.lastFrameTime = 0;
        this.frameInterval = 1000 / 60; // 60 FPS por defecto

        console.log('✅ Canvas encontrado');
        this.init();
    }

    init() {
        console.log('🎯 Inicializando partículas MEJORADAS...');

        // Configuración mejorada con valores CSS
        this.config = {
            count: this.getCSSVariable('--particles-count', 80),
            colors: this.getParticleColors(),
            sizeMin: this.getCSSVariable('--particles-size-min', 1.5),
            sizeMax: this.getCSSVariable('--particles-size-max', 4),
            speed: this.getCSSVariable('--particles-speed', 0.8),
            opacity: this.getCSSVariable('--particles-opacity', 0.6),
            blur: this.getCSSVariable('--particles-blur', 0),
            moveSpeed: this.getCSSVariable('--particles-move-speed', 1)
        };

        setTimeout(() => {
            this.setupCanvas();
            this.createParticles();
            this.startAnimation();
            this.isInitialized = true;

            console.log('🎉 PARTÍCULAS MEJORADAS INICIADAS');
        }, 100);
    }

    getCSSVariable(name, defaultValue) {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name);
        if (value) {
            return parseFloat(value.trim());
        }
        return defaultValue;
    }

    getParticleColors() {
        // Intentar obtener colores del array CSS
        const colorsArray = getComputedStyle(document.documentElement).getPropertyValue('--particles-colors-array');
        if (colorsArray) {
            try {
                return JSON.parse(colorsArray.replace(/'/g, '"'));
            } catch (e) {
                console.warn('No se pudo parsear --particles-colors-array, usando colores por defecto');
            }
        }

        // Colores por defecto basados en el tema
        return [
            'rgba(60, 200, 143, 0.4)',
            'rgba(51, 91, 154, 0.35)',
            'rgba(87, 196, 220, 0.3)',
            'rgba(255, 255, 255, 0.25)',
            'rgba(200, 220, 255, 0.3)'
        ];
    }

    setupCanvas() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.display = 'block';
        this.canvas.style.background = 'transparent';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';

        console.log('📐 Canvas dimensionado a:', width, 'x', height);
    }

    createParticles() {
        this.particles = [];

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
    }

    updateParticles() {
        this.particles.forEach(particle => {
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

            // Movimiento orgánico reducido para mejor rendimiento
            particle.speedX += (Math.random() - 0.5) * 0.01;
            particle.speedY += (Math.random() - 0.5) * 0.01;

            // Limitar velocidad
            const maxSpeed = this.config.speed * 1.5;
            const speed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);
            if (speed > maxSpeed) {
                particle.speedX = (particle.speedX / speed) * maxSpeed;
                particle.speedY = (particle.speedY / speed) * maxSpeed;
            }
        });
    }

    drawParticles() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Aplicar blur si está configurado
        if (this.config.blur > 0) {
            this.ctx.shadowBlur = this.config.blur;
        }

        // Dibujar partículas
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
        });

        // Resetear shadow
        this.ctx.shadowBlur = 0;
    }

    animate(currentTime) {
        if (!this.lastFrameTime) this.lastFrameTime = currentTime;

        const deltaTime = currentTime - this.lastFrameTime;

        if (deltaTime >= this.frameInterval) {
            this.updateParticles();
            this.drawParticles();
            this.lastFrameTime = currentTime - (deltaTime % this.frameInterval);
        }

        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }

    startAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.lastFrameTime = 0;
        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    setLowRefreshRate(enabled) {
        this.lowRefreshRate = enabled;
        this.frameInterval = enabled ? 1000 / 30 : 1000 / 60; // 30 FPS o 60 FPS
    }

    onThemeChange(theme) {
        if (window.particleThemes && window.particleThemes[theme]) {
            this.config.colors = window.particleThemes[theme].colors;
            this.restart();
        }
    }

    updateFromCSS() {
        this.config.count = this.getCSSVariable('--particles-count', 80);
        this.config.opacity = this.getCSSVariable('--particles-opacity', 0.6);
        this.config.speed = this.getCSSVariable('--particles-speed', 0.8);
        this.config.moveSpeed = this.getCSSVariable('--particles-move-speed', 1);

        this.restart();
    }

    restart() {
        this.createParticles();
        this.startAnimation();
    }

    // Métodos públicos para debugging
    makeBrighter() {
        this.particles.forEach(particle => {
            const newColor = particle.color.replace(/[\d\.]+\)$/g, '0.8)');
            particle.color = newColor;
        });
    }

    makeLarger() {
        this.particles.forEach(particle => {
            particle.size *= 1.5;
        });
    }
}

// Inicialización mejorada
function initializeEnhancedParticles() {
    console.log('🌊 INICIANDO PARTÍCULAS MEJORADAS...');

    setTimeout(() => {
        window.particleSystem = new EnhancedParticleSystem('particles-canvas');

        // Comandos globales para debugging
        window.makeParticlesBrighter = function() {
            if (window.particleSystem) {
                window.particleSystem.makeBrighter();
            }
        };

        window.makeParticlesLarger = function() {
            if (window.particleSystem) {
                window.particleSystem.makeLarger();
            }
        };

    }, 100);
}

// Iniciar cuando esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM listo - Iniciando partículas mejoradas...');
    initializeEnhancedParticles();
});