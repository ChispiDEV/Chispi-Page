// scripts/templates/config-manager.js
class ConfigManager {
    constructor() {
        this.config = {
            site: {
                title: "Chispi Page",
                description: "Portfolio y espacio creativo de Chispi",
                url: "http://localhost:3000",
                time: new Date().getFullYear()
            },
            pages: {
                // PÁGINA PRINCIPAL ESPAÑOL
                'index.html': {
                    title: "Inicio",
                    lang: "es",
                    hero: true,
                    hero_title: "¡Hola! Soy <span class='text-verde-1'>Chispi</span>",
                    hero_subtitle: "Desarrolladora | Analista de Datos | Creadora de Contenido",
                    hero_description: "Bienvenida a <strong>Chispi Page</strong>: un espacio donde comparto mis ideas, proyectos, devlogs, arte y más.",
                    hero_image_dark: "/assets/img/index-bg-dark.jpg",
                    hero_image_light: "/assets/img/index-bg-light.jpg",
                    hero_img: "/assets/img/perfil-Chispi.jpg"
                },

                // PÁGINA PRINCIPAL INGLÉS
                'en/index.html': {
                    title: "Home",
                    lang: "en",
                    hero: true,
                    hero_title: "Hi! I'm <span class='text-verde-1'>Chispi</span>",
                    hero_subtitle: "Developer | Data Analyst | Content Creator",
                    hero_description: "Welcome to <strong>Chispi Page</strong>: a place where I share my ideas, projects, devlogs, art and more.",
                    hero_image_dark: "/assets/img/index-bg-dark.jpg",
                    hero_image_light: "/assets/img/index-bg-light.jpg",
                    hero_img: "/assets/img/perfil-Chispi.jpg"
                },

                // OTRAS PÁGINAS (ejemplos)
                'about.html': {
                    title: "Sobre Mí",
                    lang: "es",
                    hero: false
                },
                'en/about.html': {
                    title: "About Me",
                    lang: "en",
                    hero: false
                },
                'projects.html': {
                    title: "Proyectos",
                    lang: "es",
                    hero: false
                },
                'en/projects.html': {
                    title: "Projects",
                    lang: "en",
                    hero: false
                },
                'blog.html': {
                    title: "Devlogs",
                    lang: "es",
                    hero: false
                },
                'en/blog.html': {
                    title: "Devlogs",
                    lang: "en",
                    hero: false
                },
                'contact.html': {
                    title: "Contacto",
                    lang: "es",
                    hero: false
                },
                'en/contact.html': {
                    title: "Contact",
                    lang: "en",
                    hero: false
                }
            }
        };
    }

    getPageConfig(pagePath) {
        const key = pagePath.replace('src/pages/', '').replace('dist/', '');
        const pageConfig = this.config.pages[key] || {
            title: 'Chispi Page',
            lang: 'es',
            hero: false
        };

        // Asegurar que el título completo incluya el site title
        return {
            ...pageConfig,
            full_title: `${this.config.site.title} | ${pageConfig.title}`
        };
    }

    getSiteConfig() {
        return this.config.site;
    }

    processTemplate(template, pageConfig) {
        let processed = template;

        // Reemplazar variables del sitio
        processed = processed.replace(/{{ site\.(.+?) }}/g, (match, key) => {
            return this.config.site[key] || match;
        });

        // Reemplazar variables de página  
        processed = processed.replace(/{{ page\.(.+?) }}/g, (match, key) => {
            return pageConfig[key] || match;
        });

        // Reemplazar relative_url
        processed = processed.replace(/{{ '(.*?)' \| relative_url }}/g, (match, path) => {
            return path;
        });

        // Reemplazar filtros de fecha
        processed = processed.replace(/{{ site\.time \| date: '\%Y' }}/g, () => {
            return new Date().getFullYear().toString();
        });

        return processed;
    }
}

export default ConfigManager;