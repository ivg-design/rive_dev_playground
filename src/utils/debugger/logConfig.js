/**
 * @file logConfig.js
 * Central configuration for the logging system.
 * This file can be imported to configure logging settings.
 */

import { LoggerAPI, LogLevel } from "./debugLogger.js";

// Default configuration for all modules
LoggerAPI.configure({
	enabled: true,
	showTimestamp: true,
	showModuleName: true,
	defaultLevel: LogLevel.NONE,
});

// Configure specific modules
LoggerAPI.setModuleLevel("parser", LogLevel.NONE); // More detailed parsing logs
LoggerAPI.setModuleLevel("dataConnector", LogLevel.NONE); // Use TRACE level for dataConnector to debug VM binding
LoggerAPI.setModuleLevel("controlInterface", LogLevel.NONE); // Detailed level for UI to debug control creation
LoggerAPI.setModuleLevel("parserHandler", LogLevel.NONE); // Normal level for handler
LoggerAPI.setModuleLevel("goldenLayout", LogLevel.DEBUG); // Golden Layout debugging - enabled for troubleshooting

// Graph Visualizer modules
LoggerAPI.setModuleLevel("graphVisualizerIntegration", LogLevel.DEBUG); // Graph integration debugging
LoggerAPI.setModuleLevel("riveGraphVisualizer", LogLevel.DEBUG); // Graph visualizer core debugging

/**
 * Configure all logging from this central place
 */
export function configureLogging() {
	// This function can be called to reset or update logging configuration
	// if needed during runtime

	// Since we're in a browser environment without bundlers like webpack,
	// we don't have access to process.env.NODE_ENV

	// For now we'll use debug levels for all (since we're troubleshooting)
	// But we'll keep individual module settings from above

	// Special verbose debugging for VM binding issue
	LoggerAPI.setModuleLevel("dataConnector", LogLevel.NONE);
}

/**
 * Toggle debugging for a specific module
 * @param {string} moduleName - Name of the module to configure
 * @param {number} level - Log level from LogLevel enum
 */
export function setModuleDebugLevel(moduleName, level) {
	LoggerAPI.setModuleLevel(moduleName, level);
}

/**
 * Enable verbose debugging for a specific module
 * @param {string} moduleName - Name of the module to make verbose
 */
export function enableVerboseDebugging(moduleName) {
	LoggerAPI.setModuleLevel(moduleName, LogLevel.TRACE);
}

/**
 * Silence all logging except errors
 */
export function silenceAllLogs() {
	LoggerAPI.setAllLevels(LogLevel.ERROR);
}

/**
 * Enable detailed debugging for all modules
 */
export function enableDetailedDebugging() {
	LoggerAPI.setAllLevels(LogLevel.DEBUG);
}

/**
 * Export the LogLevel constants for easy access
 */
export { LogLevel };

// Enhanced debugging for trigger troubleshooting
export const TRIGGER_DEBUG_CONFIG = {
	controlInterface: LogLevel.TRACE,
	dataConnector: LogLevel.TRACE,
	script_to_fix: LogLevel.TRACE,
	parser: LogLevel.DEBUG,
	parserHandler: LogLevel.INFO
};

// Function to quickly enable trigger debugging - now integrated into debugHelper
export async function enableTriggerDebugging() {
	// This function is kept for backwards compatibility but delegates to debugHelper
	if (window.debugHelper && typeof window.debugHelper.enableTriggerDebug === 'function') {
		window.debugHelper.enableTriggerDebug();
		console.log('💡 Trigger debugging enabled via debugHelper');
		console.log('💡 Use debugHelper.listTriggers(), debugHelper.testTrigger(), etc.');
	} else {
		console.warn('debugHelper not available yet. Try: debugHelper.enableTriggerDebug()');
	}
}

// Invoke the default configuration
configureLogging();
