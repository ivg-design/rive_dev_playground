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

// Invoke the default configuration
configureLogging();
