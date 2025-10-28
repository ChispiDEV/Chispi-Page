const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const gulpif = require('gulp-if');

// Configuración
const config = {
    production: process.env.NODE_ENV === 'production',
    styles: {
        src: 'src/scss/main.scss',
        watch: 'src/scss/**/*.scss',
        dest: 'assets/css'
    }
};

// Configuración de autoprefixer
const autoprefixerOptions = {
    overrideBrowserslist: [
        'last 2 versions',
        '> 1%',
        'IE 11',
        'not dead'
    ]
};

// Configuración de cssnano
const cssnanoOptions = {
    preset: ['default', {
        discardComments: {
            removeAll: true
        }
    }]
};

// Procesadores de PostCSS
const postcssProcessors = [
    autoprefixer(autoprefixerOptions),
    ...(config.production ? [cssnano(cssnanoOptions)] : [])
];

function compileSCSS() {
    return gulp.src(config.styles.src)
        .pipe(gulpif(!config.production, sourcemaps.init()))
        .pipe(sass({
            sassOptions: {
                quietDeps: true,
                style: 'expanded',
                includePaths: ['node_modules'],
                outputStyle: config.production ? 'compressed' : 'expanded'
            }
        }).on('error', function(error) {
            console.error('❌ Error en Sass:', error.message);
            console.error('🔍 Archivo:', error.file);
            console.error('📄 Línea:', error.line);
            this.emit('end');
        }))
        .pipe(postcss(postcssProcessors))
        .pipe(gulpif(!config.production, sourcemaps.write('.')))
        .pipe(gulp.dest(config.styles.dest))
        .pipe(gulpif(config.production, rename({ suffix: '.min' })))
        .pipe(gulpif(config.production, gulp.dest(config.styles.dest)))
        .on('end', () => {
            console.log(`✅ SCSS compilado ${config.production ? 'en modo producción' : 'en modo desarrollo'}`);
            console.log(`📁 Output: ${config.styles.dest}/`);
        });
}

function watch() {
    console.log('👀 Observando cambios en SCSS...');
    gulp.watch(config.styles.watch, compileSCSS)
        .on('change', (path) => {
            console.log(`📝 Archivo modificado: ${path}`);
        });
}

// Tarea para limpiar CSS
function cleanCSS(done) {
    const fs = require('fs');
    const path = require('path');

    const cssDir = config.styles.dest;
    if (fs.existsSync(cssDir)) {
        fs.readdirSync(cssDir).forEach(file => {
            if (file.endsWith('.css') || file.endsWith('.css.map')) {
                fs.unlinkSync(path.join(cssDir, file));
                console.log(`🧹 Eliminado: ${file}`);
            }
        });
    }
    done();
}

// Tareas específicas
exports.styles = compileSCSS;
exports.watch = watch;
exports.clean = cleanCSS;
exports.build = gulp.series(cleanCSS, compileSCSS);

// Tarea por defecto
exports.default = gulp.series(compileSCSS, watch);