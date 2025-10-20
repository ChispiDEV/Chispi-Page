// quick-check.js - Verificación rápida
import fs from 'fs-extra';
import path from 'path';

async function quickCheck() {
    console.log('🔍 VERIFICACIÓN RÁPIDA DE ESTRUCTURA\n');

    const checks = [
        { file: 'dist/index.html', desc: 'Página principal' },
        { file: 'dist/assets/css/main.css', desc: 'CSS principal' },
        { file: 'dist/assets/js/app.js', desc: 'JavaScript principal' },
        { file: 'dist/pages/sobre-mi.html', desc: 'Página sobre mí' },
        { file: 'dist/pages/proyectos.html', desc: 'Página proyectos' }
    ];

    for (const check of checks) {
        const exists = await fs.pathExists(check.file);
        console.log(exists ? '✅' : '❌', check.desc, '-', check.file);

        if (exists) {
            const stats = await fs.stat(check.file);
            console.log('   📏 Tamaño:', (stats.size/1024).toFixed(1), 'KB');
        }
    }

    // Verificar rutas en HTML principal
    try {
        const html = await fs.readFile('dist/index.html', 'utf8');
        const cssLoaded = html.includes('/assets/css/');
        const jsLoaded = html.includes('/assets/js/');

        console.log('\n🌐 VERIFICACIÓN DE RUTAS:');
        console.log(cssLoaded ? '✅' : '❌', 'CSS cargado correctamente');
        console.log(jsLoaded ? '✅' : '❌', 'JS cargado correctamente');

    } catch (error) {
        console.log('❌ Error leyendo HTML:', error.message);
    }
}

quickCheck();