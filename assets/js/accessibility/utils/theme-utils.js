// assets/js/accessibility/utils/theme-utils.js

export class ThemeUtils {
    static applyThemeVariables(variables) {
        const root = document.documentElement;
        Object.entries(variables).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
    }

    static removeThemeVariables(variables) {
        const root = document.documentElement;
        variables.forEach(key => {
            root.style.removeProperty(key);
        });
    }

    static getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    static isDarkTheme() {
        return this.getCurrentTheme() === 'dark';
    }

    static getContrastColor(backgroundColor) {
        // Calcular contraste para asegurar accesibilidad
        const hex = backgroundColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    static generateAccessibleColors(baseColor) {
        // Generar paleta de colores accesible
        const colors = {
            primary: baseColor,
            secondary: this.adjustBrightness(baseColor, -20),
            accent: this.adjustBrightness(baseColor, 30),
            text: this.getContrastColor(baseColor),
            background: this.adjustBrightness(baseColor, 90)
        };

        return colors;
    }

    static adjustBrightness(hex, percent) {
        // Ajustar brillo de color hexadecimal
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;

        return '#' + (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    }
}