// scripts/build/simple-build.js - VERSIÓN CORREGIDA
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import * as sass from 'sass';
import { minify } from 'terser';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SimpleLogger {
    constructor() {
        this.logDir = path.join(process.cwd(), 'logs');
        this.ensureLogDir();
    }

    ensureLogDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        console.log(logEntry);

        // Guardar en log file
        fs.appendFileSync(path.join(this.logDir, 'build.log'), logEntry + '\n');

        return logEntry;
    }

    info(message) { this.log(`ℹ️  ${message}`); }
    success(message) { this.log(`✅ ${message}`); }
    error(message) { this.log(`❌ ${message}`); }
    warning(message) { this.log(`⚠️  ${message}`); }
}

class SimpleBuilder {
    constructor() {
        this.logger = new SimpleLogger();
        this.config = {
            dev: process.env.NODE_ENV === 'development',
            paths: {
                src: path.join(process.cwd(), 'src'),
                dist: path.join(process.cwd(), 'dist'),
                styles: path.join(process.cwd(), 'src/assets/styles'),
                scripts: path.join(process.cwd(), 'src/assets/scripts'),
                assets: path.join(process.cwd(), 'src/assets'),
                images: path.join(process.cwd(), 'src/assets/images')
            }
        };
    }

    async build() {
        const startTime = Date.now();

        try {
            this.logger.info('🚀 Iniciando build simplificado...');
            this.logger.info(`Modo: ${this.config.dev ? 'DESARROLLO' : 'PRODUCCIÓN'}`);

            // Verificar que src existe
            if (!fs.existsSync(this.config.paths.src)) {
                throw new Error(`No se encuentra el directorio src: ${this.config.paths.src}`);
            }

            await this.clean();
            await this.setup();
            await this.processHTML();
            await this.processSCSS();
            await this.processJS();
            await this.processAssets();

            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            this.logger.success(`🎉 Build completado en ${duration}s`);

        } catch (error) {
            this.logger.error(`💥 Build fallido: ${error.message}`);
            console.error('Stack trace:', error.stack);
            process.exit(1);
        }
    }

    async clean() {
        this.logger.info('Limpiando directorio dist...');
        if (await fs.pathExists(this.config.paths.dist)) {
            await fs.remove(this.config.paths.dist);
            this.logger.success('Directorio dist limpiado');
        } else {
            this.logger.info('Directorio dist no existe, se creará nuevo');
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
            const fullPath = path.join(this.config.paths.dist, dir);
            await fs.ensureDir(fullPath);
            this.logger.debug(`Directorio creado: ${dir}`);
        }

        this.logger.success('Estructura de directorios creada');
    }

    async processHTML() {
        this.logger.info('Buscando archivos HTML...');

        try {
            const htmlFiles = await glob('src/**/*.html');
            this.logger.info(`Encontrados ${htmlFiles.length} archivos HTML`);

            let processedCount = 0;
            let errorCount = 0;

            for (const file of htmlFiles) {
                try {
                    this.logger.debug(`Procesando: ${file}`);

                    let content = await fs.readFile(file, 'utf8');

                    // Procesar includes
                    content = await this.processIncludes(content, path.dirname(file));

                    // Corregir rutas de assets
                    content = this.fixAssetPaths(content);

                    // Determinar ruta de destino
                    const destPath = this.getDestinationPath(file);
                    await fs.ensureDir(path.dirname(destPath));
                    await fs.writeFile(destPath, content, 'utf8');

                    processedCount++;

                } catch (error) {
                    this.logger.error(`Error procesando ${file}: ${error.message}`);
                    errorCount++;
                }
            }

            if (errorCount > 0) {
                this.logger.warning(`HTML procesado con errores: ${processedCount} exitosos, ${errorCount} fallidos`);
            } else {
                this.logger.success(`HTML procesado: ${processedCount} archivos`);
            }

        } catch (error) {
            this.logger.error(`Error en procesamiento HTML: ${error.message}`);
            throw error;
        }
    }

    async processIncludes(content, baseDir) {
        const includeRegex = /<!--\s*#include\s+virtual="([^"]+)"\s*-->/g;
        let match;
        let includeCount = 0;

        while ((match = includeRegex.exec(content)) !== null) {
            const includePath = path.join(baseDir, match[1]);

            try {
                let includeContent = await fs.readFile(includePath, 'utf8');

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

    getDestinationPath(filePath) {
        // Remover 'src/' del path para ponerlo en dist/
        const relativePath = filePath.replace(/^src[\\/]/, '');
        return path.join(this.config.paths.dist, relativePath);
    }

    async processSCSS() {
        this.logger.info('Compilando SCSS...');

        try {
            const mainSCSS = path.join(this.config.paths.styles, 'main.scss');

            // Verificar que existe el archivo principal
            if (!await fs.pathExists(mainSCSS)) {
                throw new Error(`Archivo principal no encontrado: ${mainSCSS}`);
            }

            this.logger.debug(`Compilando: ${mainSCSS}`);

            const result = sass.compile(mainSCSS, {
                style: this.config.dev ? 'expanded' : 'compressed',
                loadPaths: [this.config.paths.styles],
                sourceMap: this.config.dev,
                verbose: this.config.dev
            });

            // Escribir CSS
            const cssDir = path.join(this.config.paths.dist, 'assets/css');
            await fs.ensureDir(cssDir);

            const cssPath = path.join(cssDir, 'main.css');
            await fs.writeFile(cssPath, result.css, 'utf8');

            // Escribir sourcemap en desarrollo
            if (this.config.dev && result.sourceMap) {
                await fs.writeFile(
                    path.join(cssDir, 'main.css.map'),
                    JSON.stringify(result.sourceMap),
                    'utf8'
                );
                this.logger.debug('Sourcemap generado');
            }

            this.logger.success(`SCSS compilado: ${(result.css.length / 1024).toFixed(2)} KB`);

        } catch (error) {
            this.logger.error(`Error compilando SCSS: ${error.message}`);

            // Generar CSS de emergencia
            await this.generateEmergencyCSS();
            throw error;
        }
    }

    async generateEmergencyCSS() {
        this.logger.warning('Generando CSS de emergencia...');

        const emergencyCSS = `/* ============================
   CSS DE EMERGENCIA - CHISPIPAGE
   Generado automáticamente por fallo en SCSS
   ============================ */
   
:root {
  --color-primary: #3cc88f;
  --color-bg: #f9fafb;
  --color-text: #212529;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: sans-serif;
  background-color: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
  padding: 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}`;

        const cssDir = path.join(this.config.paths.dist, 'assets/css');
        await fs.ensureDir(cssDir);
        await fs.writeFile(path.join(cssDir, 'main.css'), emergencyCSS, 'utf8');

        this.logger.success('CSS de emergencia generado');
    }

    async processJS() {
        this.logger.info('Procesando JavaScript...');

        try {
            // Buscar en ambas ubicaciones posibles
            const jsPatterns = [
                'src/assets/scripts/js/**/*.js',  // Estructura original
                'src/assets/scripts/core/**/*.js' // Nueva estructura
            ];

            let jsFiles = [];
            for (const pattern of jsPatterns) {
                const files = await glob(pattern);
                jsFiles = jsFiles.concat(files);
            }

            // Eliminar duplicados
            jsFiles = [...new Set(jsFiles)];

            this.logger.info(`Encontrados ${jsFiles.length} archivos JS`);

            let combinedJS = '// ChispiPage JavaScript Bundle\n';

            for (const file of jsFiles) {
                try {
                    this.logger.debug(`Incluyendo: ${file}`);
                    const content = await fs.readFile(file, 'utf8');
                    combinedJS += `\n// ===== ${file} =====\n${content}\n`;
                } catch (error) {
                    this.logger.warning(`Error leyendo ${file}: ${error.message}`);
                }
            }

            // Si no hay archivos JS, crear un archivo mínimo
            if (jsFiles.length === 0) {
                combinedJS = `// ChispiPage JavaScript Bundle\nconsole.log('ChispiPage loaded');`;
                this.logger.warning('No se encontraron archivos JavaScript, creando bundle mínimo');
            }

            // Minificar en producción
            let finalJS = combinedJS;
            if (!this.config.dev) {
                try {
                    const minified = await minify(combinedJS, {
                        compress: true,
                        mangle: true,
                        format: {
                            comments: false
                        }
                    });
                    finalJS = minified.code;
                    this.logger.debug('JavaScript minificado');
                } catch (error) {
                    this.logger.warning(`Error minificando JavaScript: ${error.message}`);
                }
            }

            // Escribir JS consolidado
            const jsDir = path.join(this.config.paths.dist, 'assets/core');
            await fs.ensureDir(jsDir);

            const jsPath = path.join(jsDir, 'app.js');
            await fs.writeFile(jsPath, finalJS, 'utf8');

            this.logger.success(`JavaScript procesado: ${(finalJS.length / 1024).toFixed(2)} KB`);

        } catch (error) {
            this.logger.error(`Error procesando JavaScript: ${error.message}`);
            throw error;
        }
    }

    async processAssets() {
        this.logger.info('Copiando assets...');

        try {
            // Copiar imágenes
            const imagesSrc = this.config.paths.images;
            const imagesDest = path.join(this.config.paths.dist, 'assets/images');

            if (await fs.pathExists(imagesSrc)) {
                const images = await glob('**/*', { cwd: imagesSrc });
                await fs.copy(imagesSrc, imagesDest);
                this.logger.info(`Imágenes copiadas: ${images.length} archivos`);
            } else {
                this.logger.warning(`No se encontró directorio de imágenes: ${imagesSrc}`);
            }

            // Copiar otros assets
            const otherAssets = await glob('src/assets/**/*', {
                ignore: [
                    'src/assets/js/**',
                    'src/assets/images/**',
                    'src/assets/styles/**'
                ]
            });

            for (const asset of otherAssets) {
                const destRelativePath = asset.replace(/^src[\\/]/, '');
                const dest = path.join(this.config.paths.dist, destRelativePath);

                await fs.ensureDir(path.dirname(dest));
                await fs.copy(asset, dest);
                this.logger.debug(`Asset copiado: ${asset} → ${destRelativePath}`);
            }

            this.logger.success('Assets copiados correctamente');

        } catch (error) {
            this.logger.error(`Error copiando assets: ${error.message}`);
            throw error;
        }
    }
}

// Ejecutar build
const builder = new SimpleBuilder();
await builder.build();