import { existsSync } from 'fs';

console.log('🔍 VERIFICANDO RUTAS...\n');

const pathsToCheck = [
    'scripts/build/content-processor.js',
    'src/data/content.json',
    'src/data/skills.json',
    'src/data/featured-tech.json',
    'src/includes/generated/'
];

pathsToCheck.forEach(path => {
    const exists = existsSync(path);
    console.log(exists ? '✅' : '❌', path);
});

console.log('\n📝 INSTRUCCIONES:');
console.log('1. Si falta scripts/build/content-processor.js → Copia el código que te di');
console.log('2. Si falta src/data/ → Crea la carpeta y los archivos JSON');
console.log('3. src/includes/generated/ se creará automáticamente');