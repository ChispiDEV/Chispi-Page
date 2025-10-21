// scripts/auditor/analyzers/html-analyzer.js
class HTMLAnalyzer {
    constructor() {
        this.rules = this.getAnalysisRules();
    }

    getAnalysisRules() {
        return {
            'missing-doctype': {
                pattern: /<!DOCTYPE\s+html>/i,
                message: 'Falta declaración DOCTYPE',
                severity: 'error',
                autoFixable: true
            },
            'missing-lang': {
                pattern: /<html[^>]*lang\s*=/i,
                message: 'Elemento html debe tener atributo lang',
                severity: 'error',
                autoFixable: true
            },
            'missing-title': {
                pattern: /<title>[\s\S]*?<\/title>/i,
                message: 'Falta elemento title',
                severity: 'error'
            },
            'missing-viewport': {
                pattern: /<meta[^>]*viewport/i,
                message: 'Falta meta viewport para responsive design',
                severity: 'warning',
                autoFixable: true
            },
            'img-missing-alt': {
                pattern: /<img(?!.*alt=)[^>]*>/gi,
                message: 'Imágenes deben tener atributo alt',
                severity: 'warning'
            },
            'deprecated-tags': {
                pattern: /<(center|font|marquee|big|tt)/gi,
                message: 'Etiquetas HTML deprecadas detectadas',
                severity: 'warning'
            }
        };
    }

    async analyze(content, filePath) {
        const results = [];

        // Verificar cada regla
        Object.entries(this.rules).forEach(([ruleId, rule]) => {
            const matches = content.match(rule.pattern);

            if (!matches) {
                results.push({
                    type: ruleId.toUpperCase(),
                    message: rule.message,
                    severity: rule.severity,
                    suggestion: this.getSuggestion(ruleId),
                    autoFixable: rule.autoFixable || false,
                    line: this.findLineNumber(content, rule.pattern)
                });
            } else {
                results.push({
                    type: 'PASSED',
                    rule: ruleId,
                    severity: 'passed'
                });
            }
        });

        // Análisis de estructura semántica
        results.push(...this.analyzeSemanticStructure(content));

        return results;
    }

    analyzeSemanticStructure(content) {
        const results = [];

        // Verificar estructura semántica
        const hasHeader = /<header|<h[1-6]/i.test(content);
        const hasMain = /<main/i.test(content);
        const hasFooter = /<footer/i.test(content);
        const hasNav = /<nav/i.test(content);

        if (!hasHeader) {
            results.push({
                type: 'SEMANTIC_STRUCTURE',
                message: 'Considera usar elementos semánticos como header',
                severity: 'suggestion',
                autoFixable: false
            });
        }

        if (!hasMain) {
            results.push({
                type: 'SEMANTIC_STRUCTURE',
                message: 'Considera usar elemento main para contenido principal',
                severity: 'suggestion',
                autoFixable: false
            });
        }

        return results;
    }

    getSuggestion(ruleId) {
        const suggestions = {
            'missing-doctype': 'Agregar <!DOCTYPE html> al inicio del documento',
            'missing-lang': 'Agregar lang="es" o lang="en" al elemento html',
            'missing-viewport': 'Agregar <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            'img-missing-alt': 'Agregar atributo alt descriptivo a todas las imágenes'
        };

        return suggestions[ruleId] || 'Revisar documentación correspondiente';
    }

    findLineNumber(content, pattern) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i])) {
                return i + 1;
            }
        }
        return 1;
    }
}

export default HTMLAnalyzer;