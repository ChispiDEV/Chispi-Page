// scripts/build/template-build.js
import TemplateProcessor from '../templates/template-processor.js';
import { readdirSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

class TemplateBuild {
    constructor() {
        this.templateProcessor = new TemplateProcessor();
        this.pagesDir = 'src/pages';
        this.distDir = 'dist';
    }

    async build() {
        console.log('🏗️  INICIANDO BUILD CON TEMPLATES\n');

        try {
            const pages = this.discoverPages();
            console.log(`📄 Encontradas ${pages.length} páginas para procesar`);

            let successCount = 0;

            for (const page of pages) {
                const success = this.buildPage(page);
                if (success) successCount++;
            }

            console.log(`\n🎉 Build completado: ${successCount}/${pages.length} páginas procesadas`);
            return successCount === pages.length;

        } catch (error) {
            console.error('❌ Error en build:', error);
            return false;
        }
    }

    discoverPages() {
        const pages = [];

        const scanDirectory = (dir, basePath = '') => {
            const items = readdirSync(dir);

            for (const item of items) {
                const fullPath = join(dir, item);
                const relativePath = join(basePath, item);

                if (item.endsWith('.html')) {
                    pages.push({
                        inputPath: fullPath,
                        outputPath: join(this.distDir, relativePath),
                        relativePath: relativePath
                    });
                } else {
                    // Es un directorio, escanear recursivamente
                    const stats = require('fs').statSync(fullPath);
                    if (stats.isDirectory()) {
                        scanDirectory(fullPath, relativePath);
                    }
                }
            }
        };

        scanDirectory(this.pagesDir);
        return pages;
    }

    buildPage(pageInfo) {
        try {
            // Crear directorio de destino si no existe
            const outputDir = dirname(pageInfo.outputPath);
            if (!existsSync(outputDir)) {
                mkdirSync(outputDir, { recursive: true });
            }

            // Procesar la página
            return this.templateProcessor.processPage(
                pageInfo.inputPath,
                pageInfo.outputPath,
                pageInfo.relativePath
            );

        } catch (error) {
            console.error(`❌ Error construyendo ${pageInfo.inputPath}:`, error.message);
            return false;
        }
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const builder = new TemplateBuild();
    builder.build().then(success => {
        process.exit(success ? 0 : 1);
    });
}

export default TemplateBuild;