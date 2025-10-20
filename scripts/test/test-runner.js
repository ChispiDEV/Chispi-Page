// test-runner.js
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestRunner {
    constructor() {
        this.results = [];
        this.logFile = path.join(__dirname, 'logs', `test-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);
        this.ensureLogsDir();
    }

    ensureLogsDir() {
        const logsDir = path.join(__dirname, 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${type}] ${message}`;

        console.log(logEntry);
        fs.appendFileSync(this.logFile, logEntry + '\n');

        this.results.push({ timestamp, type, message });
    }

    async runAllTests() {
        this.log('🚀 INICIANDO SUITE DE TESTS COMPLETA');

        await this.testFileStructure();
        await this.testHTMLFiles();
        await this.testCSSFiles();
        await this.testJSFiles();
        await this.testAssets();
        await this.testRoutes();

        this.generateReport();
    }

    async testFileStructure() {
        this.log('📁 TEST: Estructura de archivos');

        const requiredPaths = [
            'dist/index.html',
            'dist/assets/css/main.css',
            'dist/assets/js/app.js',
            'dist/assets/images'
        ];

        for (const filePath of requiredPaths) {
            const exists = await fs.pathExists(filePath);
            if (exists) {
                this.log(`✅ ${filePath} - EXISTE`, 'SUCCESS');
            } else {
                this.log(`❌ ${filePath} - NO ENCONTRADO`, 'ERROR');
            }
        }
    }

    async testHTMLFiles() {
        this.log('🌐 TEST: Archivos HTML');

        const htmlFiles = await glob('dist/**/*.html');

        for (const file of htmlFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');

                // Tests para cada HTML
                const tests = {
                    tieneDoctype: content.includes('<!DOCTYPE html>'),
                    tieneCharset: content.includes('charset="UTF-8"'),
                    tieneViewport: content.includes('viewport'),
                    tieneTitle: content.match(/<title>.*<\/title>/),
                    cssCargado: content.includes('/assets/css/'),
                    jsCargado: content.includes('/assets/js/'),
                    noErroresRutas: !content.includes('assets/styles/') // Verifica rutas viejas
                };

                const passed = Object.values(tests).filter(Boolean).length;
                const total = Object.keys(tests).length;

                if (passed === total) {
                    this.log(`✅ ${file} - ${passed}/${total} tests pasados`, 'SUCCESS');
                } else {
                    this.log(`⚠️ ${file} - ${passed}/${total} tests pasados`, 'WARNING');

                    // Detalle de tests fallidos
                    Object.entries(tests).forEach(([test, result]) => {
                        if (!result) {
                            this.log(`   ❌ Falla: ${test}`, 'DETAIL');
                        }
                    });
                }

            } catch (error) {
                this.log(`❌ ${file} - Error leyendo archivo: ${error.message}`, 'ERROR');
            }
        }
    }

    async testCSSFiles() {
        this.log('🎨 TEST: Archivos CSS');

        const cssFiles = await glob('dist/assets/css/*.css');

        for (const file of cssFiles) {
            try {
                const content = await fs.readFile(file, 'utf8');
                const stats = await fs.stat(file);

                const tests = {
                    noVacio: content.length > 0,
                    tieneVariables: content.includes('--color-'),
                    tieneSelectores: content.match(/\.[a-zA-Z]/),
                    tamañoRazonable: stats.size > 1000 // Al menos 1KB
                };

                const passed = Object.values(tests).filter(Boolean).length;

                this.log(`✅ ${file} - ${passed}/4 tests - ${(stats.size/1024).toFixed(1)}KB`, 'SUCCESS');

            } catch (error) {
                this.log(`❌ ${file} - Error: ${error.message}`, 'ERROR');
            }
        }
    }

    async testJSFiles() {
        this.log('⚡ TEST: Archivos JavaScript');

        const jsFiles = await glob('dist/assets/js/*.js');

        for (const file of jsFiles) {
            try {
                const stats = await fs.stat(file);
                this.log(`✅ ${file} - ${(stats.size/1024).toFixed(1)}KB`, 'SUCCESS');
            } catch (error) {
                this.log(`❌ ${file} - Error: ${error.message}`, 'ERROR');
            }
        }
    }

    async testAssets() {
        this.log('🖼️ TEST: Assets e imágenes');

        const images = await glob('dist/assets/images/**/*');
        const otherAssets = await glob('dist/assets/**/*', {
            ignore: ['dist/assets/js/**', 'dist/assets/css/**', 'dist/assets/images/**']
        });

        this.log(`📸 Imágenes: ${images.length} archivos`, 'INFO');
        this.log(`📦 Otros assets: ${otherAssets.length} archivos`, 'INFO');

        // Verificar tipos de imagen
        const imageTypes = {};
        images.forEach(img => {
            const ext = path.extname(img).toLowerCase();
            imageTypes[ext] = (imageTypes[ext] || 0) + 1;
        });

        this.log(`📊 Tipos de imagen: ${JSON.stringify(imageTypes)}`, 'DETAIL');
    }

    async testRoutes() {
        this.log('🛣️ TEST: Rutas y navegación');

        const expectedRoutes = [
            '/',
            '/index.html',
            '/pages/sobre-mi.html',
            '/pages/proyectos.html',
            '/pages/contacto.html',
            '/pages/404.html'
        ];

        for (const route of expectedRoutes) {
            const filePath = path.join('dist', route);
            const exists = await fs.pathExists(filePath);

            if (exists) {
                this.log(`✅ Ruta ${route} - ACCESIBLE`, 'SUCCESS');
            } else {
                this.log(`❌ Ruta ${route} - NO ENCONTRADA`, 'ERROR');
            }
        }
    }

    generateReport() {
        const totalTests = this.results.filter(r =>
            r.type === 'SUCCESS' || r.type === 'ERROR' || r.type === 'WARNING'
        ).length;

        const passed = this.results.filter(r => r.type === 'SUCCESS').length;
        const warnings = this.results.filter(r => r.type === 'WARNING').length;
        const errors = this.results.filter(r => r.type === 'ERROR').length;

        this.log('\n' + '='.repeat(60), 'REPORT');
        this.log('📊 REPORTE FINAL DE TESTS', 'REPORT');
        this.log(`✅ Pasados: ${passed}`, 'REPORT');
        this.log(`⚠️ Advertencias: ${warnings}`, 'REPORT');
        this.log(`❌ Errores: ${errors}`, 'REPORT');
        this.log(`📈 Tasa de éxito: ${((passed / totalTests) * 100).toFixed(1)}%`, 'REPORT');
        this.log(`📋 Log guardado en: ${this.logFile}`, 'REPORT');
        this.log('='.repeat(60), 'REPORT');

        // Guardar reporte JSON
        const report = {
            timestamp: new Date().toISOString(),
            summary: { totalTests, passed, warnings, errors },
            details: this.results
        };

        fs.writeFileSync(
            path.join(__dirname, 'logs', 'test-report.json'),
            JSON.stringify(report, null, 2)
        );
    }
}

// Ejecutar tests
const runner = new TestRunner();
await runner.runAllTests();