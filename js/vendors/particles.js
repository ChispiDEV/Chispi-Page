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