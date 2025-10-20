// build-temp.js - Usando el build original pero con CommonJS
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import * as sass from 'sass';
import { minify } from 'terser';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Importar configuración con ruta relativa correcta
const configModule = await import('../../config/build-config.js');
const config = configModule.config;

// Importar módulos con rutas correctas
const Logger = (await import('./utils/logger.js')).Logger;
const HTMLProcessor = (await import('./processors/html-processor.js')).HTMLProcessor;
const SCSSProcessor = (await import('./processors/scss-processor.js')).SCSSProcessor;
const JSProcessor = (await import('./processors/js-processor.js')).JSProcessor;
const AssetsProcessor = (await import('./processors/assets-processor.js')).AssetsProcessor;

class ChispiBuilder {
    constructor() {
        this.config = config;
        this.logger = new Logger('build');
        this.processors = {
            html: new HTMLProcessor(config),
            scss: new SCSSProcessor(config),
            js: new JSProcessor(config),
            assets: new AssetsProcessor(config)
        };
    }

    async build() {
        const startTime = Date.now();

        try {
            this.logger.info('🚀 Iniciando build de ChispiPage...');
            this.logger.info(`Modo: ${this.config.build.dev ? 'DESARROLLO' : 'PRODUCCIÓN'}`);

            await this.clean();
            await this.setup();
            await this.process();

            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            this.logger.success(`🎉 Build completado en ${duration}s`);

        } catch (error) {
            this.logger.error(`💥 Build fallido: ${error.message}`);
            process.exit(1);
        }
    }

    async clean() {
        if (this.config.build.cleanDist) {
            this.logger.info('Limpiando directorio dist...');
            await fs.remove(this.config.dist);
        }
    }

    async setup() {
        this.logger.info('Creando estructura de directorios...');

        const structure = [
            'assets/css',
            'assets/js',
            'assets/images',
            'assets/fonts',
            'pages',
            'en/assets/css',
            'en/assets/js',
            'en/assets/images'
        ];

        for (const dir of structure) {
            await fs.ensureDir(path.join(this.config.dist, dir));
        }

        this.logger.success('Estructura de directorios creada');
    }

    async process() {
        // Procesar en serie para mejor logging
        await this.processors.html.processHTMLFiles();
        await this.processors.scss.processSCSS();
        await this.processors.js.processJavaScript();
        await this.processors.assets.processAssets();
    }
}

// Punto de entrada
const builder = new ChispiBuilder(config);
await builder.build();