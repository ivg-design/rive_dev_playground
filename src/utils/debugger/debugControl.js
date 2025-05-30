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
			
			// === COMPREHENSIVE INPUT DEBUGGING ===
			enableInputDebug: enableInputDebugging,
			discoverInputs: discoverAllInputs,
			listInputs: listAllInputs,
			listAllInputs: listAllInputs,
			testInput: testInput,
			testAllInputs: testAllInputs,
			addInputType: addInputType,
			getInputTypes: getInputTypes,
			
			// === LEGACY TRIGGER DEBUGGING (backwards compatibility) ===
			enableTriggerDebug: enableTriggerDebugging,
			listTriggers: listTriggers,
			testTrigger: testTrigger,
			testAllTriggers: testAllTriggers,
			
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
			
			// === COMPREHENSIVE INPUT DEBUGGING ===
			enableInputDebug: enableInputDebugging,
			discoverInputs: discoverAllInputs,
			listInputs: listAllInputs,
			listAllInputs: listAllInputs,
			testInput: testInput,
			testAllInputs: testAllInputs,
			addInputType: addInputType,
			getInputTypes: getInputTypes,
			
			// === LEGACY TRIGGER DEBUGGING (backwards compatibility) ===
			enableTriggerDebug: enableTriggerDebugging,
			listTriggers: listTriggers,
			testTrigger: testTrigger,
			testAllTriggers: testAllTriggers,
			
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
 * Discover all available inputs of all types
 */
function discoverAllInputs() {
	console.group('🔍 Discovering All Rive Inputs');
	
	const discovered = {
		viewModel: {},
		stateMachine: {},
		windowObjects: {}
	};
	
	// Discover ViewModel inputs
	if (window.vm || window.stageVM) {
		const vm = window.vm || window.stageVM;
		console.log('📋 Scanning ViewModel inputs...');
		
		Object.entries(RIVE_INPUT_TYPES).forEach(([type, config]) => {
			if (config.getFromVM) {
				try {
					const inputs = config.getFromVM(vm);
					if (inputs.length > 0) {
						discovered.viewModel[type] = inputs;
						console.log(`  ✅ Found ${inputs.length} ${config.displayName.toLowerCase()}`);
						
						// Expose on window for easy access
						inputs.forEach((inputData, index) => {
							const name = inputData.name || inputData;
							const windowKey = `${config.windowPrefix}${name.replace(/[^a-zA-Z0-9_]/g, '_')}`;
							window[windowKey] = inputData.input || inputData;
						});
					} else {
						console.log(`  ⚪ No ${config.displayName.toLowerCase()} found`);
					}
				} catch (e) {
					console.warn(`  ❌ Error scanning ${config.displayName}:`, e);
				}
			}
		});
	} else {
		console.log('⚠️ No ViewModel found (window.vm or window.stageVM)');
	}
	
	// Discover State Machine inputs
	if (window.r || window.rive || window.riveInstance) {
		const rive = window.r || window.rive || window.riveInstance;
		console.log('🎰 Scanning State Machine inputs...');
		
		try {
			// Try to access state machines
			if (rive.stateMachines || rive.stateMachine) {
				const stateMachines = rive.stateMachines || [rive.stateMachine];
				stateMachines.forEach((sm, smIndex) => {
					const smInputs = RIVE_INPUT_TYPES.stateMachineInputs.getFromStateMachine(sm);
					if (smInputs.length > 0) {
						discovered.stateMachine[`sm_${smIndex}`] = smInputs;
						console.log(`  ✅ Found ${smInputs.length} inputs in state machine ${smIndex}`);
						
						// Expose on window
						smInputs.forEach(inputData => {
							const windowKey = `sm_${inputData.name.replace(/[^a-zA-Z0-9_]/g, '_')}`;
							window[windowKey] = inputData.input;
						});
					}
				});
			}
		} catch (e) {
			console.warn('  ❌ Error scanning State Machine:', e);
		}
	} else {
		console.log('⚠️ No Rive instance found (window.r, window.rive, or window.riveInstance)');
	}
	
	// List existing window objects
	const existingInputs = Object.keys(window).filter(key => 
		Object.values(RIVE_INPUT_TYPES).some(config => 
			config.windowPrefix && key.startsWith(config.windowPrefix)
		)
	);
	
	if (existingInputs.length > 0) {
		discovered.windowObjects = existingInputs;
		console.log(`📦 Found ${existingInputs.length} existing input objects on window`);
	}
	
	console.groupEnd();
	
	// Store discovered inputs for other functions
	window._discoveredInputs = discovered;
	
	return discovered;
}

/**
 * List all discovered inputs with details
 */
function listAllInputs() {
	const discovered = window._discoveredInputs || discoverAllInputs();
	
	console.group('📋 All Available Rive Inputs');
	
	let totalCount = 0;
	
	// ViewModel inputs
	Object.entries(discovered.viewModel).forEach(([type, inputs]) => {
		const config = RIVE_INPUT_TYPES[type];
		if (inputs.length > 0) {
			console.group(`${config.displayName} (${inputs.length})`);
			inputs.forEach(inputData => {
				const name = inputData.name || inputData;
				const windowKey = `${config.windowPrefix}${name.replace(/[^a-zA-Z0-9_]/g, '_')}`;
				console.log(`${name} → window.${windowKey}`);
				totalCount++;
			});
			console.groupEnd();
		}
	});
	
	// State Machine inputs
	Object.entries(discovered.stateMachine).forEach(([smKey, inputs]) => {
		if (inputs.length > 0) {
			console.group(`State Machine Inputs (${inputs.length})`);
			inputs.forEach(inputData => {
				const windowKey = `sm_${inputData.name.replace(/[^a-zA-Z0-9_]/g, '_')}`;
				console.log(`${inputData.name} (${inputData.type}) → window.${windowKey}`);
				totalCount++;
			});
			console.groupEnd();
		}
	});
	
	// Window objects
	if (discovered.windowObjects?.length > 0) {
		console.group(`Existing Window Objects (${discovered.windowObjects.length})`);
		discovered.windowObjects.forEach(key => {
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
	let inputType = null;
	
	// Determine input type from window key prefix
	for (const [type, config] of Object.entries(RIVE_INPUT_TYPES)) {
		if (config.windowPrefix && inputKey.startsWith(config.windowPrefix)) {
			inputType = type;
			inputName = inputKey.replace(config.windowPrefix, '').replace(/_/g, ' ');
			break;
		}
	}
	
	if (!input) {
		console.error(`Input '${inputKey}' not found on window.`);
		listAllInputs();
		return false;
	}
	
	console.group(`🧪 Testing Input: ${inputName} (${inputType || 'unknown'})`);
	console.log('Input object:', input);
	
	try {
		let result = { success: false, reason: 'No test method available' };
		
		if (inputType && RIVE_INPUT_TYPES[inputType]?.testInput) {
			result = RIVE_INPUT_TYPES[inputType].testInput(input, inputName);
		} else {
			// Try common testing patterns
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
				}
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
	const discovered = window._discoveredInputs || discoverAllInputs();
	
	let allInputs = [];
	
	// Collect all inputs
	Object.entries(discovered.viewModel).forEach(([type, inputs]) => {
		const config = RIVE_INPUT_TYPES[type];
		inputs.forEach(inputData => {
			const name = inputData.name || inputData;
			const windowKey = `${config.windowPrefix}${name.replace(/[^a-zA-Z0-9_]/g, '_')}`;
			allInputs.push({ windowKey, name, type });
		});
	});
	
	Object.entries(discovered.stateMachine).forEach(([smKey, inputs]) => {
		inputs.forEach(inputData => {
			const windowKey = `sm_${inputData.name.replace(/[^a-zA-Z0-9_]/g, '_')}`;
			allInputs.push({ windowKey, name: inputData.name, type: 'stateMachine' });
		});
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
	
	RIVE_INPUT_TYPES[typeName] = definition;
	console.log(`✅ Added new input type: ${typeName}`);
	console.log('💡 Use debugHelper.discoverInputs() to scan for the new type');
	return true;
}

/**
 * Get all available input type definitions (for extension development)
 */
function getInputTypes() {
	console.group('🔧 Available Input Type Definitions');
	Object.entries(RIVE_INPUT_TYPES).forEach(([type, config]) => {
		console.group(config.displayName);
		console.log('Type key:', type);
		console.log('Window prefix:', config.windowPrefix);
		console.log('Has VM getter:', !!config.getFromVM);
		console.log('Has test method:', !!config.testInput);
		console.groupEnd();
	});
	console.groupEnd();
	return RIVE_INPUT_TYPES;
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

🔍 COMPREHENSIVE INPUT DISCOVERY & TESTING:
  debugHelper.enableInputDebug()  - Enable debugging for all input types
  debugHelper.discoverInputs()    - Discover all available Rive inputs
  debugHelper.listInputs()        - List all discovered inputs with details
  debugHelper.listAllInputs()     - Same as listInputs() (alias)
  debugHelper.testInput("name")   - Test specific input by name or window key
  debugHelper.testAllInputs()     - Test all discovered inputs automatically

🔧 EXTENSIBILITY & DEVELOPMENT:
  debugHelper.addInputType("name", config) - Add new input type definition
  debugHelper.getInputTypes()              - View all available input type definitions

📋 SUPPORTED INPUT TYPES:
  • Triggers (ViewModel & State Machine)
  • Boolean Inputs (ViewModel & State Machine)  
  • Number Inputs (ViewModel & State Machine)
  • Enum Inputs (ViewModel)
  • Custom Types (via addInputType)

🔥 LEGACY TRIGGER DEBUGGING (backwards compatibility):
  debugHelper.enableTriggerDebug() - Enable trigger debugging (deprecated)
  debugHelper.listTriggers()       - List trigger objects (deprecated)
  debugHelper.testTrigger("name")  - Test specific trigger (deprecated)
  debugHelper.testAllTriggers()    - Test all triggers (deprecated)

🔧 API ACCESS:
  debugHelper.api.setModuleLevel("module", level) - Set specific module level
  debugHelper.api.setAllLevels(level)            - Set all modules to level
  debugHelper.api.enable(true/false)             - Enable/disable global logging
  debugHelper.api.isEnabled()                    - Check global logging state

📖 HELP & COMMANDS:
  debugHelper.help()      - Show this help guide
  debugHelper.commands()  - List all available commands

🚀 QUICK START:
  1. Load a Rive file with inputs
  2. debugHelper.discoverInputs()  - Scan for all inputs
  3. debugHelper.listInputs()      - See what was found
  4. debugHelper.testInput("name") - Test specific inputs
  5. debugHelper.testAllInputs()   - Test everything

💡 EXTENSIBILITY EXAMPLE:
  // Add support for new Rive input type
  debugHelper.addInputType("myNewType", {
    displayName: "My New Input Type",
    windowPrefix: "mynew_",
    getFromVM: (vm) => { /* discovery logic */ },
    testInput: (input, name) => { /* test logic */ }
  });

💡 INPUT TYPES ARE AUTOMATICALLY EXPOSED ON WINDOW:
  • Triggers: window.trigger_*
  • Booleans: window.boolean_*
  • Numbers: window.number_*
  • Enums: window.enum_*
  • State Machine: window.sm_*
  
💡 TIPS:
  - All input types are discovered automatically
  - Objects are exposed on window for easy console access
  - Legacy trigger functions still work for backwards compatibility
  - Add new input types as Rive adds functionality
  - Use enableInputDebug() to see detailed discovery logs
  - Input discovery works with both ViewModel and State Machine inputs
  - Test functions are staggered to avoid overwhelming the animation

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
		'🔍 Comprehensive Input Discovery & Testing': [
			'enableInputDebug()', 'discoverInputs()', 'listInputs()', 'listAllInputs()',
			'testInput("name")', 'testAllInputs()'
		],
		'🔧 Extensibility & Development': [
			'addInputType("name", config)', 'getInputTypes()'
		],
		'🔥 Legacy Trigger Debugging': [
			'enableTriggerDebug() [deprecated]', 'listTriggers() [deprecated]',
			'testTrigger("name") [deprecated]', 'testAllTriggers() [deprecated]'
		],
		'🔧 API Access': [
			'api.setModuleLevel("module", level)', 'api.setAllLevels(level)',
			'api.enable(true/false)', 'api.isEnabled()'
		],
		'📖 Help & Commands': [
			'help()', 'commands()'
		]
	};

	Object.entries(commands).forEach(([category, funcs]) => {
		console.group(category);
		funcs.forEach(func => {
			const funcName = func.split('(')[0];
			const hasFunc = typeof helper[funcName] === 'function' || 
			               (funcName.includes('.') && typeof helper.api?.[funcName.split('.')[1]] === 'function');
			const status = hasFunc ? '✅' : '❌';
			console.log(`${status} debugHelper.${func}`);
		});
		console.groupEnd();
	});

	console.log('\n💡 SUPPORTED INPUT TYPES:');
	console.log('• Triggers (ViewModel & State Machine)');
	console.log('• Boolean Inputs (ViewModel & State Machine)');
	console.log('• Number Inputs (ViewModel & State Machine)');
	console.log('• Enum Inputs (ViewModel)');
	console.log('• Custom Types (via addInputType)');

	console.log('\n💡 AUTO-EXPOSED WINDOW OBJECTS:');
	console.log('• window.trigger_* (Triggers)');
	console.log('• window.boolean_* (Boolean inputs)');
	console.log('• window.number_* (Number inputs)');
	console.log('• window.enum_* (Enum inputs)');
	console.log('• window.sm_* (State Machine inputs)');

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
		document.addEventListener("DOMContentLoaded", initDebugControls);
	}
} catch (error) {
	// Silently handle initialization errors
}
