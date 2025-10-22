// scripts/verify-functionality.js
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

class FunctionalityVerifier {
    constructor() {
        this.projectRoot = process.cwd();
        this.issues = [];
        this.warnings = [];
    }

    checkFile(filePath, description) {
        if (!existsSync(filePath)) {
            this.issues.push(`❌ ${description}: ${filePath} no existe`);
            return false;
        }

        try {
            const content = readFileSync(filePath, 'utf8');
            if (content.trim().length === 0) {
                this.warnings.push(`⚠️ ${description}: ${filePath} está vacío`);
            }
            return true;
        } catch (error) {
            this.issues.push(`❌ ${description}: Error leyendo ${filePath} - ${error.message}`);
            return false;
        }
    }

    checkHTMLStructure() {
        console.log('\n🔍 VERIFICANDO ESTRUCTURA HTML...');

        const htmlFiles = [
            'src/pages/index.html',
            'src/pages/en/index.html',
            'src/includes/global/head.html',
            'src/includes/global/header.html',
            'src/includes/global/footer.html'
        ];

        htmlFiles.forEach(file => {
            if (this.checkFile(file, 'Archivo HTML')) {
                const content = readFileSync(file, 'utf8');

                // Verificaciones básicas de HTML
                if (file.includes('head')) {
                    if (!content.includes('<title>') && !content.includes('{{')) {
                        this.warnings.push(`⚠️ head.html: Posible falta de título`);
                    }
                    if (!content.includes('<meta') && !content.includes('{{')) {
                        this.warnings.push(`⚠️ head.html: Posible falta de meta tags`);
                    }
                }

                if (file.includes('header') && !content.includes('<nav') && !content.includes('{{')) {
                    this.warnings.push(`⚠️ header.html: Posible falta de navegación`);
                }
            }
        });
    }

    checkStyles() {
        console.log('\n🎨 VERIFICANDO ESTILOS...');

        // Verificar archivo SCSS principal
        if (this.checkFile('src/assets/styles/main.scss', 'Archivo SCSS principal')) {
            const content = readFileSync('src/assets/styles/main.scss', 'utf8');

            // Verificar imports críticos
            const criticalImports = ['variables', 'reset', 'base'];
            criticalImports.forEach(imp => {
                if (!content.includes(imp) && !content.includes('@import')) {
                    this.warnings.push(`⚠️ main.scss: Posible falta de import de ${imp}`);
                }
            });
        }

        // Verificar variables CSS
        this.checkFile('src/assets/styles/base/_variables.scss', 'Variables SCSS');
        this.checkFile('src/assets/styles/base/_css-variables.scss', 'Variables CSS');
    }

    checkScripts() {
        console.log('\n⚡ VERIFICANDO SCRIPTS...');

        const criticalScripts = [
            'src/assets/scripts/core/app.js',
            'src/assets/scripts/core/theme.js',
            'src/assets/scripts/core/router.js'
        ];

        criticalScripts.forEach(script => {
            this.checkFile(script, 'Script crítico');
        });

        // Verificar configuración de partículas
        this.checkFile('src/assets/scripts/particles/particles-config.js', 'Configuración de partículas');
    }

    checkBuildSystem() {
        console.log('\n🏗️ VERIFICANDO SISTEMA DE BUILD...');

        const buildFiles = [
            'scripts/build/adaptive-build.js',
            'package.json'
        ];

        buildFiles.forEach(file => {
            if (this.checkFile(file, 'Archivo de build')) {
                if (file === 'package.json') {
                    const content = JSON.parse(readFileSync(file, 'utf8'));

                    // Verificar scripts de build
                    const buildScripts = ['build', 'build:dev', 'build:prod'];
                    buildScripts.forEach(script => {
                        if (!content.scripts || !content.scripts[script]) {
                            this.issues.push(`❌ package.json: Falta script ${script}`);
                        }
                    });

                    // Verificar dependencias críticas
                    const criticalDeps = ['sass', 'fs-extra'];
                    criticalDeps.forEach(dep => {
                        if (!content.dependencies || !content.dependencies[dep]) {
                            this.warnings.push(`⚠️ package.json: Posible falta de dependencia ${dep}`);
                        }
                    });
                }
            }
        });
    }

    checkAccessibility() {
        console.log('\n♿ VERIFICANDO ACCESIBILIDAD...');

        // Verificar temas de accesibilidad
        const accessibilityThemes = [
            'src/assets/styles/themes/_dark.scss',
            'src/assets/styles/themes/_high-contrast.scss',
            'src/assets/styles/themes/_reduced-motion.scss'
        ];

        accessibilityThemes.forEach(theme => {
            this.checkFile(theme, 'Tema de accesibilidad');
        });

        // Verificar utilidades de accesibilidad
        this.checkFile('src/assets/styles/base/_accessibility.scss', 'Estilos de accesibilidad');
    }

    checkInternationalization() {
        console.log('\n🌐 VERIFICANDO INTERNACIONALIZACIÓN...');

        const enPages = [
            'src/pages/en/index.html',
            'src/pages/en/about.html',
            'src/pages/en/projects.html'
        ];

        const esPages = [
            'src/pages/index.html',
            'src/pages/about.html',
            'src/pages/projects.html'
        ];

        // Verificar que existan equivalentes en ambos idiomas
        esPages.forEach((esPage, index) => {
            const enPage = enPages[index];
            if (existsSync(esPage) && !existsSync(enPage)) {
                this.warnings.push(`⚠️ Internacionalización: Falta equivalente en inglés de ${esPage}`);
            }
            if (!existsSync(esPage) && existsSync(enPage)) {
                this.warnings.push(`⚠️ Internacionalización: Falta equivalente en español de ${enPage}`);
            }
        });
    }

    generateReport() {
        console.log('\n📊 INFORME DE VERIFICACIÓN:');

        if (this.issues.length === 0 && this.warnings.length === 0) {
            console.log('✅ ¡TODAS LAS VERIFICACIONES PASARON!');
            console.log('   La página debería funcionar correctamente');
            return true;
        }

        if (this.issues.length > 0) {
            console.log('\n❌ PROBLEMAS CRÍTICOS:');
            this.issues.forEach(issue => console.log(`   ${issue}`));
        }

        if (this.warnings.length > 0) {
            console.log('\n⚠️ ADVERTENCIAS:');
            this.warnings.forEach(warning => console.log(`   ${warning}`));
        }

        console.log(`\n📈 RESUMEN:`);
        console.log(`   • Problemas críticos: ${this.issues.length}`);
        console.log(`   • Advertencias: ${this.warnings.length}`);

        return this.issues.length === 0;
    }

    async run() {
        console.log('🚀 VERIFICANDO FUNCIONALIDAD DE LA PÁGINA\n');

        try {
            this.checkHTMLStructure();
            this.checkStyles();
            this.checkScripts();
            this.checkBuildSystem();
            this.checkAccessibility();
            this.checkInternationalization();

            const success = this.generateReport();

            if (success) {
                console.log('\n🎉 ¡LA PÁGINA ESTÁ LISTA PARA CONSTRUIR Y DESPLEGAR!');
                console.log('   Ejecuta: npm run build:dev');
                console.log('   Luego: npm run dev');
            } else {
                console.log('\n💡 Recomendación: Resuelve los problemas críticos antes de construir');
                process.exit(1);
            }

        } catch (error) {
            console.error('💥 Error durante la verificación:', error);
            process.exit(1);
        }
    }
}

// Ejecutar verificación
const verifier = new FunctionalityVerifier();
verifier.run();