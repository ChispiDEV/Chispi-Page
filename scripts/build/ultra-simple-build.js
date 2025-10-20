// scripts/build/ultra-simple.js - Sin dependencias externas
import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync } from 'fs';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Build ultra simple iniciado...');

// Configuración básica
const config = {
    src: join(process.cwd(), 'src'),
    dist: join(process.cwd(), 'dist'),
    dev: process.env.NODE_ENV === 'development'
};

// Función para crear directorios
function ensureDir(dir) {
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
}

// Procesar HTML básico
function processHTML() {
    console.log('📄 Procesando HTML...');

    // Solo copiar index.html como ejemplo
    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChispiPage - Build Simple</title>
    <link rel="stylesheet" href="assets/css/main.css">
</head>
<body>
    <h1>¡Build Funcionando! 🎉</h1>
    <p>El build ultra simple está funcionando correctamente.</p>
    <script src="assets/js/app.js"></script>
</body>
</html>`;

    ensureDir(join(config.dist, 'assets/css'));
    ensureDir(join(config.dist, 'assets/js'));

    writeFileSync(join(config.dist, 'index.html'), htmlContent);
    console.log('✅ HTML básico creado');
}

// Crear CSS básico
function processCSS() {
    console.log('🎨 Creando CSS básico...');

    const cssContent = `:root {
    --color-primary: #3cc88f;
    --color-bg: #f9fafb;
    --color-text: #212529;
}

body {
    font-family: 'Segoe UI', sans-serif;
    margin: 0;
    padding: 2rem;
    background: var(--color-bg);
    color: var(--color-text);
}

h1 {
    color: var(--color-primary);
}`;

    writeFileSync(join(config.dist, 'assets/css/main.css'), cssContent);
    console.log('✅ CSS básico creado');
}

// Crear JS básico
function processJS() {
    console.log('⚡ Creando JavaScript básico...');

    const jsContent = `console.log('¡ChispiPage funcionando! 🚀');

// Tema básico
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    console.log('Tema cambiado a:', theme);
}

// Inicializar
console.log('Aplicación inicializada correctamente');`;

    writeFileSync(join(config.dist, 'assets/js/app.js'), jsContent);
    console.log('✅ JavaScript básico creado');
}

// Ejecutar build
try {
    // Limpiar y crear dist
    if (existsSync(config.dist)) {
        // En una versión real aquí se limpiaría el directorio
        console.log('📁 Usando directorio dist existente');
    } else {
        ensureDir(config.dist);
    }

    processHTML();
    processCSS();
    processJS();

    console.log('🎉 ¡Build ultra simple completado!');
    console.log('📂 Abre dist/index.html en tu navegador');

} catch (error) {
    console.error('❌ Error en build:', error.message);
}