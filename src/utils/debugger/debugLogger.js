/**
 * @file debugLogger.js
 * Central logging utility that provides granular control over logging levels for different modules.
 */

// Log levels definition
export const LogLevel = {
	NONE: 0, // No logging
	ERROR: 1, // Only errors
	WARN: 2, // Errors and warnings
	INFO: 3, // General information (default)
	DEBUG: 4, // Detailed information for debugging
	TRACE: 5, // Extremely detailed tracing information
};

// Module configuration with default levels
const moduleConfig = {
	// Core modules - default to NONE unless overridden by saved settings
	parser: LogLevel.NONE,
	parserHandler: LogLevel.NONE,
	controlInterface: LogLevel.NONE,
	dataConnector: LogLevel.NONE,
	goldenLayout: LogLevel.NONE,

	// Default for any module not specified
	default: LogLevel.NONE,
};

// Global system configuration
const config = {
	enabled: true, // Master switch to enable/disable all logging
	showTimestamp: true, // Include timestamp in logs
	showModuleName: true, // Include module name in logs
	defaultLevel: LogLevel.NONE, // Default level if not specified
	consoleOutput: true, // Log to console

	// Function to format log messages
	formatMessage: (moduleName, level, message) => {
		const parts = [];

		// Add timestamp if enabled
		if (config.showTimestamp) {
			const now = new Date();
			parts.push(`[${now.toISOString()}]`);
		}

		// Add module name if enabled
		if (config.showModuleName) {
			parts.push(`[${moduleName}]`);
		}

		// Add level name
		const levelName =
			Object.keys(LogLevel).find((key) => LogLevel[key] === level) ||
			"UNKNOWN";
		parts.push(`[${levelName}]`);

		// Combine with message
		return parts.join(" ") + " " + message;
	},
};

/**
 * WASM Error Detection and Diagnostics
 */
const WASMDiagnostics = {
	// Track WASM-related errors
	wasmErrors: [],
	
	// Detect if an error is WASM-related
	isWASMError(error) {
		if (!error) return false;
		
		const errorString = error.toString().toLowerCase();
		const wasmIndicators = [
			'aborted()',
			'wasm',
			'webassembly',
			'$func',
			'rive.wasm',
			'abort',
			'memory access out of bounds',
			'unreachable',
			'stack overflow'
		];
		
		return wasmIndicators.some(indicator => errorString.includes(indicator));
	},
	
	// Analyze WASM error context
	analyzeWASMError(error, context = {}) {
		const analysis = {
			timestamp: new Date().toISOString(),
			error: error.toString(),
			stack: error.stack || 'No stack trace available',
			context: context,
			wasmFunctions: [],
			possibleCauses: [],
			recommendations: []
		};
		
		// Extract WASM function names from stack trace
		if (error.stack) {
			const wasmFunctionMatches = error.stack.match(/\$func\d+/g);
			if (wasmFunctionMatches) {
				analysis.wasmFunctions = [...new Set(wasmFunctionMatches)];
			}
		}
		
		// Determine possible causes based on context
		if (context.operation === 'enum_access') {
			analysis.possibleCauses.push('Enum property access on newer Rive file format');
			analysis.possibleCauses.push('Incompatible enum structure in WASM runtime');
			analysis.recommendations.push('Use string fallback for enum properties');
			analysis.recommendations.push('Check Rive runtime version compatibility');
		}
		
		if (context.operation === 'viewmodel_parsing') {
			analysis.possibleCauses.push('Complex ViewModel structure not supported by current runtime');
			analysis.possibleCauses.push('Memory corruption during recursive parsing');
			analysis.recommendations.push('Implement property-by-property error handling');
			analysis.recommendations.push('Add depth limits to recursive parsing');
		}
		
		if (context.operation === 'property_access') {
			analysis.possibleCauses.push('Property type mismatch between file and runtime');
			analysis.possibleCauses.push('Invalid property reference in WASM memory');
			analysis.recommendations.push('Validate property existence before access');
			analysis.recommendations.push('Use try-catch around each property access');
		}
		
		this.wasmErrors.push(analysis);
		return analysis;
	},
	
	// Get WASM error summary
	getErrorSummary() {
		return {
			totalErrors: this.wasmErrors.length,
			recentErrors: this.wasmErrors.slice(-5),
			commonFunctions: this.getCommonWASMFunctions(),
			commonCauses: this.getCommonCauses()
		};
	},
	
	// Get most common WASM functions in errors
	getCommonWASMFunctions() {
		const functionCounts = {};
		this.wasmErrors.forEach(error => {
			error.wasmFunctions.forEach(func => {
				functionCounts[func] = (functionCounts[func] || 0) + 1;
			});
		});
		
		return Object.entries(functionCounts)
			.sort(([,a], [,b]) => b - a)
			.slice(0, 5)
			.map(([func, count]) => ({ function: func, count }));
	},
	
	// Get most common error causes
	getCommonCauses() {
		const causeCounts = {};
		this.wasmErrors.forEach(error => {
			error.possibleCauses.forEach(cause => {
				causeCounts[cause] = (causeCounts[cause] || 0) + 1;
			});
		});
		
		return Object.entries(causeCounts)
			.sort(([,a], [,b]) => b - a)
			.slice(0, 3)
			.map(([cause, count]) => ({ cause, count }));
	},
	
	// Clear error history
	clearErrors() {
		this.wasmErrors = [];
	}
};

/**
 * Create a logger instance for a specific module
 * @param {string} moduleName - The name of the module using this logger
 * @returns {Object} Logger object with methods for each log level
 */
export function createLogger(moduleName) {
	// Default level for this module, or fallback to default
	const getModuleLevel = () =>
		moduleConfig[moduleName] || moduleConfig.default || config.defaultLevel;

	// Check if logging is enabled for the specified level
	const shouldLog = (level) => config.enabled && level <= getModuleLevel();

	// Common log method
	const log = (level, ...args) => {
		if (!shouldLog(level)) return;

		// Handle complex objects and multiple arguments
		const processArgs = (argsList) => {
			return argsList
				.map((arg) => {
					if (typeof arg === "object") {
						try {
							return JSON.stringify(arg);
						} catch (e) {
							return `[Object: ${typeof arg}]`;
						}
					}
					return String(arg);
				})
				.join(" ");
		};

		const message = processArgs(args);
		const formattedMessage = config.formatMessage(
			moduleName,
			level,
			message,
		);

		// Send to console if enabled
		if (config.consoleOutput) {
			switch (level) {
				case LogLevel.ERROR:
					console.error(formattedMessage);
					break;
				case LogLevel.WARN:
					console.warn(formattedMessage);
					break;
				case LogLevel.INFO:
					console.info(formattedMessage);
					break;
				case LogLevel.DEBUG:
				case LogLevel.TRACE:
				default:
					console.log(formattedMessage);
					break;
			}
		}

		// Additional log destinations could be added here (file, remote logging, etc.)
	};

	// Enhanced error logging with WASM detection
	const logError = (...args) => {
		// Check if any of the arguments is a WASM-related error
		const errors = args.filter(arg => arg instanceof Error);
		errors.forEach(error => {
			if (WASMDiagnostics.isWASMError(error)) {
				const analysis = WASMDiagnostics.analyzeWASMError(error, {
					module: moduleName,
					timestamp: new Date().toISOString()
				});
				
				// Log the WASM analysis
				log(LogLevel.ERROR, `WASM ERROR DETECTED in ${moduleName}:`);
				log(LogLevel.ERROR, `Functions involved: ${analysis.wasmFunctions.join(', ')}`);
				log(LogLevel.ERROR, `Possible causes: ${analysis.possibleCauses.join('; ')}`);
				log(LogLevel.ERROR, `Recommendations: ${analysis.recommendations.join('; ')}`);
			}
		});
		
		// Log the original error
		log(LogLevel.ERROR, ...args);
	};

	// Return logger object with methods for each level
	return {
		trace: (...args) => log(LogLevel.TRACE, ...args),
		debug: (...args) => log(LogLevel.DEBUG, ...args),
		info: (...args) => log(LogLevel.INFO, ...args),
		warn: (...args) => log(LogLevel.WARN, ...args),
		error: logError,

		// WASM-specific logging methods
		wasmError: (error, context = {}) => {
			if (WASMDiagnostics.isWASMError(error)) {
				const analysis = WASMDiagnostics.analyzeWASMError(error, { 
					...context, 
					module: moduleName 
				});
				logError(`WASM ERROR: ${error.message}`, analysis);
			} else {
				logError(`Non-WASM Error: ${error.message}`);
			}
		},

		// Get WASM diagnostics
		getWASMDiagnostics: () => WASMDiagnostics.getErrorSummary(),

		// Clear WASM error history
		clearWASMErrors: () => WASMDiagnostics.clearErrors(),

		// Utility to change the log level for this module at runtime
		setLevel: (level) => {
			if (
				typeof level === "number" &&
				level >= LogLevel.NONE &&
				level <= LogLevel.TRACE
			) {
				moduleConfig[moduleName] = level;
				log(
					LogLevel.INFO,
					`Log level changed to ${Object.keys(LogLevel).find((key) => LogLevel[key] === level)}`,
				);
			} else {
				log(LogLevel.ERROR, `Invalid log level: ${level}`);
			}
		},
	};
}

/**
 * Configure the global logger system
 * @param {Object} options - Configuration options
 */
export function configureLogger(options = {}) {
	// Update config with provided options
	Object.assign(config, options);

	// Update module config if provided
	if (options.modules && typeof options.modules === "object") {
		Object.keys(options.modules).forEach((moduleName) => {
			if (typeof options.modules[moduleName] === "number") {
				moduleConfig[moduleName] = options.modules[moduleName];
			}
		});
	}

	const defaultLogger = createLogger("loggerConfig");
	defaultLogger.info("Logger configuration updated");

	// Log current config for debugging
	defaultLogger.debug("Current configuration:", config);
	defaultLogger.debug("Module levels:", moduleConfig);
}

// Public API to control logging levels
export const LoggerAPI = {
	// Set level for a specific module
	setModuleLevel: (moduleName, level) => {
		if (
			typeof level === "number" &&
			level >= LogLevel.NONE &&
			level <= LogLevel.TRACE
		) {
			moduleConfig[moduleName] = level;

			const defaultLogger = createLogger("loggerAPI");
			defaultLogger.info(
				`Log level for module '${moduleName}' set to ${Object.keys(LogLevel).find((key) => LogLevel[key] === level)}`,
			);
		}
	},

	// Set level for all modules
	setAllLevels: (level) => {
		if (
			typeof level === "number" &&
			level >= LogLevel.NONE &&
			level <= LogLevel.TRACE
		) {
			Object.keys(moduleConfig).forEach((moduleName) => {
				moduleConfig[moduleName] = level;
			});

			// Also set default level
			moduleConfig.default = level;

			const defaultLogger = createLogger("loggerAPI");
			defaultLogger.info(
				`Global log level set to ${Object.keys(LogLevel).find((key) => LogLevel[key] === level)}`,
			);
		}
	},

	// Enable/disable logging globally
	enable: (enabled = true) => {
		config.enabled = !!enabled;

		const defaultLogger = createLogger("loggerAPI");
		defaultLogger.info(`Logging ${enabled ? "enabled" : "disabled"}`);
	},

	// Get current global enabled state
	isEnabled: () => config.enabled,

	// Get current module level
	getModuleLevel: (moduleName) => moduleConfig[moduleName] || moduleConfig.default || config.defaultLevel,

	// Get all current module levels
	getAllLevels: () => ({ ...moduleConfig }),

	// Configure the logger system
	configure: configureLogger,

	// Log levels for reference
	levels: LogLevel,
};

// Export a default logger for quick use
export default createLogger("default");
