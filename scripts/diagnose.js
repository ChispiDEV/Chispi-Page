// scripts/diagnose.js
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 DIAGNÓSTICO DEL PROYECTO\n');

// Verificar package.json
try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    console.log('✅ package.json encontrado');
    console.log('   type:', pkg.type);
    console.log('   dependencies:', Object.keys(pkg.dependencies || {}).length);
    console.log('   devDependencies:', Object.keys(pkg.devDependencies || {}).length);
} catch (error) {
    console.log('❌ Error leyendo package.json:', error.message);
}

// Verificar estructura
const pathsToCheck = [
    'src',
    'src/assets/styles/main.scss',
    'src/assets/scripts/js',
    'src/pages',
    'node_modules/fs-extra',
    'node_modules/sass',
    'node_modules/terser',
    'node_modules/glob'
];

console.log('\n📁 ESTRUCTURA DE ARCHIVOS:');
for (const checkPath of pathsToCheck) {
    const exists = existsSync(checkPath);
    console.log(exists ? '✅' : '❌', checkPath);
}

console.log('\n🎯 SUGERENCIAS:');
console.log('1. Si faltan dependencias: npm install');
console.log('2. Si hay problemas de rutas: verificar estructura');
console.log('3. Para debug: NODE_DEBUG=module npm run build:dev');