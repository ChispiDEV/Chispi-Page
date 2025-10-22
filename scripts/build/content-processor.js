import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

class ContentProcessor {
    constructor() {
        this.dataPath = 'src/data';
        this.includesPath = 'src/includes/generated';
    }

    loadJSON(file) {
        try {
            const content = readFileSync(`${this.dataPath}/${file}`, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.error(`❌ Error cargando ${file}:`, error.message);
            return {};
        }
    }

    generateBioSection(lang) {
        const content = this.loadJSON('content.json');
        const bio = content.about?.[lang]?.bio;

        if (!bio) return '';

        let html = `
            <!-- Imagen y saludo -->
            <div class="profile-header text-center mb-12">
                <img src="/assets/img/foto-perfil.jpg" alt="${lang === 'es' ? 'Foto de Cristina' : 'Photo of Cristina'}"
                     class="profile-image">
                <h2 class="section-title">🧑‍💻 ${bio.title}</h2>
                <p class="profile-greeting">${bio.greeting}</p>
            </div>

            <!-- Biografía -->
            <div class="about-grid">
        `;

        bio.sections.forEach((section, index) => {
            const cardClass = index === 0 ? 'card-sol' : 'card-fuego';
            html += `
                <div class="grid-item">
                    <div class="card ${cardClass}">
                        <p>${section.icon} ${section.content}</p>
                        <ul class="skill-list">
            `;

            section.items.forEach(item => {
                html += `<li>${item}</li>`;
            });

            html += `
                        </ul>
                    </div>
                </div>
            `;
        });

        // Sección combinada
        html += `
                <div class="grid-item grid-item-full">
                    <div class="card card-coral">
                        <p>👀 ${lang === 'es'
            ? 'Gracias a mi formación en <strong>bioquímica y educación</strong>, combino el razonamiento científico con la creatividad para resolver problemas complejos.'
            : 'Thanks to my background in <strong>biochemistry and education</strong>, I combine scientific reasoning with creativity to solve complex problems.'}
                        </p>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    generateCurrentProjects(lang) {
        const content = this.loadJSON('content.json');
        const projects = content.about?.[lang]?.currentProjects;

        if (!projects) return '';

        let html = `
            <div class="grid-item">
                <div class="card card-cielo">
                    <h3 class="section-subtitle">${projects.title}</h3>
                    <ul class="skill-list">
        `;

        projects.items.forEach(item => {
            html += `<li>${item}</li>`;
        });

        html += `
                    </ul>
                </div>
            </div>
        `;

        return html;
    }

    generateFunFacts(lang) {
        const content = this.loadJSON('content.json');
        const funFacts = content.about?.[lang]?.funFacts;

        if (!funFacts) return '';

        let html = `
            <div class="grid-item grid-item-full">
                <div class="card card-uva">
                    <h3 class="section-subtitle">${funFacts.title}</h3>
                    <ul class="skill-list">
        `;

        funFacts.items.forEach(item => {
            html += `<li>${item}</li>`;
        });

        html += `
                    </ul>
                </div>
            </div>
        `;

        return html;
    }

    generateSkillsCategory(categoryKey, lang) {
        const skills = this.loadJSON('skills.json');
        const category = skills[categoryKey];

        if (!category) return '';

        let html = `
        <div class="skills-section card pastel-${Object.keys(skills).indexOf(categoryKey) + 1}">
            <h4 class="skill-category-title">${category[lang]}</h4>
    `;

        // Manejar categorías normales
        if (category.items) {
            html += '<div class="skill-items">';

            category.items.forEach(item => {
                const tooltip = item.tooltip?.[lang] || item.name;
                const displayName = typeof item.name === 'object' ? item.name[lang] : item.name;

                html += `
                    <a href="#" class="skill-item" style="background-color: #${item.color};" 
                       aria-label="${tooltip}">
                        ${item.logo ? `<i class="devicon-${item.logo}-plain"></i>` : ''}
                        <span>${displayName}</span>
                    </a>
                `;
            });

            html += '</div>';
        }

        // Manejar categorías con subsections (como want-to-learn)
        if (category.subsections) {
            html += '<div class="subsections-grid">';

            Object.values(category.subsections).forEach(subsection => {
                html += `
                    <div class="subsection">
                        <h5 class="subsection-title">${subsection[lang]}</h5>
                        <div class="skill-items">
                `;

                subsection.items.forEach(item => {
                    const tooltip = item.tooltip?.[lang] || item.name;
                    html += `
                        <a href="#" class="skill-item" style="background-color: #${item.color};" 
                           aria-label="${tooltip}">
                            ${item.logo ? `<i class="devicon-${item.logo}-plain"></i>` : ''}
                            <span>${item.name}</span>
                        </a>
                    `;
                });

                html += `
                        </div>
                    </div>
                `;
            });

            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    generateAllSkills(lang) {
        const skillsCategories = [
            'languages',
            'frameworks',
            'data-visualization',
            'development-tools',
            'databases',
            'ides',
            'work-style',
            'want-to-learn'
        ];

        let html = '<div class="skills-grid">';

        skillsCategories.forEach(category => {
            const categoryHTML = this.generateSkillsCategory(category, lang);
            if (categoryHTML) {
                html += categoryHTML;
            }
        });

        html += '</div>';
        return html;
    }

    generateFeaturedTech(lang) {
        const featured = this.loadJSON('featured-tech.json');

        if (!featured.featured) return '';

        let html = '<div class="tech-main-grid">';

        featured.featured.forEach(tech => {
            const tooltip = tech.tooltip?.[lang] || tech.name;
            html += `
                <div class="tech-item" title="${tooltip}">
                    <i class="devicon-${tech.logo}-plain colored"></i>
                    <span>${tech.name}</span>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    // Generar todos los includes
    generateAllIncludes() {
        // Crear directorio si no existe
        if (!existsSync(this.includesPath)) {
            mkdirSync(this.includesPath, { recursive: true });
        }

        // Generar para ambos idiomas
        ['es', 'en'].forEach(lang => {
            // 1. Secciones de contenido
            const bioHTML = this.generateBioSection(lang);
            writeFileSync(`${this.includesPath}/bio-${lang}.html`, bioHTML);

            const projectsHTML = this.generateCurrentProjects(lang);
            writeFileSync(`${this.includesPath}/current-projects-${lang}.html`, projectsHTML);

            const funFactsHTML = this.generateFunFacts(lang);
            writeFileSync(`${this.includesPath}/fun-facts-${lang}.html`, funFactsHTML);

            // 2. Tecnologías principales
            const featuredTechHTML = this.generateFeaturedTech(lang);
            writeFileSync(`${this.includesPath}/featured-tech-${lang}.html`, featuredTechHTML);

            // 3. Todas las categorías de skills
            const skillsCategories = [
                'languages',
                'frameworks',
                'data-visualization',
                'development-tools',
                'databases',
                'ides',
                'work-style',
                'want-to-learn'
            ];

            skillsCategories.forEach(category => {
                const skillsHTML = this.generateSkillsCategory(category, lang);
                if (skillsHTML) {
                    writeFileSync(`${this.includesPath}/skills-${category}-${lang}.html`, skillsHTML);
                }
            });

            // 4. Skills completo (todas las categorías juntas)
            const allSkillsHTML = this.generateAllSkills(lang);
            writeFileSync(`${this.includesPath}/all-skills-${lang}.html`, allSkillsHTML);
        });

        console.log('✅ Includes generados automáticamente');
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const processor = new ContentProcessor();
    processor.generateAllIncludes();
}

export default ContentProcessor;