import fs from 'fs-extra';
import path from 'path';
import { Logger } from '../utils/logger.js';
import { FileUtils } from '../utils/file-utils.js';

export class HTMLProcessor {
    constructor(config) {
        this.config = config;
        this.logger = new Logger('html');
        this.fileUtils = new FileUtils();
    }

    async processHTMLFiles() {
        this.logger.info('Buscando archivos HTML...');

        const htmlFiles = await this.fileUtils.findFiles('src/**/*.html');
        this.logger.info(`Encontrados ${htmlFiles.length} archivos HTML`);

        let processedCount = 0;

        for (const file of htmlFiles) {
            try {
                await this.processHTMLFile(file);
                processedCount++;
            } catch (error) {
                this.logger.error(`Error procesando ${file}: ${error.message}`);
            }
        }

        this.logger.success(`Procesados ${processedCount} archivos HTML`);
        return processedCount;
    }

    async processHTMLFile(filePath) {
        let content = await this.fileUtils.readFile(filePath);

        // Procesar includes
        content = await this.processIncludes(content, path.dirname(filePath));

        // Corregir rutas de assets
        content = this.fixAssetPaths(content);

        // Minificar en producción
        if (!this.config.build.dev && this.config.build.minify.html) {
            content = this.minifyHTML(content);
        }

        // Determinar ruta de destino
        const destPath = this.getDestinationPath(filePath);
        await this.fileUtils.ensureDir(path.dirname(destPath));
        await this.fileUtils.writeFile(destPath, content);

        this.logger.debug(`Procesado: ${filePath} -> ${destPath}`);
    }

    async processIncludes(content, baseDir) {
        const includeRegex = /<!--\s*#include\s+virtual="([^"]+)"\s*-->/g;
        let match;
        let includeCount = 0;

        while ((match = includeRegex.exec(content)) !== null) {
            const includePath = path.join(baseDir, match[1]);

            try {
                let includeContent = await this.fileUtils.readFile(includePath);

                // Procesar includes anidados
                includeContent = await this.processIncludes(includeContent, path.dirname(includePath));

                content = content.replace(match[0], includeContent);
                includeCount++;

            } catch (error) {
                this.logger.warning(`No se pudo incluir: ${includePath} - ${error.message}`);
            }
        }

        if (includeCount > 0) {
            this.logger.debug(`Procesados ${includeCount} includes`);
        }

        return content;
    }

    fixAssetPaths(content) {
        // Corregir rutas antiguas de assets
        return content
            .replace(/assets\/styles\//g, 'assets/css/')
            .replace(/assets\/scripts\/js\//g, 'assets/js/')
            .replace(/href="\/([^"]*)"/g, 'href="/$1"')
            .replace(/src="\/([^"]*)"/g, 'src="/$1"');
    }

    minifyHTML(html) {
        return html
            .replace(/\s+/g, ' ')
            .replace(/>\s+</g, '><')
            .replace(/<!--.*?-->/g, '')
            .trim();
    }

    getDestinationPath(filePath) {
        // Remover 'src/' del path para ponerlo en dist/
        const relativePath = filePath.replace(/^src[\\/]/, '');
        return path.join(this.config.dist, relativePath);
    }
}