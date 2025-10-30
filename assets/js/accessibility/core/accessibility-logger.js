// assets/js/accessibility/core/accessibility-logger.js

export class AccessibilityLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000; // Máximo de logs en memoria
        this.enableRemoteLogging = false;
        this.remoteEndpoint = '/api/logs/accessibility';
    }

    // Niveles de log
    levels = {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3
    };

    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data,
            userAgent: navigator.userAgent,
            url: window.location.href,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            theme: document.documentElement.getAttribute('data-theme') || 'light'
        };

        // Guardar en memoria
        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift(); // Remover el más antiguo
        }

        // Guardar en localStorage para persistencia
        this.saveToStorage(logEntry);

        // Enviar a servidor si está habilitado
        if (this.enableRemoteLogging) {
            this.sendToServer(logEntry);
        }

        // Console output con colores
        this.consoleOutput(level, message, data, timestamp);

        return logEntry;
    }

    error(message, data = null) {
        return this.log(this.levels.ERROR, message, data);
    }

    warn(message, data = null) {
        return this.log(this.levels.WARN, message, data);
    }

    info(message, data = null) {
        return this.log(this.levels.INFO, message, data);
    }

    debug(message, data = null) {
        return this.log(this.levels.DEBUG, message, data);
    }

    success(message, data = null) {
        const entry = this.log(this.levels.INFO, message, data);
        console.log(`✅ ${message}`, data || '');
        return entry;
    }

    consoleOutput(level, message, data, timestamp) {
        const time = timestamp.split('T')[1].split('.')[0];
        const styles = {
            [this.levels.ERROR]: 'color: red; font-weight: bold;',
            [this.levels.WARN]: 'color: orange; font-weight: bold;',
            [this.levels.INFO]: 'color: blue;',
            [this.levels.DEBUG]: 'color: gray;'
        };

        const levelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
        console.log(`%c[${time}] ${levelNames[level]}: ${message}`, styles[level], data || '');
    }

    saveToStorage(logEntry) {
        try {
            const storedLogs = JSON.parse(localStorage.getItem('accessibility_logs') || '[]');
            storedLogs.push(logEntry);

            // Mantener solo los últimos 500 logs en localStorage
            if (storedLogs.length > 500) {
                storedLogs.splice(0, storedLogs.length - 500);
            }

            localStorage.setItem('accessibility_logs', JSON.stringify(storedLogs));
        } catch (error) {
            console.warn('No se pudieron guardar los logs en localStorage:', error);
        }
    }

    async sendToServer(logEntry) {
        try {
            await fetch(this.remoteEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logEntry)
            });
        } catch (error) {
            console.warn('No se pudo enviar el log al servidor:', error);
        }
    }

    // Métodos de análisis
    getErrors() {
        return this.logs.filter(log => log.level === this.levels.ERROR);
    }

    getWarnings() {
        return this.logs.filter(log => log.level === this.levels.WARN);
    }

    getRecentLogs(count = 50) {
        return this.logs.slice(-count);
    }

    analyzeCommonErrors() {
        const errors = this.getErrors();
        const errorCounts = {};

        errors.forEach(error => {
            const key = error.message;
            errorCounts[key] = (errorCounts[key] || 0) + 1;
        });

        return Object.entries(errorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([message, count]) => ({ message, count }));
    }

    generateReport() {
        const errors = this.getErrors();
        const warnings = this.getWarnings();
        const commonErrors = this.analyzeCommonErrors();

        return {
            summary: {
                totalLogs: this.logs.length,
                errors: errors.length,
                warnings: warnings.length,
                sessionStart: this.logs[0]?.timestamp,
                sessionEnd: this.logs[this.logs.length - 1]?.timestamp
            },
            commonErrors,
            recentIssues: this.getRecentLogs(20),
            suggestions: this.generateSuggestions()
        };
    }

    generateSuggestions() {
        const errors = this.getErrors();
        const suggestions = [];

        // Análisis de errores comunes y sugerencias
        errors.forEach(error => {
            if (error.message.includes('Cannot read properties')) {
                suggestions.push({
                    issue: 'Error de propiedades undefined',
                    solution: 'Verificar que los elementos DOM existen antes de acceder a sus propiedades',
                    codeExample: 'if (element) { element.property }'
                });
            }

            if (error.message.includes('Theme')) {
                suggestions.push({
                    issue: 'Problema con temas',
                    solution: 'Verificar que themeManager esté inicializado antes de usar temas',
                    codeExample: 'if (window.themeManager) { themeManager.setTheme() }'
                });
            }

            if (error.message.includes('Particles')) {
                suggestions.push({
                    issue: 'Problema con partículas',
                    solution: 'Verificar que el canvas existe y el sistema de partículas esté inicializado',
                    codeExample: 'if (window.particleSystem) { particleSystem.restart() }'
                });
            }
        });

        return suggestions;
    }

    // Exportar logs
    exportLogs(format = 'json') {
        const report = this.generateReport();

        switch (format) {
            case 'json':
                return JSON.stringify(report, null, 2);
            case 'csv':
                return this.convertToCSV(report);
            case 'html':
                return this.convertToHTML(report);
            default:
                return report;
        }
    }

    convertToCSV(report) {
        let csv = 'Timestamp,Level,Message,Data\n';
        this.logs.forEach(log => {
            csv += `"${log.timestamp}","${log.level}","${log.message}","${JSON.stringify(log.data)}"\n`;
        });
        return csv;
    }

    convertToHTML(report) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Accessibility Log Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .error { color: red; }
                .warn { color: orange; }
                .info { color: blue; }
                .debug { color: gray; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <h1>Accessibility System Report</h1>
            <div>
                <h2>Summary</h2>
                <p>Total Logs: ${report.summary.totalLogs}</p>
                <p>Errors: ${report.summary.errors}</p>
                <p>Warnings: ${report.summary.warnings}</p>
            </div>
            <div>
                <h2>Common Errors</h2>
                <ul>
                    ${report.commonErrors.map(error =>
            `<li>${error.message} (${error.count} veces)</li>`
        ).join('')}
                </ul>
            </div>
            <div>
                <h2>Suggestions</h2>
                <ul>
                    ${report.suggestions.map(suggestion =>
            `<li><strong>${suggestion.issue}:</strong> ${suggestion.solution}</li>`
        ).join('')}
                </ul>
            </div>
        </body>
        </html>`;
    }

    clearLogs() {
        this.logs = [];
        localStorage.removeItem('accessibility_logs');
    }
}