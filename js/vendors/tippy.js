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