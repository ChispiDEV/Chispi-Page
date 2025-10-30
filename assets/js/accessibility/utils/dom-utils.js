// assets/js/accessibility/utils/dom-utils.js

export class DomUtils {
    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);

        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });

        return element;
    }

    static waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver((mutations, obs) => {
                const element = document.querySelector(selector);
                if (element) {
                    obs.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Elemento ${selector} no encontrado después de ${timeout}ms`));
            }, timeout);
        });
    }

    static injectCSS(css, id = null) {
        const style = document.createElement('style');
        if (id) style.id = id;
        style.textContent = css;
        document.head.appendChild(style);
        return style;
    }

    static removeCSS(id) {
        const style = document.getElementById(id);
        if (style) {
            style.remove();
            return true;
        }
        return false;
    }

    static toggleVisibility(element, show) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }

        if (element) {
            element.style.display = show ? 'block' : 'none';
            return true;
        }
        return false;
    }

    static setAttributes(element, attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            if (value === null || value === false) {
                element.removeAttribute(key);
            } else {
                element.setAttribute(key, value.toString());
            }
        });
    }

    static getComputedStyleValue(element, property) {
        return getComputedStyle(element).getPropertyValue(property).trim();
    }

    static isElementVisible(element) {
        if (!element) return false;

        const style = getComputedStyle(element);
        return style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
            element.offsetWidth > 0 &&
            element.offsetHeight > 0;
    }
}