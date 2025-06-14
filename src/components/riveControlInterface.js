/**
 * @file riveControlInterface.js
 * Handles the creation and management of dynamic UI controls for interacting
 * with live Rive animations (State Machine inputs, ViewModel properties).
 */

import { processDataForControls } from "./dataToControlConnector.js";
import { createLogger, LoggerAPI } from "../utils/debugger/debugLogger.js";
import { setAssetMap } from "./assetManager.js";
import { 
	formatRiveEvent, 
	shouldLogEvent,
	getEventCategoryColor 
} from "../utils/riveEventMapper.js";

// Expose LoggerAPI globally for debugging
window.LoggerAPI = LoggerAPI;

// Create a logger for this module
const logger = createLogger("controlInterface");

// To store a reference to the live Rive instance and parsed data if needed globally within this module
let riveInstance = null;
let parsedRiveData = null;
let dynamicControlsInitialized = false;
let structuredControlData = null; // Will store the processed data from dataToControlConnector
let uiUpdateInterval = null; // <<< ADDED: For polling interval ID
// Event logging configuration
let displayRiveEvents = false; // Track whether to display Rive events in status bar - DEFAULT OFF
let logCustomEvents = false; // Track whether to log custom Rive events - DEFAULT OFF
let logStateChangeEvents = false; // Track whether to log state change events - DEFAULT OFF
let logNestedViewModelEvents = false; // Track whether to log nested ViewModel events - DEFAULT OFF
let logPlaybackEvents = false; // Track whether to log playback events (Play, Pause, Stop, Loop) - DEFAULT OFF
let logSystemEvents = false; // Track whether to log system events - DEFAULT OFF
let logFrameEvents = false; // Track whether to log frame-level events (Draw, Advance) - DEFAULT OFF
let eventConsoleMessages = []; // Store event console messages

// Performance monitoring configuration
let fpsCounterEnabled = false; // Track whether FPS counter is enabled - DEFAULT OFF

// Event throttling to prevent browser crashes
let eventThrottleMap = new Map(); // Track last event time by type
const EVENT_THROTTLE_MS = 100; // Minimum time between same event types
const MAX_EVENTS_PER_SECOND = 50; // Maximum events per second
const EMERGENCY_SHUTDOWN_THRESHOLD = 200; // Emergency shutdown if events exceed this
let eventCount = 0;
let eventCountResetTime = Date.now();
let emergencyShutdown = false;

// Store the Rive engine reference globally if needed, or pass it around
// For simplicity, assuming window.rive is available as in other files.
const RiveEngine = window.rive;

/* ---------- helpers (adapted from exampleIndex.mjs) ------------------ */
const argbToHex = (a) => {
	if (typeof a !== "number") return "#000000"; // Default or error color
	return "#" + (a & 0xffffff).toString(16).padStart(6, "0").toUpperCase();
};
const hexToArgb = (h) => {
	if (!h || typeof h !== "string" || !h.startsWith("#")) return 0; // Default or error value
	return parseInt("FF" + h.slice(1), 16) | 0; // Ensure it's an integer
};

const makeRow = (label, el, notes = "", dataPath = null) => {
	const row = document.createElement("div");
	row.className = "control-row";
	if (dataPath) {
		row.setAttribute("data-property-path", dataPath);
	}
	const lab = document.createElement("label");
	lab.textContent = label;
	row.appendChild(lab);
	row.appendChild(el);
	if (notes) {
		const noteSpan = document.createElement("span");
		noteSpan.className = "control-notes";
		noteSpan.textContent = ` (${notes})`;
		lab.appendChild(noteSpan); // Append notes to the label for better layout
	}
	return row;
};

// If fmt is not available, we can use a simpler log or JSON.stringify
function simpleFmt(val) {
	if (val === undefined || val === null) return "";
	if (typeof val === "string") return val;
	if (Array.isArray(val)) return val.join(", ");
	// Basic object check, could be more robust like the original fmt
	if (typeof val === "object" && val.name) return val.name;
	if (typeof val === "object" && Array.isArray(val.data))
		return val.data.join(", ");
	try {
		return JSON.stringify(val);
	} catch {
		return String(val);
	}
}

function handleConstructorStateChange(sm, st) {
	logger.debug("onStateChange Fired");
	logger.debug("SM:", simpleFmt(sm));
	logger.debug("ST:", simpleFmt(st));
	
	// Log the state change event
	logRiveEvent("StateChange", { 
		stateMachine: simpleFmt(sm), 
		state: simpleFmt(st) 
	});
	
	// Call updateControlsFromRive() to sync UI based on state machine changes.
	logger.debug("onStateChange: Calling updateControlsFromRive()");
	updateControlsFromRive();
}

/**
 * Logs a Rive event to both status bar and event console if enabled
 * @param {string} eventType - The type of Rive event
 * @param {Object} eventData - The event data object
 */
function logRiveEvent(eventType, eventData) {
	if (!displayRiveEvents || emergencyShutdown) return;
	
	// Event throttling to prevent browser crashes
	const now = Date.now();
	
	// Reset event count every second
	if (now - eventCountResetTime > 1000) {
		eventCount = 0;
		eventCountResetTime = now;
		// Reset emergency shutdown after 5 seconds
		if (emergencyShutdown && (now - eventCountResetTime) > 5000) {
			emergencyShutdown = false;
			logger.warn("[controlInterface] Event logging re-enabled after emergency shutdown");
		}
	}
	
	// Emergency shutdown if events are completely out of control
	if (eventCount >= EMERGENCY_SHUTDOWN_THRESHOLD) {
		emergencyShutdown = true;
		logger.error("[controlInterface] EMERGENCY SHUTDOWN: Too many events detected, disabling event logging");
		displayRiveEvents = false; // Also disable the main toggle
		// Update the checkbox
		const checkbox = document.getElementById("displayRiveEventsCheckbox");
		if (checkbox) checkbox.checked = false;
		return;
	}
	
	// Check if we're exceeding the maximum events per second
	if (eventCount >= MAX_EVENTS_PER_SECOND) {
		return;
	}
	
	// Throttle specific event types
	const eventKey = `${eventType}_${JSON.stringify(eventData)}`;
	const lastEventTime = eventThrottleMap.get(eventKey);
	if (lastEventTime && (now - lastEventTime) < EVENT_THROTTLE_MS) {
		return;
	}
	eventThrottleMap.set(eventKey, now);
	
	// Clean up old throttle entries (keep only last 100)
	if (eventThrottleMap.size > 100) {
		const entries = Array.from(eventThrottleMap.entries());
		entries.sort((a, b) => b[1] - a[1]); // Sort by time, newest first
		eventThrottleMap.clear();
		entries.slice(0, 50).forEach(([key, time]) => {
			eventThrottleMap.set(key, time);
		});
	}
	
	eventCount++;
	
	// Check if this event type should be logged using the mapper
	if (!shouldLogEvent(eventType, logCustomEvents, logStateChangeEvents, logNestedViewModelEvents, logPlaybackEvents, logSystemEvents, logFrameEvents, eventData)) {
		return;
	}
	
	// Format the event using the comprehensive mapper
	const formattedEvent = formatRiveEvent(eventType, eventData, structuredControlData);
	
	// Add to event console at the beginning (latest on top)
	eventConsoleMessages.unshift(formattedEvent.consoleMessage);
	
	// Limit console messages to last 100 entries
	if (eventConsoleMessages.length > 100) {
		eventConsoleMessages.pop();
	}
	
	// Update event console if it exists
	updateEventConsole();
	
	// Display in status bar
	const statusMessageDiv = document.getElementById("statusMessage");
	if (statusMessageDiv) {
		statusMessageDiv.textContent = formattedEvent.statusMessage;
		
		// Clear the message after 3 seconds
		setTimeout(() => {
			if (statusMessageDiv.textContent.includes(formattedEvent.statusMessage)) {
				statusMessageDiv.textContent = "Ready";
			}
		}, 3000);
	}
	
	// Log detailed information for debugging
	logger.debug(`[Event] ${formattedEvent.detailedMessage}`);
}

/**
 * Updates the event console display with scrolling text support
 */
function updateEventConsole() {
	const consoleElement = document.getElementById('eventConsoleContent');
	if (consoleElement) {
		// Clear existing content
		consoleElement.innerHTML = '';
		
		// Create structured HTML for each message
		eventConsoleMessages.forEach(message => {
			const messageDiv = document.createElement('div');
			messageDiv.className = 'event-message';
			
			// Extract timestamp and text
			const timestampMatch = message.match(/^\[([^\]]+)\]/);
			const timestamp = timestampMatch ? timestampMatch[1] : '';
			const text = timestampMatch ? message.substring(timestampMatch[0].length + 1) : message;
			
			// Create timestamp element
			const timestampSpan = document.createElement('span');
			timestampSpan.className = 'event-timestamp';
			timestampSpan.textContent = `[${timestamp}]`;
			
			// Create text element
			const textDiv = document.createElement('div');
			textDiv.className = 'event-text';
			
			const textContent = document.createElement('span');
			textContent.className = 'event-text-content';
			textContent.textContent = text;
			
			textDiv.appendChild(textContent);
			
			// Check if text is too long and needs scrolling
			setTimeout(() => {
				const containerWidth = textDiv.offsetWidth;
				const textWidth = textContent.offsetWidth;
				
				if (textWidth > containerWidth) {
					textDiv.classList.add('scrolling');
				}
			}, 10);
			
			messageDiv.appendChild(timestampSpan);
			messageDiv.appendChild(textDiv);
			consoleElement.appendChild(messageDiv);
		});
		
		// Keep scroll at top since latest messages are at the top
		consoleElement.scrollTop = 0;
	}
}

/**
 * Clears the event console
 */
function clearEventConsole() {
	eventConsoleMessages.length = 0;
	updateEventConsole();
	logger.info("[controlInterface] Event console cleared");
}

// Expose the clear function globally for the Golden Layout component
window.clearEventConsole = clearEventConsole;

// Expose the logRiveEvent function globally for other modules
window.logRiveEvent = logRiveEvent;

/**
 * Emergency reset function for event system
 */
function resetEventSystem() {
	emergencyShutdown = false;
	eventCount = 0;
	eventCountResetTime = Date.now();
	eventThrottleMap.clear();
	eventConsoleMessages.length = 0;
	updateEventConsole();
	logger.info("[controlInterface] Event system reset");
}

// Expose reset function globally
window.resetEventSystem = resetEventSystem;

/**
 * Shows the event logging help popup
 */
function showEventLoggingHelp() {
	// Remove existing popup if any
	const existingPopup = document.getElementById('eventLoggingHelpPopup');
	if (existingPopup) {
		existingPopup.remove();
	}

	// Create popup overlay
	const overlay = document.createElement('div');
	overlay.id = 'eventLoggingHelpPopup';
	overlay.className = 'help-popup-overlay';
	
	// Create popup content
	const popup = document.createElement('div');
	popup.className = 'help-popup';
	
	popup.innerHTML = `
		<div class="help-popup-header">
			<h3>🎯 Rive Event Logging Help</h3>
			<button class="help-popup-close" id="closeHelpPopup">&times;</button>
		</div>
		<div class="help-popup-content">
			<p><strong>Events are displayed in the status bar and logged to the Event Console panel.</strong></p>
			
			<div class="help-section">
				<h4>🎨 Custom Events</h4>
				<p>User-defined events from your Rive file. These are events you create in the Rive editor.</p>
			</div>
			
			<div class="help-section">
				<h4>🔄 State Change Events</h4>
				<p>Include state transitions, input value changes, and ViewModel property changes in the main artboard.</p>
			</div>
			
			<div class="help-section">
				<h4>🏗️ Nested ViewModel Events</h4>
				<p>Track property changes in nested ViewModels within your Rive file.</p>
			</div>
			
			<div class="help-section">
				<h4>▶️ Playback Events</h4>
				<p>Include Play, Pause, Stop, and Loop events for animations and state machines.</p>
			</div>
			
			<div class="help-section">
				<h4>⚙️ System Events</h4>
				<p>Include Load and LoadError events from the Rive runtime.</p>
			</div>
			
			<div class="help-tip">
				<strong>💡 Tip:</strong> Use the Event Console panel to view detailed event logs with timestamps and full event data.
			</div>
		</div>
	`;
	
	overlay.appendChild(popup);
	document.body.appendChild(overlay);
	
	// Add event listeners
	const closeBtn = popup.querySelector('#closeHelpPopup');
	const closePopup = () => {
		document.removeEventListener('keydown', handleKeyDown, { passive: true });
		overlay.remove();
	};
	
	closeBtn.addEventListener('click', closePopup);
	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) {
			closePopup();
		}
	});
	
	// Close on Escape key
	const handleKeyDown = (e) => {
		if (e.key === 'Escape') {
			closePopup();
		}
	};
	document.addEventListener('keydown', handleKeyDown, { passive: true });
	
	logger.info("[controlInterface] Event logging help popup displayed");
}

/**
 * Smart enum matching based on word similarity
 * @param {string} propertyName - The property name to match (e.g., "CTRL>Eye picker")
 * @param {Array} allEnums - Array of enum definitions
 * @returns {Array} Array of matching enum definitions
 */
function findSmartEnumMatches(propertyName, allEnums) {
	if (!propertyName || !allEnums || allEnums.length === 0) {
		return [];
	}

	// Extract meaningful words from the property name
	// Remove common prefixes/suffixes and split on common delimiters
	const cleanPropertyName = propertyName
		.replace(/^(CTRL>|SYS>|EMOTE>|STAT>)/i, "") // Remove common prefixes
		.replace(/(picker|selector|control|ctrl)$/i, "") // Remove common suffixes
		.trim();

	// Split into words and filter out short/common words
	const propertyWords = cleanPropertyName
		.split(/[\s>_-]+/)
		.map((word) => word.toLowerCase())
		.filter(
			(word) =>
				word.length > 2 &&
				!["the", "and", "for", "with"].includes(word),
		);

	logger.debug(
		`[Smart Enum Match] Property '${propertyName}' -> cleaned words: [${propertyWords.join(", ")}]`,
	);

	const matches = [];

	for (const enumDef of allEnums) {
		const enumName = enumDef.name || "";
		const enumWords = enumName
			.split(/[\s>_-]+/)
			.map((word) => word.toLowerCase())
			.filter((word) => word.length > 2);

		logger.debug(
			`[Smart Enum Match] Comparing '${propertyName}' words [${propertyWords.join(", ")}] with '${enumName}' words [${enumWords.join(", ")}]`,
		);

		// Check for word overlap with strict matching rules
		const commonWords = [];
		const matchDetails = [];

		for (const propWord of propertyWords) {
			for (const enumWord of enumWords) {
				let matched = false;
				let matchType = "";

				// Exact match is always good
				if (enumWord === propWord) {
					matched = true;
					matchType = "exact";
				} else if (enumWord.length >= 4 && propWord.length >= 4) {
					// For substring matching, both words must be reasonably long
					// and the match must be significant (not just a small part)
					const minLength = Math.min(
						enumWord.length,
						propWord.length,
					);
					const matchThreshold = Math.ceil(minLength * 0.7);

					if (
						enumWord.includes(propWord) &&
						propWord.length >= matchThreshold
					) {
						matched = true;
						matchType = `substring (${propWord} in ${enumWord}, ${propWord.length}/${minLength} chars)`;
					} else if (
						propWord.includes(enumWord) &&
						enumWord.length >= matchThreshold
					) {
						matched = true;
						matchType = `substring (${enumWord} in ${propWord}, ${enumWord.length}/${minLength} chars)`;
					}
				}

				if (matched && !commonWords.includes(propWord)) {
					commonWords.push(propWord);
					matchDetails.push(
						`${propWord}↔${enumWord} (${matchType})`,
					);
				}
			}
		}

		if (commonWords.length > 0) {
			logger.debug(
				`[Smart Enum Match] ✅ Match found between '${propertyName}' and '${enumName}': ${matchDetails.join(", ")}`,
			);
			matches.push(enumDef);
		} else {
			logger.debug(
				`[Smart Enum Match] ❌ No match between '${propertyName}' and '${enumName}'`,
			);
		}
	}

	return matches;
}

/**
 * Creates a control element for a specific property with direct reference to the live input
 * @param {Object} property The property object with name, type, and liveProperty reference
 * @param {Object} vmContext Optional context about the ViewModel this property belongs to
 * @return {HTMLElement} The control element
 */
function createControlForProperty(property, vmContext = null) {
	if (!property) {
		logger.warn("Cannot create control: Invalid property");
		return null;
	}

	// Check if this is a placeholder property (no live reference)
	const isPlaceholder = property.isPlaceholder || !property.liveProperty;
	const { name, type } = property;
	const liveProperty = property.liveProperty;

	logger.debug(
		`Creating control for ${type} property: ${name}, isPlaceholder: ${isPlaceholder}`,
	);

	let ctrl = null;

	try {
		switch (type) {
			case "string":
				ctrl = document.createElement("textarea");
				if (isPlaceholder) {
					ctrl.value = property.value || "";
					ctrl.disabled = true;
				} else {
					ctrl.value = liveProperty.value || "";

					ctrl.addEventListener("input", () => {
						const newValue = ctrl.value;
						logger.debug(
							`[App] Event: Attempting to set ${name} to:`,
							newValue,
						);
						liveProperty.value = newValue;
						
						// Log ViewModel property change
						logRiveEvent("ViewModelPropertyChanged", {
							property: name,
							type: type,
							value: newValue,
							viewModel: vmContext?.instanceName || vmContext?.blueprintName || "ViewModel",
							vmPath: vmContext?.path || "ViewModel",
							isNested: vmContext?.isNested || false,
							blueprintName: vmContext?.blueprintName
						});
					}, { passive: true });
				}
				break;

			case "boolean":
				ctrl = document.createElement("input");
				ctrl.type = "checkbox";
				if (isPlaceholder) {
					ctrl.checked = !!property.value;
					ctrl.disabled = true;
				} else {
					ctrl.checked = !!liveProperty.value;
					ctrl.addEventListener("change", () => {
						const newValue = ctrl.checked;
						logger.debug(
							`[App] Event: Attempting to set ${name} to:`,
							newValue,
						);
						liveProperty.value = newValue;
						
						// Log ViewModel property change
						logRiveEvent("ViewModelPropertyChanged", {
							property: name,
							type: type,
							value: newValue,
							viewModel: vmContext?.instanceName || vmContext?.blueprintName || "ViewModel",
							vmPath: vmContext?.path || "ViewModel",
							isNested: vmContext?.isNested || false,
							blueprintName: vmContext?.blueprintName
						});
					}, { passive: true });
				}
				break;

			case "number":
				ctrl = document.createElement("input");
				ctrl.type = "number";
				if (isPlaceholder) {
					ctrl.value = property.value || 0;
					ctrl.disabled = true;
				} else {
					ctrl.value = liveProperty.value || 0;
					ctrl.addEventListener("input", () => {
						const newValue = parseFloat(ctrl.value) || 0;
						logger.debug(
							`[App] Event: Attempting to set ${name} to:`,
							newValue,
						);
						liveProperty.value = newValue;
						
						// Log ViewModel property change
						logRiveEvent("ViewModelPropertyChanged", {
							property: name,
							type: type,
							value: newValue,
							viewModel: vmContext?.instanceName || vmContext?.blueprintName || "ViewModel",
							vmPath: vmContext?.path || "ViewModel",
							isNested: vmContext?.isNested || false,
							blueprintName: vmContext?.blueprintName
						});
					}, { passive: true });
				}
				break;

			case "color":
				ctrl = document.createElement("input");
				ctrl.type = "color";
				if (isPlaceholder) {
					// For placeholders, use the value directly if it's a string, otherwise use default
					ctrl.value =
						typeof property.value === "string"
							? property.value
							: "#000000";
					ctrl.disabled = true;
				} else {
					ctrl.value = argbToHex(liveProperty.value);
					ctrl.addEventListener("input", () => {
						const newValue = hexToArgb(ctrl.value);
						logger.debug(
							`[App] Event: Attempting to set ${name} (${ctrl.value}) to:`,
							newValue,
						);
						liveProperty.value = newValue;
						
						// Log ViewModel property change
						logRiveEvent("ViewModelPropertyChanged", {
							property: name,
							type: type,
							value: ctrl.value, // Use hex value for display
							viewModel: vmContext?.instanceName || vmContext?.blueprintName || "ViewModel",
							vmPath: vmContext?.path || "ViewModel",
							isNested: vmContext?.isNested || false,
							blueprintName: vmContext?.blueprintName
						});
					}, { passive: true });
				}
				break;

			case "enumType":
				ctrl = document.createElement("select");

				if (isPlaceholder) {
					const option = new Option(
						property.value || "Unknown",
						property.value || "",
					);
					ctrl.appendChild(option);
					ctrl.disabled = true;
				} else {
					if (
						riveInstance &&
						typeof riveInstance.enums === "function"
					) {
						const allEnums = riveInstance.enums();

						logger.debug(
							`[Enum Debug] Property Name: '${property.name}', enumTypeName: '${property.enumTypeName}'`,
						);
						logger.debug(
							`[Enum Debug] Available global enum names:`,
							allEnums.map((e) => e.name),
						);

						// NEW APPROACH: Get the actual enum type from the live property
						let enumDef = null;
						let actualEnumTypeName = null;

						// Try to get the enum type name from the live property itself
						if (
							liveProperty &&
							typeof liveProperty.enumType === "string"
						) {
							actualEnumTypeName = liveProperty.enumType;
							logger.debug(
								`[Enum Debug] Found enumType on live property: '${actualEnumTypeName}'`,
							);
							enumDef = allEnums.find(
								(d) => d.name === actualEnumTypeName,
							);
						}

						// If that didn't work, try the enumTypeName from parser
						if (!enumDef && property.enumTypeName) {
							logger.debug(
								`[Enum Debug] Trying enumTypeName from parser: '${property.enumTypeName}'`,
							);
							enumDef = allEnums.find(
								(d) => d.name === property.enumTypeName,
							);
						}

						// If still not found, try property name
						if (!enumDef) {
							logger.debug(
								`[Enum Debug] Trying property name: '${property.name}'`,
							);
							enumDef = allEnums.find(
								(d) => d.name === property.name,
							);
						}

						// If still not found, try case-insensitive search on all attempts
						if (!enumDef) {
							logger.debug(
								`[Enum Debug] Trying case-insensitive searches`,
							);
							const searchTerms = [
								actualEnumTypeName,
								property.enumTypeName,
								property.name,
							].filter(Boolean);
							for (const term of searchTerms) {
								enumDef = allEnums.find(
									(d) =>
										d.name.toLowerCase() ===
										term.toLowerCase(),
								);
								if (enumDef) {
									logger.debug(
										`[Enum Debug] Found via case-insensitive match: '${term}' -> '${enumDef.name}'`,
									);
									break;
								}
							}
						}

						// If still not found, try smart word-based matching
						if (!enumDef) {
							logger.debug(
								`[Enum Debug] Trying smart word-based matching`,
							);
							const searchTerms = [
								actualEnumTypeName,
								property.enumTypeName,
								property.name,
							].filter(Boolean);

							for (const term of searchTerms) {
								const matches = findSmartEnumMatches(
									term,
									allEnums,
								);
								if (matches.length === 1) {
									enumDef = matches[0];
									logger.debug(
										`[Enum Debug] Found via smart word match: '${term}' -> '${enumDef.name}'`,
									);
									break;
								} else if (matches.length > 1) {
									logger.warn(
										`[Enum Debug] Smart word matching found multiple matches for '${term}': ${matches.map((m) => m.name).join(", ")}. Skipping to avoid ambiguity.`,
									);
								}
							}
						}

						// If still not found, try simple partial matching as last resort
						if (!enumDef) {
							logger.debug(
								`[Enum Debug] Trying simple partial matching as last resort`,
							);
							const searchTerms = [
								actualEnumTypeName,
								property.enumTypeName,
								property.name,
							].filter(Boolean);
							for (const term of searchTerms) {
								enumDef = allEnums.find(
									(d) =>
										d.name.includes(term) ||
										term.includes(d.name),
								);
								if (enumDef) {
									logger.debug(
										`[Enum Debug] Found via simple partial match: '${term}' -> '${enumDef.name}'`,
									);
									break;
								}
							}
						}

						logger.debug(
							`[Enum Debug] Final enumDef found:`,
							enumDef,
						);

						const enumValues = enumDef?.values || [];

						if (enumValues.length === 0) {
							logger.warn(
								`[controlInterface] No values found for enum property '${property.name}'. Tried: actualEnumType='${actualEnumTypeName}', enumTypeName='${property.enumTypeName}', propertyName='${property.name}'`,
							);
							// Add a placeholder option
							const option = new Option(
								"No values available",
								"",
							);
							option.disabled = true;
							ctrl.appendChild(option);
						} else {
							logger.debug(
								`[Enum Debug] Successfully found ${enumValues.length} enum values:`,
								enumValues,
							);
							enumValues.forEach((v) => {
								const option = new Option(v, v);
								ctrl.appendChild(option);
							});

							if (
								liveProperty.value !== undefined &&
								liveProperty.value !== null
							) {
								ctrl.value = String(liveProperty.value);
							} else if (enumValues.length > 0) {
								ctrl.value = enumValues[0]; // Default to first if Rive value is null/undefined
							}
						}
					} else {
						logger.warn(
							"[controlInterface] riveInstance.enums() not available",
						);
						const option = new Option("Enums not available", "");
						option.disabled = true;
						ctrl.appendChild(option);
					}

					ctrl.addEventListener("change", () => {
						const newValue = ctrl.value;
						logger.debug(
							`[App] Event: Attempting to set ${name} to:`,
							newValue,
						);
						liveProperty.value = newValue;
						
						// Log ViewModel property change
						logRiveEvent("ViewModelPropertyChanged", {
							property: name,
							type: type,
							value: newValue,
							viewModel: vmContext?.instanceName || vmContext?.blueprintName || "ViewModel",
							vmPath: vmContext?.path || "ViewModel",
							isNested: vmContext?.isNested || false,
							blueprintName: vmContext?.blueprintName
						});
					}, { passive: true });
				}
				break;

			case "trigger":
				ctrl = document.createElement("button");
				ctrl.textContent = "Fire Trigger";

				if (isPlaceholder) {
					ctrl.disabled = true;
				} else {
					ctrl.addEventListener("click", () => {
						logger.debug(
							`[App] Event: Attempting to fire trigger ${name}`,
						);
						
						// Enhanced debugging for trigger objects
						logger.trace(`[App] Trigger object for ${name}:`, liveProperty);
						logger.trace(`[App] Trigger object type:`, typeof liveProperty);
						logger.trace(`[App] Trigger object constructor:`, liveProperty?.constructor?.name);
						logger.trace(`[App] Trigger object properties:`, Object.getOwnPropertyNames(liveProperty || {}));
						logger.trace(`[App] Trigger object prototype methods:`, Object.getOwnPropertyNames(Object.getPrototypeOf(liveProperty || {})));
						
						// 🔍 LIVE OBJECT DEBUGGING - Expose trigger object for console examination
						console.group(`🔥 FIRING TRIGGER: ${name}`);
						console.log(`Trigger name: ${name}`);
						console.log(`Live trigger object:`, liveProperty);
						console.log(`Object constructor:`, liveProperty?.constructor?.name);
						console.log(`Prototype chain:`, Object.getPrototypeOf(liveProperty));
						console.log(`Available methods:`, Object.getOwnPropertyNames(Object.getPrototypeOf(liveProperty || {})));
						console.log(`Direct properties:`, Object.getOwnPropertyNames(liveProperty || {}));
						
						// Expose on window for interactive debugging
						const windowKey = `firing_trigger_${name.replace(/[^a-zA-Z0-9]/g, '_')}`;
						window[windowKey] = liveProperty;
						console.log(`💡 Object exposed as: window.${windowKey}`);
						console.log(`💡 Try: window.${windowKey}.trigger() to test manually`);
						
						// Check available methods
						const hasFire = typeof liveProperty.fire === "function";
						const hasTrigger = typeof liveProperty.trigger === "function";
						const hasValue = typeof liveProperty.value !== "undefined";
						
						console.log(`🔍 Method availability:`, {
							fire: hasFire,
							trigger: hasTrigger,
							value: hasValue,
							valueType: typeof liveProperty.value
						});
						
						let triggerFired = false;
						
						try {
							// Try ViewModel trigger method first (correct API)
							if (hasTrigger) {
								console.log(`🚀 Attempting: liveProperty.trigger()`);
								logger.debug(`[App] Firing trigger ${name} using trigger() method`);
								liveProperty.trigger();
								triggerFired = true;
								console.log(`✅ SUCCESS: trigger() method worked!`);
								logger.info(`[App] Successfully fired trigger ${name} using trigger() method`);
							}
							// Fallback to fire() method (for state machine triggers)
							else if (hasFire) {
								console.log(`🚀 Attempting: liveProperty.fire()`);
								logger.debug(`[App] Firing trigger ${name} using fire() method`);
								liveProperty.fire();
								triggerFired = true;
								console.log(`✅ SUCCESS: fire() method worked!`);
								logger.info(`[App] Successfully fired trigger ${name} using fire() method`);
							}
							// Last resort: boolean pulse
							else if (hasValue) {
								console.log(`🚀 Attempting: boolean pulse (value = true)`);
								logger.debug(`[App] Firing trigger ${name} using boolean pulse (value property)`);
								const oldValue = liveProperty.value;
								liveProperty.value = true;
								setTimeout(() => {
									liveProperty.value = oldValue;
								}, 100);
								triggerFired = true;
								console.log(`✅ SUCCESS: boolean pulse worked!`);
								logger.info(`[App] Successfully fired trigger ${name} using boolean pulse`);
							}
							else {
								console.error(`❌ FAILED: No valid trigger method found!`);
								logger.error(`[App] No valid trigger method found for ${name}. Available:`, {
									object: liveProperty,
									methods: Object.getOwnPropertyNames(Object.getPrototypeOf(liveProperty || {})),
									properties: Object.getOwnPropertyNames(liveProperty || {})
								});
							}
						} catch (error) {
							console.error(`❌ ERROR during trigger firing:`, error);
							logger.error(`[App] Error firing trigger ${name}:`, error);
							logger.error(`[App] Trigger object that failed:`, liveProperty);
						}
						
						console.groupEnd();
						
						// Log ViewModel property change with enhanced information
						logRiveEvent("ViewModelPropertyChanged", {
							property: name,
							type: type,
							value: "triggered",
							success: triggerFired,
							methodUsed: hasTrigger ? "trigger()" : hasFire ? "fire()" : hasValue ? "boolean_pulse" : "none",
							viewModel: vmContext?.instanceName || vmContext?.blueprintName || "ViewModel",
							vmPath: vmContext?.path || "ViewModel",
							isNested: vmContext?.isNested || false,
							blueprintName: vmContext?.blueprintName
						});
					}, { passive: true });
				}
				break;
		}
	} catch (e) {
		logger.error(`Error creating control for property ${name}:`, e);
		return null;
	}

	return ctrl;
}

/**
 * Applies the FPS counter setting to a Rive instance if it was previously enabled
 * @param {Object} rive - The Rive instance to apply settings to
 */
function applyFpsCounterSetting(rive) {
	if (!rive) {
		logger.debug("[controlInterface] No Rive instance provided to applyFpsCounterSetting");
		return;
	}

	// Check if FPS counter methods are available
	const hasEnableFPS = typeof rive.enableFPSCounter === 'function';
	
	if (!hasEnableFPS) {
		logger.warn("[controlInterface] Rive instance doesn't support enableFPSCounter method - FPS counter not available in this version");
		return;
	}

	// Store reference to FPS display element for WebGL2 renderer workaround
	let currentFpsDisplay = null;

	if (fpsCounterEnabled) {
		try {
			// Create custom FPS callback to display in upper right corner of canvas
			const createFPSDisplay = () => {
				// Remove existing FPS display if any
				const existingDisplay = document.getElementById('rive-fps-display');
				if (existingDisplay) {
					existingDisplay.remove();
				}
				
				// Get the canvas container
				const canvasContainer = document.getElementById('canvasContainer') || document.getElementById('rive-canvas')?.parentElement;
				if (!canvasContainer) {
					logger.warn("[controlInterface] Canvas container not found for FPS display");
					return null;
				}
				
				// Create FPS display element
				const fpsDisplay = document.createElement('div');
				fpsDisplay.id = 'rive-fps-display';
				fpsDisplay.className = 'rive-fps-display fps-excellent';
				fpsDisplay.textContent = 'FPS: --';
				
				// Ensure container has relative positioning
				const containerStyle = window.getComputedStyle(canvasContainer);
				if (containerStyle.position === 'static') {
					canvasContainer.style.position = 'relative';
				}
				
				canvasContainer.appendChild(fpsDisplay);
				return fpsDisplay;
			};
			
			currentFpsDisplay = createFPSDisplay();
			
			// Enable FPS counter with custom callback
			rive.enableFPSCounter((fps) => {
				if (currentFpsDisplay && fpsCounterEnabled) {
					// Format FPS with color coding using CSS classes
					const fpsValue = Math.round(fps);
					
					// Remove existing performance classes
					currentFpsDisplay.classList.remove('fps-excellent', 'fps-moderate', 'fps-poor');
					
					// Add appropriate performance class
					if (fpsValue < 30) {
						currentFpsDisplay.classList.add('fps-poor');
					} else if (fpsValue < 50) {
						currentFpsDisplay.classList.add('fps-moderate');
					} else {
						currentFpsDisplay.classList.add('fps-excellent');
					}
					
					currentFpsDisplay.textContent = `FPS: ${fpsValue}`;
				}
			});
			
			logger.debug("[controlInterface] FPS counter enabled on new Rive instance");
		} catch (error) {
			logger.error("[controlInterface] Error enabling FPS counter:", error);
		}
	} else {
		// For WebGL2 renderer: Since disableFPSCounter() doesn't exist, we handle disable differently
		// We simply remove the display element and the callback will stop updating it
		const hasDisableFPS = typeof rive.disableFPSCounter === 'function';
		
		if (hasDisableFPS) {
			// Standard renderer - use the proper disable method
			try {
				rive.disableFPSCounter();
				logger.debug("[controlInterface] FPS counter disabled using disableFPSCounter() method");
			} catch (error) {
				logger.warn("[controlInterface] Error disabling FPS counter:", error);
			}
		} else {
			// WebGL2 renderer workaround - remove display element and let callback naturally stop
			logger.debug("[controlInterface] WebGL2 renderer detected - disabling FPS counter by removing display element");
		}
		
		// Remove the FPS display element for both renderers
		const existingDisplay = document.getElementById('rive-fps-display');
		if (existingDisplay) {
				existingDisplay.remove();
			}
		
		logger.info("[controlInterface] FPS counter disabled and display removed");
	}
}

/**
 * Initializes and builds the dynamic control UI based on the parsed data.
 * This function will now create its own Rive instance.
 *
 * @param {object} parsedDataFromHandler - The structured data object from parser.js.
 */
export function initDynamicControls(parsedDataFromHandler) {
	logger.info(
		"Initializing dynamic controls with parsed data:",
		parsedDataFromHandler
	);

	// Clear event console on page reload/initialization
	eventConsoleMessages.length = 0;
	updateEventConsole();
	logger.debug("[controlInterface] Event console cleared on initialization");

	// Load saved event logging settings from localStorage
	try {
		const savedDisplayEvents = localStorage.getItem('riveDisplayEvents');
		if (savedDisplayEvents !== null) {
			displayRiveEvents = JSON.parse(savedDisplayEvents);
		}
		
		const savedCustomEvents = localStorage.getItem('riveLogCustomEvents');
		if (savedCustomEvents !== null) {
			logCustomEvents = JSON.parse(savedCustomEvents);
		}
		
		const savedStateChangeEvents = localStorage.getItem('riveLogStateChangeEvents');
		if (savedStateChangeEvents !== null) {
			logStateChangeEvents = JSON.parse(savedStateChangeEvents);
		}
		
		const savedNestedViewModelEvents = localStorage.getItem('riveLogNestedViewModelEvents');
		if (savedNestedViewModelEvents !== null) {
			logNestedViewModelEvents = JSON.parse(savedNestedViewModelEvents);
		}
		
		const savedPlaybackEvents = localStorage.getItem('riveLogPlaybackEvents');
		if (savedPlaybackEvents !== null) {
			logPlaybackEvents = JSON.parse(savedPlaybackEvents);
		}
		
		const savedSystemEvents = localStorage.getItem('riveLogSystemEvents');
		if (savedSystemEvents !== null) {
			logSystemEvents = JSON.parse(savedSystemEvents);
		}
		
		const savedFrameEvents = localStorage.getItem('riveLogFrameEvents');
		if (savedFrameEvents !== null) {
			logFrameEvents = JSON.parse(savedFrameEvents);
		}

		// Load saved FPS counter setting from localStorage
		const savedFpsCounterEnabled = localStorage.getItem('riveFpsCounterEnabled');
		if (savedFpsCounterEnabled !== null) {
			fpsCounterEnabled = JSON.parse(savedFpsCounterEnabled);
		}
		
		logger.debug("[controlInterface] Loaded settings from localStorage:", {
			displayRiveEvents,
			logCustomEvents,
			logStateChangeEvents,
			logNestedViewModelEvents,
			logPlaybackEvents,
			logSystemEvents,
			logFrameEvents,
			fpsCounterEnabled
		});
	} catch (e) {
		logger.warn("[controlInterface] Error loading settings from localStorage:", e);
	}

	// Note: Event console initialization is now handled by Golden Layout component factory
	// to prevent timing conflicts and flicker

	// Clear previous instance and polling interval
	if (riveInstance && typeof riveInstance.cleanup === "function") {
		logger.debug("[controlInterface] Cleaning up previous Rive instance");
		riveInstance.cleanup();
	}
	if (uiUpdateInterval) {
		clearInterval(uiUpdateInterval);
		uiUpdateInterval = null;
		logger.debug("[controlInterface] Cleared UI update interval");
	}

	// Clear global references
	if (
		window.riveInstanceGlobal &&
		window.riveInstanceGlobal !== riveInstance
	) {
		try {
			if (typeof window.riveInstanceGlobal.cleanup === "function") {
				window.riveInstanceGlobal.cleanup();
			}
		} catch (e) {
			logger.warn(
				"[controlInterface] Error cleaning up global Rive instance:",
				e
			);
		}
		window.riveInstanceGlobal = null;
	}

	if (window.vm) {
		window.vm = null;
		logger.debug("[controlInterface] Cleared global VM reference");
	}

	// Note: Window resize listener cleanup is now handled by riveParserHandler.js
	riveInstance = null;
	parsedRiveData = parsedDataFromHandler;
	dynamicControlsInitialized = false;
	structuredControlData = null;

	logger.debug(
		"[controlInterface] State reset complete, initializing with new data"
	);

	const controlsContainer = document.getElementById(
		"dynamicControlsContainer"
	);
	if (!controlsContainer) {
		logger.error(
			"Dynamic controls container #dynamicControlsContainer not found. Cannot initialize."
		);
		return;
	}
	controlsContainer.innerHTML =
		"<p>Loading Rive animation and controls...</p>"; // Initial message

	if (!parsedDataFromHandler || !parsedDataFromHandler.defaultElements) {
		logger.info(
			"[controlInterface] No parsed data provided. Showing empty state."
		);
		controlsContainer.innerHTML = "<p>Please Load a Rive File</p>";
		return;
	}

	if (!RiveEngine) {
		logger.error(
			"Rive engine (window.rive) not available. Cannot create Rive instance."
		);
		controlsContainer.innerHTML =
			"<p>Error: Rive engine not available.</p>";
		return;
	}

	const canvas = document.getElementById("rive-canvas");
	if (!canvas) {
		logger.error(
			"Canvas element 'rive-canvas' not found. Cannot create Rive instance."
		);
		controlsContainer.innerHTML = "<p>Error: Canvas element not found.</p>";
		return;
	}

	const {
		src,
		artboardName,
		stateMachineNames: availableSMs, // Array of SM names from parser
		viewModelName: parsedViewModelName, // viewModelName from parser defaultElements
	} = parsedDataFromHandler.defaultElements;

	if (!src || !artboardName) {
		logger.error(
			"[controlInterface] Missing src or artboardName. Cannot create Rive instance."
		);
		if (controlsContainer)
			controlsContainer.innerHTML =
				"<p>Error: Missing Rive source or artboard name.</p>";
		return;
	}

	let smToPlay = null;
	if (availableSMs && availableSMs.length > 0) {
		if (availableSMs.includes("State Machine 1")) {
			smToPlay = "State Machine 1";
		} else {
			smToPlay = availableSMs[0];
		}
		logger.info(
			`[controlInterface] Selected state machine to play: ${smToPlay}`
		);
	} else {
		logger.info(
			"[controlInterface] No state machines found in parsed data to autoplay."
		);
	}

	// Create asset map for Asset Manager
	const assetMap = new Map();

	const riveOptions = {
		src: src,
		canvas: canvas,
		artboard: artboardName,
		stateMachines: smToPlay,
		autoplay: true, // Autoplay the selected state machine
		autoBind: true,
		onStateChange: handleConstructorStateChange,
		// Capture assets for the Asset Manager
		assetLoader: (asset) => {
			if (asset.isImage) {
				assetMap.set(asset.name, asset);
				logger.debug(`Captured image asset: ${asset.name}`);
			}
			return false; // Let Rive handle the loading
		},
	};

	// Validate canvas dimensions before creating Rive instance to prevent WebGL framebuffer errors
	const canvasRect = canvas.getBoundingClientRect();
	const canvasWidth = canvasRect.width || canvas.offsetWidth || canvas.width;
	const canvasHeight = canvasRect.height || canvas.offsetHeight || canvas.height;
	
	logger.debug("[controlInterface] Canvas dimensions before Rive creation:", {
		width: canvasWidth,
		height: canvasHeight,
		offsetWidth: canvas.offsetWidth,
		offsetHeight: canvas.offsetHeight,
		clientWidth: canvas.clientWidth,
		clientHeight: canvas.clientHeight
	});
	
	// If canvas has zero dimensions, ensure it has minimum safe dimensions
	if (canvasWidth < 10 || canvasHeight < 10) {
		logger.warn("[controlInterface] Canvas has zero/small dimensions, setting minimum safe size to prevent WebGL errors");
		canvas.width = Math.max(canvasWidth, 400);
		canvas.height = Math.max(canvasHeight, 300);
		canvas.style.minWidth = "400px";
		canvas.style.minHeight = "300px";
		
		// Force a layout recalculation
		canvas.offsetHeight; // Trigger reflow
		
		logger.info("[controlInterface] Canvas dimensions after safety adjustment:", {
			width: canvas.width,
			height: canvas.height,
			offsetWidth: canvas.offsetWidth,
			offsetHeight: canvas.offsetHeight
		});
	}

	logger.info("[controlInterface] Creating new Rive instance with options:", {
		src: riveOptions.src,
		artboard: riveOptions.artboard,
		stateMachines: riveOptions.stateMachines,
		autoplay: riveOptions.autoplay,
		autoBind: riveOptions.autoBind,
	});

	try {
		riveInstance = new RiveEngine.Rive(riveOptions);
	} catch (e) {
		logger.error(
			"[controlInterface] Error during Rive instance construction:",
			e
		);
		if (controlsContainer)
			controlsContainer.innerHTML = `<p>Error constructing Rive: ${e.toString()}</p>`;
		riveInstance = null;
		return;
	}

	if (!riveInstance || typeof riveInstance.on !== "function") {
		logger.error(
			"Newly created Rive instance is invalid or does not have .on method"
		);
		if (controlsContainer)
			controlsContainer.innerHTML =
				"<p>Error initializing Rive instance.</p>";
		return;
	}

	logger.info(
		"[controlInterface] New Rive instance constructed. Setting up Load/LoadError listeners."
	);
	const EventType = RiveEngine.EventType;

	riveInstance.on(EventType.Load, () => {
		logger.info("[controlInterface] Rive instance EventType.Load fired.");
		dynamicControlsInitialized = true;
		try {
			// Validate canvas dimensions before resizing to prevent WebGL framebuffer errors
			const canvas = riveInstance.canvas;
			if (canvas) {
				const canvasRect = canvas.getBoundingClientRect();
				const canvasWidth = canvasRect.width || canvas.offsetWidth || canvas.width;
				const canvasHeight = canvasRect.height || canvas.offsetHeight || canvas.height;
				
				logger.debug("[controlInterface] Canvas dimensions before resize:", {
					width: canvasWidth,
					height: canvasHeight
				});
				
				// Ensure canvas has minimum dimensions before resizing
				if (canvasWidth < 10 || canvasHeight < 10) {
					logger.warn("[controlInterface] Canvas still has small dimensions during Load event, adjusting before resize");
					canvas.width = Math.max(canvasWidth, 400);
					canvas.height = Math.max(canvasHeight, 300);
					canvas.style.minWidth = "400px";
					canvas.style.minHeight = "300px";
					
					// Force layout recalculation
					canvas.offsetHeight;
				}
			}
			
			riveInstance.resizeDrawingSurfaceToCanvas();
		} catch (e_resize) {
			console.error(
				"[controlInterface] onLoad ERROR during resize:",
				e_resize
			);
			if (controlsContainer)
				controlsContainer.innerHTML =
					"<p>Error during Rive resize.</p>";
			return;
		}

		// Check for ViewModel existence after load and autoBind
		if (!riveInstance.viewModelInstance && !parsedViewModelName) {
			logger.info(
				"[controlInterface] No ViewModel instance found after load and no default VM name parsed."
			);
			// structuredControlData will likely be minimal or null
		} else if (riveInstance.viewModelInstance) {
			logger.info(
				"[controlInterface] ViewModel instance found on Rive instance after load."
			);
		} else if (parsedViewModelName) {
			logger.warn(
				`[controlInterface] Parsed default ViewModel name was '${parsedViewModelName}', but no viewModelInstance found after load.`
			);
		}

		structuredControlData = processDataForControls(
			parsedRiveData,
			riveInstance
		);

		if (
			!structuredControlData &&
			(riveInstance.viewModelInstance || parsedViewModelName)
		) {
			logger.error(
				"[controlInterface] Failed to process data, but a ViewModel was expected/found."
			);
		}

		// Programmatically set "Diagram Enter" to false if it exists
		if (
			structuredControlData &&
			structuredControlData.stateMachineControls &&
			smToPlay
		) {
			const targetSMName = Array.isArray(smToPlay)
				? smToPlay[0]
				: smToPlay; // Use the actual SM name we tried to play
			const smControl = structuredControlData.stateMachineControls.find(
				(sm) => sm.name === targetSMName
			);
			if (smControl && smControl.inputs) {
				const diagramEnterInput = smControl.inputs.find(
					(input) => input.name === "Diagram Enter"
				);
				if (
					diagramEnterInput &&
					diagramEnterInput.liveInput &&
					diagramEnterInput.liveInput.value !== false
				) {
					logger.info(
						`[controlInterface] Programmatically setting '${targetSMName} -> Diagram Enter' to false.`
					);
					diagramEnterInput.liveInput.value = false;
				}
			}
		}

		setupEventListeners();
		buildControlsUI();

		// Note: Window resize listener is now handled by riveParserHandler.js
		// to avoid conflicts and ensure proper coordination

		// Set up ViewModel event monitoring
		setupViewModelEventMonitoring();

		// Expose this Rive instance to the window for debugging
		window.riveInstanceGlobal = riveInstance;
		logger.info(
			"[controlInterface] Rive instance exposed as window.riveInstanceGlobal for console debugging."
		);

		// Initialize Asset Manager with the asset map
		try {
			logger.info(
				`[controlInterface] Initializing Asset Manager with ${assetMap.size} captured assets`
			);
			setAssetMap(assetMap);

			// Also initialize with the Rive instance for compatibility
			import("./assetManager.js")
				.then(({ initializeAssetManager }) => {
					initializeAssetManager(riveInstance);
					logger.info(
						"[controlInterface] Asset Manager initialized with Rive instance"
					);
				})
				.catch((error) => {
					logger.error(
						"[controlInterface] Error importing Asset Manager:",
						error
					);
				});
		} catch (error) {
			logger.error(
				"[controlInterface] Error initializing Asset Manager:",
				error
			);
		}

		// Apply FPS counter setting
		applyFpsCounterSetting(riveInstance);
	});

	riveInstance.on(EventType.LoadError, (err) => {
		logger.error("Rive EventType.LoadError fired:", err);
		if (controlsContainer)
			controlsContainer.innerHTML = `<p>Error loading Rive file: ${err.toString()}</p>`;
		riveInstance = null; // Clear the instance
		dynamicControlsInitialized = false;
	});
}

/**
 * Sets up event listeners for the Rive instance
 */
function setupEventListeners() {
	if (!riveInstance || typeof riveInstance.on !== "function") {
		logger.warn(
			"[controlInterface] Attempted to setup listeners, but Rive instance is invalid or has no .on method",
		);
		return;
	}

	const EventType = RiveEngine.EventType; // Ensure RiveEngine is window.rive or equivalent
	if (!EventType) {
		logger.error(
			"[controlInterface] RiveEngine.EventType is not available. Cannot setup Rive listeners.",
		);
		return;
	}

	// Remove previous listeners before adding new ones, to prevent duplicates if this function is called multiple times on the same instance
	// (Though with current flow, it should only be called once per new instance)
	try {
		if (typeof riveInstance.removeAllEventListeners === "function") {
			// logger.debug('[controlInterface] Removing all existing Rive event listeners before re-adding.');
			// riveInstance.removeAllEventListeners(); // Be cautious if other parts might add listeners we don't know about
		}
	} catch (e) {
		logger.warn(
			"[controlInterface] Error trying to remove previous listeners:",
			e,
		);
	}

	logger.info(
		"[controlInterface] Setting up Rive instance event listeners (StateChanged, ValueChanged, RiveEvent).",
	);

	if (EventType.StateChanged) {
		riveInstance.on(EventType.StateChanged, (event) => {
			logger.debug(
				"[controlInterface] RIVE JS EVENT: StateChanged Fired",
				event,
			);
			logRiveEvent("StateChanged", event);
			updateControlsFromRive();
		});
	}
	if (EventType.ValueChanged) {
		riveInstance.on(EventType.ValueChanged, (event) => {
			logger.debug(
				"[controlInterface] RIVE JS EVENT: ValueChanged Fired",
				event,
			);
			logRiveEvent("ValueChanged", event);
			updateControlsFromRive();
		});
	}
	if (EventType.RiveEvent) {
		riveInstance.on(EventType.RiveEvent, (event) => {
			logger.debug(
				"[controlInterface] RIVE JS EVENT: RiveEvent (Custom) Fired",
				event,
			);
			logRiveEvent("RiveEvent", event);
			// We might want to call updateControlsFromRive() here too if custom events can alter VM/SM Input states
			// updateControlsFromRive();
		});
	}
	
	// Add listeners for other common Rive events
	if (EventType.Play) {
		riveInstance.on(EventType.Play, (event) => {
			logger.debug(
				"[controlInterface] RIVE JS EVENT: Play Fired",
				event,
			);
			logRiveEvent("Play", event);
			
			// Synchronize button states with Rive events
			if (window.riveControlInterface) {
				// Check if this is a timeline or state machine play event
				const animationName = event.data?.name || event.name;
				if (animationName === window.riveControlInterface.currentTimeline) {
					window.riveControlInterface.isTimelinePlaying = true;
					window.riveControlInterface.updateTimelineButtons();
				}
				if (animationName === window.riveControlInterface.currentStateMachine) {
					window.riveControlInterface.isStateMachineRunning = true;
					window.riveControlInterface.updateStateMachineButtons();
				}
			}
		});
	}
	if (EventType.Pause) {
		riveInstance.on(EventType.Pause, (event) => {
			logger.debug(
				"[controlInterface] RIVE JS EVENT: Pause Fired",
				event,
			);
			logRiveEvent("Pause", event);
			
			// Synchronize button states with Rive events
			if (window.riveControlInterface) {
				const animationName = event.data?.name || event.name;
				if (animationName === window.riveControlInterface.currentTimeline) {
					window.riveControlInterface.isTimelinePlaying = false;
					window.riveControlInterface.updateTimelineButtons();
				}
			}
		});
	}
	if (EventType.Stop) {
		riveInstance.on(EventType.Stop, (event) => {
			logger.debug(
				"[controlInterface] RIVE JS EVENT: Stop Fired",
				event,
			);
			logRiveEvent("Stop", event);
			
			// Synchronize button states with Rive events
			if (window.riveControlInterface) {
				const animationName = event.data?.name || event.name;
				if (animationName === window.riveControlInterface.currentTimeline) {
					window.riveControlInterface.isTimelinePlaying = false;
					window.riveControlInterface.updateTimelineButtons();
				}
				if (animationName === window.riveControlInterface.currentStateMachine) {
					window.riveControlInterface.isStateMachineRunning = false;
					window.riveControlInterface.updateStateMachineButtons();
				}
			}
		});
	}
	if (EventType.Loop) {
		riveInstance.on(EventType.Loop, (event) => {
			logger.debug(
				"[controlInterface] RIVE JS EVENT: Loop Fired",
				event,
			);
			logRiveEvent("Loop", event);
		});
	}
	if (EventType.Load) {
		riveInstance.on(EventType.Load, (event) => {
			logger.debug(
				"[controlInterface] RIVE JS EVENT: Load Fired",
				event,
			);
			logRiveEvent("Load", event);
		});
	}
	if (EventType.LoadError) {
		riveInstance.on(EventType.LoadError, (event) => {
			logger.debug(
				"[controlInterface] RIVE JS EVENT: LoadError Fired",
				event,
			);
			logRiveEvent("LoadError", event);
		});
	}
	// Frame events are disabled by default due to high frequency
	// Only enable if explicitly requested
	if (logFrameEvents) {
		if (EventType.Draw) {
			riveInstance.on(EventType.Draw, (event) => {
				logger.debug(
					"[controlInterface] RIVE JS EVENT: Draw Fired",
					event,
				);
				logRiveEvent("Draw", event);
			});
		}
		if (EventType.Advance) {
			riveInstance.on(EventType.Advance, (event) => {
				logger.debug(
					"[controlInterface] RIVE JS EVENT: Advance Fired",
					event,
				);
				logRiveEvent("Advance", event);
			});
		}
	}
	// Any other specific events from Rive docs can be added here if needed.
}

/**
 * Sets up monitoring for ViewModel property changes (including nested ViewModels)
 * Now using a safer approach that monitors through UI controls
 */
function setupViewModelEventMonitoring() {
	if (!riveInstance || !riveInstance.viewModelInstance) {
		logger.debug("[controlInterface] No ViewModel instance available for monitoring");
		return;
	}

	logger.info("[controlInterface] Setting up safe ViewModel event monitoring");
	
	// Instead of monitoring all properties directly, we'll monitor through the UI controls
	// This prevents infinite loops and only captures actual user interactions
	setupViewModelUIMonitoring();
}





/**
 * Sets up ViewModel monitoring through UI controls (safer approach)
 * This monitors when users interact with ViewModel controls rather than all property changes
 */
function setupViewModelUIMonitoring() {
	// We'll add event listeners to the ViewModel controls after they're created
	// This happens in the createControlForProperty function
	logger.debug("[controlInterface] ViewModel UI monitoring will be set up when controls are created");
}

/**
 * Builds the dynamic control UI using the processed data
 */
function buildControlsUI() {
	const controlsContainer = document.getElementById(
		"dynamicControlsContainer",
	);
	if (!controlsContainer) {
		logger.error(
			"Dynamic controls container #dynamicControlsContainer not found.",
		);
		return;
	}

	controlsContainer.innerHTML = ""; // Clear previous controls

	if (!structuredControlData) {
		logger.warn(
			"[controlInterface] No structured data available for buildControlsUI.",
		);
		const noDataMsg = document.createElement("p");
		noDataMsg.className = "info-note";
		noDataMsg.textContent =
			"No control data processed. Cannot build controls.";
		controlsContainer.appendChild(noDataMsg);
		return;
	}

	const mainTitle = document.createElement("h3");
	mainTitle.textContent = "Live Rive Controls";
	controlsContainer.appendChild(mainTitle);

	// Add Rive Event Logging section
	const eventLoggingSection = document.createElement("details");
	eventLoggingSection.className = "control-section";
	eventLoggingSection.open = false;

	const eventLoggingSummary = document.createElement("summary");
	eventLoggingSummary.innerHTML = `
		Rive Event Logging
		<button class="help-button" id="eventLoggingHelpBtn" title="Help">
			<span>?</span>
		</button>
	`;
	eventLoggingSection.appendChild(eventLoggingSummary);

	// Main enable/disable toggle
	const eventDisplayRow = document.createElement("div");
	eventDisplayRow.className = "toggle-row";
	
	const eventToggle = document.createElement("label");
	eventToggle.className = "toggle-switch master-toggle";
	eventToggle.innerHTML = `
		<input type="checkbox" id="displayRiveEventsCheckbox" ${displayRiveEvents ? 'checked' : ''}>
		<span class="toggle-slider"></span>
	`;
	
	const eventCheckbox = eventToggle.querySelector('input');
	eventCheckbox.addEventListener("change", () => {
		displayRiveEvents = eventCheckbox.checked;
		logger.info(`[controlInterface] Rive event logging ${displayRiveEvents ? 'enabled' : 'disabled'}`);
		
		// Save the setting to localStorage
		try {
			localStorage.setItem('riveDisplayEvents', JSON.stringify(displayRiveEvents));
		} catch (e) {
			logger.warn("[controlInterface] Error saving event logging settings:", e);
		}
		
		// Clear console and show disabled message when turning off
		if (!displayRiveEvents) {
			// Clear the event console messages
			eventConsoleMessages.length = 0;
			
			// Update event console with disabled message
			const consoleElement = document.getElementById('eventConsoleContent');
			if (consoleElement) {
				consoleElement.innerHTML = '<div class="event-disabled-message">🚫 Event logging is disabled</div>';
			}
			
			logger.info("[controlInterface] Event console cleared - logging disabled");
		} else {
			// When re-enabling, clear the disabled message
			const consoleElement = document.getElementById('eventConsoleContent');
			if (consoleElement) {
				consoleElement.innerHTML = '<div class="event-enabled-message">✅ Event logging enabled - waiting for events...</div>';
			}
			
			logger.info("[controlInterface] Event logging re-enabled");
		}
		
		// Show a brief confirmation in status bar
		const statusMessageDiv = document.getElementById("statusMessage");
		if (statusMessageDiv) {
			statusMessageDiv.textContent = `🔧 Rive event logging ${displayRiveEvents ? 'enabled' : 'disabled'}`;
			setTimeout(() => {
				if (statusMessageDiv.textContent.includes('event logging')) {
					statusMessageDiv.textContent = "Ready";
				}
			}, 2000);
		}
	}, { passive: true });

	const eventLabel = document.createElement("label");
	eventLabel.htmlFor = "displayRiveEventsCheckbox";
	eventLabel.className = "toggle-label";
	eventLabel.textContent = "Enable Event Logging";

	eventDisplayRow.appendChild(eventToggle);
	eventDisplayRow.appendChild(eventLabel);
	eventLoggingSection.appendChild(eventDisplayRow);

	// Custom Events toggle
	const customEventsRow = document.createElement("div");
	customEventsRow.className = "toggle-row";
	
	const customEventsToggle = document.createElement("label");
	customEventsToggle.className = "toggle-switch compact";
	customEventsToggle.innerHTML = `
		<input type="checkbox" id="logCustomEventsCheckbox" ${logCustomEvents ? 'checked' : ''}>
		<span class="toggle-slider"></span>
	`;
	
	const customEventsCheckbox = customEventsToggle.querySelector('input');
	customEventsCheckbox.addEventListener("change", () => {
		logCustomEvents = customEventsCheckbox.checked;
		logger.info(`[controlInterface] Custom event logging ${logCustomEvents ? 'enabled' : 'disabled'}`);
		
		// Save the setting to localStorage
		try {
			localStorage.setItem('riveLogCustomEvents', JSON.stringify(logCustomEvents));
		} catch (e) {
			logger.warn("[controlInterface] Error saving custom events setting:", e);
		}
	}, { passive: true });

	const customEventsLabel = document.createElement("label");
	customEventsLabel.htmlFor = "logCustomEventsCheckbox";
	customEventsLabel.className = "toggle-label";
	customEventsLabel.textContent = "Log Custom Events";

	customEventsRow.appendChild(customEventsToggle);
	customEventsRow.appendChild(customEventsLabel);
	eventLoggingSection.appendChild(customEventsRow);

	// State Change Events toggle
	const stateChangeEventsRow = document.createElement("div");
	stateChangeEventsRow.className = "toggle-row";
	
	const stateChangeEventsToggle = document.createElement("label");
	stateChangeEventsToggle.className = "toggle-switch compact";
	stateChangeEventsToggle.innerHTML = `
		<input type="checkbox" id="logStateChangeEventsCheckbox" ${logStateChangeEvents ? 'checked' : ''}>
		<span class="toggle-slider"></span>
	`;
	
	const stateChangeEventsCheckbox = stateChangeEventsToggle.querySelector('input');
	stateChangeEventsCheckbox.addEventListener("change", () => {
		logStateChangeEvents = stateChangeEventsCheckbox.checked;
		logger.info(`[controlInterface] State change event logging ${logStateChangeEvents ? 'enabled' : 'disabled'}`);
		
		// Save the setting to localStorage
		try {
			localStorage.setItem('riveLogStateChangeEvents', JSON.stringify(logStateChangeEvents));
		} catch (e) {
			logger.warn("[controlInterface] Error saving state change events setting:", e);
		}
	}, { passive: true });

	const stateChangeEventsLabel = document.createElement("label");
	stateChangeEventsLabel.htmlFor = "logStateChangeEventsCheckbox";
	stateChangeEventsLabel.className = "toggle-label";
	stateChangeEventsLabel.textContent = "Log State Change Events";

	stateChangeEventsRow.appendChild(stateChangeEventsToggle);
	stateChangeEventsRow.appendChild(stateChangeEventsLabel);
	eventLoggingSection.appendChild(stateChangeEventsRow);

	// Nested ViewModel Events toggle
	const nestedViewModelEventsRow = document.createElement("div");
	nestedViewModelEventsRow.className = "toggle-row";
	
	const nestedViewModelEventsToggle = document.createElement("label");
	nestedViewModelEventsToggle.className = "toggle-switch compact";
	nestedViewModelEventsToggle.innerHTML = `
		<input type="checkbox" id="logNestedViewModelEventsCheckbox" ${logNestedViewModelEvents ? 'checked' : ''}>
		<span class="toggle-slider"></span>
	`;
	
	const nestedViewModelEventsCheckbox = nestedViewModelEventsToggle.querySelector('input');
	nestedViewModelEventsCheckbox.addEventListener("change", () => {
		logNestedViewModelEvents = nestedViewModelEventsCheckbox.checked;
		logger.info(`[controlInterface] Nested ViewModel event logging ${logNestedViewModelEvents ? 'enabled' : 'disabled'}`);
		
		// Save the setting to localStorage
		try {
			localStorage.setItem('riveLogNestedViewModelEvents', JSON.stringify(logNestedViewModelEvents));
		} catch (e) {
			logger.warn("[controlInterface] Error saving nested ViewModel events setting:", e);
		}
	}, { passive: true });

	const nestedViewModelEventsLabel = document.createElement("label");
	nestedViewModelEventsLabel.htmlFor = "logNestedViewModelEventsCheckbox";
	nestedViewModelEventsLabel.className = "toggle-label";
	nestedViewModelEventsLabel.textContent = "Log Nested ViewModel Events";

	nestedViewModelEventsRow.appendChild(nestedViewModelEventsToggle);
	nestedViewModelEventsRow.appendChild(nestedViewModelEventsLabel);
	eventLoggingSection.appendChild(nestedViewModelEventsRow);

	// Playback Events toggle
	const playbackEventsRow = document.createElement("div");
	playbackEventsRow.className = "toggle-row";
	
	const playbackEventsToggle = document.createElement("label");
	playbackEventsToggle.className = "toggle-switch compact";
	playbackEventsToggle.innerHTML = `
		<input type="checkbox" id="logPlaybackEventsCheckbox" ${logPlaybackEvents ? 'checked' : ''}>
		<span class="toggle-slider"></span>
	`;
	
	const playbackEventsCheckbox = playbackEventsToggle.querySelector('input');
	playbackEventsCheckbox.addEventListener("change", () => {
		logPlaybackEvents = playbackEventsCheckbox.checked;
		logger.info(`[controlInterface] Playback event logging ${logPlaybackEvents ? 'enabled' : 'disabled'}`);
		
		// Save the setting to localStorage
		try {
			localStorage.setItem('riveLogPlaybackEvents', JSON.stringify(logPlaybackEvents));
		} catch (e) {
			logger.warn("[controlInterface] Error saving playback events setting:", e);
		}
	}, { passive: true });

	const playbackEventsLabel = document.createElement("label");
	playbackEventsLabel.htmlFor = "logPlaybackEventsCheckbox";
	playbackEventsLabel.className = "toggle-label";
	playbackEventsLabel.textContent = "Log Playback Events";

	playbackEventsRow.appendChild(playbackEventsToggle);
	playbackEventsRow.appendChild(playbackEventsLabel);
	eventLoggingSection.appendChild(playbackEventsRow);

	// System Events toggle
	const systemEventsRow = document.createElement("div");
	systemEventsRow.className = "toggle-row";
	
	const systemEventsToggle = document.createElement("label");
	systemEventsToggle.className = "toggle-switch compact";
	systemEventsToggle.innerHTML = `
		<input type="checkbox" id="logSystemEventsCheckbox" ${logSystemEvents ? 'checked' : ''}>
		<span class="toggle-slider"></span>
	`;
	
	const systemEventsCheckbox = systemEventsToggle.querySelector('input');
	systemEventsCheckbox.addEventListener("change", () => {
		logSystemEvents = systemEventsCheckbox.checked;
		logger.info(`[controlInterface] System event logging ${logSystemEvents ? 'enabled' : 'disabled'}`);
		
		// Save the setting to localStorage
		try {
			localStorage.setItem('riveLogSystemEvents', JSON.stringify(logSystemEvents));
		} catch (e) {
			logger.warn("[controlInterface] Error saving system events setting:", e);
		}
	}, { passive: true });

	const systemEventsLabel = document.createElement("label");
	systemEventsLabel.htmlFor = "logSystemEventsCheckbox";
	systemEventsLabel.className = "toggle-label";
	systemEventsLabel.textContent = "Log System Events";

	systemEventsRow.appendChild(systemEventsToggle);
	systemEventsRow.appendChild(systemEventsLabel);
	eventLoggingSection.appendChild(systemEventsRow);

	// Frame Events toggle (high frequency events)
	const frameEventsRow = document.createElement("div");
	frameEventsRow.className = "toggle-row";
	
	const frameEventsToggle = document.createElement("label");
	frameEventsToggle.className = "toggle-switch compact";
	frameEventsToggle.innerHTML = `
		<input type="checkbox" id="logFrameEventsCheckbox" ${logFrameEvents ? 'checked' : ''}>
		<span class="toggle-slider"></span>
	`;
	
	const frameEventsCheckbox = frameEventsToggle.querySelector('input');
	frameEventsCheckbox.addEventListener("change", () => {
		logFrameEvents = frameEventsCheckbox.checked;
		logger.info(`[controlInterface] Frame event logging ${logFrameEvents ? 'enabled' : 'disabled'}`);
		
		// Save the setting to localStorage
		try {
			localStorage.setItem('riveLogFrameEvents', JSON.stringify(logFrameEvents));
		} catch (e) {
			logger.warn("[controlInterface] Error saving frame events setting:", e);
		}
		
		// Re-setup event listeners to include/exclude frame events
		if (riveInstance) {
			setupEventListeners();
		}
	}, { passive: true });

	const frameEventsLabel = document.createElement("label");
	frameEventsLabel.htmlFor = "logFrameEventsCheckbox";
	frameEventsLabel.className = "toggle-label";
	frameEventsLabel.textContent = "Log Frame Events (High Frequency)";

	frameEventsRow.appendChild(frameEventsToggle);
	frameEventsRow.appendChild(frameEventsLabel);
	eventLoggingSection.appendChild(frameEventsRow);

	// Event Console Controls
	const eventConsoleControlsRow = document.createElement("div");
	eventConsoleControlsRow.className = "toggle-row";
	eventConsoleControlsRow.style.justifyContent = "space-between";
	eventConsoleControlsRow.style.paddingTop = "8px";
	eventConsoleControlsRow.style.borderTop = "1px solid rgba(255,255,255,0.1)";
	eventConsoleControlsRow.style.marginTop = "8px";

	const clearConsoleBtn = document.createElement("button");
	clearConsoleBtn.textContent = "Clear Console";
	clearConsoleBtn.className = "ctrl-btn ctrl-btn-secondary";
	clearConsoleBtn.style.fontSize = "0.75em";
	clearConsoleBtn.style.padding = "4px 8px";
	clearConsoleBtn.addEventListener("click", clearEventConsole, { passive: true });

	const resetSystemBtn = document.createElement("button");
	resetSystemBtn.textContent = "Reset System";
	resetSystemBtn.className = "ctrl-btn ctrl-btn-danger";
	resetSystemBtn.style.fontSize = "0.75em";
	resetSystemBtn.style.padding = "4px 8px";
	resetSystemBtn.addEventListener("click", resetEventSystem, { passive: true });

	eventConsoleControlsRow.appendChild(clearConsoleBtn);
	eventConsoleControlsRow.appendChild(resetSystemBtn);
	eventLoggingSection.appendChild(eventConsoleControlsRow);

	// Add help button event listener
	const helpButton = eventLoggingSection.querySelector("#eventLoggingHelpBtn");
	if (helpButton) {
		helpButton.addEventListener("click", showEventLoggingHelp, { passive: true });
	}

	controlsContainer.appendChild(eventLoggingSection);

	// Add Performance Monitoring section
	const performanceSection = document.createElement("details");
	performanceSection.className = "control-section";
	performanceSection.open = false;

	const performanceSummary = document.createElement("summary");
	performanceSummary.innerHTML = `
		Performance Monitoring
		<button class="help-button" id="performanceHelpBtn" title="Help">
			<span>?</span>
		</button>
	`;
	performanceSection.appendChild(performanceSummary);

	// FPS Counter toggle
	const fpsCounterRow = document.createElement("div");
	fpsCounterRow.className = "toggle-row";
	
	const fpsCounterToggle = document.createElement("label");
	fpsCounterToggle.className = "toggle-switch master-toggle";
	fpsCounterToggle.innerHTML = `
		<input type="checkbox" id="fpsCounterCheckbox" ${fpsCounterEnabled ? 'checked' : ''}>
		<span class="toggle-slider"></span>
	`;
	
	const fpsCounterCheckbox = fpsCounterToggle.querySelector('input');
	fpsCounterCheckbox.addEventListener("change", () => {
		fpsCounterEnabled = fpsCounterCheckbox.checked;
		logger.info(`[controlInterface] FPS counter ${fpsCounterEnabled ? 'enabled' : 'disabled'}`);
		
		// Save the setting to localStorage
		try {
			localStorage.setItem('riveFpsCounterEnabled', JSON.stringify(fpsCounterEnabled));
		} catch (e) {
			logger.warn("[controlInterface] Error saving FPS counter setting:", e);
		}
		
		// Enable/disable FPS counter on Rive instance
		if (riveInstance && typeof riveInstance.enableFPSCounter === 'function' && typeof riveInstance.disableFPSCounter === 'function') {
			if (fpsCounterEnabled) {
				// Create custom FPS callback to display in upper right corner of canvas
				const createFPSDisplay = () => {
					// Remove existing FPS display if any
					const existingDisplay = document.getElementById('rive-fps-display');
					if (existingDisplay) {
						existingDisplay.remove();
					}
					
					// Get the canvas container
					const canvasContainer = document.getElementById('canvasContainer') || document.getElementById('rive-canvas')?.parentElement;
					if (!canvasContainer) {
						logger.warn("[controlInterface] Canvas container not found for FPS display");
						return null;
					}
					
					// Create FPS display element
					const fpsDisplay = document.createElement('div');
					fpsDisplay.id = 'rive-fps-display';
					fpsDisplay.className = 'rive-fps-display fps-excellent';
					fpsDisplay.textContent = 'FPS: --';
					
					// Ensure container has relative positioning
					const containerStyle = window.getComputedStyle(canvasContainer);
					if (containerStyle.position === 'static') {
						canvasContainer.style.position = 'relative';
					}
					
					canvasContainer.appendChild(fpsDisplay);
					return fpsDisplay;
				};
				
				const fpsDisplay = createFPSDisplay();
				
				// Enable FPS counter with custom callback
				riveInstance.enableFPSCounter((fps) => {
					if (fpsDisplay && fpsCounterEnabled) {
						// Format FPS with color coding using CSS classes
						const fpsValue = Math.round(fps);
						
						// Remove existing performance classes
						fpsDisplay.classList.remove('fps-excellent', 'fps-moderate', 'fps-poor');
						
						// Add appropriate performance class
						if (fpsValue < 30) {
							fpsDisplay.classList.add('fps-poor');
						} else if (fpsValue < 50) {
							fpsDisplay.classList.add('fps-moderate');
						} else {
							fpsDisplay.classList.add('fps-excellent');
						}
						
						fpsDisplay.textContent = `FPS: ${fpsValue}`;
					}
				});
				
				logger.debug("[controlInterface] FPS counter enabled on new Rive instance");
			} else {
				// Disable FPS counter and remove display
				if (typeof riveInstance.disableFPSCounter === 'function') {
					try {
						riveInstance.disableFPSCounter();
						logger.debug("[controlInterface] FPS counter disabled on Rive instance");
					} catch (error) {
						logger.warn("[controlInterface] Error disabling FPS counter:", error);
					}
				} else {
					logger.debug("[controlInterface] disableFPSCounter method not available, just removing display");
				}
				
				const existingDisplay = document.getElementById('rive-fps-display');
				if (existingDisplay) {
					existingDisplay.remove();
				}
				logger.info("[controlInterface] FPS counter disabled and display removed");
			}
		} else {
			logger.warn("[controlInterface] Rive instance not available or FPS counter methods not found");
		}
		
		// Show a brief confirmation in status bar
		const statusMessageDiv = document.getElementById("statusMessage");
		if (statusMessageDiv) {
			statusMessageDiv.textContent = `📊 FPS counter ${fpsCounterEnabled ? 'enabled' : 'disabled'}`;
			setTimeout(() => {
				if (statusMessageDiv.textContent.includes('FPS counter')) {
					statusMessageDiv.textContent = "Ready";
				}
			}, 2000);
		}
	}, { passive: true });

	const fpsCounterLabel = document.createElement("label");
	fpsCounterLabel.htmlFor = "fpsCounterCheckbox";
	fpsCounterLabel.className = "toggle-label";
	fpsCounterLabel.textContent = "Show FPS Counter";

	fpsCounterRow.appendChild(fpsCounterToggle);
	fpsCounterRow.appendChild(fpsCounterLabel);
	performanceSection.appendChild(fpsCounterRow);

	// Performance info display
	const performanceInfoRow = document.createElement("div");
	performanceInfoRow.className = "toggle-row";
	performanceInfoRow.style.fontSize = "0.85em";
	performanceInfoRow.style.color = "#999";
	performanceInfoRow.style.marginTop = "8px";
	performanceInfoRow.style.paddingTop = "8px";
	performanceInfoRow.style.borderTop = "1px solid rgba(255,255,255,0.1)";
	performanceInfoRow.innerHTML = `
		<div style="line-height: 1.4;">
			<div>📊 FPS counter displays in the upper-right corner of the animation canvas</div>
			<div>🟢 Green: Good performance (≥50 FPS)</div>
			<div>🟠 Orange: Moderate performance (30-49 FPS)</div>
			<div>🔴 Red: Poor performance (&lt;30 FPS)</div>
		</div>
	`;
	performanceSection.appendChild(performanceInfoRow);

	// Add performance help button event listener
	const performanceHelpButton = performanceSection.querySelector("#performanceHelpBtn");
	if (performanceHelpButton) {
		performanceHelpButton.addEventListener("click", () => {
			logger.info("[controlInterface] Performance monitoring help requested");
			alert(`Performance Monitoring Help:

FPS Counter:
• Shows real-time frames per second in the upper-right corner of the animation canvas
• Color-coded for easy performance assessment:
  - Green (≥50 FPS): Excellent performance
  - Orange (30-49 FPS): Moderate performance  
  - Red (<30 FPS): Poor performance
• Automatically updates during animation playback
• Uses Rive's built-in FPS reporting system

Tips for Better Performance:
• Keep animation complexity reasonable
• Monitor FPS during state machine interactions
• Consider reducing animation detail if FPS drops consistently
• FPS may vary based on device capabilities and browser performance`);
		}, { passive: true });
	}

	controlsContainer.appendChild(performanceSection);

	// Add header with active information
	const infoDiv = document.createElement("div");
	infoDiv.className = "default-info";

	if (structuredControlData.activeArtboardName) {
		infoDiv.innerHTML += `<p><strong>Active Artboard:</strong> ${structuredControlData.activeArtboardName}</p>`;
	}

	if (
		structuredControlData.activeStateMachineNames &&
		structuredControlData.activeStateMachineNames.length > 0
	) {
		infoDiv.innerHTML += `<p><strong>Active State Machines:</strong> ${structuredControlData.activeStateMachineNames.join(", ")}</p>`;
	}

	if (structuredControlData.activeViewModelName) {
		// Check if this is the default ViewModel from parsed data
		const isDefaultVM =
			parsedRiveData &&
			parsedRiveData.defaultElements &&
			parsedRiveData.defaultElements.viewModelName ===
				structuredControlData.activeViewModelName;

		const vmDisplayName = isDefaultVM
			? `${structuredControlData.activeViewModelName} (Default)`
			: structuredControlData.activeViewModelName;

		infoDiv.innerHTML += `<p><strong>Active ViewModel:</strong> ${vmDisplayName}</p>`;
	}

	controlsContainer.appendChild(infoDiv);

	// Build State Machine Controls
	if (
		structuredControlData.stateMachineControls &&
		structuredControlData.stateMachineControls.length > 0
	) {
		buildStateMachineControls(
			controlsContainer,
			structuredControlData.stateMachineControls,
		);
	} else {
		// Optional: Message if no SM controls (e.g., if file has no SMs)
		// const noSmMsg = document.createElement('p'); noSmMsg.textContent = 'No State Machines found.';
		// controlsContainer.appendChild(noSmMsg);
	}

	// Create a dedicated section for ViewModel Controls for clarity
	const vmSection = document.createElement("div");
	vmSection.id = "viewmodel-controls-section";
	// const vmHeader = document.createElement('h4'); vmHeader.textContent = 'ViewModel Controls'; vmSection.appendChild(vmHeader);
	controlsContainer.appendChild(vmSection);

	if (
		structuredControlData.viewModelControls &&
		structuredControlData.viewModelControls.length > 0
	) {
		buildViewModelControls(
			vmSection,
			structuredControlData.viewModelControls,
		);
	} else {
		logger.info(
			"[controlInterface] No ViewModel controls to build (or no ViewModel found).",
		);
		const noVmMsg = document.createElement("p");
		noVmMsg.className = "info-note";
		noVmMsg.textContent =
			"No ViewModel properties available for control in this Rive file.";
		vmSection.appendChild(noVmMsg);
	}
}

/**
 * Builds controls for State Machines
 * @param {HTMLElement} container The container element
 * @param {Array} stateMachines The state machine controls data
 */
function buildStateMachineControls(container, stateMachines) {
	const smSection = document.createElement("details");
	smSection.className = "control-section";
	smSection.open = false;

	const smSummary = document.createElement("summary");
	smSummary.textContent = "State Machine Controls";
	smSection.appendChild(smSummary);

	stateMachines.forEach((sm) => {
		const smDetails = document.createElement("details");
		smDetails.className = "control-subsection";
		smDetails.open = false;

		const smName = document.createElement("summary");
		smName.textContent = `SM: ${sm.name}`;
		smDetails.appendChild(smName);

		// Add controls for each input
		if (sm.inputs && sm.inputs.length > 0) {
			sm.inputs.forEach((input) => {
				const { name, type, liveInput } = input;

				let ctrl = null;
				let notes = type;

				// Reference the enum from window.rive if available
				const riveRef = window.rive || {};
				const SMInputType = riveRef.StateMachineInputType || {};

				if (type === SMInputType.Boolean || type === "boolean") {
					ctrl = document.createElement("input");
					ctrl.type = "checkbox";
					ctrl.checked = !!liveInput.value;
					ctrl.addEventListener(
						"change",
						() => (liveInput.value = ctrl.checked),
						{ passive: true },
					);
				} else if (type === SMInputType.Number || type === "number") {
					ctrl = document.createElement("input");
					ctrl.type = "number";
					ctrl.value = liveInput.value || 0;
					ctrl.addEventListener(
						"input",
						() => (liveInput.value = parseFloat(ctrl.value) || 0),
						{ passive: true },
					);
				} else if (type === SMInputType.Trigger || type === "trigger") {
					ctrl = document.createElement("button");
					ctrl.textContent = "Fire";
					ctrl.addEventListener("click", () => liveInput.fire(), { passive: true,
					});
				}

				if (ctrl) {
					smDetails.appendChild(makeRow(name, ctrl, notes));
				}
			});
		} else {
			const noInputs = document.createElement("p");
			noInputs.className = "info-note";
			noInputs.textContent = "No inputs available for this state machine";
			smDetails.appendChild(noInputs);
		}

		smSection.appendChild(smDetails);
	});

	container.appendChild(smSection);
}

/**
 * Builds controls for ViewModels
 * @param {HTMLElement} container The container element
 * @param {Array} viewModels The ViewModel controls data
 */
function buildViewModelControls(container, viewModels, parentPath = "") {
	if (!viewModels || viewModels.length === 0) {
		// logger.info('No ViewModel controls to build'); // Already logged by caller
		return;
	}

	// logger.info(`Building controls for ${viewModels.length} ViewModels at path: '${parentPath}'`);

	viewModels.forEach((vm) => {
		const currentVmPath = parentPath
			? `${parentPath}/${vm.instanceName}`
			: vm.instanceName;
		// logger.debug(`Building controls for VM: ${vm.instanceName} (Path: ${currentVmPath})`);
		const vmDetails = document.createElement("details");
		vmDetails.className = "control-section"; // Use the same class as top-level sections
		vmDetails.open = false;

		const vmSummary = document.createElement("summary");
		vmSummary.textContent = `VM: ${vm.instanceName} ${vm.blueprintName ? `(${vm.blueprintName})` : ""}`;
		vmDetails.appendChild(vmSummary);

		// Add direct property controls
		if (vm.properties && vm.properties.length > 0) {
			// logger.debug(`Adding ${vm.properties.length} properties for ${vm.instanceName}`);
			vm.properties.forEach((prop) => {
				const propPath = `${currentVmPath}/${prop.name}`;
				const vmContext = {
					instanceName: vm.instanceName,
					blueprintName: vm.blueprintName,
					path: currentVmPath,
					isNested: parentPath !== ""
				};
				const ctrl = createControlForProperty(prop, vmContext);
				if (ctrl) {
					vmDetails.appendChild(
						makeRow(prop.name, ctrl, prop.type, propPath),
					);
				}
			});
		} else {
			logger.debug(`No properties found for ${vm.instanceName}`);
			const noProps = document.createElement("p");
			noProps.className = "info-note";
			noProps.textContent = "No direct properties in this ViewModel";
			vmDetails.appendChild(noProps);
		}

		// Add nested ViewModels (recursively)
		if (vm.nestedViewModels && vm.nestedViewModels.length > 0) {
			// logger.debug(`Adding ${vm.nestedViewModels.length} nested VMs for ${vm.instanceName}`);
			// Pass the currentVmPath as the parentPath for nested VMs
			buildNestedViewModelControls(
				vmDetails,
				vm.nestedViewModels,
				currentVmPath,
				1,
			);
		}

		container.appendChild(vmDetails);
	});
}

/**
 * Recursively builds controls for nested ViewModels
 * @param {HTMLElement} container The parent container element
 * @param {Array} nestedViewModels The nested ViewModel controls data
 * @param {string} parentPath The current path to the nested ViewModel
 * @param {number} depth Current nesting depth (for styling)
 */
function buildNestedViewModelControls(
	container,
	nestedViewModels,
	parentPath,
	depth = 1,
) {
	nestedViewModels.forEach((vm) => {
		const currentVmPath = `${parentPath}/${vm.instanceName}`;
		const nestedDetails = document.createElement("details");
		nestedDetails.className = `control-subsection nested-level-${depth}`;
		nestedDetails.open = false;

		const nestedSummary = document.createElement("summary");
		nestedSummary.textContent = `Nested: ${vm.instanceName}`;
		nestedDetails.appendChild(nestedSummary);

		if (vm.properties && vm.properties.length > 0) {
			vm.properties.forEach((prop) => {
				const propPath = `${currentVmPath}/${prop.name}`;
				const vmContext = {
					instanceName: vm.instanceName,
					blueprintName: vm.blueprintName || vm.instanceName,
					path: currentVmPath,
					isNested: true
				};
				const ctrl = createControlForProperty(prop, vmContext);
				if (ctrl) {
					nestedDetails.appendChild(
						makeRow(prop.name, ctrl, prop.type, propPath),
					);
				}
			});
		} else {
			const noProps = document.createElement("p");
			noProps.className = "info-note";
			noProps.textContent = "No properties in this nested ViewModel";
			nestedDetails.appendChild(noProps);
		}

		if (vm.nestedViewModels && vm.nestedViewModels.length > 0) {
			// Pass the currentVmPath for deeper nesting
			buildNestedViewModelControls(
				nestedDetails,
				vm.nestedViewModels,
				currentVmPath,
				depth + 1,
			);
		}

		container.appendChild(nestedDetails);
	});
}

/**
 * Updates UI controls to reflect current Rive property values
 * This ensures bidirectional feedback when properties change internally
 */
function updateControlsFromRive() {
	// logger.debug('Updating controls from Rive...'); // Keep this commented unless needed for extreme verbosity

	const allControlRows = document.querySelectorAll(
		"#dynamicControlsContainer .control-row",
	);

	allControlRows.forEach((row) => {
		const path = row.getAttribute("data-property-path");
		const labelEl = row.querySelector("label");
		const controlEl = row.querySelector("input, select, textarea");

		if (path && labelEl && controlEl) {
			// Extract the base property name from the label, as before
			// This is mostly for logging/debugging, path is the primary lookup key now.
			const propNameFromLabel = labelEl.childNodes[0].nodeValue
				.trim()
				.replace(/:$/, "");
			updateControlValueFromRive(propNameFromLabel, controlEl, path);
		} else {
			// logger.warn('[Polling] Found a control row without full path/label/control', row);
		}
	});
}

function updateControlValueFromRive(propNameForLogging, controlElement, path) {
	if (!structuredControlData || !structuredControlData.viewModelControls)
		return;
	if (
		document.activeElement === controlElement &&
		controlElement.type !== "checkbox" &&
		controlElement.type !== "select-one"
	) {
		return;
	}

	const findPropertyByPath = (rootVmArray, pathString) => {
		if (!pathString) return null;
		const segments = pathString.split("/");
		if (segments.length === 0) return null;

		let currentVmLevel = rootVmArray;
		let targetVm = null;

		// Find the root VM if the path starts with its instanceName
		// Assumes rootVmArray contains the top-level VM(s)
		const rootVmInstanceName = segments[0];
		targetVm = currentVmLevel.find(
			(vm) => vm.instanceName === rootVmInstanceName,
		);

		if (!targetVm) {
			// logger.warn(`[findPropertyByPath] Root VM '${rootVmInstanceName}' not found in path: ${pathString}`);
			return null;
		}

		// Navigate through nested VMs for segments between root and the final property name
		for (let i = 1; i < segments.length - 1; i++) {
			const nestedVmName = segments[i];
			if (
				targetVm &&
				targetVm.nestedViewModels &&
				targetVm.nestedViewModels.length > 0
			) {
				const foundNestedVm = targetVm.nestedViewModels.find(
					(nvm) => nvm.instanceName === nestedVmName,
				);
				if (foundNestedVm) {
					targetVm = foundNestedVm;
				} else {
					// logger.warn(`[findPropertyByPath] Nested VM '${nestedVmName}' not found in path: ${pathString}`);
					targetVm = null;
					break;
				}
			} else {
				// logger.warn(`[findPropertyByPath] No nested VMs in '${targetVm?.instanceName}' to find '${nestedVmName}' in path: ${pathString}`);
				targetVm = null;
				break;
			}
		}

		if (!targetVm) {
			// logger.warn(`[findPropertyByPath] Could not navigate to target VM for path: ${pathString}`);
			return null;
		}

		// The last segment is the property name
		const targetPropName = segments[segments.length - 1];
		const finalProp = targetVm.properties?.find(
			(p) => p.name === targetPropName,
		);

		if (finalProp && finalProp.liveProperty) {
			return finalProp.liveProperty;
		} else {
			// logger.warn(`[findPropertyByPath] Property '${targetPropName}' not found in VM '${targetVm.instanceName}' for path: ${pathString}`);
			return null;
		}
	};

	const liveProperty = findPropertyByPath(
		structuredControlData.viewModelControls,
		path,
	);

	if (liveProperty) {
		// logger.debug(`[Polling Path] Checking UI for '${path}', Rive value:`, liveProperty.value);

		if (controlElement.type === "checkbox") {
			const riveValueBool = !!liveProperty.value;
			if (controlElement.checked !== riveValueBool) {
				// console.log(`[Polling Path] Updating CHECKBOX for '${path}' from ${controlElement.checked} to ${riveValueBool}`);
				controlElement.checked = riveValueBool;
			}
		} else if (controlElement.type === "number") {
			// ... (robust number comparison as before) ...
			const controlValueNum = parseFloat(controlElement.value);
			const riveValueNum =
				liveProperty.value === null || liveProperty.value === undefined
					? NaN
					: parseFloat(liveProperty.value);
			if (isNaN(controlValueNum) && isNaN(riveValueNum)) {
				/* Both NaN */
			} else if (controlValueNum !== riveValueNum) {
				// console.log(`[Polling Path] Updating NUMBER for '${path}'...`);
				controlElement.value =
					riveValueNum !== undefined && !isNaN(riveValueNum)
						? riveValueNum
						: "";
			}
		} else if (controlElement.type === "color") {
			// ... (robust color comparison as before) ...
			const riveHexValue = argbToHex(liveProperty.value);
			if (controlElement.value.toUpperCase() !== riveHexValue) {
				// console.log(`[Polling Path] Updating COLOR for '${path}'...`);
				controlElement.value = riveHexValue;
			}
		} else if (controlElement.type === "select-one") {
			// ... (robust select comparison as before) ...
			const riveValueString =
				liveProperty.value === null || liveProperty.value === undefined
					? ""
					: String(liveProperty.value);
			if (controlElement.value !== riveValueString) {
				// console.log(`[Polling Path] Updating SELECT for '${path}'...`);
				controlElement.value = riveValueString;
			}
		} else if (controlElement.tagName.toLowerCase() === "textarea") {
			// ... (robust textarea comparison as before) ...
			const riveTextValue = (
				liveProperty.value === null || liveProperty.value === undefined
					? ""
					: String(liveProperty.value)
			);
			if (controlElement.value !== riveTextValue) {
				// console.log(`[Polling Path] Updating TEXTAREA for '${path}'...`);
				controlElement.value = riveTextValue;
			}
		}
	} else {
		// This warning is now more significant as path-based lookup should be precise.
		logger.warn(
			`[Polling Path] Property for path '${path}' (label: '${propNameForLogging}') not found in structuredControlData.`,
		);
	}
}

/**
 * Function to update controls if Rive data changes without a full re-parse (e.g., internal state change).
 * For now, it might just re-initialize if called.
 */
export function updateDynamicControls() {
	if (dynamicControlsInitialized && riveInstance && parsedRiveData) {
		logger.info("updateDynamicControls called. Re-initializing.");
		initDynamicControls(parsedRiveData);
	} else {
		logger.warn(
			"updateDynamicControls called but not initialized or Rive data missing.",
		);
	}
}

// Note: Resize handling has been moved to riveParserHandler.js to avoid conflicts

// Enhanced Rive Control Interface with Dynamic Panel Support
class RiveControlInterface {
	constructor() {
		this.riveInstance = null;
		this.currentFile = null;
		this.currentArtboard = null;
		this.currentTimeline = null;
		this.currentStateMachine = null;
		this.isTimelinePlaying = false;
		this.isStateMachineRunning = false;
		this.animationSpeed = 1.0;

		this.init();
		this.bindEvents();
		this.loadSavedSettings();
	}

	init() {
		// Initialize elements
		this.fileInput = document.getElementById("riveFilePicker");
		this.clearBtn = document.getElementById("clearFileBtn");
		this.artboardSelect = document.getElementById("artboardSelector");
		this.applyBtn = document.getElementById("applySelectionBtn");
		this.timelineSelect = document.getElementById("animationSelector");
		this.playTimelineBtn = document.getElementById("toggleTimelineBtn");
		this.pauseTimelineBtn = document.getElementById("pauseTimelineBtn");
		this.stateMachineSelect = document.getElementById(
			"stateMachineSelector",
		);
		this.playStateMachineBtn = document.getElementById(
			"toggleStateMachineBtn",
		);
		this.backgroundColorInput = document.getElementById(
			"canvasBackgroundColor",
		);
		this.fitSelect = document.getElementById("riveFitSelect");
		this.alignmentSelect = document.getElementById("riveAlignmentSelect");
		this.scaleInput = document.getElementById("layoutScaleInput");
		this.scaleUpBtn = document.getElementById("scaleUpBtn");
		this.scaleDownBtn = document.getElementById("scaleDownBtn");

		// Initialize button symbols and states
		if (this.playTimelineBtn) {
			this.playTimelineBtn.innerHTML = "▶";
			this.playTimelineBtn.setAttribute("data-state", "stopped");
		}
		if (this.playStateMachineBtn) {
			this.playStateMachineBtn.innerHTML = "▶";
			this.playStateMachineBtn.setAttribute("data-state", "stopped");
		}

		// State management
		this.state = {
			fileLoaded: false,
			artboardLoaded: false,
			timelineRunning: false,
			stateMachineRunning: false,
			backgroundColor: "#252525",
			fitMode: "contain",
			alignment: "center",
			scale: 1.0,
		};

		// Add file selected indicator
		this.createFileIndicator();
	}

	createFileIndicator() {
		const fileGroup = this.fileInput.closest(".file-group");
		if (fileGroup && !fileGroup.querySelector(".file-selected-indicator")) {
			const indicator = document.createElement("div");
			indicator.className = "file-selected-indicator";
			indicator.style.display = "none";
			indicator.innerHTML = `
                <span id="selectedFileName">No file selected</span>
                <button id="changeFileBtn" class="change-file-btn" title="Change file">Change</button>
            `;
			fileGroup.appendChild(indicator);

			// Bind change file button
			indicator
				.querySelector("#changeFileBtn")
				.addEventListener("click", () => {
					this.fileInput.click();
				}, { passive: true });
		}
	}

	bindEvents() {
		// File input events
		if (this.fileInput) {
			this.fileInput.addEventListener("change", (e) =>
				this.handleFileSelect(e),
			);
		}
		if (this.clearBtn) {
			this.clearBtn.addEventListener("click", () => this.clearFile(), { passive: true });
		}

		// Artboard events
		if (this.artboardSelect) {
			this.artboardSelect.addEventListener("change", (e) =>
				this.handleArtboardChange(e),
			);
		}
		if (this.applyBtn) {
			this.applyBtn.addEventListener("click", () => {
				this.applyArtboardSelection();
			}, { passive: true });
		}

		// Timeline events
		if (this.timelineSelect) {
			this.timelineSelect.addEventListener("change", (e) => {
				this.handleTimelineChange(e);
			});
		}
		if (this.playTimelineBtn) {
			this.playTimelineBtn.addEventListener("click", () => {
				this.toggleTimeline();
			}, { passive: true });
		}
		if (this.pauseTimelineBtn) {
			this.pauseTimelineBtn.addEventListener("click", () => {
				this.pauseTimeline();
			}, { passive: true });
		}

		// State machine events
		if (this.stateMachineSelect) {
			this.stateMachineSelect.addEventListener("change", (e) => {
				this.handleStateMachineChange(e);
			});
		}
		if (this.playStateMachineBtn) {
			this.playStateMachineBtn.addEventListener("click", () => {
				this.toggleStateMachine();
			}, { passive: true });
		}

		// Display control events
		if (this.backgroundColorInput) {
			this.backgroundColorInput.addEventListener("input", (e) => {
				this.updateBackgroundColor(e);
			});
		}
		if (this.fitSelect) {
			this.fitSelect.addEventListener("change", (e) => {
				this.updateFitMode(e);
			});
		}
		if (this.alignmentSelect) {
			this.alignmentSelect.addEventListener("change", (e) => {
				this.updateAlignment(e);
			});
		}
		if (this.scaleInput) {
			this.scaleInput.addEventListener("input", (e) => {
				this.updateScale(e);
			});
		}
		if (this.scaleUpBtn) {
			this.scaleUpBtn.addEventListener("click", () => {
				this.handleScaleUp();
			}, { passive: true });
		}
		if (this.scaleDownBtn) {
			this.scaleDownBtn.addEventListener("click", () => {
				this.handleScaleDown();
			}, { passive: true });
		}

		// Keyboard shortcuts
		document.addEventListener("keydown", (e) => {
			this.handleKeyboardShortcuts(e);
		});
	}

	// File Management
	handleFileSelect(event) {
		const file = event.target.files[0];
		if (file && file.name.endsWith(".riv")) {
			this.currentFile = file;
			this.state.fileLoaded = true;

			// Update UI
			this.updateFileIndicator(file.name);
			this.showNotification(
				`File "${file.name}" loaded successfully`,
				"success",
			);

			// Load file into Rive
			this.loadRiveFile(file);
		} else if (file) {
			this.showNotification("Please select a valid .riv file", "error");
			this.fileInput.value = "";
		}
	}

	updateFileIndicator(fileName) {
		const indicator = document.querySelector(".file-selected-indicator");
		const fileNameSpan = document.getElementById("selectedFileName");

		if (indicator && fileNameSpan) {
			fileNameSpan.textContent = fileName;
			indicator.style.display = "flex";
			this.fileInput.closest("div").style.display = "none";
		}
	}

	clearFile() {
		this.fileInput.value = "";
		this.currentFile = null;
		this.state.fileLoaded = false;

		// Reset UI
		const indicator = document.querySelector(".file-selected-indicator");
		if (indicator) {
			indicator.style.display = "none";
			this.fileInput.closest("div").style.display = "flex";
		}

		// Clear Rive instance
		if (this.riveInstance) {
			this.riveInstance.cleanup();
			this.riveInstance = null;
		}

		// Reset selects
		this.clearSelects();
		this.showNotification("File cleared", "info");
	}

	clearSelects() {
		if (this.artboardSelect) {
			this.artboardSelect.innerHTML =
				'<option value="">No file loaded</option>';
		}
		if (this.timelineSelect) {
			this.timelineSelect.innerHTML =
				'<option value="">No timelines</option>';
		}
		if (this.stateMachineSelect) {
			this.stateMachineSelect.innerHTML =
				'<option value="">No state machines</option>';
		}
	}

	// Rive File Loading
	async loadRiveFile(file) {
		try {
			const arrayBuffer = await file.arrayBuffer();
			const canvas = document.getElementById("rive-canvas");

			if (!canvas) {
				this.showNotification("Canvas not found", "error");
				return;
			}

			// Ensure we have access to the Rive engine
			const riveEngine = window.rive;
			if (!riveEngine) {
				this.showNotification("Rive engine not available", "error");
				return;
			}

			// Create new Rive instance
			this.riveInstance = new riveEngine.Rive({
				buffer: arrayBuffer,
				canvas: canvas,
				autoplay: false,
				onLoad: () => {
					this.onRiveLoaded();
				},
				onError: (error) => {
					this.showNotification(
						`Error loading Rive file: ${error}`,
						"error",
					);
				},
			});
		} catch (error) {
			this.showNotification(
				`Failed to load file: ${error.message}`,
				"error",
			);
		}
	}

	onRiveLoaded() {
		this.showNotification("Rive file loaded successfully", "success");
		this.populateArtboards();
		this.applyDisplaySettings();
		
		// Apply FPS counter setting to the new instance
		applyFpsCounterSetting(this.riveInstance);
	}

	populateArtboards() {
		if (!this.riveInstance || !this.artboardSelect) return;

		const artboardNames = this.riveInstance.artboardNames;
		this.artboardSelect.innerHTML =
			'<option value="">Select artboard</option>';

		artboardNames.forEach((name) => {
			const option = document.createElement("option");
			option.value = name;
			option.textContent = name;
			this.artboardSelect.appendChild(option);
		});
	}

	// Artboard Management
	handleArtboardChange(event) {
		this.currentArtboard = event.target.value;
		if (this.currentArtboard) {
			this.showNotification(
				`Artboard "${this.currentArtboard}" selected`,
				"info",
			);
		}
	}

	applyArtboardSelection() {
		if (!this.currentArtboard) {
			this.showNotification("Please select an artboard first", "warning");
			return;
		}

		this.showLoadingState(this.applyBtn, "Loading...");

		setTimeout(() => {
			try {
				// Switch to selected artboard
				this.riveInstance.artboard = this.currentArtboard;
				this.state.artboardLoaded = true;

				// Populate timelines and state machines
				this.populateTimelines();
				this.populateStateMachines();

				this.resetLoadingState(this.applyBtn, "Apply");
				this.showNotification(
					`Artboard "${this.currentArtboard}" loaded`,
					"success",
				);
			} catch (error) {
				this.resetLoadingState(this.applyBtn, "Apply");
				this.showNotification(
					`Failed to load artboard: ${error.message}`,
					"error",
				);
			}
		}, 500);
	}

	populateTimelines() {
		if (!this.riveInstance || !this.timelineSelect) return;

		const animationNames = this.riveInstance.animationNames;
		this.timelineSelect.innerHTML =
			'<option value="">Select timeline</option>';

		animationNames.forEach((name) => {
			const option = document.createElement("option");
			option.value = name;
			option.textContent = name;
			this.timelineSelect.appendChild(option);
		});
	}

	populateStateMachines() {
		if (!this.riveInstance || !this.stateMachineSelect) return;

		const stateMachineNames = this.riveInstance.stateMachineNames;
		this.stateMachineSelect.innerHTML =
			'<option value="">Select state machine</option>';

		stateMachineNames.forEach((name) => {
			const option = document.createElement("option");
			option.value = name;
			option.textContent = name;
			this.stateMachineSelect.appendChild(option);
		});
	}

	// Timeline Management
	handleTimelineChange(event) {
		this.currentTimeline = event.target.value;
		if (this.currentTimeline) {
			this.showNotification(
				`Timeline "${this.currentTimeline}" selected`,
				"info",
			);
		}
	}

	toggleTimeline() {
		if (!this.currentTimeline) {
			this.showNotification("Please select a timeline first", "warning");
			return;
		}

		if (this.isTimelinePlaying) {
			this.stopTimeline();
		} else {
			this.playTimeline();
		}
	}

	playTimeline() {
		try {
			this.riveInstance.play(this.currentTimeline);
			this.isTimelinePlaying = true;
			this.state.timelineRunning = true;

			this.updateTimelineButtons();
			this.showNotification(
				`Timeline "${this.currentTimeline}" started`,
				"success",
			);
		} catch (error) {
			this.showNotification(
				`Failed to play timeline: ${error.message}`,
				"error",
			);
		}
	}

	stopTimeline() {
		try {
			this.riveInstance.stop(this.currentTimeline);
			this.isTimelinePlaying = false;
			this.state.timelineRunning = false;

			this.updateTimelineButtons();
			this.showNotification(
				`Timeline "${this.currentTimeline}" stopped`,
				"info",
			);
		} catch (error) {
			this.showNotification(
				`Failed to stop timeline: ${error.message}`,
				"error",
			);
		}
	}

	pauseTimeline() {
		try {
			this.riveInstance.pause(this.currentTimeline);
			this.updateTimelineButtons();
			this.showNotification(
				`Timeline "${this.currentTimeline}" paused`,
				"info",
			);
		} catch (error) {
			this.showNotification(
				`Failed to pause timeline: ${error.message}`,
				"error",
			);
		}
	}

	updateTimelineButtons() {
		if (this.playTimelineBtn) {
			// Use flat Unicode symbols instead of emoji
			const icon = this.isTimelinePlaying ? "■" : "▶";
			this.playTimelineBtn.innerHTML = icon;
			this.playTimelineBtn.setAttribute(
				"data-state",
				this.isTimelinePlaying ? "playing" : "stopped",
			);
		}
	}

	// State Machine Management
	handleStateMachineChange(event) {
		this.currentStateMachine = event.target.value;
		if (this.currentStateMachine) {
			this.showNotification(
				`State machine "${this.currentStateMachine}" selected`,
				"info",
			);
		}
	}

	toggleStateMachine() {
		if (!this.currentStateMachine) {
			this.showNotification(
				"Please select a state machine first",
				"warning",
			);
			return;
		}

		if (this.isStateMachineRunning) {
			this.stopStateMachine();
		} else {
			this.playStateMachine();
		}
	}

	playStateMachine() {
		this.showLoadingState(this.playStateMachineBtn, "Starting...");

		setTimeout(() => {
			try {
				this.riveInstance.play(this.currentStateMachine);
				this.isStateMachineRunning = true;
				this.state.stateMachineRunning = true;

				this.updateStateMachineButtons();
				this.showNotification(
					`State machine "${this.currentStateMachine}" started`,
					"success",
				);
			} catch (error) {
				this.isStateMachineRunning = false;
				this.state.stateMachineRunning = false;
				this.updateStateMachineButtons();
				this.showNotification(
					`Failed to start state machine: ${error.message}`,
					"error",
				);
			}
		}, 1000);
	}

	stopStateMachine() {
		try {
			this.riveInstance.stop(this.currentStateMachine);
			this.isStateMachineRunning = false;
			this.state.stateMachineRunning = false;

			this.updateStateMachineButtons();
			this.showNotification(
				`State machine "${this.currentStateMachine}" stopped`,
				"info",
			);
		} catch (error) {
			this.showNotification(
				`Failed to stop state machine: ${error.message}`,
				"error",
			);
		}
	}

	updateStateMachineButtons() {
		if (this.playStateMachineBtn) {
			// Use flat Unicode symbols instead of emoji
			const icon = this.isStateMachineRunning ? "■" : "▶";
			this.playStateMachineBtn.innerHTML = icon;
			this.playStateMachineBtn.setAttribute(
				"data-state",
				this.isStateMachineRunning ? "playing" : "stopped",
			);
		}
	}

	// Display Controls
	updateBackgroundColor(event) {
		const color = event.target.value;
		this.state.backgroundColor = color;

		const canvas = document.getElementById("rive-canvas");
		if (canvas) {
			canvas.style.backgroundColor = color;
		}

		this.saveSettings();
		this.showNotification(`Background color updated`, "info");
	}

	updateFitMode(event) {
		this.state.fitMode = event.target.value;

		// Enable/disable scale input based on fit mode
		if (this.scaleInput) {
			const isLayoutMode = event.target.value === "layout";
			this.scaleInput.disabled = !isLayoutMode;
			this.scaleInput.style.opacity = isLayoutMode ? "1" : "0.5";
			this.scaleInput.style.cursor = isLayoutMode
				? "text"
				: "not-allowed";
		}

		// Enable/disable scale buttons based on fit mode
		if (this.scaleUpBtn && this.scaleDownBtn) {
			const isLayoutMode = event.target.value === "layout";
			this.scaleUpBtn.disabled = !isLayoutMode;
			this.scaleDownBtn.disabled = !isLayoutMode;
			this.scaleUpBtn.style.opacity = isLayoutMode ? "1" : "0.5";
			this.scaleDownBtn.style.opacity = isLayoutMode ? "1" : "0.5";
			this.scaleUpBtn.style.cursor = isLayoutMode
				? "pointer"
				: "not-allowed";
			this.scaleDownBtn.style.cursor = isLayoutMode
				? "pointer"
				: "not-allowed";
		}

		this.applyDisplaySettings();
		this.saveSettings();
		this.showNotification(`Fit mode set to ${event.target.value}`, "info");
	}

	updateAlignment(event) {
		this.state.alignment = event.target.value;
		this.applyDisplaySettings();
		this.saveSettings();
		this.showNotification(`Alignment set to ${event.target.value}`, "info");
	}

	updateScale(event) {
		const scale = parseFloat(event.target.value);
		if (!isNaN(scale) && scale > 0) {
			this.state.scale = scale;
			this.applyDisplaySettings();
			this.saveSettings();
			this.showNotification(`Scale set to ${scale}`, "info");
		}
	}

	handleScaleUp() {
		logger.debug(
			`[RiveControlInterface] ScaleUp clicked. Input: ${!!this.scaleInput}, Fit mode: ${this.state.fitMode}`,
		);

		if (!this.scaleInput || this.state.fitMode !== "layout") {
			logger.debug(
				"[RiveControlInterface] ScaleUp ignored - not in layout mode or no input",
			);
			return;
		}

		const currentValue = parseFloat(this.scaleInput.value) || 1;
		const step = parseFloat(this.scaleInput.step) || 0.1;
		const max = parseFloat(this.scaleInput.max) || 5;

		logger.debug(
			`[RiveControlInterface] ScaleUp - Current: ${currentValue}, Step: ${step}, Max: ${max}`,
		);

		const newValue = Math.min(currentValue + step, max);
		this.scaleInput.value = newValue.toFixed(1);

		logger.debug(
			`[RiveControlInterface] ScaleUp - New value: ${newValue.toFixed(1)}`,
		);

		// Trigger the update
		this.updateScale({ target: this.scaleInput });
	}

	handleScaleDown() {
		if (!this.scaleInput || this.state.fitMode !== "layout") return;

		const currentValue = parseFloat(this.scaleInput.value) || 1;
		const step = parseFloat(this.scaleInput.step) || 0.1;
		const min = parseFloat(this.scaleInput.min) || 0.1;

		const newValue = Math.max(currentValue - step, min);
		this.scaleInput.value = newValue.toFixed(1);

		// Trigger the update
		this.updateScale({ target: this.scaleInput });
	}

	applyDisplaySettings() {
		if (!this.riveInstance) return;

		try {
			// Ensure we have access to the Rive engine
			const riveEngine = window.rive;
			if (!riveEngine) {
				console.warn("Rive engine not available");
				return;
			}

			// Map string values to Rive enums
			const fitMap = {
				contain: riveEngine.Fit.Contain,
				cover: riveEngine.Fit.Cover,
				fill: riveEngine.Fit.Fill,
				fitWidth: riveEngine.Fit.FitWidth,
				fitHeight: riveEngine.Fit.FitHeight,
				scaleDown: riveEngine.Fit.ScaleDown,
				none: riveEngine.Fit.None,
				layout: riveEngine.Fit.Layout,
			};

			const alignmentMap = {
				center: riveEngine.Alignment.Center,
				topLeft: riveEngine.Alignment.TopLeft,
				topCenter: riveEngine.Alignment.TopCenter,
				topRight: riveEngine.Alignment.TopRight,
				centerLeft: riveEngine.Alignment.CenterLeft,
				centerRight: riveEngine.Alignment.CenterRight,
				bottomLeft: riveEngine.Alignment.BottomLeft,
				bottomCenter: riveEngine.Alignment.BottomCenter,
				bottomRight: riveEngine.Alignment.BottomRight,
			};

			// Create layout configuration
			const layoutConfig = {
				fit: fitMap[this.state.fitMode] || riveEngine.Fit.Contain,
				alignment:
					alignmentMap[this.state.alignment] || riveEngine.Alignment.Center,
			};

			// Add layout scale factor if using Layout fit mode
			if (this.state.fitMode === "layout") {
				layoutConfig.layoutScaleFactor = this.state.scale;
			}

			// Apply fit mode and alignment
			this.riveInstance.layout = new riveEngine.Layout(layoutConfig);

			// Apply background color
			const canvas = document.getElementById("rive-canvas");
			if (canvas) {
				canvas.style.backgroundColor = this.state.backgroundColor;
			}

			this.riveInstance.resizeDrawingSurfaceToCanvas();
		} catch (error) {
			console.warn("Failed to apply display settings:", error);
		}
	}

	// Utility Functions
	showLoadingState(button, text) {
		if (button) {
			button.disabled = true;
			button.textContent = text;
			button.style.opacity = "0.7";
		}
	}

	resetLoadingState(button, originalText) {
		if (button) {
			button.disabled = false;
			// Check if this is a play/stop button and use flat Unicode symbols
			if (button.id === "toggleTimelineBtn" || button.id === "toggleStateMachineBtn") {
				const icon = originalText === "Stop" ? "■" : "▶";
				button.innerHTML = icon;
			} else {
				button.textContent = originalText;
			}
			button.style.opacity = "1";
		}
	}

	showNotification(message, type = "info") {
		// Create notification element
		const notification = document.createElement("div");
		notification.className = `notification notification-${type}`;
		notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

		// Style the notification
		Object.assign(notification.style, {
			position: "fixed",
			top: "20px",
			right: "20px",
			padding: "12px 20px",
			borderRadius: "8px",
			color: "white",
			fontSize: "0.9rem",
			fontWeight: "500",
			zIndex: "10000",
			display: "flex",
			alignItems: "center",
			gap: "8px",
			minWidth: "250px",
			boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
			transform: "translateX(100%)",
			transition: "transform 0.3s ease",
		});

		// Set background color based on type
		const colors = {
			success: "linear-gradient(135deg, #10b981, #059669)",
			warning: "linear-gradient(135deg, #f59e0b, #d97706)",
			error: "linear-gradient(135deg, #ef4444, #dc2626)",
			info: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
		};
		notification.style.background = colors[type] || colors.info;

		document.body.appendChild(notification);

		// Animate in
		setTimeout(() => {
			notification.style.transform = "translateX(0)";
		}, 100);

		// Remove after delay
		setTimeout(() => {
			notification.style.transform = "translateX(100%)";
			setTimeout(() => {
				if (notification.parentNode) {
					notification.parentNode.removeChild(notification);
				}
			}, 300);
		}, 3000);
	}

	getNotificationIcon(type) {
		const icons = {
			success: "check-circle",
			warning: "exclamation-triangle",
			error: "times-circle",
			info: "info-circle",
		};
		return icons[type] || icons.info;
	}

	handleKeyboardShortcuts(event) {
		// Ctrl/Cmd + shortcuts
		if (event.ctrlKey || event.metaKey) {
			switch (event.key) {
				case "o":
					event.preventDefault();
					if (this.fileInput) this.fileInput.click();
					break;
				case "r":
					event.preventDefault();
					this.clearFile();
					break;
				case "Enter":
					event.preventDefault();
					if (this.currentArtboard) {
						this.applyArtboardSelection();
					}
					break;
			}
		}

		// Space bar for play/pause
		if (
			event.code === "Space" &&
			event.target.tagName !== "INPUT" &&
			event.target.tagName !== "SELECT"
		) {
			event.preventDefault();
			if (this.currentTimeline) {
				this.toggleTimeline();
			}
		}
	}

	saveSettings() {
		const settings = {
			backgroundColor: this.state.backgroundColor,
			fitMode: this.state.fitMode,
			alignment: this.state.alignment,
			scale: this.state.scale,
		};

		localStorage.setItem("riveControlSettings", JSON.stringify(settings));
	}

	loadSavedSettings() {
		const saved = localStorage.getItem("riveControlSettings");
		if (saved) {
			try {
				const settings = JSON.parse(saved);

				// Apply saved settings
				if (settings.backgroundColor && this.backgroundColorInput) {
					this.backgroundColorInput.value = settings.backgroundColor;
					this.state.backgroundColor = settings.backgroundColor;
				}

				if (settings.fitMode && this.fitSelect) {
					this.fitSelect.value = settings.fitMode;
					this.state.fitMode = settings.fitMode;
				}

				if (settings.alignment && this.alignmentSelect) {
					this.alignmentSelect.value = settings.alignment;
					this.state.alignment = settings.alignment;
				}

				if (settings.scale !== undefined && this.scaleInput) {
					this.scaleInput.value = settings.scale;
					this.state.scale = settings.scale;
				}

				// Initialize scale input state based on fit mode
				if (this.fitSelect && this.scaleInput) {
					const isLayoutMode = this.state.fitMode === "layout";
					this.scaleInput.disabled = !isLayoutMode;
					this.scaleInput.style.opacity = isLayoutMode ? "1" : "0.5";
					this.scaleInput.style.cursor = isLayoutMode
						? "text"
						: "not-allowed";
				}

				// Initialize scale button state based on fit mode
				if (this.scaleUpBtn && this.scaleDownBtn) {
					const isLayoutMode = this.state.fitMode === "layout";
					this.scaleUpBtn.disabled = !isLayoutMode;
					this.scaleDownBtn.disabled = !isLayoutMode;
					this.scaleUpBtn.style.opacity = isLayoutMode ? "1" : "0.5";
					this.scaleDownBtn.style.opacity = isLayoutMode
						? "1"
						: "0.5";
					this.scaleUpBtn.style.cursor = isLayoutMode
						? "pointer"
						: "not-allowed";
					this.scaleDownBtn.style.cursor = isLayoutMode
						? "pointer"
						: "not-allowed";
				}
			} catch (error) {
				console.warn("Failed to load saved settings:", error);
			}
		}
	}

	// Public API
	getRiveInstance() {
		return this.riveInstance;
	}

	getCurrentState() {
		return { ...this.state };
	}
}

// Initialize the control interface when DOM is loaded
let riveControlInterface;
document.addEventListener("DOMContentLoaded", () => {
	riveControlInterface = new RiveControlInterface();

	// Make it globally accessible for debugging
	window.riveControlInterface = riveControlInterface;
}, { passive: true });

export default RiveControlInterface;
