import fs from 'fs-extra';
import path from 'path';
import { Logger } from '../utils/logger.js';
import { FileUtils } from '../utils/file-utils.js';

export class AssetsProcessor {
    constructor(config) {
        this.config = config;
        this.logger = new Logger('assets');
        this.fileUtils = new FileUtils();
        this.stats = { images: 0, other: 0 };
    }

    async processAssets() {
        this.logger.info('Procesando assets...');

        await this.processImages();
        await this.processOtherAssets();
        await this.processStaticFiles();

        this.logger.success(`Assets procesados: ${this.stats.images} imágenes, ${this.stats.other} otros archivos`);
    }

    async processImages() {
        const imagesSrc = this.config.assets.images;
        const imagesDest = path.join(this.config.dist, 'assets/images');

        if (await fs.pathExists(imagesSrc)) {
            const images = await this.fileUtils.findFiles('src/assets/images/**/*');
            await this.fileUtils.copyWithStructure(imagesSrc, imagesDest);
            this.stats.images = images.length;
            this.logger.info(`Imágenes copiadas: ${images.length} archivos`);
        } else {
            this.logger.warning(`No se encontró directorio de imágenes: ${imagesSrc}`);
        }
    }

    async processOtherAssets() {
        const otherAssets = await this.fileUtils.findFiles('src/assets/**/*', {
            ignore: [
                'src/assets/js/**',
                'src/assets/images/**',
                'src/assets/styles/**'
            ]
        });

        for (const asset of otherAssets) {
            const destPath = asset.replace(/^src[\\/]/, '');
            const fullDest = path.join(this.config.dist, destPath);

            await this.fileUtils.ensureDir(path.dirname(fullDest));
            await this.fileUtils.copyWithStructure(asset, fullDest);
            this.stats.other++;
        }
    }

    async processStaticFiles() {
        const staticFiles = await this.fileUtils.findFiles('*.{txt,xml,json,ico,webmanifest}');

        for (const file of staticFiles) {
            await this.fileUtils.copyWithStructure(file, path.join(this.config.dist, file));
            this.logger.debug(`Archivo estático copiado: ${file}`);
        }

        this.logger.info(`Archivos estáticos copiados: ${staticFiles.length}`);
    }
}