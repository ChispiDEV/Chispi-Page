import fs from 'fs-extra';
import path from 'path';
import * as sass from 'sass';
import { Logger } from '../utils/logger.js';
import { FileUtils } from '../utils/file-utils.js';

export class SCSSProcessor {
    constructor(config) {
        this.config = config;
        this.logger = new Logger('scss');
        this.fileUtils = new FileUtils();
    }

    async processSCSS() {
        this.logger.info('Compilando SCSS...');

        const mainSCSSPath = path.join(this.config.assets.styles, 'main.scss');

        try {
            const exists = await fs.pathExists(mainSCSSPath);
            if (!exists) {
                throw new Error(`Archivo principal no encontrado: ${mainSCSSPath}`);
            }

            const result = sass.compile(mainSCSSPath, {
                style: this.config.build.dev ? 'expanded' : 'compressed',
                loadPaths: [this.config.assets.styles],
                sourceMap: this.config.build.sourceMaps
            });

            // Escribir CSS
            const cssDir = path.join(this.config.dist, 'assets/css');
            await this.fileUtils.ensureDir(cssDir);

            const cssPath = path.join(cssDir, 'main.css');
            await this.fileUtils.writeFile(cssPath, result.css);

            // Escribir sourcemap si es necesario
            if (this.config.build.sourceMaps && result.sourceMap) {
                const mapPath = path.join(cssDir, 'main.css.map');
                await this.fileUtils.writeFile(mapPath, JSON.stringify(result.sourceMap));
            }

            this.logger.success(`SCSS compilado: ${(result.css.length / 1024).toFixed(2)} KB`);
            return result.css.length;

        } catch (error) {
            this.logger.error(`Error compilando SCSS: ${error.message}`);

            // Fallback a CSS de emergencia
            await this.generateEmergencyCSS();
            throw error;
        }
    }

    async generateEmergencyCSS() {
        this.logger.warning('Generando CSS de emergencia...');

        const emergencyCSS = `/* CSS de emergencia - Fallback por error en SCSS */
        :root {
            --color-primary: #3cc88f;
            --color-bg: #f9fafb;
            --color-text: #212529;
        }
        body { font-family: sans-serif; margin: 0; padding: 20px; }`;

        const cssDir = path.join(this.config.dist, 'assets/css');
        await this.fileUtils.ensureDir(cssDir);
        await this.fileUtils.writeFile(path.join(cssDir, 'main.css'), emergencyCSS);

        this.logger.info('CSS de emergencia generado');
    }
}