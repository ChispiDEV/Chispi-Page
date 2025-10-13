import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as sass from 'sass';
import chokidar from 'chokidar';
import fse from 'fs-extra';
import { minify } from 'html-minifier-terser';
import cssnano from 'cssnano';
import { minify as terserMinify } from 'terser';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NodeBuildSystem {
    constructor() {
        // En Windows, process.env.NODE_ENV puede venir con espacios
        const nodeEnv = (process.env.NODE_ENV || 'development').trim();
        this.config = {
            source: 'src',
            dist: 'dist',
            baseurl: '/Chispi-Page',
            isProduction: nodeEnv === 'production'
        };

        this.siteData = {
            title: "Chispi-Page || Dashboard Personal",
            description: "Portfolio, Devlogs, Proyectos y Recursos",
            url: "https://ChispiDEV.github.io",
            baseurl: "/Chispi-Page"
        };
    }

    async build() {
        console.log('🚀 Iniciando build...');
        console.log(`   Modo: ${this.config.isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);

        // Crear directorio dist si no existe
        if (!fs.existsSync(this.config.dist)) {
            fs.mkdirSync(this.config.dist, { recursive: true });
        }

        try {
            await this.buildHTML();
            await this.buildCSS();
            await this.buildJS();
            await this.copyAssets();
            await this.copyStatic();
            await this.processPosts();

            console.log('✅ ¡Build completado!');
            console.log(`📁 Archivos en: ${path.resolve(this.config.dist)}`);

        } catch (error) {
            console.error('❌ Error en build:', error);
            throw error;
        }
    }

    async buildHTML() {
        console.log('📄 Procesando HTML...');

        // Verificar si existe la carpeta src
        if (!fs.existsSync(this.config.source)) {
            console.log('⚠️  Carpeta src/ no encontrada. Creando estructura básica...');
            await this.createBasicStructure();
            return;
        }

        const htmlFiles = await glob('**/*.html', { cwd: this.config.source });

        if (htmlFiles.length === 0) {
            console.log('ℹ️  No se encontraron archivos HTML en src/');
            return;
        }

        for (const file of htmlFiles) {
            console.log(`   📝 Procesando: ${file}`);
            try {
                let content = await fse.readFile(path.join(this.config.source, file), 'utf8');

                content = this.processSiteVariables(content, file);

                if (this.config.isProduction) {
                    try {
                        content = await minify(content, {
                            removeAttributeQuotes: true,
                            collapseWhitespace: true,
                            removeComments: true,
                            minifyCSS: true,
                            minifyJS: true,
                        });
                    } catch (error) {
                        console.warn(`⚠️  No se pudo minificar ${file}:`, error.message);
                    }
                }

                const outputPath = path.join(this.config.dist, file);
                await fse.outputFile(outputPath, content);

            } catch (error) {
                console.error(`❌ Error procesando ${file}:`, error.message);
            }
        }
    }

    async createBasicStructure() {
        console.log('🏗️  Creando estructura básica...');

        // Crear index.html básico
        const basicHTML = `<!DOCTYPE html>
<html lang="es" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Chispi-Page || Dashboard Personal</title>
    <meta name="description" content="Portfolio, Devlogs, Proyectos y Recursos">
    <link rel="stylesheet" href="/Chispi-Page/assets/css/style.css">
</head>
<body>
    <nav style="padding: 1rem; background: #f5f5f5;">
        <strong>Chispi Page</strong> - Migración a Node.js en progreso
    </nav>
    <main style="padding: 2rem; text-align: center;">
        <h1>🚀 Migración en Progreso</h1>
        <p>El sitio se está migrando de Jekyll a Node.js</p>
        <p>Pronto estará disponible con todas las funcionalidades</p>
    </main>
    <script src="/Chispi-Page/assets/js/app.bundle.js"></script>
</body>
</html>`;

        await fse.outputFile(path.join(this.config.dist, 'index.html'), basicHTML);
        console.log('✅ index.html básico creado');
    }

    processSiteVariables(content, filePath) {
        const pageTitle = this.getPageTitle(filePath);
        const pageLang = this.getPageLanguage(filePath);

        let processed = content
            .replace(/{{ site\.title }}/g, this.siteData.title)
            .replace(/{{ site\.description }}/g, this.siteData.description)
            .replace(/{{ site\.url }}/g, this.siteData.url)
            .replace(/{{ site\.baseurl }}/g, this.siteData.baseurl)
            .replace(/{{ page\.title }}/g, pageTitle)
            .replace(/{{ page\.lang \| default: 'es' }}/g, pageLang);

        // Procesar condicionales de idioma
        processed = processed.replace(
            /\{% if page\.lang == 'es' %}(.*?)\{% else %}(.*?)\{% endif %}/gs,
            pageLang === 'es' ? '$1' : '$2'
        );

        processed = processed.replace(
            /\{% if page\.lang == 'en' %}(.*?)\{% else %}(.*?)\{% endif %}/gs,
            pageLang === 'en' ? '$1' : '$2'
        );

        // Procesar includes
        processed = this.processIncludes(processed);

        // Procesar URLs relativas
        processed = processed.replace(/{{ '(.*?)' \| relative_url }}/g, `${this.siteData.baseurl}/$1`);

        return processed;
    }

    processIncludes(content) {
        const includeRegex = /\{% include (.*?) %}/g;
        return content.replace(includeRegex, (match, includePath) => {
            const cleanPath = includePath.replace(/'/g, '').replace(/"/g, '');
            const fullPath = path.join('src', '_includes', `${cleanPath}.html`);

            try {
                if (fs.existsSync(fullPath)) {
                    return fs.readFileSync(fullPath, 'utf8');
                }
            } catch (error) {
                console.warn(`⚠️  No se pudo incluir: ${cleanPath}`);
            }

            return `<!-- Include no encontrado: ${cleanPath} -->`;
        });
    }

    getPageTitle(filePath) {
        const name = path.basename(filePath, '.html');
        const titles = {
            'index': 'Inicio',
            'sobre-mi': 'Sobre Mí',
            'proyectos': 'Proyectos',
            'posts': 'Devlogs',
            'recursos': 'Recursos',
            'contacto': 'Contacto'
        };
        return titles[name] || name;
    }

    getPageLanguage(filePath) {
        return filePath.includes('/en/') ? 'en' : 'es';
    }

    async buildCSS() {
        console.log('🎨 Compilando SCSS...');

        try {
            const result = sass.compile('styles/main.scss', {
                style: this.config.isProduction ? 'compressed' : 'expanded',
                loadPaths: ['styles']
            });

            let css = result.css;

            if (this.config.isProduction) {
                try {
                    const minified = await cssnano.process(css, { from: undefined });
                    css = minified.css;
                } catch (error) {
                    console.warn('⚠️  No se pudo minificar CSS');
                    // Usar CleanCSS como fallback
                    const CleanCSS = await import('clean-css');
                    css = new CleanCSS().minify(css).styles;
                }
            }

            await fse.outputFile(path.join(this.config.dist, 'assets/css/style.css'), css);
            console.log('✅ CSS compilado');

        } catch (error) {
            console.error('❌ Error compilando SCSS:', error.message);
        }
    }

    async buildJS() {
        console.log('📦 Procesando JavaScript...');

        const modules = [
            'assets/js/vendors/particles.js',
            'assets/js/vendors/tippy.js',
            'assets/particles/particles-config.js',
            'assets/js/modules/sidebar.js',
            'assets/js/modules/scroll.js',
            'assets/js/modules/theme.js',
            'assets/js/modules/language.js',
            'assets/js/modules/particles.js',
            'assets/js/modules/tooltips.js',
            'assets/js/modules/popups.js',
            'assets/js/app.js'
        ];

        let bundle = `/*! Chispi Page Bundle - ${new Date().toISOString()} */\n`;

        for (const module of modules) {
            if (await fse.pathExists(module)) {
                try {
                    const content = await fse.readFile(module, 'utf8');
                    bundle += `\n// ===== ${path.basename(module)} =====\n`;
                    bundle += content + '\n';
                } catch (error) {
                    console.warn(`⚠️  Error leyendo ${module}:`, error.message);
                }
            } else {
                console.warn(`⚠️  Módulo no encontrado: ${module}`);
            }
        }

        if (this.config.isProduction) {
            try {
                const minified = await terserMinify(bundle, {
                    compress: {
                        drop_console: true,
                        drop_debugger: true
                    },
                    mangle: true,
                    format: {
                        comments: false
                    }
                });
                bundle = minified.code;
            } catch (error) {
                console.warn('⚠️  No se pudo minificar JS:', error.message);
            }
        }

        await fse.outputFile(path.join(this.config.dist, 'assets/js/app.bundle.js'), bundle);
        console.log('✅ JavaScript consolidado');
    }

    async copyAssets() {
        console.log('📁 Copiando assets...');

        if (!fs.existsSync('assets')) {
            console.log('ℹ️  No se encontró la carpeta assets/');
            return;
        }

        try {
            await fse.copy('assets', path.join(this.config.dist, 'assets'), {
                filter: (src) => {
                    return !src.includes('/js/modules/') &&
                        !src.includes('/js/vendors/') &&
                        !src.includes('/css/') &&
                        !src.endsWith('.scss');
                }
            });
            console.log('✅ Assets copiados');
        } catch (error) {
            console.error('❌ Error copiando assets:', error.message);
        }
    }

    async copyStatic() {
        console.log('📋 Copiando archivos estáticos...');

        try {
            const files = await glob('*', {
                cwd: this.config.source,
                nodir: true,
                ignore: '**/*.html'
            });

            for (const file of files) {
                await fse.copy(
                    path.join(this.config.source, file),
                    path.join(this.config.dist, file)
                );
            }

            // Copiar CNAME si existe
            if (await fse.pathExists('CNAME')) {
                await fse.copy('CNAME', path.join(this.config.dist, 'CNAME'));
                console.log('✅ CNAME copiado');
            }
        } catch (error) {
            console.log('ℹ️  No hay archivos estáticos para copiar');
        }
    }

    async processPosts() {
        console.log('📝 Procesando posts...');

        if (!fs.existsSync('_posts')) {
            console.log('ℹ️  No se encontró la carpeta _posts/');
            return;
        }

        try {
            const postFiles = await glob('_posts/*.md');

            if (postFiles.length === 0) {
                console.log('ℹ️  No hay posts para procesar');
                return;
            }

            for (const postFile of postFiles) {
                try {
                    const content = await fse.readFile(postFile, 'utf8');
                    const htmlContent = this.markdownToHTML(content);
                    const fileName = path.basename(postFile, '.md');
                    const outputFile = `blog/${fileName}.html`;

                    await fse.outputFile(path.join(this.config.dist, outputFile), htmlContent);
                    console.log(`   📄 Post procesado: ${outputFile}`);
                } catch (error) {
                    console.warn(`⚠️  Error procesando post ${postFile}:`, error.message);
                }
            }

            console.log(`✅ ${postFiles.length} posts procesados`);
        } catch (error) {
            console.error('❌ Error procesando posts:', error.message);
        }
    }

    markdownToHTML(content) {
        // Conversión básica de Markdown a HTML
        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Post - Chispi Page</title>
    <link rel="stylesheet" href="/Chispi-Page/assets/css/style.css">
</head>
<body>
    <nav style="padding: 1rem; background: #f5f5f5;">
        <a href="/Chispi-Page/">← Volver al inicio</a>
    </nav>
    <main style="max-width: 800px; margin: 0 auto; padding: 2rem;">
        <article class="post">
            ${content
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" style="max-width: 100%;">')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')}
        </article>
    </main>
    <script src="/Chispi-Page/assets/js/app.bundle.js"></script>
</body>
</html>`;
    }

    async watch() {
        console.log('👀 Modo observación activado...');
        console.log('   Los cambios se recompilarán automáticamente');

        const watcher = chokidar.watch([
            'src/**/*',
            'styles/**/*',
            'assets/**/*',
            '_posts/**/*'
        ], {
            ignored: /(^|[/\\])\../,
            persistent: true
        });

        let buildTimeout;
        watcher.on('change', async (filePath) => {
            console.log(`\n🔄 ${filePath} modificado - Recompilando...`);

            clearTimeout(buildTimeout);
            buildTimeout = setTimeout(async () => {
                try {
                    await this.build();
                    console.log('✅ Cambios aplicados');
                } catch (error) {
                    console.error('❌ Error aplicando cambios:', error);
                }
            }, 500);
        });

        // Build inicial
        await this.build();
        console.log('\n🎯 Para ver el sitio ejecuta en otra terminal: npm run serve');
        console.log('   o abre el archivo dist/index.html en tu navegador');
    }
}

const args = process.argv.slice(2);
const buildSystem = new NodeBuildSystem();

if (args.includes('--watch') || args.includes('-w')) {
    buildSystem.watch();
} else {
    buildSystem.build();
}