// Router simple para SPA (si es necesario)
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = '';
        this.init();
    }

    init() {
        // Navegación para enlaces internos
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="/"]');
            if (link && !link.target) {
                e.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });

        // Manejar botones atrás/adelante
        window.addEventListener('popstate', () => {
            this.handleRoute(window.location.pathname);
        });

        // Ruta inicial
        this.handleRoute(window.location.pathname);
    }

    addRoute(path, callback) {
        this.routes[path] = callback;
    }

    navigate(path) {
        window.history.pushState({}, '', path);
        this.handleRoute(path);
    }

    handleRoute(path) {
        this.currentRoute = path;

        // Emitir evento de cambio de ruta
        document.dispatchEvent(new CustomEvent('routeChanged', {
            detail: { path }
        }));

        // Ejecutar callback si existe
        if (this.routes[path]) {
            this.routes[path]();
        }
    }

    getCurrentRoute() {
        return this.currentRoute;
    }
}

// Inicializar
const router = new Router();
window.router = router;