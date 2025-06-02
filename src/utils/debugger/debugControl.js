/**
 * @file debugControl.js
 * Provides a UI for controlling the debugging system.
 */

import { LoggerAPI, LogLevel } from "./debugLogger.js";
// Import the enhanced formatter service
import RiveFormatterService from "./riveInstanceFormatter.js";

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
			// === PANEL CONTROLS ===
			enable: enableDebugControls,
			disable: disableDebugControls,
			toggle: toggleDebugControls,
			isEnabled: () => debugControlsEnabled,
			
			// === SETTINGS ===
			clearSettings: clearDebugSettings,
			currentSettings: getCurrentSettings,
			
			// === TESTING ===
			test: testDebugSystem,
			
			// === API ACCESS ===
			api: LoggerAPI,
			
			// === ENHANCED OBJECT FORMATTING ===
			objectFormatter: RiveFormatterService.formatObject,
			manualAssetSearch: RiveFormatterService.manualAssetSearch,
			exploreObject: (obj, maxDepth = 3) => {
				console.group('🔍 Deep Object Explorer');
				if (!obj) {
					console.log('❌ No object provided');
					console.groupEnd();
					return;
				}
				console.log('Object:', obj);
				console.log('Type:', typeof obj);
				console.log('Constructor:', obj.constructor?.name || 'Unknown');
				if (RiveFormatterService.isRiveInstance(obj)) {
					console.log('✅ Detected as Rive Instance');
					const assets = RiveFormatterService.findAssets(obj);
					const inputs = RiveFormatterService.findInputs(obj);
					console.log('Assets found:', assets);
					console.log('Inputs found:', inputs);
				}
				console.groupEnd();
			},
			
			// === COMPREHENSIVE INPUT DEBUGGING ===
			enableInputDebug: enableInputDebugging,
			discoverInputs: discoverAllInputs,
			listInputs: listAllInputs,
			listAllInputs: listAllInputs,
			testInput: testInput,
			testAllInputs: testAllInputs,
			addInputType: addInputType,
			getInputTypes: getInputTypes,
			
			// === COMPREHENSIVE HELP ===
			help: showDebugHelp,
			commands: listAllCommands
		});
	} else {
		// Create new object if it doesn't exist
		window.debugHelper = {
			// === LOG LEVEL SHORTCUTS (from debugQuickSet.js) ===
			verbose: () => {
				LoggerAPI.setAllLevels(LogLevel.TRACE);
				console.log("🐛 All modules set to TRACE level");
			},
			debug: () => {
				LoggerAPI.setAllLevels(LogLevel.DEBUG);
				console.log("🐛 All modules set to DEBUG level");
			},
			normal: () => {
				LoggerAPI.setAllLevels(LogLevel.INFO);
				console.log("🐛 All modules set to INFO level");
			},
			quiet: () => {
				LoggerAPI.setAllLevels(LogLevel.WARN);
				console.log("🐛 All modules set to WARN level");
			},
			silent: () => {
				LoggerAPI.setAllLevels(LogLevel.ERROR);
				console.log("🐛 All modules set to ERROR level (silent)");
			},
			off: () => {
				LoggerAPI.setAllLevels(LogLevel.NONE);
				console.log("🐛 All logging disabled");
			},
			traceSingle: (module) => {
				LoggerAPI.setModuleLevel(module, LogLevel.TRACE);
				console.log(`🐛 Module '${module}' set to TRACE level`);
			},
			
			// === PANEL CONTROLS ===
			enable: enableDebugControls,
			disable: disableDebugControls,
			toggle: toggleDebugControls,
			isEnabled: () => debugControlsEnabled,
			
			// === SETTINGS ===
			clearSettings: clearDebugSettings,
			currentSettings: getCurrentSettings,
			
			// === TESTING ===
			test: testDebugSystem,
			
			// === API ACCESS ===
			api: LoggerAPI,
			
			// === ENHANCED OBJECT FORMATTING ===
			objectFormatter: RiveFormatterService.formatObject,
			manualAssetSearch: RiveFormatterService.manualAssetSearch,
			exploreObject: (obj, maxDepth = 3) => {
				console.group('🔍 Deep Object Explorer');
				if (!obj) {
					console.log('❌ No object provided');
					console.groupEnd();
					return;
				}
				console.log('Object:', obj);
				console.log('Type:', typeof obj);
				console.log('Constructor:', obj.constructor?.name || 'Unknown');
				if (RiveFormatterService.isRiveInstance(obj)) {
					console.log('✅ Detected as Rive Instance');
					const assets = RiveFormatterService.findAssets(obj);
					const inputs = RiveFormatterService.findInputs(obj);
					console.log('Assets found:', assets);
					console.log('Inputs found:', inputs);
				}
				console.groupEnd();
			},
			
			// === COMPREHENSIVE INPUT DEBUGGING ===
			enableInputDebug: enableInputDebugging,
			discoverInputs: discoverAllInputs,
			listInputs: listAllInputs,
			listAllInputs: listAllInputs,
			testInput: testInput,
			testAllInputs: testAllInputs,
			addInputType: addInputType,
			getInputTypes: getInputTypes,
			
			// === COMPREHENSIVE HELP ===
			help: showDebugHelp,
			commands: listAllCommands
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
                <button id="debug-enable-all">Global ON</button>
                <button id="debug-disable-all">Global OFF</button>
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

// === RIVE INPUT DISCOVERY & TESTING SYSTEM ===

/**
 * Comprehensive input type definitions for Rive
 * This object defines all known input types and their testing methods
 * Add new types here as Rive adds functionality
 */
const RIVE_INPUT_TYPES = {
	// ViewModel inputs
	triggers: {
		displayName: 'Triggers',
		windowPrefix: 'trigger_',
		firingPrefix: 'firing_trigger_',
		testMethods: ['trigger', 'fire'],
		getFromVM: (vm) => {
			const inputs = [];
			if (vm && typeof vm.trigger === 'function') {
				// Try to discover triggers through VM introspection
				try {
					const vmProps = Object.getOwnPropertyNames(vm);
					// Look for trigger-related properties or methods
					vmProps.forEach(prop => {
						if (prop.includes('trigger') || prop.includes('Trigger')) {
							inputs.push(prop);
						}
					});
				} catch (e) {
					console.debug('Could not introspect VM for triggers:', e);
				}
			}
			return inputs;
		},
		testInput: (input, name) => {
			if (typeof input.trigger === 'function') {
				input.trigger();
				return { success: true, method: 'trigger()' };
			} else if (typeof input.fire === 'function') {
				input.fire();
				return { success: true, method: 'fire()' };
			}
			return { success: false, reason: 'No trigger() or fire() method available' };
		}
	},
	
	booleans: {
		displayName: 'Boolean Inputs',
		windowPrefix: 'boolean_',
		getFromVM: (vm) => {
			const inputs = [];
			if (vm && typeof vm.boolean === 'function') {
				// Common boolean input names to try
				const commonBooleans = [
					'Pills Active', 'Pills In', 'Hover', 'Active', 'Enabled', 'Visible',
					'Selected', 'Playing', 'Paused', 'Muted', 'Loading', 'Error'
				];
				
				commonBooleans.forEach(name => {
					try {
						const bool = vm.boolean(name);
						if (bool) {
							inputs.push({ name, input: bool });
						}
					} catch (e) {
						// Input doesn't exist, continue
					}
				});
			}
			return inputs;
		},
		testInput: (input, name) => {
			try {
				const currentValue = input.value;
				input.value = !currentValue;
				const newValue = input.value;
				return { 
					success: true, 
					method: 'value toggle',
					details: `${currentValue} → ${newValue}`
				};
			} catch (e) {
				return { success: false, reason: e.message };
			}
		}
	},
	
	numbers: {
		displayName: 'Number Inputs',
		windowPrefix: 'number_',
		getFromVM: (vm) => {
			const inputs = [];
			if (vm && typeof vm.number === 'function') {
				// Common number input names to try
				const commonNumbers = [
					'Speed', 'Volume', 'Progress', 'Value', 'Amount', 'Level',
					'Position', 'Rotation', 'Scale', 'Opacity', 'Size', 'Width', 'Height'
				];
				
				commonNumbers.forEach(name => {
					try {
						const num = vm.number(name);
						if (num) {
							inputs.push({ name, input: num });
						}
					} catch (e) {
						// Input doesn't exist, continue
					}
				});
			}
			return inputs;
		},
		testInput: (input, name) => {
			try {
				const currentValue = input.value;
				const testValue = currentValue === 0 ? 1 : currentValue * 1.1;
				input.value = testValue;
				const newValue = input.value;
				return { 
					success: true, 
					method: 'value change',
					details: `${currentValue} → ${newValue}`
				};
			} catch (e) {
				return { success: false, reason: e.message };
			}
		}
	},
	
	enums: {
		displayName: 'Enum Inputs',
		windowPrefix: 'enum_',
		getFromVM: (vm) => {
			const inputs = [];
			if (vm && typeof vm.enum === 'function') {
				// Common enum input names to try
				const commonEnums = [
					'State', 'States', 'Mode', 'Type', 'Style', 'Direction',
					'CTRL>States', 'EMOTE>Mode', 'UI>State'
				];
				
				commonEnums.forEach(name => {
					try {
						const enumInput = vm.enum(name);
						if (enumInput) {
							inputs.push({ name, input: enumInput });
						}
					} catch (e) {
						// Input doesn't exist, continue
					}
				});
			}
			return inputs;
		},
		testInput: (input, name) => {
			try {
				const currentValue = input.value;
				// Try to cycle through enum values
				const currentIndex = input.value;
				const nextIndex = (currentIndex + 1) % (input.options?.length || 2);
				input.value = nextIndex;
				const newValue = input.value;
				return { 
					success: true, 
					method: 'value cycle',
					details: `index ${currentIndex} → ${newValue}`
				};
			} catch (e) {
				return { success: false, reason: e.message };
			}
		}
	},
	
	// State Machine inputs (separate from ViewModel)
	stateMachineInputs: {
		displayName: 'State Machine Inputs',
		windowPrefix: 'sm_',
		getFromStateMachine: (stateMachine) => {
			const inputs = [];
			if (stateMachine && stateMachine.inputs) {
				stateMachine.inputs.forEach(input => {
					inputs.push({ name: input.name, input: input, type: input.type });
				});
			}
			return inputs;
		},
		testInput: (input, name) => {
			try {
				if (input.type === 'trigger') {
					input.fire();
					return { success: true, method: 'fire()' };
				} else if (input.type === 'boolean') {
					const currentValue = input.value;
					input.value = !currentValue;
					return { 
						success: true, 
						method: 'value toggle',
						details: `${currentValue} → ${!currentValue}`
					};
				} else if (input.type === 'number') {
					const currentValue = input.value;
					const testValue = currentValue + 1;
					input.value = testValue;
					return { 
						success: true, 
						method: 'value increment',
						details: `${currentValue} → ${testValue}`
					};
				}
				return { success: false, reason: 'Unknown input type: ' + input.type };
			} catch (e) {
				return { success: false, reason: e.message };
			}
		}
	}
};

/**
 * Enable comprehensive input debugging for all types
 */
function enableInputDebugging() {
	// Set input-specific debug levels
	const inputModules = {
		controlInterface: LogLevel.TRACE,
		dataConnector: LogLevel.TRACE,
		script_to_fix: LogLevel.TRACE,
		parser: LogLevel.DEBUG,
		parserHandler: LogLevel.INFO
	};
	
	Object.entries(inputModules).forEach(([module, level]) => {
		LoggerAPI.setModuleLevel(module, level);
	});
	
	console.log('🔍 Input debugging enabled for all relevant modules');
	console.log('💡 Input objects will be automatically exposed on window when discovered');
	console.log('💡 Use debugHelper.discoverInputs() to scan for all available inputs');
}

/**
 * Enhanced input discovery using RiveFormatterService
 */
function discoverAllInputsEnhanced() {
	console.group('🔍 Enhanced Input Discovery');
	
	const discovered = {
		riveInstances: [],
		viewModelInputs: [],
		stateMachineInputs: [],
		totalCount: 0
	};
	
	// Find all Rive instances
	const riveInstances = [
		window.riveInstanceGlobal,
		window.r,
		window.rive,
		window.riveInstance
	].filter(instance => instance && RiveFormatterService.isRiveInstance(instance));
	
	// Also search window for other potential Rive instances
	Object.keys(window).forEach(key => {
		const obj = window[key];
		if (obj && RiveFormatterService.isRiveInstance(obj) && !riveInstances.includes(obj)) {
			riveInstances.push(obj);
		}
	});
	
	discovered.riveInstances = riveInstances.map((instance, index) => `riveInstance_${index}`);
	
	if (riveInstances.length === 0) {
		console.log('❌ No Rive instances found');
		console.log('💡 Load a Rive file first to create an instance');
		console.groupEnd();
		return discovered;
	}
	
	console.log(`✅ Found ${riveInstances.length} Rive instances`);
	
	// Use RiveFormatterService to discover inputs from each instance
	riveInstances.forEach((riveInstance, index) => {
		console.group(`🎯 Analyzing Rive Instance ${index + 1}`);
		
		try {
			const inputs = RiveFormatterService.findInputs(riveInstance);
			
			if (inputs.viewModelInputs.length > 0) {
				console.log(`✅ Found ${inputs.viewModelInputs.length} view model inputs`);
				discovered.viewModelInputs.push(...inputs.viewModelInputs);
			}
			
			if (inputs.stateMachineInputs.length > 0) {
				console.log(`✅ Found ${inputs.stateMachineInputs.length} state machine inputs`);
				discovered.stateMachineInputs.push(...inputs.stateMachineInputs);
			}
			
			// Also discover assets for completeness
			const assets = RiveFormatterService.findAssets(riveInstance);
			const totalAssets = assets.images.length + assets.fonts.length + assets.audio.length + assets.others.length;
			if (totalAssets > 0) {
				console.log(`📦 Found ${totalAssets} assets (${assets.images.length} images, ${assets.fonts.length} fonts, ${assets.audio.length} audio, ${assets.others.length} others)`);
			}
			
		} catch (error) {
			console.warn(`❌ Error analyzing Rive instance ${index + 1}:`, error);
		}
		
		console.groupEnd();
	});
	
	// Expose discovered inputs on window for easy access
	discovered.viewModelInputs.forEach(inputData => {
		const prefix = getInputPrefix(inputData.type);
		const cleanName = inputData.name.replace(/[^a-zA-Z0-9_]/g, '_');
		const windowKey = `${prefix}${cleanName}`;
		window[windowKey] = inputData.input;
	});
	
	discovered.stateMachineInputs.forEach(inputData => {
		const cleanName = inputData.name.replace(/[^a-zA-Z0-9_]/g, '_');
		const windowKey = `sm_${cleanName}`;
		window[windowKey] = inputData.input;
	});
	
	discovered.totalCount = discovered.viewModelInputs.length + discovered.stateMachineInputs.length;
	
	if (discovered.totalCount > 0) {
		console.log(`✅ Total discovered: ${discovered.totalCount} inputs`);
		console.log('💡 Inputs exposed on window with prefixes: vm_, sm_, trigger_, bool_, num_');
	} else {
		console.log('❌ No inputs found in any Rive instances');
	}
	
	console.groupEnd();
	
	// Store discovered inputs for other functions
	window._discoveredInputs = discovered;
	
	return discovered;
}

/**
 * Get appropriate prefix for input type
 */
function getInputPrefix(inputType) {
	const prefixMap = {
		'triggers': 'trigger_',
		'booleans': 'bool_',
		'numbers': 'num_',
		'enums': 'enum_',
		'detected': 'vm_',
		'inputs': 'vm_',
		'_inputs': 'vm_'
	};
	return prefixMap[inputType] || 'vm_';
}

/**
 * Discover all available inputs of all types
 */
function discoverAllInputs() {
	// Use the enhanced discovery
	return discoverAllInputsEnhanced();
}

/**
 * List all discovered inputs with details
 */
function listAllInputs() {
	const discovered = window._discoveredInputs || discoverAllInputsEnhanced();
	
	console.group('📋 All Available Rive Inputs');
	
	let totalCount = 0;
	
	// ViewModel inputs
	if (discovered.viewModelInputs.length > 0) {
		console.group(`View Model Inputs (${discovered.viewModelInputs.length})`);
		discovered.viewModelInputs.forEach(inputData => {
			const prefix = getInputPrefix(inputData.type);
			const cleanName = inputData.name.replace(/[^a-zA-Z0-9_]/g, '_');
			const windowKey = `${prefix}${cleanName}`;
			console.log(`${inputData.name} (${inputData.type}) → window.${windowKey}`);
			totalCount++;
		});
		console.groupEnd();
	}
	
	// State Machine inputs
	if (discovered.stateMachineInputs.length > 0) {
		console.group(`State Machine Inputs (${discovered.stateMachineInputs.length})`);
		discovered.stateMachineInputs.forEach(inputData => {
			const cleanName = inputData.name.replace(/[^a-zA-Z0-9_]/g, '_');
			const windowKey = `sm_${cleanName}`;
			console.log(`${inputData.name} (${inputData.type}) → window.${windowKey}`);
			totalCount++;
		});
		console.groupEnd();
	}
	
	// List existing window objects with input prefixes
	const inputPrefixes = ['trigger_', 'bool_', 'num_', 'enum_', 'vm_', 'sm_'];
	const existingInputs = Object.keys(window).filter(key => 
		inputPrefixes.some(prefix => key.startsWith(prefix))
	);
	
	if (existingInputs.length > 0) {
		console.group(`Existing Window Objects (${existingInputs.length})`);
		existingInputs.forEach(key => {
			console.log(`window.${key}`);
		});
		console.groupEnd();
	}
	
	if (totalCount === 0) {
		console.log('❌ No inputs found. Load a Rive file with inputs first.');
		console.log('💡 Use debugHelper.discoverInputs() to scan for inputs');
	} else {
		console.log(`\n✅ Total: ${totalCount} inputs available for testing`);
	}
	
	console.groupEnd();
	return discovered;
}

/**
 * Test a specific input by name or window key
 */
function testInput(inputKey) {
	if (!inputKey) {
		console.error('Usage: debugHelper.testInput("input_name_or_window_key")');
		listAllInputs();
		return false;
	}
	
	// Find the input object
	let input = window[inputKey];
	let inputName = inputKey;
	let inputType = 'detected';
	
	// Determine input type from window key prefix
	const prefixes = {
		'trigger_': 'trigger',
		'bool_': 'boolean',
		'num_': 'number',
		'enum_': 'enum',
		'vm_': 'viewModel',
		'sm_': 'stateMachine'
	};
	
	for (const [prefix, type] of Object.entries(prefixes)) {
		if (inputKey.startsWith(prefix)) {
			inputType = type;
			inputName = inputKey.replace(prefix, '').replace(/_/g, ' ');
			break;
		}
	}
	
	if (!input) {
		console.error(`Input '${inputKey}' not found on window.`);
		listAllInputs();
		return false;
	}
	
	console.group(`🧪 Testing Input: ${inputName} (${inputType})`);
	console.log('Input object:', input);
	
	try {
		let result = { success: false, reason: 'No test method available' };
		
		// Try common testing patterns based on type and available methods
		if (typeof input.trigger === 'function') {
			input.trigger();
			result = { success: true, method: 'trigger()' };
		} else if (typeof input.fire === 'function') {
			input.fire();
			result = { success: true, method: 'fire()' };
		} else if (input.hasOwnProperty('value')) {
			const oldValue = input.value;
			if (typeof oldValue === 'boolean') {
				input.value = !oldValue;
				result = { success: true, method: 'value toggle', details: `${oldValue} → ${!oldValue}` };
			} else if (typeof oldValue === 'number') {
				input.value = oldValue + 1;
				result = { success: true, method: 'value increment', details: `${oldValue} → ${oldValue + 1}` };
			} else if (typeof oldValue === 'string') {
				input.value = oldValue + '_test';
				result = { success: true, method: 'value append', details: `"${oldValue}" → "${oldValue}_test"` };
			}
		} else if (typeof input.setValue === 'function') {
			// Try setValue method
			try {
				if (inputType === 'boolean' || inputType === 'trigger') {
					input.setValue(true);
					result = { success: true, method: 'setValue(true)' };
				} else if (inputType === 'number') {
					input.setValue(Math.random() * 100);
					result = { success: true, method: 'setValue(random)' };
				} else {
					input.setValue(true);
					result = { success: true, method: 'setValue(true)' };
				}
			} catch (setValueError) {
				result = { success: false, reason: `setValue failed: ${setValueError.message}` };
			}
		}
		
		if (result.success) {
			console.log(`✅ Test successful using ${result.method}`);
			if (result.details) {
				console.log(`📊 Change: ${result.details}`);
			}
		} else {
			console.error(`❌ Test failed: ${result.reason}`);
			console.log('Available properties:', Object.getOwnPropertyNames(input));
			console.log('Prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(input)));
		}
		
		return result.success;
	} catch (error) {
		console.error('❌ Error testing input:', error);
		return false;
	} finally {
		console.groupEnd();
	}
}

/**
 * Test all available inputs with staggered timing
 */
function testAllInputs() {
	const discovered = window._discoveredInputs || discoverAllInputsEnhanced();
	
	let allInputs = [];
	
	// Collect all view model inputs
	discovered.viewModelInputs.forEach(inputData => {
		const prefix = getInputPrefix(inputData.type);
		const cleanName = inputData.name.replace(/[^a-zA-Z0-9_]/g, '_');
		const windowKey = `${prefix}${cleanName}`;
		allInputs.push({ windowKey, name: inputData.name, type: inputData.type });
	});
	
	// Collect all state machine inputs
	discovered.stateMachineInputs.forEach(inputData => {
		const cleanName = inputData.name.replace(/[^a-zA-Z0-9_]/g, '_');
		const windowKey = `sm_${cleanName}`;
		allInputs.push({ windowKey, name: inputData.name, type: inputData.type });
	});
	
	if (allInputs.length === 0) {
		console.log('❌ No inputs available to test. Use debugHelper.discoverInputs() first.');
		return;
	}
	
	console.log(`🧪 Testing ${allInputs.length} inputs with 500ms delays...`);
	
	allInputs.forEach((inputInfo, index) => {
		setTimeout(() => {
			console.log(`\n--- Testing ${index + 1}/${allInputs.length}: ${inputInfo.name} ---`);
			testInput(inputInfo.windowKey);
		}, index * 500); // Stagger tests by 500ms
	});
}

/**
 * Add a new input type definition (for extensibility)
 */
function addInputType(typeName, definition) {
	if (!typeName || !definition) {
		console.error('Usage: debugHelper.addInputType("typeName", { displayName, windowPrefix, getFromVM, testInput })');
		return false;
	}
	
	// Store in a simple registry
	if (!window._customInputTypes) {
		window._customInputTypes = {};
	}
	
	window._customInputTypes[typeName] = definition;
	console.log(`✅ Added new input type: ${typeName}`);
	console.log('💡 Use debugHelper.discoverInputs() to scan for the new type');
	return true;
}

/**
 * Get all available input type definitions (for extension development)
 */
function getInputTypes() {
	console.group('🔧 Available Input Type Definitions');
	
	const builtInTypes = {
		'triggers': { displayName: 'Triggers', windowPrefix: 'trigger_' },
		'booleans': { displayName: 'Boolean Inputs', windowPrefix: 'bool_' },
		'numbers': { displayName: 'Number Inputs', windowPrefix: 'num_' },
		'enums': { displayName: 'Enum Inputs', windowPrefix: 'enum_' },
		'viewModel': { displayName: 'View Model Inputs', windowPrefix: 'vm_' },
		'stateMachine': { displayName: 'State Machine Inputs', windowPrefix: 'sm_' }
	};
	
	console.group('Built-in Types');
	Object.entries(builtInTypes).forEach(([type, config]) => {
		console.group(config.displayName);
		console.log('Type key:', type);
		console.log('Window prefix:', config.windowPrefix);
		console.groupEnd();
	});
	console.groupEnd();
	
	const customTypes = window._customInputTypes || {};
	if (Object.keys(customTypes).length > 0) {
		console.group('Custom Types');
		Object.entries(customTypes).forEach(([type, config]) => {
			console.group(config.displayName || type);
			console.log('Type key:', type);
			console.log('Window prefix:', config.windowPrefix);
			console.log('Has VM getter:', !!config.getFromVM);
			console.log('Has test method:', !!config.testInput);
			console.groupEnd();
		});
		console.groupEnd();
	}
	
	console.groupEnd();
	return { builtInTypes, customTypes };
}

/**
 * Show comprehensive debug help
 */
function showDebugHelp() {
	console.log(`
🐛 ==========================================
   RIVE TESTER DEBUG HELPER - COMPREHENSIVE GUIDE
🐛 ==========================================

📊 LOG LEVEL SHORTCUTS:
  debugHelper.verbose()     - Set all modules to TRACE (most detailed)
  debugHelper.debug()       - Set all modules to DEBUG 
  debugHelper.normal()      - Set all modules to INFO (recommended)
  debugHelper.quiet()       - Set all modules to WARN (errors/warnings only)
  debugHelper.silent()      - Set all modules to ERROR (errors only)
  debugHelper.off()         - Disable all logging
  debugHelper.traceSingle("module") - Set specific module to TRACE

🎛️ PANEL CONTROLS:
  debugHelper.enable()      - Show debug controls panel
  debugHelper.disable()     - Hide debug controls panel  
  debugHelper.toggle()      - Toggle debug controls panel
  debugHelper.isEnabled()   - Check if debug controls are enabled

⚙️ SETTINGS & STATUS:
  debugHelper.currentSettings() - Show detailed current debug settings
  debugHelper.clearSettings()   - Clear all saved debug settings
  debugHelper.test()           - Test all debug modules

🔍 ENHANCED OBJECT FORMATTING & ANALYSIS:
  debugHelper.objectFormatter(obj)     - Enhanced object inspection with Rive detection
  debugHelper.manualAssetSearch(rive)  - Deep asset search and analysis
  debugHelper.exploreObject(obj)       - Deep object explorer with Rive intelligence

🔍 COMPREHENSIVE INPUT DISCOVERY & TESTING:
  debugHelper.enableInputDebug()  - Enable debugging for all input types
  debugHelper.discoverInputs()    - Discover all available Rive inputs (enhanced)
  debugHelper.listInputs()        - List all discovered inputs with details
  debugHelper.listAllInputs()     - Same as listInputs() (alias)
  debugHelper.testInput("name")   - Test specific input by name or window key
  debugHelper.testAllInputs()     - Test all discovered inputs automatically

🔧 EXTENSIBILITY & DEVELOPMENT:
  debugHelper.addInputType("name", config) - Add new input type definition
  debugHelper.getInputTypes()              - View all available input type definitions

📋 ENHANCED FEATURES:
  • Auto-detects Rive instances across window object
  • Deep asset map exploration with closure access attempts
  • Enhanced view model input discovery using multiple paths
  • State machine input detection from animator
  • Smart Rive instance detection with comprehensive property checking
  • Specialized formatting for different asset types
  • Automatic window exposure with logical prefixes

🔧 API ACCESS:
  debugHelper.api.setModuleLevel("module", level) - Set specific module level
  debugHelper.api.setAllLevels(level)            - Set all modules to level
  debugHelper.api.enable(true/false)             - Enable/disable global logging
  debugHelper.api.isEnabled()                    - Check global logging state

📖 HELP & COMMANDS:
  debugHelper.help()      - Show this help guide
  debugHelper.commands()  - List all available commands

🚀 QUICK START:
  1. Load a Rive file with inputs/assets
  2. debugHelper.discoverInputs()        - Scan for all inputs (enhanced)
  3. debugHelper.objectFormatter(window.riveInstanceGlobal) - Analyze Rive instance
  4. debugHelper.manualAssetSearch(window.riveInstanceGlobal) - Find all assets
  5. debugHelper.listInputs()            - See what inputs were found
  6. debugHelper.testInput("name")       - Test specific inputs
  7. debugHelper.testAllInputs()         - Test everything

💡 OBJECT ANALYSIS EXAMPLES:
  // Analyze any Rive instance
  debugHelper.objectFormatter(window.riveInstanceGlobal)
  
  // Deep exploration with Rive intelligence
  debugHelper.exploreObject(window.riveInstanceGlobal)
  
  // Find assets with closure access attempts
  debugHelper.manualAssetSearch(window.riveInstanceGlobal)

💡 INPUT DISCOVERY EXAMPLES:
  // Enhanced discovery using RiveFormatterService
  const discovered = debugHelper.discoverInputs()
  
  // Test specific input types
  debugHelper.testInput("trigger_myTrigger")
  debugHelper.testInput("bool_myBoolean")
  debugHelper.testInput("sm_stateMachineInput")

💡 INPUT PREFIXES (Auto-exposed on window):
  • View Model Triggers: window.trigger_*
  • View Model Booleans: window.bool_*
  • View Model Numbers: window.num_*
  • View Model Enums: window.enum_*
  • View Model Others: window.vm_*
  • State Machine: window.sm_*
  
💡 TIPS:
  - Enhanced asset detection with deep traversal and closure scope attempts
  - View model input discovery using user-specified paths plus fallbacks
  - Smart Rive instance detection across all window properties
  - All input types are discovered automatically from live Rive instances
  - Objects are exposed on window for easy console access
  - Enhanced formatter provides 10+ organized analysis sections
  - Asset explorer shows detailed asset information including CDN UUIDs
  - Manual asset search helps troubleshoot hard-to-find data

💡 TIP: Use debugHelper.commands() for a quick list of all methods
	`);
}

/**
 * List all available commands in debugHelper
 */
function listAllCommands() {
	const helper = window.debugHelper;
	if (!helper) {
		console.error('debugHelper not available');
		return;
	}

	console.group('🐛 All Available debugHelper Commands');

	const commands = {
		'📊 Log Level Shortcuts': [
			'verbose()', 'debug()', 'normal()', 'quiet()', 'silent()', 'off()', 'traceSingle("module")'
		],
		'🎛️ Panel Controls': [
			'enable()', 'disable()', 'toggle()', 'isEnabled()'
		],
		'⚙️ Settings & Status': [
			'currentSettings()', 'clearSettings()', 'test()'
		],
		'🔍 Enhanced Object Formatting & Analysis': [
			'objectFormatter(obj)', 'manualAssetSearch(rive)', 'exploreObject(obj)'
		],
		'🔍 Comprehensive Input Discovery & Testing': [
			'enableInputDebug()', 'discoverInputs()', 'listInputs()', 'listAllInputs()',
			'testInput("name")', 'testAllInputs()'
		],
		'🔧 Extensibility & Development': [
			'addInputType("name", config)', 'getInputTypes()'
		],
		'🔧 API Access': [
			'api.setModuleLevel("module", level)', 'api.setAllLevels(level)',
			'api.enable(true/false)', 'api.isEnabled()'
		],
		'📖 Help & Commands': [
			'help()', 'commands()'
		]
	};

	Object.entries(commands).forEach(([category, commandList]) => {
		console.group(`${category}:`);
		commandList.forEach(cmd => {
			const funcName = cmd.split('(')[0];
			const isAvailable = typeof helper[funcName] === 'function';
			const status = isAvailable ? '✅' : '❌';
			console.log(`${status} debugHelper.${cmd}`);
		});
		console.groupEnd();
	});

	console.groupEnd();
	console.log('\n💡 Usage: debugHelper.functionName()');
	console.log('📖 For detailed help: debugHelper.help()');
}

// === LEGACY TRIGGER DEBUGGING FUNCTIONS (for backwards compatibility) ===

/**
 * Enable comprehensive trigger debugging (legacy)
 */
function enableTriggerDebugging() {
	console.warn('⚠️ enableTriggerDebug() is deprecated. Use enableInputDebug() instead.');
	enableInputDebugging();
}

/**
 * List all trigger objects currently exposed on window (legacy)
 */
function listTriggers() {
	console.warn('⚠️ listTriggers() is deprecated. Use listAllInputs() for all input types.');
	const triggers = Object.keys(window).filter(key => 
		key.startsWith('trigger_') || key.startsWith('firing_trigger_')
	);
	
	console.group('🎯 Available Trigger Objects (Legacy View)');
	if (triggers.length === 0) {
		console.log('No trigger objects found. Use debugHelper.discoverInputs() for comprehensive scanning.');
	} else {
		triggers.forEach(key => {
			console.log(`${key}:`, window[key]);
		});
	}
	console.groupEnd();
	return triggers;
}

/**
 * Test a specific trigger (legacy)
 */
function testTrigger(triggerKey) {
	console.warn('⚠️ testTrigger() is deprecated. Use testInput() instead.');
	return testInput(triggerKey);
}

/**
 * Test all available triggers (legacy)
 */
function testAllTriggers() {
	console.warn('⚠️ testAllTriggers() is deprecated. Use testAllInputs() instead.');
	testAllInputs();
}

// Initialize the debug controls when this module is imported
try {
	if (
		document.readyState === "complete" ||
		document.readyState === "interactive"
	) {
		initDebugControls();
	} else {
		document.addEventListener("DOMContentLoaded", initDebugControls, { passive: true });
	}
} catch (error) {
	// Silently handle initialization errors
}
