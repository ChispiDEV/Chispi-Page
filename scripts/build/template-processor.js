// scripts/templates/template-processor.js
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import ConfigManager from './config-manager.js';

class TemplateProcessor {
    constructor() {
        this.configManager = new ConfigManager();
        this.includesPath = 'src/includes';
    }

    // Procesar includes (similar a Jekyll)
    processIncludes(content, baseDir = '') {
        let processed = content;

        // Procesar includes del tipo: <!--# include file="path/to/file.html" -->
        const includeRegex = /<!--# include file="(.+?)" -->/g;

        let match;
        while ((match = includeRegex.exec(processed)) !== null) {
            const includePath = join(this.includesPath, match[1]);

            if (existsSync(includePath)) {
                const includeContent = readFileSync(includePath, 'utf8');
                // Procesar recursivamente los includes anidados
                const processedInclude = this.processIncludes(includeContent, dirname(match[1]));
                processed = processed.replace(match[0], processedInclude);
            } else {
                console.warn(`⚠️ Include no encontrado: ${includePath}`);
            }
        }

        return processed;
    }

    // Procesar condiciones (if/else simples)
    processConditions(content, pageConfig) {
        let processed = content;

        // Procesar {% if page.lang == 'es' %} ... {% endif %}
        const ifLangRegex = /{% if page\.lang == '(.+?)' %}([\s\S]*?){% endif %}/g;

        let match;
        while ((match = ifLangRegex.exec(processed)) !== null) {
            const targetLang = match[1];
            const conditionalContent = match[2];

            if (pageConfig.lang === targetLang) {
                processed = processed.replace(match[0], conditionalContent);
            } else {
                processed = processed.replace(match[0], '');
            }
        }

        // Procesar {% if page.hero %} ... {% endif %}
        const ifHeroRegex = /{% if page\.hero %}([\s\S]*?){% endif %}/g;

        while ((match = ifHeroRegex.exec(processed)) !== null) {
            const conditionalContent = match[1];

            if (pageConfig.hero) {
                processed = processed.replace(match[0], conditionalContent);
            } else {
                processed = processed.replace(match[0], '');
            }
        }      
        
        return processed;
    }

    // Procesar comentarios Liquid
    processComments(content) {
        return content.replace(/{%.*?%}/g, '').replace(/{{.*?}}/g, '');
    }

    // Procesar una página completa
    processPage(templatePath, outputPath, pageConfig) {
        try {
            let template = readFileSync(templatePath, 'utf8');

            // 1. Procesar includes
            template = this.processIncludes(template);

            // 2. Procesar variables
            template = this.configManager.processTemplate(template, pageConfig);

            // 3. Procesar condiciones
            template = this.processConditions(template, pageConfig);

            // 4. Limpiar comentarios Liquid no procesados
            template = this.processComments(template);

            // 5. Escribir archivo procesado
            writeFileSync(outputPath, template, 'utf8');

            console.log(`✅ Página procesada: ${outputPath}`);
            return true;

        } catch (error) {
            console.error(`❌ Error procesando ${templatePath}:`, error.message);
            return false;
        }
    }
}

export default TemplateProcessor;