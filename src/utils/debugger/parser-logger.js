/**
 * @file parser-logger.js
 * Provides a global logger for parser.js (which is loaded as a script, not a module)
 */

import { createLogger } from "./debugLogger.js";

// Create the logger and attach it to window
window.parserLogger = createLogger("parser");

// Log that the parser logger is ready
window.parserLogger.debug(
	"Parser logger initialized and attached to window.parserLogger",
);
