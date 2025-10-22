import { readdirSync, rmdirSync, unlinkSync, existsSync, statSync } from 'fs';
import { join } from 'path';

console.log('🧹 LIMPIANDO ORGANIZACIÓN...\n');

// Carpetas que pueden estar vacías y podemos eliminar
const foldersToCheck = [
    'scripts/auditor',
    'scripts/auditor/core',
    'scripts/auditor/analyzers',
    'scripts/auditor/fixers'
];

// Archivos sueltos que podemos mover/eliminar
const looseFiles = [
    'scripts/debug-paths.js',
    'scripts/diagnose.js'
];

console.log('🔍 Verificando carpetas vacías...\n');

foldersToCheck.forEach(folder => {
    if (existsSync(folder)) {
        try {
            const files = readdirSync(folder);
            if (files.length === 0) {
                rmdirSync(folder);
                console.log(`✅ Eliminada carpeta vacía: ${folder}`);
            } else {
                console.log(`📁 Carpeta con contenido: ${folder}`);
                files.forEach(file => {
                    console.log(`   📄 ${file}`);
                });
            }
        } catch (error) {
            console.log(`❌ Error verificando ${folder}: ${error.message}`);
        }
    }
});

console.log('\n🔍 Archivos sueltos...\n');

looseFiles.forEach(file => {
    if (existsSync(file)) {
        console.log(`📄 ${file} - ¿Mover a utils/?`);
    }
});

console.log('\n📁 ESTRUCTURA FINAL:');
console.log('scripts/');
console.log('├── build/           # 🏗️ Sistema de construcción');
console.log('├── utils/           # 🛠️ Herramientas de desarrollo');
console.log('├── audit/           # 🔍 Auditoría de código');
console.log('├── deploy/          # 🚀 Despliegue');
console.log('├── test/            # 🧪 Pruebas');
console.log('├── analyze/         # 📊 Análisis');
console.log('├── templates/       # 📝 Plantillas');
console.log('└── organize-scripts.js');

console.log('\n🎉 ¡Limpieza completada!');
console.log('💡 Recomendaciones:');
console.log('   • Mover debug-paths.js y diagnose.js a scripts/utils/');
console.log('   • Verificar si necesitas scripts en deploy/ y test/');