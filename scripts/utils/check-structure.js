// scripts/check-structure.js
import { readdirSync, existsSync, statSync } from 'fs';
import { join, relative, sep } from 'path';

class ProjectStructureChecker {
    constructor() {
        this.projectRoot = process.cwd();
        this.stats = {
            directories: 0,
            files: 0,
            errors: 0,
            missing: 0
        };
        this.fileAnalysis = {
            scripts: { core: 0, modules: 0, vendors: 0, utils: 0, total: 0 },
            styles: { base: 0, components: 0, pages: 0, themes: 0, layout: 0, sections: 0, total: 0 },
            pages: { spanish: 0, english: 0, total: 0 },
            includes: { global: 0, components: 0, sections: 0, total: 0 },
            other: 0
        };
    }

    normalizePath(path) {
        return path.split(sep).join('/');
    }

    getRelativePath(fullPath) {
        return this.normalizePath(relative(this.projectRoot, fullPath));
    }

    categorizeFile(filePath) {
        const relPath = this.getRelativePath(filePath);

        if (relPath.includes('/assets/scripts/')) {
            this.fileAnalysis.scripts.total++;
            if (relPath.includes('/core/')) this.fileAnalysis.scripts.core++;
            else if (relPath.includes('/modules/')) this.fileAnalysis.scripts.modules++;
            else if (relPath.includes('/vendors/')) this.fileAnalysis.scripts.vendors++;
            else if (relPath.includes('/utils/')) this.fileAnalysis.scripts.utils++;
        }
        else if (relPath.includes('/assets/styles/')) {
            this.fileAnalysis.styles.total++;
            if (relPath.includes('/base/')) this.fileAnalysis.styles.base++;
            else if (relPath.includes('/components/')) this.fileAnalysis.styles.components++;
            else if (relPath.includes('/pages/')) this.fileAnalysis.styles.pages++;
            else if (relPath.includes('/themes/')) this.fileAnalysis.styles.themes++;
            else if (relPath.includes('/layout/')) this.fileAnalysis.styles.layout++;
            else if (relPath.includes('/sections/')) this.fileAnalysis.styles.sections++;
        }
        else if (relPath.includes('/pages/')) {
            this.fileAnalysis.pages.total++;
            if (relPath.includes('/en/')) this.fileAnalysis.pages.english++;
            else this.fileAnalysis.pages.spanish++;
        }
        else if (relPath.includes('/includes/')) {
            this.fileAnalysis.includes.total++;
            if (relPath.includes('/global/')) this.fileAnalysis.includes.global++;
            else if (relPath.includes('/components/')) this.fileAnalysis.includes.components++;
            else if (relPath.includes('/sections/')) this.fileAnalysis.includes.sections++;
        }
        else {
            this.fileAnalysis.other++;
        }
    }

    checkDir(dirPath, indent = '', depth = 0) {
        const relativePath = this.getRelativePath(dirPath);

        if (!existsSync(dirPath)) {
            console.log(`${indent}❌ ${relativePath} - NO EXISTE`);
            this.stats.missing++;
            this.stats.errors++;
            return;
        }

        if (depth > 5) {
            console.log(`${indent}📁 ${relativePath.split('/').pop()}/ [...]`);
            return;
        }

        try {
            const stats = statSync(dirPath);
            if (!stats.isDirectory()) {
                const displayName = relativePath.split('/').pop();
                console.log(`${indent}  📄 ${displayName}`);
                this.stats.files++;
                this.categorizeFile(dirPath);
                return;
            }

            const displayName = relativePath.split('/').pop();
            console.log(`${indent}📁 ${displayName}/`);
            this.stats.directories++;

            const items = readdirSync(dirPath, { withFileTypes: true });

            items.sort((a, b) => {
                if (a.isDirectory() && !b.isDirectory()) return -1;
                if (!a.isDirectory() && b.isDirectory()) return 1;
                return a.name.localeCompare(b.name);
            });

            const filteredItems = items.filter(item => {
                return !item.name.startsWith('.') &&
                    item.name !== 'node_modules' &&
                    !item.name.includes('.git') &&
                    item.name !== '.idea';
            });

            for (const item of filteredItems) {
                const fullPath = join(dirPath, item.name);
                this.checkDir(fullPath, indent + '  ', depth + 1);
            }

        } catch (error) {
            console.log(`${indent}❌ Error leyendo ${relativePath}: ${error.message}`);
            this.stats.errors++;
        }
    }

    checkCriticalPaths() {
        console.log('🔍 ESTRUCTURA CRÍTICA DEL PROYECTO\n');

        const criticalPaths = [
            'src/assets/scripts',
            'src/assets/styles',
            'src/pages',
            'src/includes'
        ];

        criticalPaths.forEach(path => this.checkDir(path));
    }

    checkCriticalFiles() {
        console.log('\n🎯 ARCHIVOS CRÍTICOS:');

        const criticalFiles = [
            'package.json',
            'src/assets/styles/main.scss',
            'src/pages/index.html',
            'src/includes/global/head.html',
            'src/includes/global/header.html',
            'src/includes/global/footer.html'
        ];

        let allExist = true;
        criticalFiles.forEach(file => {
            const exists = existsSync(file);
            const status = exists ? '✅' : '❌';
            console.log(`${status} ${file}`);

            if (!exists) {
                this.stats.missing++;
                allExist = false;
            }
        });

        return allExist;
    }

    analyzeStructure() {
        console.log('\n📈 ANÁLISIS DETALLADO:');

        console.log('   📂 SCRIPTS:');
        console.log(`      • Core: ${this.fileAnalysis.scripts.core} archivos`);
        console.log(`      • Módulos: ${this.fileAnalysis.scripts.modules} archivos`);
        console.log(`      • Vendors: ${this.fileAnalysis.scripts.vendors} archivos`);
        console.log(`      • Utils: ${this.fileAnalysis.scripts.utils} archivos`);
        console.log(`      • TOTAL: ${this.fileAnalysis.scripts.total} archivos`);

        console.log('   🎨 ESTILOS:');
        console.log(`      • Base: ${this.fileAnalysis.styles.base} archivos`);
        console.log(`      • Componentes: ${this.fileAnalysis.styles.components} archivos`);
        console.log(`      • Páginas: ${this.fileAnalysis.styles.pages} archivos`);
        console.log(`      • Temas: ${this.fileAnalysis.styles.themes} archivos`);
        console.log(`      • Layout: ${this.fileAnalysis.styles.layout} archivos`);
        console.log(`      • Secciones: ${this.fileAnalysis.styles.sections} archivos`);
        console.log(`      • TOTAL: ${this.fileAnalysis.styles.total} archivos`);

        console.log('   📄 PÁGINAS:');
        console.log(`      • Español: ${this.fileAnalysis.pages.spanish} archivos`);
        console.log(`      • Inglés: ${this.fileAnalysis.pages.english} archivos`);
        console.log(`      • TOTAL: ${this.fileAnalysis.pages.total} archivos`);

        console.log('   🧩 INCLUDES:');
        console.log(`      • Global: ${this.fileAnalysis.includes.global} archivos`);
        console.log(`      • Componentes: ${this.fileAnalysis.includes.components} archivos`);
        console.log(`      • Secciones: ${this.fileAnalysis.includes.sections} archivos`);
        console.log(`      • TOTAL: ${this.fileAnalysis.includes.total} archivos`);
    }

    printStats() {
        console.log('\n📊 ESTADÍSTICAS GENERALES:');
        console.log(`   • Directorios: ${this.stats.directories}`);
        console.log(`   • Archivos totales: ${this.stats.files}`);
        console.log(`   • Archivos analizados: ${this.fileAnalysis.scripts.total + this.fileAnalysis.styles.total + this.fileAnalysis.pages.total + this.fileAnalysis.includes.total}`);
        console.log(`   • Errores: ${this.stats.errors}`);
        console.log(`   • Faltantes: ${this.stats.missing}`);
    }

    generateSuggestions() {
        console.log('\n💡 RECOMENDACIONES:');

        const suggestions = [];

        // Análisis de scripts
        if (this.fileAnalysis.scripts.modules > 8) {
            suggestions.push('• Considera agrupar módulos de scripts similares');
        }

        if (this.fileAnalysis.styles.themes > 5) {
            suggestions.push('• Los temas están bien organizados para accesibilidad');
        }

        if (this.fileAnalysis.pages.spanish === this.fileAnalysis.pages.english) {
            suggestions.push('• ✅ Internacionalización balanceada (español/inglés)');
        }

        if (this.fileAnalysis.includes.global >= 4) {
            suggestions.push('• ✅ Estructura de includes globales completa');
        }

        if (this.fileAnalysis.styles.components > 10) {
            suggestions.push('• Considera un sistema de design tokens para los componentes');
        }

        if (this.stats.files > 80) {
            suggestions.push('• Proyecto de tamaño considerable, considera code splitting');
        }

        if (suggestions.length === 0) {
            suggestions.push('• La estructura está optimizada. ¡Excelente trabajo!');
        }

        suggestions.forEach(suggestion => console.log(`   ${suggestion}`));
    }

    run() {
        console.log('🚀 ANALIZANDO ESTRUCTURA DEL PROYECTO\n');

        try {
            this.checkCriticalPaths();
            const allCriticalExist = this.checkCriticalFiles();
            this.analyzeStructure();
            this.printStats();
            this.generateSuggestions();

            if (this.stats.errors === 0 && this.stats.missing === 0) {
                console.log('\n🎉 ¡ESTRUCTURA DEL PROYECTO OPTIMIZADA!');
                console.log('   Todos los archivos críticos están presentes');
                console.log('   La organización es adecuada para el build process');
            } else {
                console.log('\n❌ Se encontraron problemas en la estructura');
                process.exit(1);
            }

        } catch (error) {
            console.error('💥 Error durante el análisis:', error);
            process.exit(1);
        }
    }
}

const checker = new ProjectStructureChecker();
checker.run();