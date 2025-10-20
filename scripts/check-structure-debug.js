// scripts/check-structure-debug.js
console.log('🔍 DEBUG: Script iniciado...');
console.log('🔍 DEBUG: Directorio actual:', process.cwd());

import { existsSync } from 'fs';

console.log('🔍 DEBUG: Después del import...');

// Verificación básica
const criticalPaths = [
    'src/assets/scripts',
    'src/assets/styles',
    'src/pages',
    'src/includes'
];

console.log('\n🔍 VERIFICACIÓN BÁSICA:');
criticalPaths.forEach(path => {
    const exists = existsSync(path);
    console.log(exists ? '✅' : '❌', path);
});

console.log('🔍 DEBUG: Script finalizado');