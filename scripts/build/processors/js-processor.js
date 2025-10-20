import fs from 'fs-extra';
import path from 'path';
import { minify } from 'terser';
import { Logger } from '../utils/logger.js';
import { FileUtils } from '../utils/file-utils.js';

export class JSProcessor {
    constructor(config) {
        this.config = config;
        this.logger = new Logger('javascript');
        this.fileUtils = new FileUtils();
    }

    async processJavaScript() {
        this.logger.info('Procesando JavaScript...');

        const jsFiles = await this.fileUtils.findFiles('src/assets/scripts/js/**/*.js');
        this.logger.info(`Encontrados ${jsFiles.length} archivos JS`);

        let combinedJS = '// ChispiPage JavaScript Bundle\n';

        for (const file of jsFiles) {
            try {
                const content = await this.fileUtils.readFile(file);
                combinedJS += `\n// === ${file} ===\n${content}\n`;
                this.logger.debug(`Incluido: ${file}`);
            } catch (error) {
                this.logger.warning(`Error leyendo ${file}: ${error.message}`);
            }
        }

        // Minificar en producción
        let finalJS = combinedJS;
        if (!this.config.build.dev && this.config.build.minify.js) {
            try {
                const minified = await minify(combinedJS, {
                    compress: true,
                    mangle: true,
                    format: { comments: false }
                });
                finalJS = minified.code;
                this.logger.debug('JavaScript minificado');
            } catch (error) {
                this.logger.warning(`Error minificando JS: ${error.message}`);
            }
        }

        // Escribir archivo final
        const jsDir = path.join(this.config.dist, 'assets/js');
        await this.fileUtils.ensureDir(jsDir);
        await this.fileUtils.writeFile(path.join(jsDir, 'app.js'), finalJS);

        this.logger.success(`JavaScript procesado: ${(finalJS.length / 1024).toFixed(2)} KB`);
        return finalJS.length;
    }
}