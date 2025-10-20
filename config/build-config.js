// config/build-config.js
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PATHS = {
    root: process.cwd(),
    src: path.join(process.cwd(), 'src'),
    dist: path.join(process.cwd(), 'dist'),
    config: path.join(process.cwd(), 'config'),
    scripts: path.join(process.cwd(), 'scripts'),
    logs: path.join(process.cwd(), 'logs'),

    // Rutas específicas de src
    content: path.join(process.cwd(), 'src/content'),
    layouts: path.join(process.cwd(), 'src/layouts'),
    includes: path.join(process.cwd(), 'src/includes'),
    pages: path.join(process.cwd(), 'src/pages'),
    assets: {
        styles: path.join(process.cwd(), 'src/assets/styles'),
        scripts: path.join(process.cwd(), 'src/assets/scripts'),
        images: path.join(process.cwd(), 'src/assets/images')
    }
};

export const config = {
    ...PATHS,
    build: {
        dev: process.env.NODE_ENV === 'development',
        cleanDist: true,
        minify: {
            html: true,
            js: true,
            css: true
        },
        sourceMaps: true
    }
};