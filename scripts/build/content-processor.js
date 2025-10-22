import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

class ContentProcessor {
    constructor() {
        this.dataPath = 'src/data';
        this.includesPath = 'src/includes/generated';
    }

    loadJSON(filePath) {
        try {
            const content = readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.error(`❌ Error cargando ${filePath}:`, error.message);
            return null;
        }
    }

    loadAllSkills() {
        const skillsPath = join(this.dataPath, 'skills');
        const skills = {};

        try {
            const files = readdirSync(skillsPath);

            files.forEach(file => {
                if (file.endsWith('.json')) {
                    const category = file.replace('.json', '');
                    const filePath = join(skillsPath, file);
                    const data = this.loadJSON(filePath);

                    if (data) {
                        skills[category] = data;
                    }
                }
            });

            console.log(`✅ Cargadas ${Object.keys(skills).length} categorías de skills`);
            return skills;

        } catch (error) {
            console.error('❌ Error cargando skills:', error.message);
            return {};
        }
    }

    loadContent() {
        const contentPath = join(this.dataPath, 'content');
        const content = {};

        try {
            const files = readdirSync(contentPath);

            files.forEach(file => {
                if (file.endsWith('.json')) {
                    const section = file.replace('.json', '').replace('-content', '');
                    const filePath = join(contentPath, file);
                    const data = this.loadJSON(filePath);

                    if (data) {
                        content[section] = data;
                    }
                }
            });

            console.log(`✅ Cargadas ${Object.keys(content).length} secciones de contenido`);
            return content;

        } catch (error) {
            console.error('❌ Error cargando contenido:', error.message);
            return {};
        }
    }

    generateBioSection(lang) {
        const content = this.loadContent();
        const about = content.about;

        if (!about?.[lang]?.bio) {
            console.log(`⚠️  No hay datos de bio para ${lang}`);
            return '<!-- Bio section no disponible -->';
        }

        const bio = about[lang].bio;

        let html = `
            <div class="profile-header text-center mb-12">
                <img src="/assets/img/foto-perfil.jpg" alt="${lang === 'es' ? 'Foto de Cristina' : 'Photo of Cristina'}" class="profile-image">
                <h2 class="section-title">🧑‍💻 ${bio.title}</h2>
                <p class="profile-greeting">${bio.greeting}</p>
            </div>
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
        const content = this.loadContent();
        const projects = content.projects?.[lang];

        if (!projects) {
            console.log(`⚠️  No hay datos de proyectos para ${lang}`);
            return '<!-- Projects section no disponible -->';
        }

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
        const content = this.loadContent();
        const funFacts = content.funfacts?.[lang];

        if (!funFacts) {
            console.log(`⚠️  No hay datos de curiosidades para ${lang}`);
            return '<!-- Fun facts section no disponible -->';
        }

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
        const skills = this.loadAllSkills();
        const category = skills[categoryKey];

        if (!category) {
            console.log(`⚠️  No hay datos para categoría ${categoryKey}`);
            return '';
        }

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

        // Manejar categorías con subsections
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
            'programming', 'frameworks', 'visualization',
            'tools', 'databases', 'ides', 'workstyle', 'learning'
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
        const featured = this.loadJSON(join(this.dataPath, 'featured-tech.json'));

        if (!featured?.featured) {
            console.log('⚠️  No hay tecnologías destacadas');
            return '<!-- Featured tech no disponible -->';
        }

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
        // Crear directorios si no existen
        if (!existsSync(this.includesPath)) {
            mkdirSync(this.includesPath, { recursive: true });
        }
        if (!existsSync(join(this.dataPath, 'content'))) {
            mkdirSync(join(this.dataPath, 'content'), { recursive: true });
        }
        if (!existsSync(join(this.dataPath, 'skills'))) {
            mkdirSync(join(this.dataPath, 'skills'), { recursive: true });
        }

        console.log('🚀 Generando includes...');

        // Generar para ambos idiomas
        ['es', 'en'].forEach(lang => {
            console.log(`🌐 Procesando idioma: ${lang}`);

            try {
                // 1. Secciones de contenido
                const bioHTML = this.generateBioSection(lang);
                writeFileSync(`${this.includesPath}/bio-${lang}.html`, bioHTML);
                console.log(`   ✅ bio-${lang}.html generado`);

                const projectsHTML = this.generateCurrentProjects(lang);
                writeFileSync(`${this.includesPath}/current-projects-${lang}.html`, projectsHTML);
                console.log(`   ✅ current-projects-${lang}.html generado`);

                const funFactsHTML = this.generateFunFacts(lang);
                writeFileSync(`${this.includesPath}/fun-facts-${lang}.html`, funFactsHTML);
                console.log(`   ✅ fun-facts-${lang}.html generado`);

                // 2. Tecnologías principales
                const featuredTechHTML = this.generateFeaturedTech(lang);
                writeFileSync(`${this.includesPath}/featured-tech-${lang}.html`, featuredTechHTML);
                console.log(`   ✅ featured-tech-${lang}.html generado`);

                // 3. Skills individuales
                const skillsCategories = ['programming', 'frameworks', 'visualization', 'tools', 'databases', 'ides', 'workstyle', 'learning'];

                skillsCategories.forEach(category => {
                    const skillsHTML = this.generateSkillsCategory(category, lang);
                    if (skillsHTML) {
                        writeFileSync(`${this.includesPath}/skills-${category}-${lang}.html`, skillsHTML);
                        console.log(`   ✅ skills-${category}-${lang}.html generado`);
                    }
                });

                // 4. Skills completo
                const allSkillsHTML = this.generateAllSkills(lang);
                writeFileSync(`${this.includesPath}/all-skills-${lang}.html`, allSkillsHTML);
                console.log(`   ✅ all-skills-${lang}.html generado`);

            } catch (error) {
                console.error(`❌ Error procesando ${lang}:`, error.message);
            }
        });

        console.log('🎉 Includes generados automáticamente');
        console.log('📍 Ubicación:', this.includesPath);
    }
}

// Ejecutar
const processor = new ContentProcessor();
processor.generateAllIncludes();