// assets/js/footer.js
class FooterManager {
    constructor() {
        this.init();
    }

    init() {
        this.updateYear();
    }

    updateYear() {
        const yearElement = document.querySelector('footer .container p');
        if (yearElement) {
            const currentYear = new Date().getFullYear();
            yearElement.innerHTML = yearElement.innerHTML.replace(/2025/, currentYear);
        }
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    new FooterManager();
});