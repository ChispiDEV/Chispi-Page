// scripts/auditor/auditor-cli.js
import AuditorCore from './core/auditor-core.js';
import { Logger } from './utils/logger.js';

class CodeAuditorCLI {
    constructor() {
        this.auditor = new AuditorCore();
        this.logger = new Logger();
        this.startTime = Date.now();
    }

    async run() {
        console.log('🔍 INICIANDO AUDITORÍA DE CÓDIGO\n');

        try {
            // Fase 1: Escaneo inicial
            await this.phase1_Discovery();

            // Fase 2: Análisis profundo
            await this.phase2_Analysis();

            // Fase 3: Generación de reportes
            await this.phase3_Reporting();

            // Fase 4: Sugerencias y correcciones
            await this.phase4_Recommendations();

        } catch (error) {
            this.logger.error('Error en auditoría:', error);
            process.exit(1);
        }
    }

    async phase1_Discovery() {
        this.logger.info('FASE 1: DESCUBRIMIENTO DE ARCHIVOS');

        const stats = await this.auditor.discoverFiles();
        this.logger.success(`📁 Encontrados: ${stats.files} archivos, ${stats.directories} directorios`);

        // Detectar tipos de archivo
        const fileTypes = await this.auditor.analyzeFileTypes();
        console.log('   📊 Distribución:', fileTypes);
    }

    async phase2_Analysis() {
        this.logger.info('FASE 2: ANÁLISIS DE CÓDIGO');

        const results = await this.auditor.runFullAnalysis();

        // Mostrar resumen inmediato
        console.log('\n   ⚡ ANÁLISIS COMPLETADO:');
        console.log(`      • ✅ Correctos: ${results.passed.length}`);
        console.log(`      • ⚠️  Advertencias: ${results.warnings.length}`);
        console.log(`      • ❌ Errores: ${results.errors.length}`);
        console.log(`      • 💡 Sugerencias: ${results.suggestions.length}`);
    }

    async phase3_Reporting() {
        this.logger.info('FASE 3: GENERACIÓN DE REPORTES');

        const report = await this.auditor.generateReports();
        this.logger.success(`📄 Reportes guardados en: ${report.path}`);

        // Mostrar métricas clave
        if (report.metrics) {
            console.log('\n   📈 MÉTRICAS DEL PROYECTO:');
            Object.entries(report.metrics).forEach(([key, value]) => {
                console.log(`      • ${key}: ${value}`);
            });
        }
    }

    async phase4_Recommendations() {
        this.logger.info('FASE 4: RECOMENDACIONES Y CORRECCIONES');

        const fixes = await this.auditor.generateFixes();

        if (fixes.autoFixable > 0) {
            console.log(`\n   🔧 Correcciones automáticas disponibles: ${fixes.autoFixable}`);
            console.log('      Ejecuta: npm run audit:fix');
        }

        if (fixes.manual.length > 0) {
            console.log(`\n   📝 Correcciones manuales necesarias: ${fixes.manual.length}`);
            fixes.manual.slice(0, 5).forEach(fix => {
                console.log(`      • ${fix.file}: ${fix.issue}`);
            });
        }
    }

    printSummary() {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
        console.log(`\n🎉 AUDITORÍA COMPLETADA en ${duration}s`);
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const cli = new CodeAuditorCLI();
    cli.run().then(() => {
        cli.printSummary();
    });
}

export default CodeAuditorCLI;