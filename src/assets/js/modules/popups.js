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