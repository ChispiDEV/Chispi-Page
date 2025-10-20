import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LogAnalyzer {
    constructor() {
        this.logsPath = path.join(__dirname, 'logs');
        this.analyticsFile = path.join(this.logsPath, 'build-analytics.json');
    }

    async loadAnalytics() {
        try {
            if (!await fs.pathExists(this.analyticsFile)) {
                console.log('❌ No se encontraron datos de analytics');
                return [];
            }

            const data = await fs.readFile(this.analyticsFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.log('❌ Error cargando analytics:', error.message);
            return [];
        }
    }

    generateStats(analytics) {
        if (analytics.length === 0) {
            console.log('📊 No hay datos para analizar');
            return;
        }

        const totalBuilds = analytics.length;
        const successfulBuilds = analytics.filter(a => a.success).length;
        const failedBuilds = totalBuilds - successfulBuilds;
        const successRate = ((successfulBuilds / totalBuilds) * 100).toFixed(1);

        const avgBuildTime = (analytics.reduce((sum, a) => sum + parseFloat(a.buildTime), 0) / totalBuilds).toFixed(2);
        const avgCssSize = (analytics.reduce((sum, a) => sum + parseFloat(a.cssSizeKB), 0) / totalBuilds).toFixed(2);
        const avgJsSize = (analytics.reduce((sum, a) => sum + parseFloat(a.jsSizeKB), 0) / totalBuilds).toFixed(2);

        const totalErrors = analytics.reduce((sum, a) => sum + a.totalErrors, 0);
        const totalWarnings = analytics.reduce((sum, a) => sum + a.totalWarnings, 0);

        console.log('\n' + '='.repeat(60));
        console.log('📈 ANÁLISIS DE BUILDS - CHISPIPAGE');
        console.log('='.repeat(60));
        console.log(`📊 Total de builds: ${totalBuilds}`);
        console.log(`✅ Exitosos: ${successfulBuilds} (${successRate}%)`);
        console.log(`❌ Fallidos: ${failedBuilds}`);
        console.log(`⏱️  Tiempo promedio: ${avgBuildTime}s`);
        console.log(`🎨 CSS promedio: ${avgCssSize} KB`);
        console.log(`⚡ JS promedio: ${avgJsSize} KB`);
        console.log(`⚠️  Total advertencias: ${totalWarnings}`);
        console.log(`💥 Total errores: ${totalErrors}`);

        // Últimos 5 builds
        console.log('\n🕒 ÚLTIMOS 5 BUILDS:');
        console.log('-'.repeat(60));
        analytics.slice(-5).reverse().forEach((build, index) => {
            const status = build.success ? '✅' : '❌';
            const date = new Date(build.timestamp).toLocaleString();
            console.log(`${status} ${date} - ${build.buildTime}s - ${build.cssSizeKB}KB CSS - ${build.jsSizeKB}KB JS`);
        });

        // Tendencia de éxito
        const recentBuilds = analytics.slice(-10);
        const recentSuccessRate = (recentBuilds.filter(b => b.success).length / recentBuilds.length * 100).toFixed(1);
        console.log(`\n📈 Tendencia reciente: ${recentSuccessRate}% éxito (últimos 10 builds)`);
    }

    async analyze() {
        console.log('🔍 Analizando logs de build...');

        const analytics = await this.loadAnalytics();
        this.generateStats(analytics);
    }
}

// Ejecutar análisis
const analyzer = new LogAnalyzer();
await analyzer.analyze();