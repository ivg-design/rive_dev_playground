/**
 * @file debugControl.js
 * Provides a UI for controlling the debugging system.
 */

import { LoggerAPI, LogLevel } from "./debugLogger.js";

// Module names that are available for debugging
const MODULES = [
	"parser",
	"parserHandler",
	"controlInterface",
	"dataConnector",
	"goldenLayout",
	"eventMapper",
	"graphVisualizerIntegration",
	"riveGraphVisualizer",
];

// Log level names and values
const LOG_LEVELS = [
	{ name: "NONE", value: LogLevel.NONE },
	{ name: "ERROR", value: LogLevel.ERROR },
	{ name: "WARN", value: LogLevel.WARN },
	{ name: "INFO", value: LogLevel.INFO },
	{ name: "DEBUG", value: LogLevel.DEBUG },
	{ name: "TRACE", value: LogLevel.TRACE },
];

// Global state for debug controls
let debugControlsContainer = null;
let debugControlsEnabled = false;

// LocalStorage keys for persistence
const STORAGE_KEYS = {
	DEBUG_ENABLED: "rive-tester-debug-enabled",
	DEBUG_LEVELS: "rive-tester-debug-levels",
	DEBUG_GLOBAL_ENABLED: "rive-tester-debug-global-enabled",
};

/**
 * Loads debug settings from localStorage
 */
function loadDebugSettings() {
	try {
		// Load debug controls visibility
		const savedEnabled = localStorage.getItem(STORAGE_KEYS.DEBUG_ENABLED);
		if (savedEnabled === "true") {
			debugControlsEnabled = true;
		}

		// Load global debug state
		const globalEnabled = localStorage.getItem(
			STORAGE_KEYS.DEBUG_GLOBAL_ENABLED,
		);
		if (globalEnabled !== null) {
			LoggerAPI.enable(globalEnabled === "true");
		}

		// Load module-specific levels
		const savedLevels = localStorage.getItem(STORAGE_KEYS.DEBUG_LEVELS);
		if (savedLevels) {
			const levels = JSON.parse(savedLevels);
			Object.entries(levels).forEach(([module, level]) => {
				LoggerAPI.setModuleLevel(module, level);
			});
		}
	} catch (e) {
		console.warn("Failed to load debug settings from localStorage:", e);
	}
}

/**
 * Saves debug settings to localStorage
 */
function saveDebugSettings() {
	try {
		localStorage.setItem(
			STORAGE_KEYS.DEBUG_ENABLED,
			debugControlsEnabled.toString(),
		);

		// Save current module levels (we'll need to track these)
		const currentLevels = {};
		MODULES.forEach((module) => {
			// We'll need to get current levels from the UI since LoggerAPI doesn't expose them
			const levelSelect = document.getElementById(
				`debug-level-${module}`,
			);
			if (levelSelect) {
				currentLevels[module] = parseInt(levelSelect.value);
			}
		});
		localStorage.setItem(
			STORAGE_KEYS.DEBUG_LEVELS,
			JSON.stringify(currentLevels),
		);

		// Save global enabled state - we need to track this properly
		const globalEnabled = LoggerAPI.isEnabled();
		localStorage.setItem(
			STORAGE_KEYS.DEBUG_GLOBAL_ENABLED,
			globalEnabled.toString(),
		);

		// Only log if global logging is enabled
		if (LoggerAPI.isEnabled()) {
			console.log(`🐛 [DEBUG CONTROL] Settings saved - Global: ${globalEnabled}, Modules:`, currentLevels);
		}
	} catch (e) {
		console.warn("Failed to save debug settings to localStorage:", e);
	}
}

/**
 * Creates and injects the debug control panel into the DOM
 */
export function initDebugControls() {
	// Load saved settings first (silently)
	loadDebugSettings();

	// Initialize UI if it was enabled (silently)
	if (debugControlsEnabled) {
		createDebugControlsUI();
	}

	// Extend existing global helper (from debugQuickSet.js) - silently
	if (window.debugHelper) {
		// Extend existing object
		Object.assign(window.debugHelper, {
			enable: enableDebugControls,
			disable: disableDebugControls,
			toggle: toggleDebugControls,
			isEnabled: () => debugControlsEnabled,
			clearSettings: clearDebugSettings,
			currentSettings: getCurrentSettings,
			test: testDebugSystem,
			// Add direct access to LoggerAPI
			api: LoggerAPI,
		});
	} else {
		// Create new object if it doesn't exist
		window.debugHelper = {
			enable: enableDebugControls,
			disable: disableDebugControls,
			toggle: toggleDebugControls,
			isEnabled: () => debugControlsEnabled,
			clearSettings: clearDebugSettings,
			currentSettings: getCurrentSettings,
			test: testDebugSystem,
			// Add direct access to LoggerAPI
			api: LoggerAPI,
		};
	}
}

/**
 * Enables and shows the debug controls
 */
function enableDebugControls() {
	debugControlsEnabled = true;
	if (!debugControlsContainer) {
		createDebugControlsUI();
	} else {
		debugControlsContainer.style.display = "block";
	}
	saveDebugSettings();
}

/**
 * Disables and hides the debug controls
 */
function disableDebugControls() {
	debugControlsEnabled = false;
	if (debugControlsContainer) {
		debugControlsContainer.style.display = "none";
	}
	saveDebugSettings();
}

/**
 * Toggles the debug controls visibility
 */
function toggleDebugControls() {
	if (debugControlsEnabled) {
		disableDebugControls();
	} else {
		enableDebugControls();
	}
}

/**
 * Creates the actual debug controls UI
 */
function createDebugControlsUI() {
	if (debugControlsContainer) {
		return; // Already created
	}

	debugControlsContainer = document.createElement("div");
	debugControlsContainer.id = "debug-controls-panel";
	debugControlsContainer.style.cssText = `
        position: fixed;
        bottom: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 10px;
        border-top-left-radius: 8px;
        z-index: 9999;
        font-family: monospace;
        font-size: 12px;
        max-height: 400px;
        overflow-y: auto;
        transition: transform 0.3s;
        transform: translateY(calc(100% - 30px));
    `;

	// Title bar that stays visible
	const titleBar = document.createElement("div");
	titleBar.textContent = "🐛 Debug Controls";
	titleBar.style.cssText = `
        cursor: pointer;
        font-weight: bold;
        padding-bottom: 5px;
        border-bottom: 1px solid #555;
        user-select: none;
    `;
	debugControlsContainer.appendChild(titleBar);

	// Content container for all controls
	const content = document.createElement("div");
	content.style.cssText = `
        margin-top: 10px;
    `;
	debugControlsContainer.appendChild(content);

	// Global controls
	const globalControls = document.createElement("div");
	globalControls.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong>Global Controls</strong>
            <div style="display: flex; gap: 10px; margin-top: 5px;">
                <button id="debug-enable-all">Enable All</button>
                <button id="debug-disable-all">Disable All</button>
                <select id="debug-all-level">
                    ${LOG_LEVELS.map((level) => `<option value="${level.value}">${level.name}</option>`).join("")}
                </select>
                <button id="debug-set-all-level">Set All Levels</button>
            </div>
        </div>
    `;
	content.appendChild(globalControls);

	// Module-specific controls
	const moduleControls = document.createElement("div");
	moduleControls.innerHTML = `
        <div>
            <strong>Module Controls</strong>
            <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
                <tr>
                    <th style="text-align: left; padding: 3px;">Module</th>
                    <th style="text-align: left; padding: 3px;">Level</th>
                    <th style="text-align: left; padding: 3px;">Actions</th>
                </tr>
                ${MODULES.map(
					(module) => `
                    <tr>
                        <td style="padding: 3px;">${module}</td>
                        <td style="padding: 3px;">
                            <select id="debug-level-${module}">
                                ${LOG_LEVELS.map((level) => `<option value="${level.value}">${level.name}</option>`).join("")}
                            </select>
                        </td>
                        <td style="padding: 3px;">
                            <button id="debug-set-${module}">Set</button>
                        </td>
                    </tr>
                `,
				).join("")}
            </table>
        </div>
    `;
	content.appendChild(moduleControls);

	// Status messages
	const statusArea = document.createElement("div");
	statusArea.id = "debug-status";
	statusArea.style.cssText = `
        margin-top: 10px;
        padding-top: 5px;
        border-top: 1px solid #555;
        min-height: 20px;
        font-style: italic;
    `;
	content.appendChild(statusArea);

	// Add to DOM
	document.body.appendChild(debugControlsContainer);

	// Setup event handlers
	titleBar.addEventListener("click", () => {
		if (debugControlsContainer.style.transform === "translateY(0px)") {
			debugControlsContainer.style.transform =
				"translateY(calc(100% - 30px))";
		} else {
			debugControlsContainer.style.transform = "translateY(0px)";
		}
	});

	// Global controls
	document
		.getElementById("debug-enable-all")
		.addEventListener("click", () => {
			if (LoggerAPI.isEnabled()) {
				console.log("🐛 [DEBUG CONTROL] Enabling all logging globally");
			}
			LoggerAPI.enable(true);
			updateStatus("Logging enabled globally");
			saveDebugSettings();
			if (LoggerAPI.isEnabled()) {
				console.log("🐛 [DEBUG CONTROL] Global logging enabled - all modules will now log according to their levels");
			}
		});

	document
		.getElementById("debug-disable-all")
		.addEventListener("click", () => {
			if (LoggerAPI.isEnabled()) {
				console.log("🐛 [DEBUG CONTROL] Disabling all logging globally");
			}
			LoggerAPI.enable(false);
			updateStatus("Logging disabled globally");
			saveDebugSettings();
			// Note: After this point, LoggerAPI.isEnabled() will be false, so no more logging
			console.log("🐛 [DEBUG CONTROL] Global logging disabled - no modules will log regardless of their levels");
		});

	document
		.getElementById("debug-set-all-level")
		.addEventListener("click", () => {
			const level = parseInt(
				document.getElementById("debug-all-level").value,
			);
			const levelName = getLevelName(level);
			
			if (LoggerAPI.isEnabled()) {
				console.log(`🐛 [DEBUG CONTROL] Setting all modules to level: ${levelName} (${level})`);
			}

			MODULES.forEach((module) => {
				LoggerAPI.setModuleLevel(module, level);
				const moduleSelect = document.getElementById(
					`debug-level-${module}`,
				);
				if (moduleSelect) {
					moduleSelect.value = level.toString();
				}
			});

			updateStatus(`All modules set to ${levelName}`);
			saveDebugSettings();
			
			if (LoggerAPI.isEnabled()) {
				console.log(`🐛 [DEBUG CONTROL] All modules now set to ${levelName} level`);
			}
		});

	// Module-specific controls
	MODULES.forEach((module) => {
		const setBtn = document.getElementById(`debug-set-${module}`);
		if (setBtn) {
			setBtn.addEventListener("click", () => {
				const levelSelect = document.getElementById(
					`debug-level-${module}`,
				);
				const level = parseInt(levelSelect.value);
				const levelName = getLevelName(level);
				
				if (LoggerAPI.isEnabled()) {
					console.log(`🐛 [DEBUG CONTROL] Setting module '${module}' to level: ${levelName} (${level})`);
				}

				LoggerAPI.setModuleLevel(module, level);
				updateStatus(`${module} set to ${levelName}`);
				saveDebugSettings();
				
				if (LoggerAPI.isEnabled()) {
					console.log(`🐛 [DEBUG CONTROL] Module '${module}' now set to ${levelName} level`);
				}
			});
		}
	});

	// Set initial selected values based on saved configuration
	loadSavedUISettings();
}

/**
 * Updates the status message in the debug panel
 * @param {string} message - Status message to display
 */
function updateStatus(message) {
	const statusEl = document.getElementById("debug-status");
	if (statusEl) {
		statusEl.textContent = message;

		// Clear after 3 seconds
		setTimeout(() => {
			statusEl.textContent = "";
		}, 3000);
	}
}

/**
 * Gets the name of a log level from its value
 * @param {number} level - Log level value
 * @returns {string} Log level name
 */
function getLevelName(level) {
	const found = LOG_LEVELS.find((l) => l.value === level);
	return found ? found.name : "UNKNOWN";
}

/**
 * Loads saved UI settings and applies them to the dropdowns
 */
function loadSavedUISettings() {
	try {
		const savedLevels = localStorage.getItem(STORAGE_KEYS.DEBUG_LEVELS);
		if (savedLevels) {
			const levels = JSON.parse(savedLevels);

			// Set module-specific dropdowns
			MODULES.forEach((module) => {
				const levelSelect = document.getElementById(
					`debug-level-${module}`,
				);
				if (levelSelect && levels[module] !== undefined) {
					levelSelect.value = levels[module];
				} else if (levelSelect) {
					levelSelect.value = LogLevel.NONE; // Default to NONE
				}
			});

			// Set global dropdown to the most common level or NONE
			const globalSelect = document.getElementById("debug-all-level");
			if (globalSelect) {
				globalSelect.value = LogLevel.NONE; // Default to NONE
			}
		} else {
			// No saved settings, use defaults (NONE)
			document.getElementById("debug-all-level").value = LogLevel.NONE;
			MODULES.forEach((module) => {
				document.getElementById(`debug-level-${module}`).value =
					LogLevel.NONE;
			});
		}
	} catch (e) {
		console.warn("Failed to load saved UI settings:", e);
		// Fallback to defaults (NONE)
		document.getElementById("debug-all-level").value = LogLevel.NONE;
		MODULES.forEach((module) => {
			document.getElementById(`debug-level-${module}`).value =
				LogLevel.NONE;
		});
	}
}

/**
 * Tests the debug system by sending test messages to all modules
 */
function testDebugSystem() {
	// Import the createLogger function to test
	import('./debugLogger.js').then(({ createLogger }) => {
		MODULES.forEach((module) => {
			const logger = createLogger(module);
			
			// Test all log levels
			logger.error(`Test ERROR message from ${module}`);
			logger.warn(`Test WARN message from ${module}`);
			logger.info(`Test INFO message from ${module}`);
			logger.debug(`Test DEBUG message from ${module}`);
			logger.trace(`Test TRACE message from ${module}`);
		});
	}).catch((e) => {
		console.error("🧪 [DEBUG TEST] Failed to import debugLogger:", e);
	});
}

/**
 * Clears all debug settings from localStorage
 */
function clearDebugSettings() {
	try {
		Object.values(STORAGE_KEYS).forEach((key) => {
			localStorage.removeItem(key);
		});

		// Reset to defaults
		debugControlsEnabled = false;
		LoggerAPI.enable(true); // Default to enabled
		MODULES.forEach((module) => {
			LoggerAPI.setModuleLevel(module, LogLevel.INFO); // Default level
		});

		// Show feedback when user explicitly clears settings
		if (LoggerAPI.isEnabled()) {
			console.log("🐛 [DEBUG CONTROL] All debug settings cleared from localStorage");
		}
	} catch (e) {
		console.warn("Failed to clear debug settings:", e);
	}
}

/**
 * Gets current debug settings for all modules
 * @returns {Object} Current debug settings
 */
function getCurrentSettings() {
	const settings = {
		debugControlsEnabled: debugControlsEnabled,
		globalEnabled: LoggerAPI.isEnabled(), // Get actual current state
		modules: {},
	};

	try {
		// Get actual current levels from LoggerAPI
		const currentLevels = LoggerAPI.getAllLevels();
		
		MODULES.forEach((module) => {
			const actualLevel = LoggerAPI.getModuleLevel(module);
			const levelName = getLevelName(actualLevel);
			settings.modules[module] = {
				level: actualLevel,
				levelName: levelName,
			};
		});

		// Also get from UI if available for comparison
		if (debugControlsEnabled && debugControlsContainer) {
			MODULES.forEach((module) => {
				const levelSelect = document.getElementById(`debug-level-${module}`);
				if (levelSelect) {
					const uiLevel = parseInt(levelSelect.value);
					const actualLevel = settings.modules[module].level;
					if (uiLevel !== actualLevel) {
						settings.modules[module].mismatch = true;
						settings.modules[module].uiLevel = uiLevel;
						settings.modules[module].uiLevelName = getLevelName(uiLevel);
					}
				}
			});
		}

		// Show detailed output when user explicitly requests current settings
		if (LoggerAPI.isEnabled()) {
			console.log("\n🐛 Current Debug Settings:");
			console.log("=========================");
			console.log(
				`Debug Controls Panel: ${debugControlsEnabled ? "Enabled" : "Disabled"}`,
			);
			console.log(
				`Global Logging: ${settings.globalEnabled ? "Enabled" : "Disabled"}`,
			);

			console.log("\nModule Settings:");
			MODULES.forEach((module) => {
				const moduleSettings = settings.modules[module];
				const mismatchWarning = moduleSettings.mismatch ? " ⚠️" : "";
				const levelDisplay = moduleSettings.mismatch 
					? `${moduleSettings.levelName} (UI: ${moduleSettings.uiLevelName})`
					: moduleSettings.levelName;
				console.log(`  ${module.padEnd(15)} : ${levelDisplay}${mismatchWarning}`);
			});

			console.log("\n💡 Tips:");
			console.log("  - Use debugHelper.enable() to show debug controls");
			console.log("  - Use debugHelper.disable() to hide debug controls");
			console.log("  - Use debugHelper.test() to test all modules");
			console.log("  - Set levels to NONE to stop all messages for that module");
			console.log("  - Global disable overrides all module settings");
			console.log("  - ⚠️ indicates UI/actual level mismatch - click 'Set' button to sync");
			console.log("=========================\n");
		}

		return settings;
	} catch (e) {
		console.warn("Failed to get current debug settings:", e);
		return settings;
	}
}

// Initialize the debug controls when this module is imported
try {
	if (
		document.readyState === "complete" ||
		document.readyState === "interactive"
	) {
		initDebugControls();
	} else {
		document.addEventListener("DOMContentLoaded", initDebugControls);
	}
} catch (error) {
	// Silently handle initialization errors
}
