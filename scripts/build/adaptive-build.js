// scripts/build/adaptive-build.js - Se adapta a la estructura real
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import * as sass from 'sass';
import { minify } from 'terser';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AdaptiveBuilder {
    constructor() {
        this.config = {
            dev: process.env.NODE_ENV === 'development',
            paths: {
                src: path.join(process.cwd(), 'src'),
                dist: path.join(process.cwd(), 'dist')
            }
        };
    }

    async build() {
        console.log('🚀 Build adaptativo iniciado...\n');

        try {
            // Descubrir estructura automáticamente
            await this.discoverStructure();

            await this.clean();
            await this.setup();
            await this.processHTML();
            await this.processSCSS();
            await this.processJS();
            await this.processAssets();

            console.log('🎉 Build adaptativo completado!');

        } catch (error) {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
    }

    async discoverStructure() {
        console.log('🔍 Descubriendo estructura...');

        // Scripts - buscar en múltiples ubicaciones
        const scriptLocations = [
            'src/assets/scripts/js',
            'src/assets/scripts/core',
            'src/assets/scripts',
            'src/scripts'
        ];

        for (const location of scriptLocations) {
            if (await fs.pathExists(location)) {
                this.config.paths.scripts = location;
                console.log(`✅ Scripts encontrados en: ${location}`);
                break;
            }
        }

        if (!this.config.paths.scripts) {
            console.log('⚠️  No se encontraron scripts, se crearán mínimos');
        }

        // Styles
        const styleLocations = [
            'src/assets/styles',
            'src/styles'
        ];

        for (const location of styleLocations) {
            if (await fs.pathExists(location)) {
                this.config.paths.styles = location;
                console.log(`✅ Styles encontrados en: ${location}`);
                break;
            }
        }

        // Images
        const imageLocations = [
            'src/assets/images',
            'src/images'
        ];

        for (const location of imageLocations) {
            if (await fs.pathExists(location)) {
                this.config.paths.images = location;
                console.log(`✅ Imágenes encontradas en: ${location}`);
                break;
            }
        }

        console.log('');
    }

    async clean() {
        console.log('🧹 Limpiando dist...');
        if (await fs.pathExists(this.config.paths.dist)) {
            await fs.remove(this.config.paths.dist);
        }
    }

    async setup() {
        console.log('📁 Creando estructura...');
        await fs.ensureDir(path.join(this.config.paths.dist, 'assets/css'));
        await fs.ensureDir(path.join(this.config.paths.dist, 'assets/js'));
        await fs.ensureDir(path.join(this.config.paths.dist, 'assets/images'));
    }

    async processHTML() {
        console.log('📄 Procesando HTML...');
        const htmlFiles = await glob('src/**/*.html');

        for (const file of htmlFiles) {
            let content = await fs.readFile(file, 'utf8');

            // Corregir rutas
            content = content
                .replace(/assets\/styles\//g, 'assets/css/')
                .replace(/assets\/scripts\//g, 'assets/js/');

            const destPath = file.replace(/^src[\\/]/, '');
            await fs.ensureDir(path.dirname(path.join(this.config.paths.dist, destPath)));
            await fs.writeFile(path.join(this.config.paths.dist, destPath), content);
        }

        console.log(`✅ HTML: ${htmlFiles.length} archivos`);
    }

    async processSCSS() {
        console.log('🎨 Compilando SCSS...');

        const mainScss = this.config.paths.styles ?
            path.join(this.config.paths.styles, 'main.scss') : null;

        if (mainScss && await fs.pathExists(mainScss)) {
            try {
                const result = sass.compile(mainScss, {
                    style: this.config.dev ? 'expanded' : 'compressed'
                });

                await fs.writeFile(
                    path.join(this.config.paths.dist, 'assets/css/main.css'),
                    result.css
                );

                console.log(`✅ SCSS compilado: ${(result.css.length/1024).toFixed(1)}KB`);
            } catch (error) {
                console.log('⚠️  Error SCSS, usando CSS básico');
                await this.createBasicCSS();
            }
        } else {
            console.log('⚠️  No se encontró SCSS, usando CSS básico');
            await this.createBasicCSS();
        }
    }

    async createBasicCSS() {
        const basicCSS = `body { font-family: sans-serif; margin: 20px; }`;
        await fs.writeFile(
            path.join(this.config.paths.dist, 'assets/css/main.css'),
            basicCSS
        );
    }

    async processJS() {
        console.log('⚡ Procesando JS...');

        let jsFiles = [];
        if (this.config.paths.scripts) {
            jsFiles = await glob(path.join(this.config.paths.scripts, '**/*.js'));
        }

        if (jsFiles.length === 0) {
            // Buscar en cualquier ubicación
            jsFiles = await glob('src/**/*.js');
        }

        let combinedJS = '// ChispiPage JS Bundle\n';

        for (const file of jsFiles) {
            const content = await fs.readFile(file, 'utf8');
            combinedJS += `\n// ${file}\n${content}\n`;
        }

        if (jsFiles.length === 0) {
            combinedJS = `console.log('ChispiPage loaded');`;
        }

        await fs.writeFile(
            path.join(this.config.paths.dist, 'assets/js/app.js'),
            combinedJS
        );

        console.log(`✅ JS: ${jsFiles.length} archivos, ${(combinedJS.length/1024).toFixed(1)}KB`);
    }

    async processAssets() {
        console.log('🖼️  Copiando assets...');

        if (this.config.paths.images && await fs.pathExists(this.config.paths.images)) {
            await fs.copy(
                this.config.paths.images,
                path.join(this.config.paths.dist, 'assets/images')
            );
            console.log('✅ Imágenes copiadas');
        } else {
            console.log('⚠️  No se encontraron imágenes');
        }
    }
}

// Ejecutar
const builder = new AdaptiveBuilder();
await builder.build();