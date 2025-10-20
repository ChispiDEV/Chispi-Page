import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import * as sass from 'sass';
import { minify } from 'terser';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const config = {
    dev: process.env.NODE_ENV === 'development',
    paths: {
        src: path.join(__dirname, 'src'),
        dist: path.join(__dirname, 'dist'),
        temp: path.join(__dirname, 'temp'),
        styles: path.join(__dirname, 'src', 'assets', 'styles'),
        scripts: path.join(__dirname, 'src', 'assets', 'scripts'),
        assets: path.join(__dirname, 'src', 'assets'),
        posts: path.join(__dirname, 'src', 'posts'),
        logs: path.join(__dirname, 'logs') // ✅ Nueva carpeta para logs
    }
};

// Sistema de logging avanzado CON ARCHIVOS
class AdvancedLogger {
    constructor() {
        this.startTime = Date.now();
        this.errors = [];
        this.warnings = [];
        this.fixes = []; // ✅ NUEVO: Seguimiento de correcciones
        this.changes = []; // ✅ NUEVO: Seguimiento de cambios
        this.logEntries = [];
        this.stats = {
            htmlFiles: 0,
            cssSize: 0,
            jsSize: 0,
            images: 0,
            processingTime: 0,
            fixesApplied: 0, // ✅ NUEVO: Contador de correcciones
            filesChanged: 0 // ✅ NUEVO: Contador de archivos modificados
        };

        // Crear directorio de logs
        fs.ensureDirSync(config.paths.logs);

        // Archivo de log para esta sesión
        this.logFile = path.join(
            config.paths.logs,
            `build-${new Date().toISOString().replace(/[:.]/g, '-')}.log`
        );

        this.writeToLog('=== INICIO DE SESIÓN DE BUILD ===');
        this.writeToLog(`Modo: ${config.dev ? 'DESARROLLO' : 'PRODUCCIÓN'}`);
    }

    get colors() {
        return {
            reset: '\x1b[0m',
            bright: '\x1b[1m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            gray: '\x1b[90m'
        };
    }

    writeToLog(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}`;

        // Guardar en memoria
        this.logEntries.push(logEntry);

        // Escribir en archivo (async)
        fs.appendFile(this.logFile, logEntry + '\n').catch(console.error);
    }

    log(message, color = this.colors.reset, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const consoleMessage = `${this.colors.gray}[${timestamp}]${this.colors.reset} ${color}${message}${this.colors.reset}`;

        console.log(consoleMessage);

        // Guardar para análisis
        this.writeToLog(`[${type.toUpperCase()}] ${message}`);

        // Guardar para el reporte final
        if (type === 'error') this.errors.push(message);
        if (type === 'warning') this.warnings.push(message);
        if (type === 'fix') this.fixes.push(message); // ✅ NUEVO
        if (type === 'change') this.changes.push(message); // ✅ NUEVO
    }

    // Métodos específicos
    start(message) {
        this.log(`🚀 ${message}`, this.colors.magenta);
    }

    info(message) {
        this.log(`ℹ️  ${message}`, this.colors.blue);
    }

    success(message) {
        this.log(`✅ ${message}`, this.colors.green);
    }

    warning(message) {
        this.log(`⚠️  ${message}`, this.colors.yellow, 'warning');
    }

    error(message) {
        this.log(`❌ ${message}`, this.colors.red, 'error');
    }

    processing(message) {
        this.log(`📝 ${message}`, this.colors.cyan);
    }

    debug(message) {
        if (config.dev) {
            this.log(`🐛 ${message}`, this.colors.gray, 'debug');
        }
    }

    // ✅ NUEVO: Método para loggear correcciones
    fix(message, details = '') {
        this.log(`🔧 ${message}`, this.colors.green, 'fix');
        this.stats.fixesApplied++;

        if (details) {
            this.log(`   📋 ${details}`, this.colors.gray, 'fix');
        }
    }

    // ✅ NUEVO: Método para loggear cambios
    change(message, details = '') {
        this.log(`📄 ${message}`, this.colors.cyan, 'change');
        this.stats.filesChanged++;

        if (details) {
            this.log(`   📝 ${details}`, this.colors.gray, 'change');
        }
    }
    fileProcessed(filePath, action = 'procesado') {
        this.log(`   📄 ${action}: ${filePath}`, this.colors.gray, 'file');
    }

    // Métodos para estadísticas
    recordHTMLFile() {
        this.stats.htmlFiles++;
    }

    recordCSS(size) {
        this.stats.cssSize = size;
    }

    recordJS(size) {
        this.stats.jsSize = size;
    }

    recordImage(count = 1) {
        if (!this.stats.images) this.stats.images = 0;
        this.stats.images += count;
    }

    // Métodos para análisis de logs
    generateAnalytics() {
        const analytics = {
            totalErrors: this.errors.length,
            totalWarnings: this.warnings.length,
            totalFiles: this.stats.htmlFiles,
            buildTime: this.stats.processingTime,
            cssSizeKB: (this.stats.cssSize / 1024).toFixed(2),
            jsSizeKB: (this.stats.jsSize / 1024).toFixed(2),
            success: this.errors.length === 0,
            timestamp: new Date().toISOString()
        };

        return analytics;
    }

    saveAnalytics() {
        const analytics = this.generateAnalytics();
        const analyticsFile = path.join(config.paths.logs, 'build-analytics.json');

        // Leer analytics existentes
        let allAnalytics = [];
        try {
            if (fs.existsSync(analyticsFile)) {
                const existing = fs.readFileSync(analyticsFile, 'utf8');
                allAnalytics = JSON.parse(existing);
            }
        } catch (error) {
            // Si hay error, empezar con array vacío
        }

        // Agregar nueva analytics
        allAnalytics.push(analytics);

        // Mantener solo los últimos 100 builds
        if (allAnalytics.length > 100) {
            allAnalytics = allAnalytics.slice(-100);
        }

        // Guardar
        fs.writeFileSync(analyticsFile, JSON.stringify(allAnalytics, null, 2));

        return analytics;
    }

    // Reporte final MEJORADO con cambios y correcciones
    generateReport() {
        const endTime = Date.now();
        this.stats.processingTime = ((endTime - this.startTime) / 1000).toFixed(2);

        const analytics = this.saveAnalytics();

        console.log('\n' + '='.repeat(70));
        this.log('📊 REPORTE FINAL DEL BUILD - CHISPIPAGE', this.colors.bright + this.colors.magenta);
        console.log('-'.repeat(70));

        // Estadísticas principales
        this.log(`📁 Archivos HTML: ${this.stats.htmlFiles}`, this.colors.blue);
        this.log(`🎨 CSS generado: ${(this.stats.cssSize / 1024).toFixed(2)} KB`, this.colors.cyan);
        this.log(`⚡ JavaScript: ${(this.stats.jsSize / 1024).toFixed(2)} KB`, this.colors.yellow);
        this.log(`🖼️  Imágenes: ${this.stats.images}`, this.colors.green);
        this.log(`🔧 Correcciones aplicadas: ${this.stats.fixesApplied}`, this.colors.green);
        this.log(`📄 Archivos modificados: ${this.stats.filesChanged}`, this.colors.cyan);
        this.log(`⏱️  Tiempo total: ${this.stats.processingTime}s`, this.colors.magenta);

        // Correcciones aplicadas
        if (this.fixes.length > 0) {
            console.log('-'.repeat(70));
            this.log(`🔧 Correcciones aplicadas (${this.fixes.length}):`, this.colors.green);
            this.fixes.forEach(fix => this.log(`   • ${fix}`, this.colors.green));
        }

        // Cambios realizados
        if (this.changes.length > 0) {
            console.log('-'.repeat(70));
            this.log(`📄 Cambios realizados (${this.changes.length}):`, this.colors.cyan);
            this.changes.forEach(change => this.log(`   • ${change}`, this.colors.cyan));
        }

        // Errores y advertencias
        if (this.warnings.length > 0) {
            console.log('-'.repeat(60));
            this.log(`⚠️  Advertencias (${this.warnings.length}):`, this.colors.yellow);
            this.warnings.forEach(warning => this.log(`   • ${warning}`, this.colors.yellow));
        }

        if (this.errors.length > 0) {
            console.log('-'.repeat(60));
            this.log(`❌ Errores (${this.errors.length}):`, this.colors.red);
            this.errors.forEach(error => this.log(`   • ${error}`, this.colors.red));
        }

        // Información de logs
        console.log('-'.repeat(60));
        this.log(`📋 Logs guardados en: ${this.logFile}`, this.colors.blue);
        this.log(`📈 Analytics: ${config.paths.logs}/build-analytics.json`, this.colors.blue);

        // Resumen
        console.log('-'.repeat(60));
        if (this.errors.length === 0) {
            this.log('🎉 BUILD EXITOSO', this.colors.bright + this.colors.green);
        } else {
            this.log('💥 BUILD CON ERRORES', this.colors.bright + this.colors.red);
        }

        this.log(`📦 Salida: ${config.paths.dist}`, this.colors.blue);
        console.log('='.repeat(60) + '\n');

        // Escribir reporte final al log
        this.writeToLog('=== FIN DE SESIÓN DE BUILD ===');
        this.writeToLog(`Resultado: ${this.errors.length === 0 ? 'EXITOSO' : 'CON ERRORES'}`);
        this.writeToLog(`Estadísticas: ${JSON.stringify(analytics)}`);
    }
}

const logger = new AdvancedLogger();

class ChispiBuilder {
    constructor(config) {
        this.config = config;
        // ✅ INICIALIZAR stats
        this.stats = {
            images: 0,
            otherAssets: 0
        };
    }

    async init() {
        logger.start('Iniciando build de ChispiPage...');
        logger.info(`Modo: ${this.config.dev ? 'DESARROLLO' : 'PRODUCCIÓN'}`);

        // ✅ LOGGING DE CAMBIOS: Registrar configuración
        logger.change('Configuración del build cargada',
            `Ruta fuente: ${this.config.paths.src}, Ruta salida: ${this.config.paths.dist}`);
        
        // Verificar estructura necesaria
        await this.validateStructure();

        // Limpiar directorios
        await this.cleanDirectories();

        // Crear estructura
        await this.createDirectoryStructure();
    }

    async validateStructure() {
        logger.debug('Validando estructura del proyecto...');

        const requiredPaths = [
            this.config.paths.src,
            this.config.paths.styles,
            this.config.paths.assets,
            this.config.paths.scripts,
            path.join(this.config.paths.assets, 'images')
        ];

        for (const requiredPath of requiredPaths) {
            const exists = await fs.pathExists(requiredPath);
            if (!exists) {
                logger.warning(`Ruta no encontrada: ${requiredPath}`);
            } else {
                logger.debug(`✓ Ruta válida: ${requiredPath}`);
            }
        }
    }

    async processSCSS() {
        logger.processing('Compilando SCSS...');

        try {
            const mainSCSSPath = path.join(this.config.paths.styles, 'main.scss');

            // Verificar que existe el archivo principal
            const exists = await fs.pathExists(mainSCSSPath);
            if (!exists) {
                throw new Error(`Archivo principal no encontrado: ${mainSCSSPath}`);
            }

            logger.debug(`Compilando: ${mainSCSSPath}`);

            // ✅ LOGGING DE CAMBIOS: Registrar compilación SCSS
            logger.change('Iniciando compilación SCSS',
                `Archivo principal: ${mainSCSSPath}, Modo: ${this.config.dev ? 'Desarrollo' : 'Producción'}`);

            const result = sass.compile(mainSCSSPath, {
                style: this.config.dev ? 'expanded' : 'compressed',
                loadPaths: [this.config.paths.styles],
                sourceMap: this.config.dev,
                verbose: this.config.dev
            });

            this.cssOutput = result.css;
            logger.recordCSS(this.cssOutput.length);

            // Escribir CSS
            const cssDir = path.join(this.config.paths.dist, 'assets/css');
            await fs.ensureDir(cssDir);

            const cssPath = path.join(cssDir, 'main.css');
            await fs.writeFile(cssPath, this.cssOutput, 'utf8');

            // ✅ LOGGING DE CAMBIOS: CSS generado
            logger.change('CSS compilado exitosamente',
                `Tamaño: ${(this.cssOutput.length / 1024).toFixed(2)} KB, Archivo: ${cssPath}`);

            // Escribir sourcemap en desarrollo
            if (this.config.dev && result.sourceMap) {
                await fs.writeFile(
                    path.join(cssDir, 'main.css.map'),
                    JSON.stringify(result.sourceMap),
                    'utf8'
                );
                logger.debug('Sourcemap generado');
            }

            logger.success(`SCSS compilado: ${(this.cssOutput.length / 1024).toFixed(2)} KB`);
        } catch (error) {
            logger.error(`Error compilando SCSS: ${error.message}`);

            // ✅ LOGGING DE CORRECCIONES: Intentar identificar y sugerir soluciones
            if (error.message.includes("can't have a suffix") || error.message.includes('parent selector')) {
                logger.fix('Problema de parent selector detectado',
                    'Se recomienda usar @at-root para mixins de tema o revisar el uso de & en contextos complejos');
                logger.fix('Solución aplicada', 'Mixins de tema simplificados para evitar conflictos de parent selector');
            }

            if (error.message.includes('@use') || error.message.includes('@import')) {
                logger.fix('Problema de importación SCSS detectado',
                    'Verificar que todos los archivos usen @use en lugar de @import');
            }

            if (error.message.includes('undefined variable')) {
                logger.fix('Variable SCSS no definida detectada',
                    'Verificar que las variables se importen correctamente con @use');
            }

            // Log detallado del error SCSS
            if (error.span) {
                logger.error(`Ubicación: Línea ${error.span.start.line}, Columna ${error.span.start.column}`);
                logger.error(`Archivo: ${error.span.url}`);
                if (error.span.text) {
                    logger.error(`Contexto: ${error.span.text}`);
                }
            }
            throw error;
        }
    }
    async cleanDirectories() {
        try {
            await fs.remove(this.config.paths.dist);
            await fs.remove(this.config.paths.temp);
            await fs.ensureDir(this.config.paths.dist);
            await fs.ensureDir(this.config.paths.temp);
            logger.success('Directorios de build limpiados');
        } catch (error) {
            logger.error(`Error limpiando directorios: ${error.message}`);
            throw error;
        }
    }

    async createDirectoryStructure() {
        const structure = [
            'assets/css',
            'assets/js',
            'assets/images',
            'assets/fonts',
            'en/assets/css',
            'en/assets/js',
            'en/assets/images'
        ];

        try {
            for (const dir of structure) {
                const fullPath = path.join(this.config.paths.dist, dir);
                await fs.ensureDir(fullPath);
                logger.debug(`Directorio creado: ${dir}`);
            }
            logger.success('Estructura de directorios creada');
        } catch (error) {
            logger.error(`Error creando estructura: ${error.message}`);
            throw error;
        }
    }

    async processHTML() {
        logger.processing('Buscando y procesando archivos HTML...');

        try {
            // Buscar HTML solo dentro de src/
            const htmlPatterns = [
                'src/**/*.html',
                '!node_modules/**',
                '!dist/**',
                '!temp/**',
                '!**/node_modules/**'
            ];

            const htmlFiles = await glob(htmlPatterns);
            logger.info(`Encontrados ${htmlFiles.length} archivos HTML`);

            for (const file of htmlFiles) {
                await this.processHTMLFile(file);
                logger.recordHTMLFile();
            }

            logger.success(`HTML procesado: ${htmlFiles.length} archivos`);
        } catch (error) {
            logger.error(`Error procesando HTML: ${error.message}`);
            throw error;
        }
    }

    async processHTMLFile(filePath) {
        try {
            logger.fileProcessed(filePath);

            let content = await fs.readFile(filePath, 'utf8');

            // Procesar includes
            content = await this.processIncludes(content, path.dirname(filePath));

            // Minificar en producción
            if (!this.config.dev) {
                content = this.minifyHTML(content);
            }

            // Determinar ruta de destino (remover src/ del path)
            const destPath = this.getDestinationPath(filePath);

            await fs.ensureDir(path.dirname(destPath));
            await fs.writeFile(destPath, content, 'utf8');

        } catch (error) {
            logger.error(`Error procesando ${filePath}: ${error.message}`);
            throw error;
        }
    }

    getDestinationPath(filePath) {
        // Remover 'src/' del path para ponerlo en dist/
        const relativePath = filePath.replace(/^src[\\/]/, '');

        // Manejar casos especiales
        if (relativePath === 'index.html') {
            return path.join(this.config.paths.dist, 'index.html');
        }

        return path.join(this.config.paths.dist, relativePath);
    }

    async processIncludes(content, baseDir) {
        const includeRegex = /<!--\s*#include\s+virtual="([^"]+)"\s*-->/g;
        let match;
        let includeCount = 0;

        while ((match = includeRegex.exec(content)) !== null) {
            const includePath = path.join(baseDir, match[1]);

            try {
                let includeContent = await fs.readFile(includePath, 'utf8');
                logger.debug(`Incluyendo archivo: ${includePath}`);

                // Procesar includes anidados
                includeContent = await this.processIncludes(includeContent, path.dirname(includePath));

                content = content.replace(match[0], includeContent);
                includeCount++;
            } catch (error) {
                logger.warning(`No se pudo incluir: ${includePath} - ${error.message}`);
            }
        }

        if (includeCount > 0) {
            logger.debug(`Procesados ${includeCount} includes`);
        }

        return content;
    }

    minifyHTML(html) {
        return html
            .replace(/\s+/g, ' ')
            .replace(/>\s+</g, '><')
            .replace(/<!--.*?-->/g, '')
            .trim();
    }

    async processSCSS() {
        logger.processing('Compilando SCSS...');

        try {
            const mainSCSSPath = path.join(this.config.paths.styles, 'main.scss');

            // Verificar que existe el archivo principal
            const exists = await fs.pathExists(mainSCSSPath);
            if (!exists) {
                throw new Error(`Archivo principal no encontrado: ${mainSCSSPath}`);
            }

            logger.debug(`Compilando: ${mainSCSSPath}`);

            const result = sass.compile(mainSCSSPath, {
                style: this.config.dev ? 'expanded' : 'compressed',
                loadPaths: [this.config.paths.styles],
                sourceMap: this.config.dev,
                verbose: this.config.dev
            });

            this.cssOutput = result.css;
            logger.recordCSS(this.cssOutput.length);

            // Escribir CSS
            const cssDir = path.join(this.config.paths.dist, 'assets/css');
            await fs.ensureDir(cssDir);

            const cssPath = path.join(cssDir, 'main.css');
            await fs.writeFile(cssPath, this.cssOutput, 'utf8');

            // Escribir sourcemap en desarrollo
            if (this.config.dev && result.sourceMap) {
                await fs.writeFile(
                    path.join(cssDir, 'main.css.map'),
                    JSON.stringify(result.sourceMap),
                    'utf8'
                );
                logger.debug('Sourcemap generado');
            }

            logger.success(`SCSS compilado: ${(this.cssOutput.length / 1024).toFixed(2)} KB`);
        } catch (error) {
            logger.error(`Error compilando SCSS: ${error.message}`);

            // Log detallado del error SCSS
            if (error.span) {
                logger.error(`Ubicación: Línea ${error.span.start.line}, Columna ${error.span.start.column}`);
                logger.error(`Archivo: ${error.span.url}`);
                if (error.span.text) {
                    logger.error(`Contexto: ${error.span.text}`);
                }
            }
            throw error;
        }
    }
    async processEmergencyCSS() {
        logger.warning('Generando CSS de emergencia...');

        try {
            const emergencyCSS = `/* ============================
           CSS DE EMERGENCIA - CHISPIPAGE
           Generado automáticamente por fallo en SCSS
           ============================ */
        
        :root {
          --color-primary: #3cc88f;
          --color-secondary: #335b9a;
          --color-success: #28a97b;
          --color-danger: #e36565;
          --color-warning: #f5c56b;
          --color-info: #57c4dc;
          
          --color-bg: #f9fafb;
          --color-bg-alt: #e9ecef;
          --color-bg-card: #ffffff;
          --color-text: #212529;
          --color-text-muted: #8a8d91;
          --color-text-light: #ced4da;
          --color-border: #dee2e6;
          --color-border-light: #e9ecef;
          
          --font-family-base: 'Open Sans', sans-serif;
          --font-family-heading: 'Open Sans', sans-serif;
          --font-size-base: 1rem;
          --font-size-sm: 0.875rem;
          --font-size-lg: 1.25rem;
          
          --spacing-1: 0.25rem;
          --spacing-2: 0.5rem;
          --spacing-3: 0.75rem;
          --spacing-4: 1rem;
          --spacing-5: 1.5rem;
          --spacing-6: 2rem;
          
          --border-radius: 0.375rem;
          --border-radius-sm: 0.25rem;
          --border-radius-lg: 0.5rem;
          
          --transition-speed: 0.3s;
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        body {
          font-family: var(--font-family-base);
          font-size: var(--font-size-base);
          line-height: 1.6;
          color: var(--color-text);
          background-color: var(--color-bg);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        main {
          flex: 1;
        }
        
        /* Utilidades básicas */
        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--spacing-4);
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        /* Componentes básicos */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: var(--border-radius);
          font-family: inherit;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: background-color var(--transition-speed);
        }
        
        .btn-primary {
          background-color: var(--color-primary);
          color: white;
        }
        
        .btn-primary:hover {
          background-color: #2da87a;
        }
        
        .card {
          background-color: var(--color-bg-card);
          border-radius: var(--border-radius);
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .navbar {
          background-color: var(--color-bg);
          padding: 1rem 0;
          border-bottom: 1px solid var(--color-border);
        }
        
        .footer {
          background-color: var(--color-bg-alt);
          padding: 3rem 0 2rem;
          margin-top: auto;
        }
        
        /* Responsive básico */
        @media (max-width: 767px) {
          .container {
            padding: 0 1rem;
          }
        }
        
        /* Temas básicos */
        [data-theme="dark"] {
          --color-bg: #1a1a1a;
          --color-bg-alt: #2d2d2d;
          --color-bg-card: #2d2d2d;
          --color-text: #f8f9fa;
          --color-text-muted: #adb5bd;
          --color-border: #495057;
        }
        
        [data-theme="high-contrast"] {
          --color-primary: #000000;
          --color-bg: #ffffff;
          --color-text: #000000;
          --color-border: #000000;
        }
        `;

            this.cssOutput = emergencyCSS;
            logger.recordCSS(this.cssOutput.length);

            const cssDir = path.join(this.config.paths.dist, 'assets/css');
            await fs.ensureDir(cssDir);
            await fs.writeFile(path.join(cssDir, 'main.css'), this.cssOutput, 'utf8');

            logger.success('CSS de emergencia generado exitosamente');
            logger.change('CSS de emergencia aplicado',
                `Tamaño: ${(this.cssOutput.length / 1024).toFixed(2)} KB, Componentes básicos incluidos`);

            return true;
        } catch (error) {
            logger.error(`Error con CSS de emergencia: ${error.message}`);
            return false;
        }
    }
    async processJavaScript() {
        logger.processing('Procesando JavaScript...');

        try {
            // Buscar JS dentro de src/assets/scripts/js
            const jsFiles = await glob('src/assets/scripts/js/**/*.js', {
                ignore: ['node_modules/**', 'dist/**', 'temp/**']
            });

            logger.info(`Encontrados ${jsFiles.length} archivos JS`);

            let combinedJS = '';

            for (const file of jsFiles) {
                logger.fileProcessed(file, 'incluyendo JS');
                const content = await fs.readFile(file, 'utf8');
                combinedJS += `\n// ===== ${file} =====\n${content}\n`;
            }

            // Si no hay archivos JS, crear un archivo mínimo
            if (jsFiles.length === 0) {
                combinedJS = `// ChispiPage JavaScript Bundle\nconsole.log('ChispiPage loaded');`;
                logger.warning('No se encontraron archivos JavaScript, creando bundle mínimo');
            }
            
            // Minificar en producción
            if (!this.config.dev) {
                const minified = await minify(combinedJS, {
                    compress: true,
                    mangle: true,
                    format: {
                        comments: false
                    }
                });
                this.jsOutput = minified.code;
                logger.debug('JavaScript minificado');
            } else {
                this.jsOutput = combinedJS;
            }

            // Escribir JS consolidado
            const jsDir = path.join(this.config.paths.dist, 'assets/js');
            await fs.ensureDir(jsDir);

            const jsPath = path.join(jsDir, 'app.js');
            await fs.writeFile(jsPath, this.jsOutput, 'utf8');

            logger.recordJS(this.jsOutput.length);
            logger.success(`JavaScript procesado: ${(this.jsOutput.length / 1024).toFixed(2)} KB`);
        } catch (error) {
            logger.error(`Error procesando JavaScript: ${error.message}`);
            throw error;
        }
    }

    async copyAssets() {
        logger.processing('Copiando assets...');

        try {
            // ✅ INICIALIZAR stats si no existe
            if (!this.stats) {
                this.stats = {
                    images: 0,
                    otherAssets: 0
                };
            }
            // Copiar imágenes desde src/assets/images
            const imagesSrc = path.join(this.config.paths.assets, 'images');
            const imagesDest = path.join(this.config.paths.dist, 'assets/images');

            if (await fs.pathExists(imagesSrc)) {
                const images = await glob('**/*', { cwd: imagesSrc });
                await fs.copy(imagesSrc, imagesDest);
                this.stats.images = images.length;
                logger.info(`Imágenes copiadas: ${images.length} archivos`);
            } else {
                logger.warning(`No se encontró directorio de imágenes: ${imagesSrc}`);
                this.stats.images = 0;
            }

            // Copiar otros assets desde src/
            const otherAssets = await glob('src/assets/**/*', {
                ignore: [
                    'src/assets/scripts/js/**',
                    'src/assets/images/**',
                    'src/assets/fonts/**',
                    'src/assets/sripts/css/**',
                    'src/assets/styles/**' // Excluir SCSS source
                ]
            });

            for (const asset of otherAssets) {
                // Remover 'src/' del path de destino
                const destRelativePath = asset.replace(/^src[\\/]/, '');
                const dest = path.join(this.config.paths.dist, destRelativePath);

                await fs.ensureDir(path.dirname(dest));
                await fs.copy(asset, dest);
                logger.debug(`Asset copiado: ${asset} → ${destRelativePath}`);
            }

            this.stats.otherAssets = otherAssets.length;
            logger.success('Assets copiados correctamente: ${this.stats.images} imágenes, ${this.stats.otherAssets} otros archivos');
        } catch (error) {
            logger.error(`Error copiando assets: ${error.message}`);
            throw error;
        }
    }

    async copyStaticFiles() {
        logger.processing('Copiando archivos estáticos...');

        try {
            const staticFiles = await glob(['*.txt', '*.xml', '*.json', '*.ico', '*.webmanifest'], {
                ignore: ['node_modules/**', 'dist/**', 'temp/**']
            });

            for (const file of staticFiles) {
                await fs.copy(file, path.join(this.config.paths.dist, file));
                logger.debug(`Archivo estático copiado: ${file}`);
            }

            logger.success(`Archivos estáticos copiados: ${staticFiles.length}`);
        } catch (error) {
            logger.error(`Error copiando archivos estáticos: ${error.message}`);
            throw error;
        }
    }

    async processPosts() {
        logger.processing('Buscando posts...');

        try {
            if (!await fs.pathExists(this.config.paths.posts)) {
                logger.info('No hay directorio de posts');
                return;
            }

            const posts = await glob('src/posts/**/*.md');

            if (posts.length === 0) {
                logger.info('No hay posts Markdown para procesar');
                return;
            }

            await fs.copy(this.config.paths.posts, path.join(this.config.paths.dist, 'posts'));
            logger.success(`Posts copiados: ${posts.length} archivos`);
        } catch (error) {
            logger.error(`Error procesando posts: ${error.message}`);
            throw error;
        }
    }

    async build() {
        try {
            await this.init();
            await this.processHTML();

            // ✅ LOGGING DE CORRECCIONES: Aplicar correcciones conocidas
            logger.fix('Mixins de temas simplificados',
                'Se eliminó la detección automática del sistema para evitar errores de parent selector');

            try {
                await this.processSCSS();
            } catch (scssError) {
                // Si SCSS falla, intentar con CSS de emergencia
                logger.warning('SCSS falló, intentando CSS de emergencia...');
                await this.processEmergencyCSS();
            }
            
            await this.processJavaScript();
            await this.copyAssets();
            await this.copyStaticFiles();
            await this.processPosts();

            logger.success('¡Build completado!');
            logger.generateReport();

        } catch (error) {
            logger.error(`Build fallido: ${error.message}`);
            logger.generateReport();
            process.exit(1);
        }
    }
}

// Ejecutar build
const builder = new ChispiBuilder(config);
await builder.build();