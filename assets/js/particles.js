// assets/js/particles.js - VERSIÓN CON PARTÍCULAS VISIBLES
console.log('🔴 particles.js cargado - VERSIÓN VISIBLE');

// ===== SISTEMA DE PARTÍCULAS VISIBLES =====
class VisibleParticleSystem {
    constructor(canvasId) {
        console.log('🚀 Creando sistema de partículas VISIBLE...');

        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('❌ Canvas no encontrado');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.isInitialized = false;

        console.log('✅ Canvas encontrado');
        this.init();
    }

    init() {
        console.log('🎯 Inicializando partículas VISIBLES...');

        // CONFIGURACIÓN MÁS VISIBLE
        this.config = {
            count: 80,
            colors: [
                'rgba(60, 200, 143, 0.4)',    // Verde más visible
                'rgba(51, 91, 154, 0.35)',    // Azul más visible
                'rgba(87, 196, 220, 0.3)',    // Azul claro más visible
                'rgba(255, 255, 255, 0.25)',  // Blanco más visible
                'rgba(200, 220, 255, 0.3)'    // Azul claro más visible
            ],
            sizeMin: 1.5,
            sizeMax: 4,
            speed: 0.8
        };

        setTimeout(() => {
            this.setupCanvas();
            this.createParticles();
            this.startAnimation();
            this.isInitialized = true;

            console.log('🎉 PARTÍCULAS VISIBLES INICIADAS');
            console.log('👉 Si no ves nada, prueba en la consola: makeParticlesBrighter()');
        }, 100);
    }

    setupCanvas() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.display = 'block';
        this.canvas.style.background = 'transparent';

        console.log('📐 Canvas dimensionado a:', width, 'x', height);
    }

    createParticles() {
        this.particles = [];

        for (let i = 0; i < this.config.count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * (this.config.sizeMax - this.config.sizeMin) + this.config.sizeMin,
                speedX: (Math.random() - 0.5) * this.config.speed,
                speedY: (Math.random() - 0.5) * this.config.speed,
                color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
                originalColor: this.config.colors[Math.floor(Math.random() * this.config.colors.length)]
            });
        }

        console.log('✨ Partículas creadas:', this.particles.length);
        console.log('🎨 Colores usados:', this.config.colors);
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

            // Movimiento orgánico
            particle.speedX += (Math.random() - 0.5) * 0.02;
            particle.speedY += (Math.random() - 0.5) * 0.02;

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
        // LIMPIAR COMPLETAMENTE - sin fondo oscuro
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujar partículas con brillo
        this.particles.forEach(particle => {
            // Brillo suave
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 12;

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();

            this.ctx.shadowBlur = 0;
        });

        // Dibujar borde de debug (verde = funcionando)
        // this.ctx.strokeStyle = 'lime';
        // this.ctx.lineWidth = 2;
        // this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
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
        console.log('▶️ Iniciando animación VISIBLE...');
        this.animate();
    }

    // Hacer partículas más brillantes
    makeBrighter() {
        this.particles.forEach(particle => {
            const newColor = particle.color.replace(/[\d\.]+\)$/g, '0.6)');
            particle.color = newColor;
        });
        console.log('💡 Partículas hechas más brillantes');
    }

    // Hacer partículas más grandes
    makeLarger() {
        this.particles.forEach(particle => {
            particle.size *= 1.5;
        });
        console.log('🔍 Partículas agrandadas');
    }

    // Reinicio
    restart() {
        this.createParticles();
        this.startAnimation();
    }
}

// ===== INICIALIZACIÓN =====
function initializeVisibleParticles() {
    console.log('🌊 INICIANDO PARTÍCULAS VISIBLES...');

    setTimeout(() => {
        window.particleSystem = new VisibleParticleSystem('particles-canvas');

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

        window.showParticleDebug = function() {
            console.log('🔧 DEBUG PARTÍCULAS:');
            console.log('- makeParticlesBrighter() - Aumenta brillo');
            console.log('- makeParticlesLarger() - Aumenta tamaño');
            console.log('- particleSystem.restart() - Reinicia');
            console.log('- Partículas activas:', window.particleSystem?.particles?.length);
        };

    }, 100);
}

// ===== DIAGNÓSTICO RÁPIDO =====
function quickDiagnostic() {
    const canvas = document.getElementById('particles-canvas');
    console.log('🔍 DIAGNÓSTICO RÁPIDO:');
    console.log('- Canvas:', !!canvas);
    console.log('- Canvas tamaño:', canvas?.width, 'x', canvas?.height);
    console.log('- Z-index:', getComputedStyle(canvas).zIndex);
    console.log('- Opacidad:', getComputedStyle(canvas).opacity);

    // Verificar si hay elementos superpuestos
    const overlapped = document.elementsFromPoint(100, 100);
    console.log('- Elementos en (100,100):', overlapped[0]?.tagName);
}

// Iniciar cuando esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM listo - Iniciando partículas visibles...');
    quickDiagnostic();
    initializeVisibleParticles();
});

// Comandos iniciales
console.log('💡 COMANDOS DISPONIBLES:');
console.log('- makeParticlesBrighter()');
console.log('- makeParticlesLarger()');
console.log('- showParticleDebug()');
console.log('- quickDiagnostic()');