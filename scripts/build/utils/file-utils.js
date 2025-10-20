import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

export class FileUtils {
    async findFiles(pattern, options = {}) {
        return await glob(pattern, {
            ignore: ['node_modules/**', 'dist/**', 'temp/**'],
            ...options
        });
    }

    async ensureDir(dirPath) {
        await fs.ensureDir(dirPath);
    }

    async copyWithStructure(src, dest) {
        await fs.copy(src, dest);
    }

    async readFile(filePath) {
        return await fs.readFile(filePath, 'utf8');
    }

    async writeFile(filePath, content) {
        await fs.writeFile(filePath, content, 'utf8');
    }
}