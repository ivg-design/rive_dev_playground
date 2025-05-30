/**
 * @file debugQuickSet.js
 * Provides shortcuts for debug level configuration in the console
 */

import { LoggerAPI, LogLevel, createLogger } from "./debugLogger.js";

// Create a logger for this module
const logger = createLogger("debugQuickSet");

// Attach to window (will be extended by debugControl.js)
window.debugHelper = {
	// Easy functions to change log levels from the browser console
	verbose: () => {
		LoggerAPI.setAllLevels(LogLevel.TRACE);
		logger.info("All modules set to TRACE level");
	},
	debug: () => {
		LoggerAPI.setAllLevels(LogLevel.DEBUG);
		logger.info("All modules set to DEBUG level");
	},
	normal: () => {
		LoggerAPI.setAllLevels(LogLevel.INFO);
		logger.info("All modules set to INFO level");
	},
	quiet: () => {
		LoggerAPI.setAllLevels(LogLevel.WARN);
		logger.info("All modules set to WARN level");
	},
	silent: () => {
		LoggerAPI.setAllLevels(LogLevel.ERROR);
		logger.info("All modules set to ERROR level (silent)");
	},
	off: () => {
		LoggerAPI.setAllLevels(LogLevel.NONE);
		logger.info("All logging disabled");
	},
	traceSingle: (module) => {
		LoggerAPI.setModuleLevel(module, LogLevel.TRACE);
		logger.info(`Module '${module}' set to TRACE level`);
	},

	// Helper to show current debug settings (will be extended by debugControl.js)
	currentSettings: () => {
		logger.info(
			"Debug settings function will be available after debugControl.js loads",
		);
		return null;
	},
};

// Log that debug helpers are ready
logger.info(
	"Debug helpers attached to window.debugHelper - Debug controls hidden by default, use window.debugHelper.enable() to show",
);
