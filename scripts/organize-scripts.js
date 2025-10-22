import { renameSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

console.log('📁 ORGANIZANDO SCRIPTS...\n');

// Crear estructura de directorios
const directories = [
    'scripts/build',
    'scripts/utils',
    'scripts/audit',
    'scripts/audit/analyzers',
    'scripts/audit/fixers',
    'scripts/audit/core',
    'scripts/deploy',
    'scripts/test',
    'scripts/analyze',
    'scripts/templates'
];

directories.forEach(dir => {
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(`✅ Creado: ${dir}`);
    }
});

// Mapeo de archivos a mover
const fileMoves = [
    // BUILD SYSTEM
    ['scripts/build.js', 'scripts/build/adaptive-build.js'],
    ['scripts/build/simple-build.js', 'scripts/build/simple-build.js'],
    ['scripts/build/adaptive-build.js', 'scripts/build/adaptive-build.js'],
    ['scripts/build/content-processor.js', 'scripts/build/content-processor.js'],
    ['scripts/build/template-build.js', 'scripts/build/template-build.js'],

    // UTILITIES
    ['scripts/check-structure.js', 'scripts/utils/check-structure.js'],
    ['scripts/check-structure-debug.js', 'scripts/utils/check-structure-debug.js'],
    ['scripts/verify-functionality.js', 'scripts/utils/verify-functionality.js'],
    ['scripts/migrate-data.js', 'scripts/utils/migrate-data.js'],

    // AUDIT SYSTEM (si existen)
    ['scripts/auditor/auditor-cli.js', 'scripts/audit/auditor-cli.js'],
    ['scripts/auditor/core/auditor-core.js', 'scripts/audit/core/auditor-core.js'],
    ['scripts/auditor/core/report-generator.js', 'scripts/audit/core/report-generator.js'],
    ['scripts/auditor/analyzers/html-analyzer.js', 'scripts/audit/analyzers/html-analyzer.js'],
    ['scripts/auditor/analyzers/css-analyzer.js', 'scripts/audit/analyzers/css-analyzer.js'],
    ['scripts/auditor/analyzers/js-analyzer.js', 'scripts/audit/analyzers/js-analyzer.js'],
    ['scripts/auditor/analyzers/security-analyzer.js', 'scripts/audit/analyzers/security-analyzer.js'],
    ['scripts/auditor/fixers/auto-fixer.js', 'scripts/audit/fixers/auto-fixer.js'],

    // DEPLOY & TEST
    ['scripts/deploy.js', 'scripts/deploy/deploy.js'],
    ['scripts/test-runner.js', 'scripts/test/test-runner.js'],
    ['scripts/analyze-build.js', 'scripts/analyze/analyze-build.js'],

    // MANTENER EN RAÍZ (importantes)
    ['scripts/organize-scripts.js', 'scripts/organize-scripts.js']
];

console.log('🔄 Moviendo archivos...\n');

let movedCount = 0;
let errorCount = 0;

fileMoves.forEach(([from, to]) => {
    try {
        if (existsSync(from)) {
            renameSync(from, to);
            console.log(`✅ Movido: ${from} → ${to}`);
            movedCount++;
        } else {
            console.log(`⚠️  No existe: ${from}`);
        }
    } catch (error) {
        console.log(`❌ Error moviendo ${from}: ${error.message}`);
        errorCount++;
    }
});

// Verificar archivos en scripts/ que no se movieron
console.log('\n🔍 Archivos restantes en scripts/:');
try {
    const files = readdirSync('scripts');
    files.forEach(file => {
        if (file !== 'organize-scripts.js' && !file.includes('/')) {
            console.log(`   📄 ${file} (sin mover)`);
        }
    });
} catch (error) {
    console.log('   No se pudo leer directorio scripts/');
}

console.log('\n📊 RESUMEN:');
console.log(`   • Archivos movidos: ${movedCount}`);
console.log(`   • Errores: ${errorCount}`);
console.log('\n🎉 ¡Organización completada!');
console.log('📝 Actualiza tu package.json si es necesario');