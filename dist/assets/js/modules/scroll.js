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