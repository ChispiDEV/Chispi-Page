// scripts/auditor/core/auditor-core.js
import { readdirSync, statSync, readFileSync, existsSync } from 'fs';
import { join, extname, relative } from 'path';
import HTMLAnalyzer from '../analyzers/html-analyzer.js';
import CSSAnalyzer from '../analyzers/css-analyzer.js';
import JSAnalyzer from '../analyzers/js-analyzer.js';
import SecurityAnalyzer from '../analyzers/security-analyzer.js';
import ReportGenerator from './report-generator.js';

class AuditorCore {
    constructor() {
        this.projectRoot = process.cwd();
        this.scannedFiles = [];
        this.analysisResults = {
            errors: [],
            warnings: [],
            suggestions: [],
            passed: [],
            metrics: {}
        };

        this.analyzers = {
            html: new HTMLAnalyzer(),
            css: new CSSAnalyzer(),
            js: new JSAnalyzer(),
            security: new SecurityAnalyzer()
        };

        this.reportGenerator = new ReportGenerator();
    }

    async discoverFiles() {
        const files = [];
        const directories = [];

        const scanDirectory = (dir, depth = 0) => {
            if (depth > 8) return; // Limitar profundidad

            try {
                const items = readdirSync(dir);

                for (const item of items) {
                    if (item.startsWith('.') || item === 'node_modules' || item === 'dist') {
                        continue;
                    }

                    const fullPath = join(dir, item);
                    const stats = statSync(fullPath);

                    if (stats.isDirectory()) {
                        directories.push(fullPath);
                        scanDirectory(fullPath, depth + 1);
                    } else {
                        files.push(fullPath);
                    }
                }
            } catch (error) {
                this.analysisResults.errors.push({
                    type: 'SCAN_ERROR',
                    file: dir,
                    message: `Error escaneando directorio: ${error.message}`,
                    severity: 'medium'
                });
            }
        };

        scanDirectory(this.projectRoot);
        this.scannedFiles = files;

        return {
            files: files.length,
            directories: directories.length
        };
    }

    analyzeFileTypes() {
        const types = {};

        this.scannedFiles.forEach(file => {
            const ext = extname(file).toLowerCase() || 'none';
            types[ext] = (types[ext] || 0) + 1;
        });

        return types;
    }

    async runFullAnalysis() {
        for (const file of this.scannedFiles) {
            await this.analyzeFile(file);
        }

        // Análisis de seguridad cross-file
        await this.analyzers.security.analyzeProject(this.scannedFiles, this.analysisResults);

        // Calcular métricas
        this.calculateMetrics();

        return this.analysisResults;
    }

    async analyzeFile(filePath) {
        const relativePath = relative(this.projectRoot, filePath);
        const content = readFileSync(filePath, 'utf8');
        const ext = extname(filePath).toLowerCase();

        try {
            let fileResults = [];

            // Seleccionar analyzer basado en extensión
            if (ext === '.html') {
                fileResults = await this.analyzers.html.analyze(content, filePath);
            } else if (ext === '.css' || ext === '.scss') {
                fileResults = await this.analyzers.css.analyze(content, filePath);
            } else if (ext === '.js') {
                fileResults = await this.analyzers.js.analyze(content, filePath);
            }

            // Procesar resultados del archivo
            fileResults.forEach(result => {
                result.file = relativePath;
                this.categorizeResult(result);
            });

        } catch (error) {
            this.analysisResults.errors.push({
                type: 'ANALYSIS_ERROR',
                file: relativePath,
                message: `Error analizando archivo: ${error.message}`,
                severity: 'high'
            });
        }
    }

    categorizeResult(result) {
        switch (result.severity) {
            case 'error':
                this.analysisResults.errors.push(result);
                break;
            case 'warning':
                this.analysisResults.warnings.push(result);
                break;
            case 'suggestion':
                this.analysisResults.suggestions.push(result);
                break;
            case 'passed':
                this.analysisResults.passed.push(result);
                break;
        }
    }

    calculateMetrics() {
        const metrics = {
            totalFiles: this.scannedFiles.length,
            totalLines: this.calculateTotalLines(),
            errorDensity: this.analysisResults.errors.length / this.scannedFiles.length,
            warningDensity: this.analysisResults.warnings.length / this.scannedFiles.length,
            jsComplexity: this.calculateJSComplexity(),
            cssComplexity: this.calculateCSSComplexity(),
            accessibilityScore: this.calculateAccessibilityScore()
        };

        this.analysisResults.metrics = metrics;
        return metrics;
    }

    calculateTotalLines() {
        let total = 0;
        this.scannedFiles.forEach(file => {
            try {
                const content = readFileSync(file, 'utf8');
                total += content.split('\n').length;
            } catch (error) {
                // Ignorar errores en conteo de líneas
            }
        });
        return total;
    }

    calculateJSComplexity() {
        const jsFiles = this.scannedFiles.filter(f => f.endsWith('.js'));
        return jsFiles.length > 0 ? 'medium' : 'low';
    }

    calculateCSSComplexity() {
        const cssFiles = this.scannedFiles.filter(f => f.endsWith('.css') || f.endsWith('.scss'));
        return cssFiles.length > 10 ? 'high' : cssFiles.length > 5 ? 'medium' : 'low';
    }

    calculateAccessibilityScore() {
        // Puntuación basada en análisis de accesibilidad
        const accessibilityIssues = this.analysisResults.errors.filter(
            e => e.type.includes('ACCESSIBILITY')
        ).length;

        return Math.max(0, 100 - (accessibilityIssues * 10));
    }

    async generateReports() {
        return await this.reportGenerator.generate(this.analysisResults);
    }

    async generateFixes() {
        const fixes = {
            autoFixable: 0,
            manual: []
        };

        // Identificar problemas auto-corregibles
        this.analysisResults.errors.forEach(error => {
            if (error.autoFixable) {
                fixes.autoFixable++;
            } else {
                fixes.manual.push({
                    file: error.file,
                    issue: error.message,
                    solution: error.suggestion
                });
            }
        });

        return fixes;
    }
}

export default AuditorCore;