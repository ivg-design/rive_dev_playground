/**
 * @file wasmDiagnostics.js
 * Specialized diagnostics tool for WASM-related errors in Rive parsing
 */

/**
 * WASM Error Analysis and Diagnostics Tool
 * Provides detailed analysis of WASM errors and recommendations for fixing them
 */
export class WASMDiagnostics {
    constructor() {
        this.errorHistory = [];
        this.patterns = new Map();
        this.recommendations = new Map();
        this.initializeKnownPatterns();
    }

    /**
     * Initialize known WASM error patterns and their solutions
     */
    initializeKnownPatterns() {
        // Enum-related WASM errors
        this.patterns.set('enum_access_abort', {
            indicators: ['$func14754', '$func7034', 'enum', 'aborted()'],
            description: 'WASM abort during enum property access',
            commonCauses: [
                'Newer Rive file format with incompatible enum structures',
                'Runtime version mismatch with file format',
                'Memory corruption during enum value retrieval'
            ],
            solutions: [
                'Use string fallback for enum properties',
                'Implement property existence validation before access',
                'Update Rive runtime to latest compatible version',
                'Add try-catch around each enum property access'
            ]
        });

        // ViewModel parsing errors
        this.patterns.set('viewmodel_parsing_abort', {
            indicators: ['viewModel', 'properties', 'recursive', 'aborted()'],
            description: 'WASM abort during ViewModel recursive parsing',
            commonCauses: [
                'Complex nested ViewModel structures',
                'Circular references in ViewModels',
                'Memory exhaustion during recursive parsing'
            ],
            solutions: [
                'Implement depth limits for recursive parsing',
                'Add circular reference detection',
                'Parse ViewModels iteratively instead of recursively',
                'Implement property-by-property error boundaries'
            ]
        });

        // Property access errors
        this.patterns.set('property_access_abort', {
            indicators: ['property', 'access', '$func', 'aborted()'],
            description: 'WASM abort during property access',
            commonCauses: [
                'Invalid property references in WASM memory',
                'Type mismatch between file and runtime expectations',
                'Corrupted property metadata'
            ],
            solutions: [
                'Validate property existence before access',
                'Use defensive programming with null checks',
                'Implement type validation before property access',
                'Add comprehensive error handling around property operations'
            ]
        });

        // File format compatibility errors
        this.patterns.set('file_format_incompatibility', {
            indicators: ['newer', 'version', 'format', 'incompatible'],
            description: 'File format incompatibility with current runtime',
            commonCauses: [
                'Rive file created with newer editor version',
                'Runtime version too old for file format',
                'Unsupported features in the file'
            ],
            solutions: [
                'Update Rive runtime to latest version',
                'Export file with compatible format version',
                'Check Rive editor and runtime version compatibility',
                'Use feature detection before accessing new properties'
            ]
        });
    }

    /**
     * Analyze a WASM error and provide detailed diagnostics
     * @param {Error} error - The error to analyze
     * @param {Object} context - Additional context about the error
     * @returns {Object} Detailed analysis and recommendations
     */
    analyzeError(error, context = {}) {
        const analysis = {
            timestamp: new Date().toISOString(),
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name
            },
            context: context,
            isWASMError: this.isWASMError(error),
            wasmFunctions: this.extractWASMFunctions(error),
            matchedPatterns: [],
            recommendations: [],
            severity: 'unknown',
            actionable: true
        };

        // Check against known patterns
        for (const [patternName, pattern] of this.patterns) {
            if (this.matchesPattern(error, context, pattern)) {
                analysis.matchedPatterns.push({
                    name: patternName,
                    description: pattern.description,
                    causes: pattern.commonCauses,
                    solutions: pattern.solutions
                });
            }
        }

        // Determine severity
        analysis.severity = this.determineSeverity(analysis);

        // Generate specific recommendations
        analysis.recommendations = this.generateRecommendations(analysis);

        // Store in history
        this.errorHistory.push(analysis);

        return analysis;
    }

    /**
     * Check if an error is WASM-related
     * @param {Error} error - The error to check
     * @returns {boolean} True if the error is WASM-related
     */
    isWASMError(error) {
        if (!error) return false;

        const errorString = error.toString().toLowerCase();
        const stackString = (error.stack || '').toLowerCase();
        
        const wasmIndicators = [
            'aborted()',
            'wasm',
            'webassembly',
            '$func',
            'rive.wasm',
            'abort',
            'memory access out of bounds',
            'unreachable',
            'stack overflow',
            'runtime error'
        ];

        return wasmIndicators.some(indicator => 
            errorString.includes(indicator) || stackString.includes(indicator)
        );
    }

    /**
     * Extract WASM function names from error stack
     * @param {Error} error - The error to analyze
     * @returns {Array} Array of WASM function names
     */
    extractWASMFunctions(error) {
        if (!error.stack) return [];

        const wasmFunctionMatches = error.stack.match(/\$func\d+/g);
        return wasmFunctionMatches ? [...new Set(wasmFunctionMatches)] : [];
    }

    /**
     * Check if error matches a known pattern
     * @param {Error} error - The error to check
     * @param {Object} context - Error context
     * @param {Object} pattern - Pattern to match against
     * @returns {boolean} True if error matches pattern
     */
    matchesPattern(error, context, pattern) {
        const errorText = (error.toString() + (error.stack || '')).toLowerCase();
        const contextText = JSON.stringify(context).toLowerCase();
        const combinedText = errorText + ' ' + contextText;

        return pattern.indicators.some(indicator => 
            combinedText.includes(indicator.toLowerCase())
        );
    }

    /**
     * Determine error severity
     * @param {Object} analysis - Error analysis object
     * @returns {string} Severity level
     */
    determineSeverity(analysis) {
        if (analysis.matchedPatterns.length === 0) return 'unknown';
        
        // Check for critical patterns
        const criticalPatterns = ['enum_access_abort', 'viewmodel_parsing_abort'];
        if (analysis.matchedPatterns.some(p => criticalPatterns.includes(p.name))) {
            return 'critical';
        }

        // Check for high severity patterns
        const highSeverityPatterns = ['file_format_incompatibility'];
        if (analysis.matchedPatterns.some(p => highSeverityPatterns.includes(p.name))) {
            return 'high';
        }

        return 'medium';
    }

    /**
     * Generate specific recommendations based on analysis
     * @param {Object} analysis - Error analysis object
     * @returns {Array} Array of recommendations
     */
    generateRecommendations(analysis) {
        const recommendations = [];

        // Add pattern-specific recommendations
        analysis.matchedPatterns.forEach(pattern => {
            recommendations.push(...pattern.solutions);
        });

        // Add general WASM error recommendations
        if (analysis.isWASMError) {
            recommendations.push(
                'Enable detailed WASM debugging in browser developer tools',
                'Check browser console for additional WASM error details',
                'Verify Rive runtime initialization completed successfully'
            );
        }

        // Add context-specific recommendations
        if (analysis.context.operation === 'enum_access') {
            recommendations.push(
                'Implement enum property validation before access',
                'Use string property access as fallback for enums',
                'Check if enum definition exists before accessing values'
            );
        }

        if (analysis.context.operation === 'viewmodel_parsing') {
            recommendations.push(
                'Implement iterative parsing instead of recursive',
                'Add memory usage monitoring during parsing',
                'Consider parsing ViewModels in smaller chunks'
            );
        }

        // Remove duplicates and return
        return [...new Set(recommendations)];
    }

    /**
     * Get error statistics and patterns
     * @returns {Object} Error statistics
     */
    getStatistics() {
        const stats = {
            totalErrors: this.errorHistory.length,
            wasmErrors: this.errorHistory.filter(e => e.isWASMError).length,
            severityBreakdown: {},
            commonPatterns: {},
            commonFunctions: {},
            recentErrors: this.errorHistory.slice(-5)
        };

        // Calculate severity breakdown
        this.errorHistory.forEach(error => {
            stats.severityBreakdown[error.severity] = 
                (stats.severityBreakdown[error.severity] || 0) + 1;
        });

        // Calculate common patterns
        this.errorHistory.forEach(error => {
            error.matchedPatterns.forEach(pattern => {
                stats.commonPatterns[pattern.name] = 
                    (stats.commonPatterns[pattern.name] || 0) + 1;
            });
        });

        // Calculate common WASM functions
        this.errorHistory.forEach(error => {
            error.wasmFunctions.forEach(func => {
                stats.commonFunctions[func] = 
                    (stats.commonFunctions[func] || 0) + 1;
            });
        });

        return stats;
    }

    /**
     * Generate a diagnostic report
     * @returns {Object} Comprehensive diagnostic report
     */
    generateReport() {
        const stats = this.getStatistics();
        const report = {
            summary: {
                totalErrors: stats.totalErrors,
                wasmErrorPercentage: stats.totalErrors > 0 ? 
                    Math.round((stats.wasmErrors / stats.totalErrors) * 100) : 0,
                mostCommonSeverity: this.getMostCommon(stats.severityBreakdown),
                mostCommonPattern: this.getMostCommon(stats.commonPatterns)
            },
            recommendations: this.getTopRecommendations(),
            patterns: stats.commonPatterns,
            functions: stats.commonFunctions,
            recentErrors: stats.recentErrors.map(error => ({
                timestamp: error.timestamp,
                message: error.error.message,
                severity: error.severity,
                patterns: error.matchedPatterns.map(p => p.name)
            }))
        };

        return report;
    }

    /**
     * Get the most common item from a frequency map
     * @param {Object} frequencyMap - Map of items to their frequencies
     * @returns {string} Most common item
     */
    getMostCommon(frequencyMap) {
        const entries = Object.entries(frequencyMap);
        if (entries.length === 0) return 'none';
        
        return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }

    /**
     * Get top recommendations across all errors
     * @returns {Array} Top recommendations
     */
    getTopRecommendations() {
        const recommendationCounts = {};
        
        this.errorHistory.forEach(error => {
            error.recommendations.forEach(rec => {
                recommendationCounts[rec] = (recommendationCounts[rec] || 0) + 1;
            });
        });

        return Object.entries(recommendationCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([rec, count]) => ({ recommendation: rec, frequency: count }));
    }

    /**
     * Clear error history
     */
    clearHistory() {
        this.errorHistory = [];
    }

    /**
     * Export diagnostics data
     * @returns {Object} Exportable diagnostics data
     */
    exportData() {
        return {
            errorHistory: this.errorHistory,
            statistics: this.getStatistics(),
            report: this.generateReport(),
            exportTimestamp: new Date().toISOString()
        };
    }
}

// Create a singleton instance
export const wasmDiagnostics = new WASMDiagnostics();

// Export utility functions
export function analyzeWASMError(error, context = {}) {
    return wasmDiagnostics.analyzeError(error, context);
}

export function getWASMDiagnosticsReport() {
    return wasmDiagnostics.generateReport();
}

export function clearWASMDiagnostics() {
    wasmDiagnostics.clearHistory();
} 