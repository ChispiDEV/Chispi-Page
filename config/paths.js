import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PATHS = {
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