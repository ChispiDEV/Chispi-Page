import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

console.log('🚀 MIGRANDO DATOS A ESTRUCTURA MODULAR...\n');

// Crear directorios
const dataPath = 'src/data';
const contentPath = join(dataPath, 'content');
const skillsPath = join(dataPath, 'skills');

if (!existsSync(contentPath)) mkdirSync(contentPath, { recursive: true });
if (!existsSync(skillsPath)) mkdirSync(skillsPath, { recursive: true });

// Cargar datos actuales
try {
    const currentContent = JSON.parse(readFileSync(join(dataPath, 'content.json'), 'utf8'));
    const currentSkills = JSON.parse(readFileSync(join(dataPath, 'skills.json'), 'utf8'));

    console.log('✅ Datos actuales cargados');

    // Separar contenido
    const aboutContent = {
        es: currentContent.about?.es,
        en: currentContent.about?.en
    };

    const projectsContent = {
        es: {
            title: "🔥 ¿Qué estoy haciendo ahora?",
            items: currentContent.about?.es?.currentProjects?.items || []
        },
        en: {
            title: "🔥 What I'm doing now",
            items: currentContent.about?.en?.currentProjects?.items || []
        }
    };

    const funfactsContent = {
        es: {
            title: "🎉 Curiosidades",
            items: currentContent.about?.es?.funFacts?.items || []
        },
        en: {
            title: "🎉 Fun Facts",
            items: currentContent.about?.en?.funFacts?.items || []
        }
    };

    // Guardar contenido separado
    writeFileSync(join(contentPath, 'about-content.json'), JSON.stringify(aboutContent, null, 2));
    writeFileSync(join(contentPath, 'projects-content.json'), JSON.stringify(projectsContent, null, 2));
    writeFileSync(join(contentPath, 'funfacts-content.json'), JSON.stringify(funfactsContent, null, 2));

    console.log('✅ Contenido separado en archivos individuales');

    // Separar skills (aquí necesitaría ver tu skills.json actual completo)
    console.log('📝 Skills necesitan separación manual basada en tu estructura');
    console.log('💡 Crea los archivos en src/data/skills/ basándote en tus categorías');

} catch (error) {
    console.error('❌ Error en migración:', error.message);
}