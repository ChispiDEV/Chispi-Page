const fs = require('fs');
const path = require('path');
const sass = require('sass');
const CleanCSS = require('clean-css');
const { execSync } = require('child_process');
const chokidar = require('chokidar');

class BuildSystem {
    constructor() {
        this.config = {
            scss: {
                entry: 'styles/main.scss',
                output: 'assets/css/style.css',
                watch: 'styles/**/*.scss'
            },
            js: {
                modules: 'assets/js/modules/',
                vendors: 'assets/js/vendors/',
                output: 'assets/js/dist/app.bundle.js',
                watch: 'assets/js/**/*.js'
            },
            production: process.env.JEKYLL_ENV === 'production'
        };
    }

    // === COMPILACIÓN SCSS ===
    compileSCSS() {
        console.log('🎨 Compilando SCSS...');

        try {
            const result = sass.compile(this.config.scss.entry, {
                style: this.config.production ? 'compressed' : 'expanded',
                sourceMap: !this.config.production,
                loadPaths: ['styles/']
            });

            let css = result.css;

            // Minificar en producción
            if (this.config.production) {
                const minified = new CleanCSS().minify(css);
                css = minified.styles;
            }

            // Asegurar que el directorio existe
            const outputDir = path.dirname(this.config.scss.output);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // Escribir archivo CSS
            fs.writeFileSync(this.config.scss.output, css);

            // Escribir sourcemap si existe
            if (result.sourceMap && !this.config.production) {
                fs.writeFileSync(`${this.config.scss.output}.map`, JSON.stringify(result.sourceMap));
            }

            console.log(`✅ SCSS compilado: ${this.config.scss.output}`);
            return true;

        } catch (error) {
            console.error('❌ Error compilando SCSS:', error.message);
            return false;
        }
    }

    // === CONSOLIDACIÓN JAVASCRIPT ===
    bundleJavaScript() {
        console.log('📦 Consolidando JavaScript...');

        const modules = this.getModuleLoadOrder();
        let bundleContent = '';

        // Header del bundle
        bundleContent += `/*!
 * Chispi Page - Bundle consolidado
 * Generado: ${new Date().toISOString()}
 * Módulos: ${modules.map(m => path.basename(m)).join(', ')}
 */\n\n`;

        // Agregar módulos en orden
        modules.forEach(modulePath => {
            if (fs.existsSync(modulePath)) {
                const content = fs.readFileSync(modulePath, 'utf8');
                bundleContent += `// === ${path.basename(modulePath)} ===\n`;
                bundleContent += this.processJavaScript(content, modulePath);
                bundleContent += '\n\n';
            } else {
                console.warn(`⚠️ Archivo no encontrado: ${modulePath}`);
            }
        });

        // Minificar en producción
        if (this.config.production) {
            bundleContent = this.minifyJavaScript(bundleContent);
        }

        // Escribir bundle
        const outputDir = path.dirname(this.config.js.output);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(this.config.js.output, bundleContent);
        console.log(`✅ JavaScript consolidado: ${this.config.js.output}`);

        return true;
    }

    getModuleLoadOrder() {
        // Orden específico para dependencias
        return [
            // 1. Vendors primero
            path.join(this.config.js.vendors, 'particles.js'),
            path.join(this.config.js.vendors, 'tippy.js'),

            // 2. Configuraciones
            'assets/particles/particles-config.js',

            // 3. Módulos core (orden crítico)
            path.join(this.config.js.modules, 'sidebar.js'),
            path.join(this.config.js.modules, 'scroll.js'),
            path.join(this.config.js.modules, 'theme.js'),
            path.join(this.config.js.modules, 'language.js'),
            path.join(this.config.js.modules, 'particles.js'),
            path.join(this.config.js.modules, 'tooltips.js'),
            path.join(this.config.js.modules, 'popups.js'),

            // 4. App principal (siempre último)
            'assets/js/app.js'
        ].filter(fs.existsSync); // Solo archivos que existen
    }

    processJavaScript(content, filePath) {
        // Procesamientos básicos
        let processed = content;

        // Remover sourcemaps en producción
        if (this.config.production) {
            processed = processed.replace(/\/\/# sourceMappingURL=.*$/gm, '');
        }

        // Agregar información de archivo (solo desarrollo)
        if (!this.config.production) {
            processed = `// Archivo: ${path.basename(filePath)}\n${processed}`;
        }

        return processed;
    }

    minifyJavaScript(code) {
        try {
            const UglifyJS = require('uglify-js');
            const result = UglifyJS.minify(code, {
                compress: {
                    drop_console: true, // Remover console.log en producción
                    drop_debugger: true
                },
                mangle: {
                    toplevel: true
                },
                output: {
                    comments: /^!/
                }
            });

            if (result.error) {
                console.warn('⚠️ Error minificando JS:', result.error);
                return code;
            }

            return result.code;
        } catch (error) {
            console.warn('⚠️ No se pudo minificar JS, usando original:', error.message);
            return code;
        }
    }

    // === WATCHERS PARA DESARROLLO ===
    watchSCSS() {
        console.log('👀 Observando cambios en SCSS...');

        const watcher = chokidar.watch(this.config.scss.watch, {
            ignored: /(^|[/\\])\../, // ignorar archivos ocultos
            persistent: true
        });

        watcher.on('change', (filePath) => {
            console.log(`🔄 SCSS modificado: ${filePath}`);
            this.compileSCSS();
        });

        watcher.on('error', error => {
            console.error('❌ Error observando SCSS:', error);
        });
    }

    watchJavaScript() {
        console.log('👀 Observando cambios en JavaScript...');

        const watcher = chokidar.watch(this.config.js.watch, {
            ignored: /(^|[/\\])\../,
            persistent: true
        });

        watcher.on('change', (filePath) => {
            console.log(`🔄 JavaScript modificado: ${filePath}`);
            this.bundleJavaScript();
        });

        watcher.on('error', error => {
            console.error('❌ Error observando JS:', error);
        });
    }

    // === MÉTODOS PRINCIPALES ===
    buildCSS() {
        return this.compileSCSS();
    }

    buildJS() {
        return this.bundleJavaScript();
    }

    buildAll() {
        console.log('🏗️  Iniciando build completo...');
        const cssSuccess = this.buildCSS();
        const jsSuccess = this.buildJS();

        if (cssSuccess && jsSuccess) {
            console.log('✅ Build completado exitosamente');
            return true;
        } else {
            console.error('❌ Build falló');
            return false;
        }
    }

    watchAll() {
        console.log('🔮 Modo desarrollo activado - Observando cambios...');
        this.buildAll();
        this.watchSCSS();
        this.watchJavaScript();
    }
}

// Manejo de argumentos de línea de comandos
function parseArguments() {
    const args = process.argv.slice(2);
    const options = {
        css: args.includes('--css'),
        js: args.includes('--js'),
        all: args.includes('--all'),
        watchCss: args.includes('--watch-css'),
        watchJs: args.includes('--watch-js'),
        watch: args.includes('--watch')
    };

    // Si no hay argumentos, construir todo
    if (Object.values(options).every(val => !val)) {
        options.all = true;
    }

    return options;
}

// Ejecución principal
if (require.main === module) {
    const options = parseArguments();
    const buildSystem = new BuildSystem();

    try {
        if (options.watch || options.watchCss || options.watchJs) {
            if (options.watchCss) buildSystem.watchSCSS();
            else if (options.watchJs) buildSystem.watchJavaScript();
            else buildSystem.watchAll();
        } else {
            if (options.css) buildSystem.buildCSS();
            if (options.js) buildSystem.buildJS();
            if (options.all) buildSystem.buildAll();
        }
    } catch (error) {
        console.error('💥 Error en el sistema de build:', error);
        process.exit(1);
    }
}

module.exports = BuildSystem;