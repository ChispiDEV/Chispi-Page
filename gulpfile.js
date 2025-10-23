const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));

function compileSCSS() {
    return gulp.src('src/scss/main.scss')
        .pipe(sass({
            // Habilitar características modernas de Sass
            sassOptions: {
                quietDeps: true,
                style: 'expanded'
            }
        }).on('error', sass.logError))
        .pipe(gulp.dest('assets/css'));
}

function watch() {
    gulp.watch('src/scss/**/*.scss', compileSCSS);
}

exports.styles = compileSCSS;
exports.watch = watch;
exports.default = compileSCSS;