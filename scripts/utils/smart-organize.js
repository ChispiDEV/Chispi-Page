import { readdirSync, existsSync, renameSync, rmdirSync, statSync } from 'fs';
import { join } from 'path';

console.log('🧠 ORGANIZACIÓN INTELIGENTE DE SCRIPTS...\n');

// Función para listar recursivamente
function listDirectory(dir, prefix = '') {
    const items = readdirSync(dir);
    let structure = [];

    items.forEach(item => {
        const fullPath = join(dir, item);
        const stats = statSync(fullPath);

        if (stats.isDirectory()) {
            structure.push(`${prefix}📁 ${item}/`);
            structure = structure.concat(listDirectory(fullPath, prefix + '  '));
        } else {
            structure.push(`${prefix}📄 ${item}`);
        }
    });

    return structure;
}

// 1. ANALIZAR ESTRUCTURA ACTUAL
console.log('🔍 ESTRUCTURA ACTUAL:\n');
const currentStructure = listDirectory('scripts');
currentStructure.forEach(line => console.log(line));

// 2. IDENTIFICAR PROBLEMAS
console.log('\n❌ PROBLEMAS IDENTIFICADOS:\n');

// Verificar archivos sueltos
const looseFiles = readdirSync('scripts').filter(item => {
    const fullPath = join('scripts', item);
    return statSync(fullPath).isFile() && item.endsWith('.js');
});

if (looseFiles.length > 0) {
    console.log('📄 Archivos sueltos en scripts/:');
    looseFiles.forEach(file => console.log(`   • ${file}`));
}

// Verificar duplicación audit/auditor
if (existsSync('scripts/audit') && existsSync('scripts/auditor')) {
    console.log('📁 Duplicación: scripts/audit/ y scripts/auditor/');
}

// Verificar carpetas con contenido útil
const foldersWithContent = ['scripts/templates', 'scripts/deploy'];
foldersWithContent.forEach(folder => {
    if (existsSync(folder)) {
        const files = readdirSync(folder).filter(f => f.endsWith('.js'));
        if (files.length > 0) {
            console.log(`📁 ${folder}/ tiene archivos útiles: ${files.join(', ')}`);
        }
    }
});

// 3. PLAN DE ORGANIZACIÓN
console.log('\n🎯 PLAN DE ORGANIZACIÓN:\n');

const organizationPlan = [];

// Mover archivos sueltos a utils/
looseFiles.forEach(file => {
    organizationPlan.push({
        action: 'MOVER',
        from: `scripts/${file}`,
        to: `scripts/utils/${file}`,
        reason: 'Archivo suelto → utils/'
    });
});

// Consolidar auditor/ en audit/
if (existsSync('scripts/auditor')) {
    const auditorFiles = readdirSync('scripts/auditor', { recursive: true })
        .filter(f => f.endsWith('.js') || f.endsWith('.txt'))
        .map(f => `scripts/auditor/${f}`);

    auditorFiles.forEach(file => {
        const newPath = file.replace('scripts/auditor/', 'scripts/audit/');
        organizationPlan.push({
            action: 'MOVER',
            from: file,
            to: newPath,
            reason: 'Consolidar auditor/ → audit/'
        });
    });
}

// Mover templates/ a build/ (son parte del build system)
if (existsSync('scripts/templates')) {
    const templateFiles = readdirSync('scripts/templates')
        .filter(f => f.endsWith('.js'))
        .map(f => `scripts/templates/${f}`);

    templateFiles.forEach(file => {
        const newPath = file.replace('scripts/templates/', 'scripts/build/');
        organizationPlan.push({
            action: 'MOVER',
            from: file,
            to: newPath,
            reason: 'Templates → build/ (sistema de construcción)'
        });
    });
}

// Mover deploy/ a utils/ (es una utilidad)
if (existsSync('scripts/deploy')) {
    const deployFiles = readdirSync('scripts/deploy')
        .filter(f => f.endsWith('.js'))
        .map(f => `scripts/deploy/${f}`);

    deployFiles.forEach(file => {
        const newPath = file.replace('scripts/deploy/', 'scripts/utils/');
        organizationPlan.push({
            action: 'MOVER',
            from: file,
            to: newPath,
            reason: 'Deploy → utils/ (herramienta de desarrollo)'
        });
    });
}

// Mostrar plan
organizationPlan.forEach((plan, index) => {
    console.log(`${index + 1}. ${plan.action}: ${plan.from} → ${plan.to}`);
    console.log(`   💡 ${plan.reason}`);
});

// 4. EJECUTAR ORGANIZACIÓN
console.log('\n🚀 EJECUTANDO ORGANIZACIÓN...\n');

let executed = 0;
let errors = 0;

// Crear directorios necesarios
const neededDirs = ['scripts/utils', 'scripts/audit/config', 'scripts/audit/utils'];
neededDirs.forEach(dir => {
    if (!existsSync(dir)) {
        require('fs').mkdirSync(dir, { recursive: true });
        console.log(`✅ Creado: ${dir}/`);
    }
});

// Ejecutar movimientos
organizationPlan.forEach(plan => {
    try {
        if (existsSync(plan.from)) {
            renameSync(plan.from, plan.to);
            console.log(`✅ ${plan.action}: ${plan.from} → ${plan.to}`);
            executed++;
        }
    } catch (error) {
        console.log(`❌ Error en ${plan.from}: ${error.message}`);
        errors++;
    }
});

// 5. LIMPIAR DIRECTORIOS VACÍOS
console.log('\n🧹 LIMPIANDO DIRECTORIOS VACÍOS...\n');

const dirsToCheck = ['scripts/auditor', 'scripts/templates', 'scripts/deploy', 'scripts/analyze'];
dirsToCheck.forEach(dir => {
    if (existsSync(dir)) {
        try {
            const files = readdirSync(dir);
            if (files.length === 0) {
                rmdirSync(dir);
                console.log(`✅ Eliminado: ${dir}/ (vacío)`);
            } else {
                console.log(`⚠️  Mantenido: ${dir}/ (contiene: ${files.join(', ')})`);
            }
        } catch (error) {
            console.log(`❌ Error en ${dir}: ${error.message}`);
        }
    }
});

// 6. MOSTRAR ESTRUCTURA FINAL
console.log('\n📁 ESTRUCTURA FINAL:\n');
if (existsSync('scripts')) {
    const finalStructure = listDirectory('scripts');
    finalStructure.forEach(line => console.log(line));
}

console.log(`\n📊 RESUMEN:`);
console.log(`   • Acciones ejecutadas: ${executed}`);
console.log(`   • Errores: ${errors}`);
console.log(`   • Archivos sueltos resueltos: ${looseFiles.length}`);

console.log('\n🎉 ¡Organización completada!');
console.log('💡 Si hay errores, ejecuta: node scripts/smart-organize.js');