class ThemeManager {
    constructor() {
        this.availableThemes = [
            'light', 'dark', 'high-contrast', 'daltonism',
            'dyslexia', 'grayscale', 'photophobia',
            'reading', 'sepia', 'reduced-motion'
        ];

        this.availableModifiers = [
            'high-contrast',
            'reduced-motion',
            'reading-mode'
        ];

        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.currentModifiers = JSON.parse(localStorage.getItem('themeModifiers')) || [];
        this.init();
    }

    applyTheme(theme) {
        // Remover todos los temas primero
        this.availableThemes.forEach(t => {
            document.documentElement.removeAttribute(`data-theme`);
        });

        // Aplicar nuevo tema
        if (theme !== 'light') { // light es el tema por defecto
            document.documentElement.setAttribute('data-theme', theme);
        }
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
    }

    applyModifiers(modifiers) {
        // Remover todos los modificadores
        this.availableModifiers.forEach(m => {
            document.documentElement.removeAttribute(`data-modifier`);
        });

        // Aplicar nuevos modificadores
        modifiers.forEach(modifier => {
            document.documentElement.setAttribute('data-modifier', modifier);
        });

        localStorage.setItem('themeModifiers', JSON.stringify(modifiers));
        this.currentModifiers = modifiers;
    }

    // Interfaz para múltiples modificadores
    createAdvancedSelector() {
        return `
      <div class="theme-selector-advanced">
        <h4>Tema Principal</h4>
        <select id="main-theme">
          ${this.availableThemes.map(theme =>
            `<option value="${theme}" ${theme === this.currentTheme ? 'selected' : ''}>
              ${this.formatName(theme)}
            </option>`
        ).join('')}
        </select>
        
        <h4>Modificadores</h4>
        ${this.availableModifiers.map(modifier => `
          <label>
            <input type="checkbox" value="${modifier}" 
                   ${this.currentModifiers.includes(modifier) ? 'checked' : ''}>
            ${this.formatName(modifier)}
          </label>
        `).join('')}
      </div>
    `;
    }
}