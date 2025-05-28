/**
 * @file riveEventMapper.js
 * Comprehensive Rive event mapping and formatting based on the official C++ bindings
 * 
 * This mapper is based on the definitive C++ to JavaScript bindings found in:
 * rive-wasm/wasm/src/bindings.cpp - createRiveEventObject function
 * and the TypeScript definitions in rive.ts
 */

import { createLogger } from './debugger/debugLogger.js';

const logger = createLogger('eventMapper');

/**
 * Complete event type mappings from the C++ runtime and TypeScript definitions
 * Based on rive.ts and C++ bindings
 */
const EVENT_TYPES = {
	// Core event types from C++ coreType() and TypeScript RiveEventType enum
	GENERAL_EVENT: 128,      // RiveEventType::General
	OPEN_URL_EVENT: 131,     // RiveEventType::OpenUrl
	
	// State machine input types from TypeScript StateMachineInputType enum
	NUMBER_INPUT: 56,        // StateMachineInputType::Number
	TRIGGER_INPUT: 58,       // StateMachineInputType::Trigger
	BOOLEAN_INPUT: 59,       // StateMachineInputType::Boolean
	
	// Custom property types from C++ bindings (CustomProperty classes)
	CUSTOM_PROPERTY_BOOLEAN: 'CustomPropertyBoolean',
	CUSTOM_PROPERTY_STRING: 'CustomPropertyString', 
	CUSTOM_PROPERTY_NUMBER: 'CustomPropertyNumber',
	
	// ViewModel property types from TypeScript PropertyType enum
	PROPERTY_NUMBER: 'number',
	PROPERTY_STRING: 'string',
	PROPERTY_BOOLEAN: 'boolean',
	PROPERTY_COLOR: 'color',
	PROPERTY_TRIGGER: 'trigger',
	PROPERTY_ENUM: 'enum',
	PROPERTY_LIST: 'list',
	PROPERTY_IMAGE: 'image',
	
	// Animation loop types from TypeScript LoopType enum
	LOOP_ONESHOT: 'oneshot',  // has value 0 in runtime
	LOOP_LOOP: 'loop',        // has value 1 in runtime
	LOOP_PINGPONG: 'pingpong', // has value 2 in runtime
	
	// Event types from TypeScript EventType enum
	EVENT_LOAD: 'load',
	EVENT_LOAD_ERROR: 'loaderror',
	EVENT_PLAY: 'play',
	EVENT_PAUSE: 'pause',
	EVENT_STOP: 'stop',
	EVENT_LOOP: 'loop',
	EVENT_DRAW: 'draw',
	EVENT_ADVANCE: 'advance',
	EVENT_STATE_CHANGE: 'statechange',
	EVENT_RIVE_EVENT: 'riveevent',
	EVENT_AUDIO_STATUS_CHANGE: 'audiostatuschange',
	
	// Fit types from TypeScript Fit enum
	FIT_COVER: 'cover',
	FIT_CONTAIN: 'contain',
	FIT_FILL: 'fill',
	FIT_FIT_WIDTH: 'fitWidth',
	FIT_FIT_HEIGHT: 'fitHeight',
	FIT_NONE: 'none',
	FIT_SCALE_DOWN: 'scaleDown',
	FIT_LAYOUT: 'layout',
	
	// Alignment types from TypeScript Alignment enum
	ALIGN_CENTER: 'center',
	ALIGN_TOP_LEFT: 'topLeft',
	ALIGN_TOP_CENTER: 'topCenter',
	ALIGN_TOP_RIGHT: 'topRight',
	ALIGN_CENTER_LEFT: 'centerLeft',
	ALIGN_CENTER_RIGHT: 'centerRight',
	ALIGN_BOTTOM_LEFT: 'bottomLeft',
	ALIGN_BOTTOM_CENTER: 'bottomCenter',
	ALIGN_BOTTOM_RIGHT: 'bottomRight',
	
	// State types from C++ bindings (for state machine states)
	ANIMATION_STATE: 'AnimationState',
	ENTRY_STATE: 'EntryState',
	EXIT_STATE: 'ExitState',
	ANY_STATE: 'AnyState',
	
	// System audio status from TypeScript
	AUDIO_AVAILABLE: 'AVAILABLE',
	AUDIO_UNAVAILABLE: 'UNAVAILABLE'
};

/**
 * Event categories for organization and filtering
 */
const EVENT_CATEGORIES = {
	CUSTOM: 'custom',           // User-defined events from Rive file
	STATE_CHANGE: 'state', // StateChanged, ValueChanged
	NESTED_VIEWMODEL: 'nested_vm', // Nested ViewModel property changes
	NESTED_ARTBOARD: 'nested_ab', // Nested artboard state machine changes
	PLAYBACK: 'play',       // Play, Pause, Stop, Loop
	SYSTEM: 'sys',           // Internal system events
	FRAME: 'frm',              // Frame-level events (Draw, Advance)
	ASSET: 'asset'             // Asset management events (replace, reset, etc.)
};

/**
 * Input type name mappings for better display
 */
const INPUT_TYPE_NAMES = {
	[EVENT_TYPES.BOOLEAN_INPUT]: 'Boolean',
	[EVENT_TYPES.NUMBER_INPUT]: 'Number', 
	[EVENT_TYPES.TRIGGER_INPUT]: 'Trigger',
	59: 'Boolean',  // Explicit numeric mapping
	56: 'Number',   // Explicit numeric mapping
	58: 'Trigger'   // Explicit numeric mapping
};

/**
 * Event type name mappings for better display
 */
const EVENT_TYPE_NAMES = {
	[EVENT_TYPES.GENERAL_EVENT]: 'General Event',
	[EVENT_TYPES.OPEN_URL_EVENT]: 'Open URL Event',
	128: 'General Event',  // Explicit numeric mapping
	131: 'Open URL Event'  // Explicit numeric mapping
};

/**
 * Property type name mappings for better display
 */
const PROPERTY_TYPE_NAMES = {
	[EVENT_TYPES.PROPERTY_NUMBER]: 'Number Property',
	[EVENT_TYPES.PROPERTY_STRING]: 'String Property',
	[EVENT_TYPES.PROPERTY_BOOLEAN]: 'Boolean Property',
	[EVENT_TYPES.PROPERTY_COLOR]: 'Color Property',
	[EVENT_TYPES.PROPERTY_TRIGGER]: 'Trigger Property',
	[EVENT_TYPES.PROPERTY_ENUM]: 'Enum Property',
	[EVENT_TYPES.PROPERTY_LIST]: 'List Property',
	[EVENT_TYPES.PROPERTY_IMAGE]: 'Image Property'
};

/**
 * Determines if an event should be logged based on current filter settings
 * @param {string} eventType - The event type (e.g., 'RiveEvent', 'StateChanged')
 * @param {boolean} logCustomEvents - Whether to log custom events
 * @param {boolean} logStateChangeEvents - Whether to log state change events
 * @param {boolean} logNestedViewModelEvents - Whether to log nested ViewModel events
 * @param {boolean} logPlaybackEvents - Whether to log playback events
 * @param {boolean} logSystemEvents - Whether to log system events
 * @param {boolean} logFrameEvents - Whether to log frame events
 * @returns {boolean} Whether the event should be logged
 */
export function shouldLogEvent(eventType, logCustomEvents, logStateChangeEvents, logNestedViewModelEvents = true, logPlaybackEvents = true, logSystemEvents = true, logFrameEvents = false, eventData = null) {
	const category = getEventCategory(eventType, eventData);
	
	switch (category) {
		case EVENT_CATEGORIES.CUSTOM:
			return logCustomEvents;
		case EVENT_CATEGORIES.STATE_CHANGE:
			return logStateChangeEvents;
		case EVENT_CATEGORIES.NESTED_VIEWMODEL:
			return logNestedViewModelEvents;
		case EVENT_CATEGORIES.NESTED_ARTBOARD:
			return false; // Nested artboard events are disabled
		case EVENT_CATEGORIES.PLAYBACK:
			return logPlaybackEvents;
		case EVENT_CATEGORIES.SYSTEM:
			return logSystemEvents;
		case EVENT_CATEGORIES.FRAME:
			return logFrameEvents;
		case EVENT_CATEGORIES.ASSET:
			return logSystemEvents; // Asset events follow system events setting
		default:
			return true;
	}
}

/**
 * Gets the category for an event type
 * @param {string} eventType - The event type
 * @param {Object} eventData - Optional event data for context-sensitive categorization
 * @returns {string} The event category
 */
function getEventCategory(eventType, eventData = null) {
	switch (eventType) {
		case 'RiveEvent':
		case 'riveevent':
			return EVENT_CATEGORIES.CUSTOM;
		case 'StateChanged':
		case 'StateChange':  // Handle both variants
		case 'ValueChanged':
		case 'statechange':  // Handle lowercase variant
			return EVENT_CATEGORIES.STATE_CHANGE;
		case 'ViewModelPropertyChanged':
			// Check if this is a nested ViewModel event
			if (eventData && eventData.isNested) {
				return EVENT_CATEGORIES.NESTED_VIEWMODEL;
			}
			return EVENT_CATEGORIES.STATE_CHANGE;
		case 'NestedArtboardStateChanged':
		case 'NestedStateMachineChanged':
			return EVENT_CATEGORIES.NESTED_ARTBOARD;
		case 'Play':
		case 'Pause':
		case 'Stop':
		case 'Loop':
		case 'play':
		case 'pause':
		case 'stop':
		case 'loop':
			return EVENT_CATEGORIES.PLAYBACK;
		case 'Load':
		case 'LoadError':
		case 'load':
		case 'loaderror':
			return EVENT_CATEGORIES.SYSTEM;
		case 'Draw':
		case 'Advance':
		case 'draw':
		case 'advance':
			return EVENT_CATEGORIES.FRAME;
		case 'AssetFileReplacement':
		case 'AssetUrlReplacement':
		case 'AssetImageSubstitution':
		case 'AssetReset':
		case 'AssetInfo':
		case 'AssetError':
		case 'AssetFileReplacementError':
		case 'AssetUrlReplacementError':
		case 'AssetImageSubstitutionError':
		case 'AssetResetError':
			return EVENT_CATEGORIES.ASSET;
		default:
			return EVENT_CATEGORIES.SYSTEM;
	}
}

/**
 * Gets a color for the event category
 * @param {string} eventType - The event type
 * @returns {string} CSS color for the category
 */
export function getEventCategoryColor(eventType, eventData = null) {
	const category = getEventCategory(eventType, eventData);
	
	switch (category) {
		case EVENT_CATEGORIES.CUSTOM:
			return '#00ff41';      // Bright green for custom events
		case EVENT_CATEGORIES.STATE_CHANGE:
			return '#ffa500';      // Orange for state changes
		case EVENT_CATEGORIES.NESTED_VIEWMODEL:
			return '#ff69b4';      // Hot pink for nested ViewModel events
		case EVENT_CATEGORIES.NESTED_ARTBOARD:
			return '#9370db';      // Medium purple for nested artboard events
		case EVENT_CATEGORIES.PLAYBACK:
			return '#00bfff';      // Blue for playback events
		case EVENT_CATEGORIES.SYSTEM:
			return '#ff6b6b';      // Red for system events
		case EVENT_CATEGORIES.ASSET:
			return '#ffd700';      // Gold for asset events
		default:
			return '#ffffff';      // White for unknown
	}
}

/**
 * Gets a human-readable name for an input type
 * @param {number|string} inputType - The input type code or name
 * @returns {string} Human-readable input type name
 */
function getInputTypeName(inputType) {
	return INPUT_TYPE_NAMES[inputType] || `Type ${inputType}`;
}

/**
 * Gets a human-readable name for an event type
 * @param {number|string} eventType - The event type code or name
 * @returns {string} Human-readable event type name
 */
function getEventTypeName(eventType) {
	return EVENT_TYPE_NAMES[eventType] || `Type ${eventType}`;
}

/**
 * Gets a human-readable name for a property type
 * @param {string} propertyType - The property type name
 * @returns {string} Human-readable property type name
 */
function getPropertyTypeName(propertyType) {
	return PROPERTY_TYPE_NAMES[propertyType] || `${propertyType} Property`;
}

/**
 * Formats a Rive event for display based on the definitive C++ bindings structure
 * @param {string} eventType - The type of event (e.g., 'RiveEvent', 'StateChanged')
 * @param {Object} eventData - The event data object from Rive
 * @param {Object} structuredControlData - Optional control data for context
 * @returns {Object} Formatted event with multiple message formats
 */
export function formatRiveEvent(eventType, eventData, structuredControlData = null) {
	const timestamp = new Date().toLocaleTimeString();
	const category = getEventCategory(eventType, eventData);
	const color = getEventCategoryColor(eventType, eventData);
	
	// Log raw event data for debugging when logging is actually enabled
	// Check the actual LoggerAPI enabled state, not just debug controls panel visibility
	const isLoggingEnabled = window.debugHelper?.api?.isEnabled?.() || false;
	if (isLoggingEnabled) {
		// Use logger instead of direct console calls to respect global logging state
		try {
			logger.debug(`🔍 [Event Debug] ${eventType} - Raw eventData:`, eventData);
			logger.debug(`🔍 [Event Debug] ${eventType} - Structured control data:`, structuredControlData);
			
			// Special logging for riveevent types
			if (eventType === 'riveevent' && eventData.data) {
				logger.debug('🎯 Custom Event Details:', {
					name: eventData.data.name,
					type: eventData.data.type,
					delay: eventData.data.delay,
					properties: eventData.data.properties
				});
			}
		} catch (e) {
			// Silently ignore logging errors when debugging is disabled
		}
	}
	
	let result;
	
	try {
		// Parse based on the definitive C++ bindings structure
		switch (eventType) {
			case 'RiveEvent':
			case 'riveevent':
				result = formatCustomRiveEvent(eventData, timestamp, color);
				break;
			case 'StateChanged':
			case 'StateChange':
			case 'statechange':
				result = formatStateChangedEvent(eventData, timestamp, color);
				break;
			case 'ValueChanged':
				result = formatValueChangedEvent(eventData, timestamp, color, structuredControlData);
				break;
			case 'ViewModelPropertyChanged':
				result = formatViewModelPropertyChangedEvent(eventData, timestamp, color);
				break;
			case 'NestedArtboardStateChanged':
			case 'NestedStateMachineChanged':
				result = formatNestedArtboardEvent(eventType, eventData, timestamp, color);
				break;
			case 'Play':
			case 'Pause':
			case 'Stop':
			case 'Loop':
			case 'play':
			case 'pause':
			case 'stop':
			case 'loop':
				result = formatPlaybackEvent(eventType, eventData, timestamp, color);
				break;
			case 'Load':
			case 'LoadError':
			case 'load':
			case 'loaderror':
				result = formatSystemEvent(eventType, eventData, timestamp, color);
				break;
			case 'Draw':
			case 'Advance':
			case 'draw':
			case 'advance':
				result = formatFrameEvent(eventType, eventData, timestamp, color);
				break;
			case 'AssetFileReplacement':
			case 'AssetUrlReplacement':
			case 'AssetImageSubstitution':
			case 'AssetReset':
			case 'AssetInfo':
			case 'AssetError':
			case 'AssetFileReplacementError':
			case 'AssetUrlReplacementError':
			case 'AssetImageSubstitutionError':
			case 'AssetResetError':
				result = formatAssetEvent(eventType, eventData, timestamp, color);
				break;
			default:
				result = formatGenericEvent(eventType, eventData, timestamp, color);
		}
		
		// Log the final result for debugging only when logging is enabled
		if (isLoggingEnabled) {
			try {
				logger.debug(`🔍 [Event Debug] ${eventType} - Final formatted result:`, result);
			} catch (e) {
				// Silently ignore logging errors
			}
		}
		
		logger.debug(`Formatted ${eventType} event`, result);
		
	} catch (error) {
		logger.error(`Error formatting ${eventType} event:`, error);
		result = {
			statusMessage: `Error: ${eventType}`,
			consoleMessage: `[${timestamp}] ❌ Error formatting ${eventType}: ${error.message}`,
			detailedMessage: `Error processing ${eventType} event: ${error.message}`
		};
		
		if (isLoggingEnabled) {
			try {
				logger.error(`🔍 [Event Debug] ${eventType} - Event formatting error:`, error);
			} catch (e) {
				// Silently ignore logging errors
			}
		}
	}
	
	return result;
}

/**
 * Formats a custom Rive event based on C++ bindings structure
 * Expected structure from JavaScript runtime:
 * {
 *   type: 'riveevent',
 *   data: {
 *     name: string,
 *     type: number,
 *     delay?: number,
 *     url?: string,      // For OpenUrlEvent
 *     target?: string,   // For OpenUrlEvent  
 *     properties?: { [key: string]: boolean | string | number }
 *   }
 * }
 */
function formatCustomRiveEvent(eventData, timestamp, color) {
	// Handle nested data structure: eventData.data contains the actual event info
	const actualEventData = eventData.data || eventData;
	const eventName = actualEventData.name || 'Unknown Event';
	const eventType = actualEventData.type || 'Unknown Type';
	const delay = actualEventData.delay || 0;
	
	let details = [];
	
	// Add type information with better recognition using our complete type mappings
	const eventTypeName = getEventTypeName(eventType);
	if (eventType === EVENT_TYPES.OPEN_URL_EVENT || eventType === 131 || actualEventData.url) {
		details.push(`URL: ${actualEventData.url || 'Unknown'}`);
		if (actualEventData.target) {
			details.push(`Target: ${actualEventData.target}`);
		}
		details.push(eventTypeName);
	} else if (eventType === EVENT_TYPES.GENERAL_EVENT || eventType === 128) {
		details.push(eventTypeName);
	} else {
		// Show the numeric type with name if available
		details.push(eventTypeName);
	}
	
	// Add delay if present
	if (delay > 0) {
		details.push(`Delay: ${delay}s`);
	}
	
	// Add custom properties
	if (actualEventData.properties && Object.keys(actualEventData.properties).length > 0) {
		const propStrings = Object.entries(actualEventData.properties).map(([key, value]) => {
			const valueType = typeof value;
			return `${key}: ${value} (${valueType})`;
		});
		details.push(`Properties: {${propStrings.join(', ')}}`);
	}
	
	const detailString = details.length > 0 ? ` - ${details.join(', ')}` : '';
	
	return {
		statusMessage: `CUSTOM: ${eventName}`,
		consoleMessage: `[${timestamp}] CUSTOM: ${eventName}${detailString}`,
		detailedMessage: `Custom Rive Event '${eventName}' fired${detailString}`
	};
}

/**
 * Formats a state changed event
 */
function formatStateChangedEvent(eventData, timestamp, color) {
	const stateName = eventData.stateMachine || eventData.state || 'Unknown State';
	
	return {
		statusMessage: `STATE: ${stateName}`,
		consoleMessage: `[${timestamp}] STATE: ${stateName}`,
		detailedMessage: `State machine changed to: ${stateName}`
	};
}

/**
 * Formats a value changed event with comprehensive input type detection
 */
function formatValueChangedEvent(eventData, timestamp, color, structuredControlData) {
	let inputName = 'Unknown Input';
	let inputType = 'Unknown';
	let inputValue = 'Unknown';
	
	// Extract input information from various possible structures
	if (eventData.name) {
		inputName = eventData.name;
	} else if (eventData.input && eventData.input.name) {
		inputName = eventData.input.name;
	}
	
	// Determine input type and value using our complete type mappings
	if (eventData.input) {
		const input = eventData.input;
		
		// Check input type based on our complete type constants
		if (input.type === EVENT_TYPES.BOOLEAN_INPUT || input.type === 59 || typeof input.value === 'boolean') {
			inputType = getInputTypeName(EVENT_TYPES.BOOLEAN_INPUT);
			inputValue = input.value;
		} else if (input.type === EVENT_TYPES.NUMBER_INPUT || input.type === 56 || typeof input.value === 'number') {
			inputType = getInputTypeName(EVENT_TYPES.NUMBER_INPUT);
			inputValue = input.value;
		} else if (input.type === EVENT_TYPES.TRIGGER_INPUT || input.type === 58) {
			inputType = getInputTypeName(EVENT_TYPES.TRIGGER_INPUT);
			inputValue = 'fired';
		} else {
			inputType = getInputTypeName(input.type);
			inputValue = input.value;
		}
	} else if (eventData.value !== undefined) {
		inputValue = eventData.value;
		inputType = typeof inputValue === 'boolean' ? 'Boolean' : 
				   typeof inputValue === 'number' ? 'Number' : 'String';
	}
	
	return {
		statusMessage: `INPUT: ${inputName} = ${inputValue}`,
		consoleMessage: `[${timestamp}] INPUT: ${inputName} = ${inputValue} (${inputType})`,
		detailedMessage: `Input '${inputName}' (${inputType}) changed to: ${inputValue}`
	};
}

/**
 * Formats ViewModel property changed events
 */
function formatViewModelPropertyChangedEvent(eventData, timestamp, color) {
	const propertyName = eventData.property || 'Unknown Property';
	const propertyValue = eventData.value !== undefined ? eventData.value : 'Unknown';
	const propertyType = eventData.type || 'Unknown';
	const viewModelName = eventData.viewModel || 'ViewModel';
	const vmPath = eventData.vmPath || eventData.path || viewModelName;
	const isNested = eventData.isNested || false;
	const blueprintName = eventData.blueprintName || viewModelName;
	
	// Create a more descriptive VM identifier
	let vmIdentifier = viewModelName;
	if (blueprintName && blueprintName !== viewModelName) {
		vmIdentifier = `${viewModelName} (${blueprintName})`;
	}
	
	// Add nested indicator
	const nestedPrefix = isNested ? 'NESTED-VM' : 'VM';
	const fullPath = `${vmPath}/${propertyName}`;
	
	return {
		statusMessage: `${nestedPrefix}: ${propertyName} = ${propertyValue}`,
		consoleMessage: `[${timestamp}] ${nestedPrefix}: ${fullPath} = ${propertyValue} (${propertyType})`,
		detailedMessage: `${isNested ? 'Nested ' : ''}ViewModel property '${fullPath}' (${propertyType}) changed to: ${propertyValue}`
	};
}

/**
 * Formats nested artboard events
 */
function formatNestedArtboardEvent(eventType, eventData, timestamp, color) {
	// Handle path-based detection system events
	if (eventData.eventSource === 'Path-Based Detection System') {
		const pathCount = eventData.discoveredPaths || 0;
		const pathList = eventData.pathList || [];
		return {
			statusMessage: `NESTED-AB: System Active (${pathCount} paths)`,
			consoleMessage: `[${timestamp}] NESTED-AB: ${eventData.message} - Discovered ${pathCount} nested paths: [${pathList.join(', ')}]`,
			detailedMessage: `Path-based nested artboard detection: ${eventData.message}. ${eventData.note || ''}`
		};
	}
	
	// Handle path discovery events
	if (eventData.eventSource === 'Path Discovery') {
		return {
			statusMessage: `NESTED-AB: Paths Found`,
			consoleMessage: `[${timestamp}] NESTED-AB: ${eventData.message}`,
			detailedMessage: `${eventData.message}. ${eventData.note || ''}`
		};
	}
	
	// Handle input discovery events
	if (eventData.eventSource === 'Input Discovery') {
		const inputCount = eventData.discoveredInputs ? eventData.discoveredInputs.length : 0;
		const path = eventData.nestedPath || 'unknown';
		return {
			statusMessage: `NESTED-AB: ${path} (${inputCount} inputs)`,
			consoleMessage: `[${timestamp}] NESTED-AB: ${eventData.message} - ${eventData.note || ''}`,
			detailedMessage: `Input discovery for nested path '${path}': Found ${inputCount} inputs that will be monitored for changes`
		};
	}
	
	// Handle enhanced detection system events (legacy)
	if (eventData.eventSource === 'Enhanced Detection System') {
		return {
			statusMessage: `NESTED-AB: System Active`,
			consoleMessage: `[${timestamp}] NESTED-AB: ${eventData.message}`,
			detailedMessage: `Enhanced nested artboard detection: ${eventData.message}. ${eventData.note || ''}`
		};
	}
	
	// Handle path-based monitoring events
	if (eventData.detectionMethod === 'path-based-polling' && eventData.nestedPath) {
		const path = eventData.nestedPath;
		const inputName = eventData.inputName || 'input';
		const currentValue = eventData.currentValue;
		const previousValue = eventData.previousValue;
		
		return {
			statusMessage: `NESTED-AB: ${path}.${inputName} = ${currentValue}`,
			consoleMessage: `[${timestamp}] NESTED-AB: ${path}.${inputName}: ${previousValue} -> ${currentValue}`,
			detailedMessage: `Path-based nested artboard event: '${path}' input '${inputName}' changed from ${previousValue} to ${currentValue}`
		};
	}
	
	// Handle detected nested events from original events
	if (eventData.detectedAsNested && eventData.originalEventData) {
		const originalData = eventData.originalEventData;
		const originalType = eventData.originalEventType || 'Unknown';
		const detectionReason = eventData.detectionReason || 'Pattern match';
		
		// Extract meaningful information from the original event
		const eventName = originalData.name || originalData.stateName || originalData.state || 'Unknown Event';
		const stateMachine = originalData.stateMachine || originalData.input?.name || 'Unknown SM';
		
		return {
			statusMessage: `NESTED-AB: ${eventName}`,
			consoleMessage: `[${timestamp}] NESTED-AB: Detected from ${originalType} -> ${eventName} (${stateMachine}) [${detectionReason}]`,
			detailedMessage: `Detected nested artboard event from ${originalType}: '${eventName}' in state machine '${stateMachine}'. Detection reason: ${detectionReason}`
		};
	}
	
	// Handle traditional nested artboard events (if they ever work)
	const artboardName = eventData.artboardName || 'Unknown Artboard';
	const stateMachineName = eventData.stateMachineName || 'Unknown SM';
	const stateName = eventData.stateName || eventData.name || 'Unknown State';
	const artboardIndex = eventData.nestedArtboardIndex !== undefined ? eventData.nestedArtboardIndex : '?';
	const smIndex = eventData.stateMachineIndex !== undefined ? eventData.stateMachineIndex : '?';
	
	const shortPath = `${artboardName}[${artboardIndex}]/${stateMachineName}[${smIndex}]`;
	
	return {
		statusMessage: `NESTED-AB: ${stateName}`,
		consoleMessage: `[${timestamp}] NESTED-AB: ${shortPath} -> ${stateName}`,
		detailedMessage: `Nested artboard '${artboardName}' state machine '${stateMachineName}' changed to state: ${stateName}`
	};
}

/**
 * Formats playback events (Play, Pause, Stop, Loop)
 */
function formatPlaybackEvent(eventType, eventData, timestamp, color) {
	const animationName = eventData.animation || eventData.name || 'Animation';
	const eventTypeUpper = eventType.toUpperCase();
	
	return {
		statusMessage: `${eventTypeUpper}: ${animationName}`,
		consoleMessage: `[${timestamp}] ${eventTypeUpper}: ${animationName}`,
		detailedMessage: `Animation '${animationName}' ${eventType.toLowerCase()}`
	};
}

/**
 * Formats system events (Load, LoadError)
 */
function formatSystemEvent(eventType, eventData, timestamp, color) {
	const eventTypeUpper = eventType.toUpperCase();
	const eventName = eventData.name || eventData.animation || 'System';
	
	return {
		statusMessage: `SYS: ${eventTypeUpper}`,
		consoleMessage: `[${timestamp}] SYS: ${eventTypeUpper} - ${eventName}`,
		detailedMessage: `System ${eventType} event: ${eventName}`
	};
}

/**
 * Formats frame events (Draw, Advance)
 */
function formatFrameEvent(eventType, eventData, timestamp, color) {
	const eventTypeUpper = eventType.toUpperCase();
	const eventName = eventData.name || eventData.animation || 'Frame';
	
	return {
		statusMessage: `FRAME: ${eventTypeUpper}`,
		consoleMessage: `[${timestamp}] FRAME: ${eventTypeUpper} - ${eventName}`,
		detailedMessage: `Frame ${eventType} event: ${eventName}`
	};
}

/**
 * Formats asset events
 */
function formatAssetEvent(eventType, eventData, timestamp, color) {
	const assetName = eventData.assetName || 'Unknown Asset';
	const assetType = eventData.assetType || 'Unknown Type';
	
	let statusMessage, consoleMessage, detailedMessage;
	
	switch (eventType) {
		case 'AssetFileReplacement':
			const fileName = eventData.fileName || 'Unknown File';
			statusMessage = `ASSET: ${assetName} → ${fileName}`;
			consoleMessage = `[${timestamp}] ASSET REPLACE: ${assetName} with file "${fileName}" (${assetType})`;
			detailedMessage = `Asset "${assetName}" replaced with local file "${fileName}" (Type: ${assetType}, Size: ${eventData.fileSize || 'Unknown'} bytes)`;
			break;
			
		case 'AssetUrlReplacement':
			const url = eventData.url || 'Unknown URL';
			statusMessage = `ASSET: ${assetName} → URL`;
			consoleMessage = `[${timestamp}] ASSET REPLACE: ${assetName} with URL "${url}" (${assetType})`;
			detailedMessage = `Asset "${assetName}" replaced with URL "${url}" (Type: ${assetType})`;
			break;
			
		case 'AssetImageSubstitution':
			const imageSize = eventData.imageSize ? `${eventData.imageSize.width}x${eventData.imageSize.height}` : 'Unknown Size';
			statusMessage = `ASSET: ${assetName} substituted`;
			consoleMessage = `[${timestamp}] ASSET SUBSTITUTE: ${assetName} image decoded and applied (${imageSize})`;
			detailedMessage = `Asset "${assetName}" image successfully decoded and applied (Size: ${imageSize}, Format: ${eventData.imageFormat || 'Unknown'})`;
			break;
			
		case 'AssetReset':
			statusMessage = `ASSET: ${assetName} reset`;
			consoleMessage = `[${timestamp}] ASSET RESET: ${assetName} restored to original (${assetType})`;
			detailedMessage = `Asset "${assetName}" reset to original embedded version (Type: ${assetType}, Method: ${eventData.resetMethod || 'Unknown'})`;
			break;
			
		case 'AssetInfo':
			statusMessage = `ASSET: ${assetName} info viewed`;
			consoleMessage = `[${timestamp}] ASSET INFO: ${assetName} details displayed (${assetType})`;
			detailedMessage = `Asset "${assetName}" information displayed (Type: ${assetType})`;
			break;
			
		case 'AssetError':
		case 'AssetFileReplacementError':
		case 'AssetUrlReplacementError':
		case 'AssetImageSubstitutionError':
		case 'AssetResetError':
			const errorMsg = eventData.error || eventData.errorMessage || 'Unknown Error';
			statusMessage = `ASSET ERROR: ${assetName}`;
			consoleMessage = `[${timestamp}] ASSET ERROR: ${assetName} - ${errorMsg}`;
			detailedMessage = `Asset "${assetName}" error: ${errorMsg} (Type: ${assetType})`;
			break;
			
		default:
			statusMessage = `ASSET: ${assetName}`;
			consoleMessage = `[${timestamp}] ASSET: ${eventType} - ${assetName}`;
			detailedMessage = `Asset event "${eventType}" for "${assetName}"`;
	}
	
	return {
		statusMessage,
		consoleMessage,
		detailedMessage
	};
}

/**
 * Formats generic/unknown events
 */
function formatGenericEvent(eventType, eventData, timestamp, color) {
	const eventName = eventData.name || eventData.type || eventType;
	const eventTypeUpper = eventType.toUpperCase();
	
	return {
		statusMessage: `${eventTypeUpper}: ${eventName}`,
		consoleMessage: `[${timestamp}] ${eventTypeUpper}: ${eventName}`,
		detailedMessage: `${eventType} event: ${eventName}`
	};
}

// Export constants for use in other modules
export { EVENT_TYPES, EVENT_CATEGORIES, INPUT_TYPE_NAMES, EVENT_TYPE_NAMES, PROPERTY_TYPE_NAMES }; 