/**
 * @file main.js
 * Client-side script to handle user interactions for selecting a Rive file,
 * choosing a parser, and displaying the parsed Rive data using JSONEditor.
 * It orchestrates calls to the Rive parser and updates the UI accordingly.
 */

import { initDynamicControls } from './riveControlInterface.js';
import { processDataForControls } from './dataToControlConnector.js';
import { createLogger } from '../utils/debugger/debugLogger.js';
import { initializeGoldenLayout, updateJSONEditor, getGoldenLayout } from './goldenLayoutManager.js';
import { initializeAssetManager, clearAssetManager } from './assetManager.js';

// Create a logger for this module
const logger = createLogger('parserHandler');

// Log Rive globals on script load for debugging
logger.debug("Pre-Init typeof window.rive:", typeof window.rive, "Value:", window.rive);
logger.debug("Pre-Init typeof window.Rive:", typeof window.Rive, "Value:", window.Rive); // Note uppercase R

// DOM element references
let riveFilePicker = null;
let outputDiv = null; 
const statusMessageDiv = document.getElementById('statusMessage');

// Artboard and State Machine selection controls (will be found after Golden Layout init)
let artboardSelector = null;
let animationSelector = null;
let stateMachineSelector = null;
let applySelectionBtn = null;

// Playback control buttons (will be found after Golden Layout init)
let toggleTimelineBtn = null;
let pauseTimelineBtn = null;
let toggleStateMachineBtn = null;



/**
 * Holds the current instance of the JSONEditor.
 * @type {JSONEditor | null}
 */
let jsonEditorInstance = null;
let currentRiveInstance = null; // Store the live Rive instance globally in this module
let currentParsedData = null; // Store the parsed data for artboard/state machine selection
let selectedArtboard = null;
let selectedAnimation = null;
let selectedStateMachine = null;
let liveRiveInstance = null; // Reference to the live Rive instance for playback control

// Playback state tracking
let timelineState = 'stopped'; // 'stopped', 'playing', 'paused'
let stateMachineState = 'stopped'; // 'stopped', 'playing'
let currentPlaybackMode = 'none'; // 'timeline', 'stateMachine', 'none'

// Window resize handler
let resizeHandler = null;

/**
 * Updates the JSONEditor with new data using Golden Layout manager
 * @param {object | null} jsonData - The JSON data to display
 */
function setupJsonEditor(jsonData) {
	updateJSONEditor(jsonData);
}

/**
 * Finds and caches DOM elements after Golden Layout initialization
 */
function findDOMElements() {
	riveFilePicker = document.getElementById('riveFilePicker');
	outputDiv = document.getElementById('output');
	artboardSelector = document.getElementById('artboardSelector');
	animationSelector = document.getElementById('animationSelector');
	stateMachineSelector = document.getElementById('stateMachineSelector');
	applySelectionBtn = document.getElementById('applySelectionBtn');
	toggleTimelineBtn = document.getElementById('toggleTimelineBtn');
	pauseTimelineBtn = document.getElementById('pauseTimelineBtn');
	toggleStateMachineBtn = document.getElementById('toggleStateMachineBtn');
	
	// Debug logging for each element
	logger.debug('DOM element search results:', {
		riveFilePicker: !!riveFilePicker,
		outputDiv: !!outputDiv,
		artboardSelector: !!artboardSelector,
		animationSelector: !!animationSelector,
		stateMachineSelector: !!stateMachineSelector,
		applySelectionBtn: !!applySelectionBtn,
		toggleTimelineBtn: !!toggleTimelineBtn,
		pauseTimelineBtn: !!pauseTimelineBtn,
		toggleStateMachineBtn: !!toggleStateMachineBtn
	});
	
	// Check if controls template exists
	const controlsTemplate = document.getElementById('controlsTemplate');
	const controlsComponent = document.getElementById('controls');
	logger.debug('Template and component check:', {
		controlsTemplate: !!controlsTemplate,
		controlsComponent: !!controlsComponent
	});
	
	logger.debug('DOM elements found and cached');
}

/**
 * Handles window resize events to maintain canvas aspect ratio and quality
 */
function handleWindowResize() {
	resizeCanvasToAnimationAspectRatio();
}

/**
 * Resizes canvas to match the animation's aspect ratio
 */
function resizeCanvasToAnimationAspectRatio() {
	const riveInstance = getLiveRiveInstance();
	const canvas = document.getElementById('rive-canvas');
	const container = document.getElementById('canvasContainer');
	
	if (!riveInstance || !canvas || !container) {
		return;
	}

	try {
		// Get artboard dimensions
		let artboardWidth = riveInstance._artboardWidth;
		let artboardHeight = riveInstance._artboardHeight;
		
		// Fallback methods if _artboardWidth/Height not available
		if (!artboardWidth || !artboardHeight) {
			const artboard = riveInstance.artboard;
			if (artboard) {
				artboardWidth = artboard.bounds?.maxX - artboard.bounds?.minX;
				artboardHeight = artboard.bounds?.maxY - artboard.bounds?.minY;
			}
		}
		
		// Another fallback - try to get from layout
		if (!artboardWidth || !artboardHeight) {
			const layout = riveInstance.layout;
			if (layout && layout.runtimeArtboard) {
				artboardWidth = layout.runtimeArtboard.width;
				artboardHeight = layout.runtimeArtboard.height;
			}
		}
		
		// Final fallback - use default dimensions
		if (!artboardWidth || !artboardHeight) {
			artboardWidth = 500;
			artboardHeight = 500;
			logger.warn('Could not determine artboard dimensions, using defaults');
		}

		const aspectRatio = artboardWidth / artboardHeight;
		const containerRect = container.getBoundingClientRect();
		const containerWidth = containerRect.width - 20; // Account for padding
		const containerHeight = containerRect.height - 20;

		let canvasWidth, canvasHeight;

		// Calculate canvas size to fit container while maintaining aspect ratio
		if (containerWidth / containerHeight > aspectRatio) {
			// Container is wider than artboard aspect ratio
			canvasHeight = containerHeight;
			canvasWidth = canvasHeight * aspectRatio;
		} else {
			// Container is taller than artboard aspect ratio
			canvasWidth = containerWidth;
			canvasHeight = canvasWidth / aspectRatio;
		}

		// Apply the calculated dimensions
		canvas.style.width = `${canvasWidth}px`;
		canvas.style.height = `${canvasHeight}px`;
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;

		// Trigger Rive resize
		if (typeof riveInstance.resizeDrawingSurfaceToCanvas === 'function') {
			riveInstance.resizeDrawingSurfaceToCanvas();
		}

		logger.debug(`Canvas resized to animation aspect ratio: ${canvasWidth}x${canvasHeight} (artboard: ${artboardWidth}x${artboardHeight})`);

	} catch (error) {
		logger.error('Error resizing canvas to animation aspect ratio:', error);
		// Fallback to standard resize
		if (riveInstance && typeof riveInstance.resizeDrawingSurfaceToCanvas === 'function') {
			riveInstance.resizeDrawingSurfaceToCanvas();
		}
	}
}

/**
 * Ensures the canvas fills its container properly (fallback method)
 */
function resizeCanvasToContainer() {
	// Use the new aspect ratio aware resize method
	resizeCanvasToAnimationAspectRatio();
}

/**
 * Sets up the window resize listener
 */
function setupWindowResizeListener() {
	// Remove existing listener if any
	if (resizeHandler) {
		window.removeEventListener('resize', resizeHandler);
	}
	
	// Create debounced resize handler to avoid excessive calls
	let resizeTimeout;
	resizeHandler = () => {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(() => {
			resizeCanvasToContainer();
			handleWindowResize();
		}, 100); // 100ms debounce
	};
	
	window.addEventListener('resize', resizeHandler);
	logger.debug('Window resize listener set up');
}

/**
 * Removes the window resize listener
 */
function removeWindowResizeListener() {
	if (resizeHandler) {
		window.removeEventListener('resize', resizeHandler);
		resizeHandler = null;
		logger.debug('Window resize listener removed');
	}
}

/**
 * Resets all application state when a new file is selected
 */
function resetApplicationState() {
	logger.info('Resetting application state for new file selection');
	
	// Reset global state variables
	currentRiveInstance = null;
	currentParsedData = null;
	selectedArtboard = null;
	selectedAnimation = null;
	selectedStateMachine = null;
	liveRiveInstance = null;
	
	// Reset playback states
	resetPlaybackStates();
	
	// Clear selectors
	if (artboardSelector) {
		artboardSelector.innerHTML = '<option value="">Loading...</option>';
	}
	if (animationSelector) {
		animationSelector.innerHTML = '<option value="">No Timelines</option>';
	}
	if (stateMachineSelector) {
		stateMachineSelector.innerHTML = '<option value="">No State Machines</option>';
	}
	
	// Controls are now always visible in the new layout
	
	// Clear status message
	if (statusMessageDiv) {
		statusMessageDiv.textContent = 'Loading new file...';
	}
	
	// Clear JSON editor
	if (jsonEditorInstance) {
		try {
			jsonEditorInstance.set({ message: "Loading new file..." });
		} catch (e) {
			logger.warn('Error clearing JSON editor:', e);
		}
	}
	
	// Clear dynamic controls container
	const controlsContainer = document.getElementById('dynamicControlsContainer');
	if (controlsContainer) {
		controlsContainer.innerHTML = '<p>Loading new animation...</p>';
	}
	
	// Clear Asset Manager
	try {
		clearAssetManager();
		logger.debug('Asset Manager cleared');
	} catch (e) {
		logger.warn('Error clearing Asset Manager:', e);
	}
	
	// Clear any global Rive instance references
	if (window.riveInstanceGlobal) {
		try {
			if (typeof window.riveInstanceGlobal.cleanup === 'function') {
				window.riveInstanceGlobal.cleanup();
			}
		} catch (e) {
			logger.warn('Error cleaning up global Rive instance:', e);
		}
		window.riveInstanceGlobal = null;
	}
	
	// Clear VM reference
	if (window.vm) {
		window.vm = null;
	}
	
	logger.debug('Application state reset complete');
}

// Initialize Golden Layout and set up the application on DOMContentLoaded.
document.addEventListener('DOMContentLoaded', () => {
	// Initialize Golden Layout
	const layout = initializeGoldenLayout();
	
	if (layout) {
		// Wait for layout to be ready, then find DOM elements and set up event listeners
		setTimeout(() => {
			findDOMElements();
			
			// Debug: Check if file picker was found
			if (!riveFilePicker) {
				logger.error('riveFilePicker not found after Golden Layout initialization');
				// Try to find it again after a longer delay
				setTimeout(() => {
					findDOMElements();
					if (riveFilePicker) {
						logger.info('riveFilePicker found on second attempt');
						setupEventListeners();
					} else {
						logger.error('riveFilePicker still not found after second attempt');
					}
				}, 500);
			} else {
				logger.info('riveFilePicker found successfully');
				setupEventListeners();
			}
			
			setupWindowResizeListener();
			
			// Expose resize function globally for Golden Layout
			window.resizeCanvasToAnimationAspectRatio = resizeCanvasToAnimationAspectRatio;
			
			// Initialize background color label contrast
			const bgColorInput = document.getElementById('canvasBackgroundColor');
			if (bgColorInput) {
				updateBackgroundColorLabelContrast(bgColorInput.value);
			}
			
			// Initialize layout scale state
			const riveFitSelect = document.getElementById('riveFitSelect');
			const layoutScaleInput = document.getElementById('layoutScaleInput');
			if (riveFitSelect && layoutScaleInput) {
				const fitValue = riveFitSelect.value;
				layoutScaleInput.disabled = fitValue !== 'layout';
				if (fitValue === 'layout') {
					layoutScaleInput.style.opacity = '1';
					layoutScaleInput.style.cursor = 'text';
				} else {
					layoutScaleInput.style.opacity = '0.5';
					layoutScaleInput.style.cursor = 'not-allowed';
				}
			}
			
			// Initialize with default message
			setupJsonEditor({ message: "Please select a Rive file to parse." });
			
			logger.info('Application initialized with Golden Layout');
		}, 100);
	} else {
		logger.error('Failed to initialize Golden Layout');
	}
});

/**
 * Sets up event listeners after Golden Layout initialization
 */
function setupEventListeners() {
	// Event listener for the Rive file picker
	if (riveFilePicker) {
		riveFilePicker.addEventListener('change', handleFileSelect);
	}

	// Event listeners for artboard and state machine selection
	if (artboardSelector) {
		artboardSelector.addEventListener('change', handleArtboardChange);
	}
	if (animationSelector) {
		animationSelector.addEventListener('change', handleAnimationChange);
	}
	if (stateMachineSelector) {
		stateMachineSelector.addEventListener('change', handleStateMachineChange);
	}
	if (applySelectionBtn) {
		applySelectionBtn.addEventListener('click', handleApplySelection);
	}

	// Event listeners for playback controls
	if (toggleTimelineBtn) {
		toggleTimelineBtn.addEventListener('click', handleToggleTimeline);
	}
	if (pauseTimelineBtn) {
		pauseTimelineBtn.addEventListener('click', handlePauseTimeline);
	}
	if (toggleStateMachineBtn) {
		toggleStateMachineBtn.addEventListener('click', handleToggleStateMachine);
	}

		// Event listener for canvas background color
	const canvasBackgroundColor = document.getElementById('canvasBackgroundColor');
	if (canvasBackgroundColor) {
		canvasBackgroundColor.addEventListener('change', handleCanvasBackgroundChange);
	}

	// Event listener for clear file button
	const clearFileBtn = document.getElementById('clearFileBtn');
	if (clearFileBtn) {
		clearFileBtn.addEventListener('click', handleClearFile);
	}

	// Event listener for change file button
	const changeFileBtn = document.getElementById('changeFileBtn');
	if (changeFileBtn) {
		changeFileBtn.addEventListener('click', handleChangeFile);
	}

	// Event listeners for Rive layout controls
	const riveFitSelect = document.getElementById('riveFitSelect');
	const riveAlignmentSelect = document.getElementById('riveAlignmentSelect');
	const layoutScaleInput = document.getElementById('layoutScaleInput');

	if (riveFitSelect) {
		riveFitSelect.addEventListener('change', handleRiveLayoutChange);
	}
	if (riveAlignmentSelect) {
		riveAlignmentSelect.addEventListener('change', handleRiveLayoutChange);
	}
	if (layoutScaleInput) {
		layoutScaleInput.addEventListener('input', handleRiveLayoutChange);
	}
	
	logger.debug('Event listeners set up');
}

/**
 * Populates the artboard selector with available artboards from parsed data
 * @param {object} parsedData - The parsed Rive data
 */
function populateArtboardSelector(parsedData) {
	if (!artboardSelector || !parsedData || !parsedData.artboards) {
		return;
	}

	// Clear existing options
	artboardSelector.innerHTML = '';

	// Add artboard options
	parsedData.artboards.forEach((artboard, index) => {
		const option = document.createElement('option');
		option.value = artboard.name;
		
		// Emphasize default artboard
		const isDefault = parsedData.defaultElements && parsedData.defaultElements.artboardName === artboard.name;
		if (isDefault) {
			option.textContent = `${artboard.name} (Default)`;
			option.selected = true;
			selectedArtboard = artboard.name;
		} else {
			option.textContent = artboard.name;
		}
		
		artboardSelector.appendChild(option);
	});

	// If no default was found, select the first artboard
	if (!selectedArtboard && parsedData.artboards.length > 0) {
		selectedArtboard = parsedData.artboards[0].name;
		artboardSelector.value = selectedArtboard;
	}

	logger.info(`Populated artboard selector with ${parsedData.artboards.length} artboards. Selected: ${selectedArtboard}`);
}

/**
 * Populates the timeline selector based on the selected artboard
 * @param {string} artboardName - The name of the selected artboard
 */
function populateAnimationSelector(artboardName) {
	if (!animationSelector || !currentParsedData || !currentParsedData.artboards) {
		return;
	}

	// Clear existing options
	animationSelector.innerHTML = '';

	// Find the selected artboard
	const selectedArtboardData = currentParsedData.artboards.find(ab => ab.name === artboardName);
	
	if (!selectedArtboardData || !selectedArtboardData.animations || selectedArtboardData.animations.length === 0) {
		const option = document.createElement('option');
		option.value = '';
		option.textContent = 'No Timelines';
		animationSelector.appendChild(option);
		selectedAnimation = null;
		logger.info(`No timelines found for artboard: ${artboardName}`);
		return;
	}

	// Add timeline options
	selectedArtboardData.animations.forEach((animation, index) => {
		const option = document.createElement('option');
		option.value = animation.name;
		option.textContent = `${animation.name} (${animation.duration.toFixed(2)}s)`;
		
		// Select the first timeline by default
		if (index === 0) {
			option.selected = true;
			selectedAnimation = animation.name;
		}
		
		animationSelector.appendChild(option);
	});

	logger.info(`Populated timeline selector with ${selectedArtboardData.animations.length} timelines for artboard ${artboardName}. Selected: ${selectedAnimation}`);
}

/**
 * Populates the state machine selector based on the selected artboard
 * @param {string} artboardName - The name of the selected artboard
 */
function populateStateMachineSelector(artboardName) {
	if (!stateMachineSelector || !currentParsedData || !currentParsedData.artboards) {
		return;
	}

	// Clear existing options
	stateMachineSelector.innerHTML = '';

	// Find the selected artboard
	const selectedArtboardData = currentParsedData.artboards.find(ab => ab.name === artboardName);
	
	if (!selectedArtboardData || !selectedArtboardData.stateMachines || selectedArtboardData.stateMachines.length === 0) {
		const option = document.createElement('option');
		option.value = '';
		option.textContent = 'No State Machines';
		stateMachineSelector.appendChild(option);
		selectedStateMachine = null;
		logger.info(`No state machines found for artboard: ${artboardName}`);
		return;
	}

	// Add state machine options
	selectedArtboardData.stateMachines.forEach((stateMachine, index) => {
		const option = document.createElement('option');
		option.value = stateMachine.name;
		
		// Check if this is the default state machine
		const isDefault = currentParsedData.defaultElements && 
			currentParsedData.defaultElements.stateMachineNames && 
			currentParsedData.defaultElements.stateMachineNames.includes(stateMachine.name);
		
		// Select "State Machine 1" by default if it exists, otherwise select the first one, or use default from parsed data
		const shouldSelect = isDefault || 
			stateMachine.name === "State Machine 1" || 
			(index === 0 && !selectedArtboardData.stateMachines.find(sm => sm.name === "State Machine 1") && !isDefault);
		
		if (isDefault) {
			option.textContent = `${stateMachine.name} (Default)`;
		} else {
			option.textContent = stateMachine.name;
		}
		
		if (shouldSelect) {
			option.selected = true;
			selectedStateMachine = stateMachine.name;
		}
		
		stateMachineSelector.appendChild(option);
	});

	// If no selection was made, select the first state machine
	if (!selectedStateMachine && selectedArtboardData.stateMachines.length > 0) {
		selectedStateMachine = selectedArtboardData.stateMachines[0].name;
		stateMachineSelector.value = selectedStateMachine;
	}

	logger.info(`Populated state machine selector with ${selectedArtboardData.stateMachines.length} state machines for artboard ${artboardName}. Selected: ${selectedStateMachine}`);
}

/**
 * Handles artboard selection change
 */
function handleArtboardChange() {
	selectedArtboard = artboardSelector.value;
	logger.info(`Artboard selection changed to: ${selectedArtboard}`);
	
	// Update animation and state machine selectors based on new artboard
	populateAnimationSelector(selectedArtboard);
	populateStateMachineSelector(selectedArtboard);
}

/**
 * Handles timeline selection change
 */
function handleAnimationChange() {
	selectedAnimation = animationSelector.value;
	logger.info(`Timeline selection changed to: ${selectedAnimation}`);
	
	// Reset playback states when timeline changes
	resetPlaybackStates();
}

/**
 * Handles state machine selection change
 */
function handleStateMachineChange() {
	selectedStateMachine = stateMachineSelector.value;
	logger.info(`State machine selection changed to: ${selectedStateMachine}`);
}

/**
 * Handles applying the artboard and state machine selection
 */
function handleApplySelection() {
	if (!selectedArtboard) {
		logger.warn('No artboard selected');
		return;
	}

	logger.info(`Applying selection - Artboard: ${selectedArtboard}, Timeline: ${selectedAnimation || 'None'}, State Machine: ${selectedStateMachine || 'None'}`);

	// Update the parsed data with the new selection
	if (currentParsedData && currentParsedData.defaultElements) {
		currentParsedData.defaultElements.artboardName = selectedArtboard;
		currentParsedData.defaultElements.stateMachineNames = selectedStateMachine ? [selectedStateMachine] : [];
	}

	// Reset playback states when applying new selection
	resetPlaybackStates();

	// Reinitialize the dynamic controls with the updated selection
	initDynamicControls(currentParsedData);
	
	if (statusMessageDiv) {
		statusMessageDiv.textContent = `Applied selection - Artboard: ${selectedArtboard}${selectedAnimation ? `, Timeline: ${selectedAnimation}` : ''}${selectedStateMachine ? `, State Machine: ${selectedStateMachine}` : ''}`;
	}
}

/**
 * Gets the current live Rive instance from the control interface
 */
function getLiveRiveInstance() {
	// Try to get the instance from the global window reference first
	if (window.riveInstanceGlobal) {
		return window.riveInstanceGlobal;
	}
	
	// Fallback to stored reference
	return liveRiveInstance;
}

/**
 * Resets all playback states and updates UI
 */
function resetPlaybackStates() {
	timelineState = 'stopped';
	stateMachineState = 'stopped';
	currentPlaybackMode = 'none';
	updateButtonStates();
}

/**
 * Initializes playback states based on what's auto-playing
 */
function initializePlaybackStates(parsedData) {
	// Check if a state machine is set to auto-play
	if (parsedData && parsedData.defaultElements && 
		parsedData.defaultElements.stateMachineNames && 
		parsedData.defaultElements.stateMachineNames.length > 0) {
		
		// State machine is auto-playing
		stateMachineState = 'playing';
		timelineState = 'stopped';
		currentPlaybackMode = 'stateMachine';
		
		logger.info('Initialized with auto-playing state machine');
	} else {
		// No auto-play, reset to stopped
		resetPlaybackStates();
	}
	
	updateButtonStates();
}

/**
 * Updates button states based on current playback state
 */
function updateButtonStates() {
	// Update timeline toggle button
	if (toggleTimelineBtn) {
		toggleTimelineBtn.setAttribute('data-state', timelineState === 'playing' ? 'playing' : 'stopped');
		toggleTimelineBtn.textContent = timelineState === 'playing' ? 'Stop' : 'Play';
	}
	
	// Update pause button
	if (pauseTimelineBtn) {
		pauseTimelineBtn.setAttribute('data-state', timelineState === 'paused' ? 'paused' : 'unpaused');
		pauseTimelineBtn.disabled = timelineState === 'stopped';
	}
	
	// Update state machine toggle button
	if (toggleStateMachineBtn) {
		toggleStateMachineBtn.setAttribute('data-state', stateMachineState === 'playing' ? 'playing' : 'stopped');
		toggleStateMachineBtn.textContent = stateMachineState === 'playing' ? 'Stop' : 'Play';
	}
}

/**
 * Handles timeline play/stop toggle
 */
function handleToggleTimeline() {
	const riveInstance = getLiveRiveInstance();
	if (!riveInstance) {
		logger.warn('No live Rive instance available for timeline playback');
		return;
	}

	if (!selectedAnimation) {
		logger.warn('No timeline selected');
		return;
	}

	try {
		if (timelineState === 'stopped' || timelineState === 'paused') {
			// Stop state machine if it's playing (override behavior)
			if (stateMachineState === 'playing' && selectedStateMachine) {
				riveInstance.stop(selectedStateMachine);
				stateMachineState = 'stopped';
			}
			
			logger.info(`Playing timeline: ${selectedAnimation}`);
			riveInstance.play(selectedAnimation);
			timelineState = 'playing';
			currentPlaybackMode = 'timeline';
			
			if (statusMessageDiv) {
				statusMessageDiv.textContent = `Playing timeline: ${selectedAnimation}`;
			}
		} else {
			logger.info(`Stopping timeline: ${selectedAnimation}`);
			riveInstance.stop(selectedAnimation);
			timelineState = 'stopped';
			currentPlaybackMode = 'none';
			
			if (statusMessageDiv) {
				statusMessageDiv.textContent = `Stopped timeline: ${selectedAnimation}`;
			}
		}
		
		updateButtonStates();
	} catch (error) {
		logger.error('Error toggling timeline:', error);
		if (statusMessageDiv) {
			statusMessageDiv.textContent = `Error controlling timeline: ${error.message}`;
		}
	}
}

/**
 * Handles timeline pause toggle
 */
function handlePauseTimeline() {
	const riveInstance = getLiveRiveInstance();
	if (!riveInstance) {
		logger.warn('No live Rive instance available for timeline control');
		return;
	}

	if (!selectedAnimation || timelineState === 'stopped') {
		logger.warn('No timeline playing to pause');
		return;
	}

	try {
		if (timelineState === 'paused') {
			logger.info(`Resuming timeline: ${selectedAnimation}`);
			riveInstance.play(selectedAnimation);
			timelineState = 'playing';
			
			if (statusMessageDiv) {
				statusMessageDiv.textContent = `Resumed timeline: ${selectedAnimation}`;
			}
	} else {
			logger.info(`Pausing timeline: ${selectedAnimation}`);
			riveInstance.pause(selectedAnimation);
			timelineState = 'paused';
			
			if (statusMessageDiv) {
				statusMessageDiv.textContent = `Paused timeline: ${selectedAnimation}`;
			}
		}
		
		updateButtonStates();
	} catch (error) {
		logger.error('Error pausing timeline:', error);
		if (statusMessageDiv) {
			statusMessageDiv.textContent = `Error pausing timeline: ${error.message}`;
		}
	}
}

/**
 * Handles state machine play/stop toggle
 */
function handleToggleStateMachine() {
	const riveInstance = getLiveRiveInstance();
	if (!riveInstance) {
		logger.warn('No live Rive instance available for state machine control');
		return;
	}

	if (!selectedStateMachine) {
		logger.warn('No state machine selected');
		return;
	}

	try {
		if (stateMachineState === 'stopped') {
			// Stop timeline if it's playing (override behavior)
			if (timelineState !== 'stopped' && selectedAnimation) {
				riveInstance.stop(selectedAnimation);
				timelineState = 'stopped';
			}
			
			logger.info(`Starting state machine: ${selectedStateMachine}`);
			
			// For state machines, we need to ensure they're properly started and interactive
			// The key is to use play() which maintains interactivity, not just start the state machine
			riveInstance.play(selectedStateMachine);
			stateMachineState = 'playing';
			currentPlaybackMode = 'stateMachine';
			
			if (statusMessageDiv) {
				statusMessageDiv.textContent = `Started state machine: ${selectedStateMachine} (interactive)`;
			}
		} else {
			logger.info(`Stopping state machine: ${selectedStateMachine}`);
			
			// For state machines, we need to properly stop them and clear their state
			riveInstance.stop(selectedStateMachine);
			
			// Also pause to ensure it's completely stopped
			try {
				riveInstance.pause(selectedStateMachine);
			} catch (e) {
				// Pause might not be available for state machines, that's ok
				logger.debug('Pause not available for state machine, using stop only');
			}
			
			stateMachineState = 'stopped';
			currentPlaybackMode = 'none';
			
			if (statusMessageDiv) {
				statusMessageDiv.textContent = `Stopped state machine: ${selectedStateMachine} (no longer interactive)`;
			}
		}
		
		updateButtonStates();
	} catch (error) {
		logger.error('Error toggling state machine:', error);
		if (statusMessageDiv) {
			statusMessageDiv.textContent = `Error controlling state machine: ${error.message}`;
		}
	}
}

/**
 * Handles the Rive file selection event.
 * It reads the selected file, determines which parser to use (original or modular),
 * calls the appropriate parser function, and then updates the JSONEditor with the result.
 * @param {Event} event - The file input change event.
 */
function handleFileSelect(event) {
	const file = event.target.files[0];
	
	// Reset all state when a new file is selected
	resetApplicationState();
	
	// Update file selection UI
	if (file) {
		updateFileSelectionUI(true, file.name);
	}

	if (!window.rive) {
		logger.error("Rive engine (window.rive) not found!");
		if(statusMessageDiv) statusMessageDiv.textContent = "Error: Rive engine (window.rive) not found!";
		setupJsonEditor({ error: "Rive engine (window.rive) not found!" });
		return;
	}
	const riveEngine = window.rive;
	currentRiveInstance = null; // Reset current Rive instance on new file load

	let riveSrcForOriginal = null;
	let messageForOriginal = "using internal default Rive file path";

	if (file && file.name) {
		riveSrcForOriginal = URL.createObjectURL(file);
		messageForOriginal = `using selected file '${file.name}'`;
		logger.info(`Will use selected file: ${file.name}`);
	} else {
		riveSrcForOriginal = null; // Parser.js handles its default
	}
	if(statusMessageDiv) statusMessageDiv.textContent = `Running Rive parser (${messageForOriginal})...`;

	const riveCanvas = document.getElementById('rive-canvas');
	logger.debug("riveCanvas element fetched in handleFileSelect:", riveCanvas);
	if (!riveCanvas) {
		logger.error("Canvas element with ID 'rive-canvas' not found in DOM!");
		// Optionally, update UI to reflect this critical error
		// return; // Might be too early to return, let parser.js handle its internal fallback for now
	} 

	if (typeof runOriginalClientParser === 'function') {
		try {
			runOriginalClientParser(riveEngine, riveCanvas, riveSrcForOriginal, function(error, parsedData) {
				if (error) {
					logger.error("Parser reported error:", error);
					if(statusMessageDiv) statusMessageDiv.textContent = `Error from parser: ${error.error || 'Unknown error'}`;
					setupJsonEditor({ error: `Parser error: ${error.error || 'Unknown error'}`, details: error.details });
					initDynamicControls(null); // Pass null as riveControlInterface will create its own instance
					
					// Hide artboard/state machine controls on error
					if (artboardStateMachineControls) {
						artboardStateMachineControls.style.display = 'none';
					}
				} else if (parsedData) {
					if(statusMessageDiv) statusMessageDiv.textContent = `Successfully parsed. Displaying data.`;
					setupJsonEditor(parsedData); 
					
					// Store the parsed data for artboard/state machine selection
					currentParsedData = parsedData;
					
					// Populate and show artboard/timeline/state machine selectors
					populateArtboardSelector(parsedData);
					if (selectedArtboard) {
						populateAnimationSelector(selectedArtboard);
						populateStateMachineSelector(selectedArtboard);
					}
					
					// Set initial playback states based on what's auto-playing
					initializePlaybackStates(parsedData);
					
					// Controls are now always visible in the new layout
					
					// MODIFIED: Call initDynamicControls with only parsedData
					// riveControlInterface will be responsible for creating the Rive instance.
					initDynamicControls(parsedData);
					
					// Trigger canvas resize to match animation aspect ratio after load
					setTimeout(() => {
						resizeCanvasToAnimationAspectRatio();
					}, 500);
					
				} else {
					if(statusMessageDiv) statusMessageDiv.textContent = "Parser finished with no data.";
					setupJsonEditor({ message: "Parser returned no data." });
					initDynamicControls(null);
					
					// Controls are now always visible in the new layout
				}
			}); 
		} catch (e) {
			logger.error("Error calling runOriginalClientParser:", e);
			if(statusMessageDiv) statusMessageDiv.textContent = "Error running parser. Check console.";
			setupJsonEditor({ error: `Error calling parser: ${e.message}` });
		}
	} else {
		logger.error("runOriginalClientParser function not found.");
		if(statusMessageDiv) statusMessageDiv.textContent = "Error: Parser function not found.";
		setupJsonEditor({ error: "Parser function not found." });
	}
}

/**
 * Handles canvas background color change
 */
function handleCanvasBackgroundChange(event) {
	const canvas = document.getElementById('rive-canvas');
	const color = event.target.value;
	
	// Apply background directly to the canvas element
	if (canvas) {
		canvas.style.backgroundColor = color;
		logger.info(`Canvas background color changed to: ${color}`);
	} else {
		logger.warn('Canvas element not found for background color change');
	}
	
	// Update label contrast
	updateBackgroundColorLabelContrast(color);
}

/**
 * Updates the background color label contrast based on the selected color
 */
function updateBackgroundColorLabelContrast(color) {
	const label = document.querySelector('.bg-color-label');
	if (!label) return;
	
	// Convert hex to RGB
	const hex = color.replace('#', '');
	const r = parseInt(hex.substr(0, 2), 16);
	const g = parseInt(hex.substr(2, 2), 16);
	const b = parseInt(hex.substr(4, 2), 16);
	
	// Calculate luminance
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	
	// Set text color based on luminance
	if (luminance > 0.5) {
		label.style.color = '#000000';
		label.style.textShadow = '1px 1px 2px rgba(255, 255, 255, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.3)';
	} else {
		label.style.color = '#ffffff';
		label.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(255, 255, 255, 0.3)';
	}
}

/**
 * Handles clearing the current file
 */
function handleClearFile() {
	logger.info('Clearing current file');
	
	// Clear the file input
	if (riveFilePicker) {
		riveFilePicker.value = '';
	}
	
	// Show file picker, hide file selected indicator
	updateFileSelectionUI(false);
	
	// Reset all application state
	resetApplicationState();
	
	// Clear the JSON editor
	setupJsonEditor({ message: "Please select a Rive file to begin parsing." });
	
	// Update status message
	if (statusMessageDiv) {
		statusMessageDiv.textContent = 'File cleared. Please select a new Rive file to begin parsing.';
	}
	
	logger.info('File cleared successfully');
}

/**
 * Handles changing the current file
 */
function handleChangeFile() {
	logger.info('Changing current file');
	
	// Show file picker, hide file selected indicator
	updateFileSelectionUI(false);
	
	// Trigger file picker
	if (riveFilePicker) {
		riveFilePicker.click();
	}
}

/**
 * Updates the file selection UI state
 */
function updateFileSelectionUI(fileSelected, fileName = '') {
	const filePickerContainer = document.querySelector('.file-section .file-group > div:first-child');
	const fileSelectedIndicator = document.getElementById('fileSelectedIndicator');
	const selectedFileNameSpan = document.getElementById('selectedFileName');
	
	if (fileSelected) {
		// Hide file picker, show selected indicator
		if (filePickerContainer) {
			filePickerContainer.style.display = 'none';
		}
		if (fileSelectedIndicator) {
			fileSelectedIndicator.style.display = 'flex';
		}
		if (selectedFileNameSpan) {
			selectedFileNameSpan.textContent = fileName;
		}
	} else {
		// Show file picker, hide selected indicator
		if (filePickerContainer) {
			filePickerContainer.style.display = 'flex';
		}
		if (fileSelectedIndicator) {
			fileSelectedIndicator.style.display = 'none';
		}
	}
}

/**
 * Handles Rive layout changes (fit, alignment, scale)
 */
function handleRiveLayoutChange() {
	const riveInstance = getLiveRiveInstance();
	if (!riveInstance) {
		logger.debug('No Rive instance available for layout change');
		return;
	}

	const riveFitSelect = document.getElementById('riveFitSelect');
	const riveAlignmentSelect = document.getElementById('riveAlignmentSelect');
	const layoutScaleInput = document.getElementById('layoutScaleInput');

	if (!riveFitSelect || !riveAlignmentSelect || !layoutScaleInput) {
		logger.warn('Layout control elements not found');
		return;
	}

	const fitValue = riveFitSelect.value;
	const alignmentValue = riveAlignmentSelect.value;
	const scaleValue = parseFloat(layoutScaleInput.value) || 1;

	// Enable/disable layout scale input based on fit type
	layoutScaleInput.disabled = fitValue !== 'layout';
	
	// Update visual state
	if (fitValue === 'layout') {
		layoutScaleInput.style.opacity = '1';
		layoutScaleInput.style.cursor = 'text';
	} else {
		layoutScaleInput.style.opacity = '0.5';
		layoutScaleInput.style.cursor = 'not-allowed';
	}

	try {
		// Map string values to Rive enums
		const fitMap = {
			'contain': window.rive.Fit.Contain,
			'cover': window.rive.Fit.Cover,
			'fill': window.rive.Fit.Fill,
			'fitWidth': window.rive.Fit.FitWidth,
			'fitHeight': window.rive.Fit.FitHeight,
			'scaleDown': window.rive.Fit.ScaleDown,
			'none': window.rive.Fit.None,
			'layout': window.rive.Fit.Layout
		};

		const alignmentMap = {
			'center': window.rive.Alignment.Center,
			'topLeft': window.rive.Alignment.TopLeft,
			'topCenter': window.rive.Alignment.TopCenter,
			'topRight': window.rive.Alignment.TopRight,
			'centerLeft': window.rive.Alignment.CenterLeft,
			'centerRight': window.rive.Alignment.CenterRight,
			'bottomLeft': window.rive.Alignment.BottomLeft,
			'bottomCenter': window.rive.Alignment.BottomCenter,
			'bottomRight': window.rive.Alignment.BottomRight
		};

		const fit = fitMap[fitValue] || window.rive.Fit.Contain;
		const alignment = alignmentMap[alignmentValue] || window.rive.Alignment.Center;

		// Create new layout
		const layout = new window.rive.Layout({
			fit: fit,
			alignment: alignment
		});

		// Set layout scale factor if using Layout fit
		if (fitValue === 'layout') {
			layout.layoutScaleFactor = scaleValue;
		}

		// Apply the new layout
		riveInstance.layout = layout;
		
		// Trigger resize to apply changes with proper aspect ratio
		setTimeout(() => {
			resizeCanvasToAnimationAspectRatio();
		}, 100);

		logger.info(`Layout updated - Fit: ${fitValue}, Alignment: ${alignmentValue}, Scale: ${scaleValue}`);
		
		if (statusMessageDiv) {
			statusMessageDiv.textContent = `Layout updated: ${fitValue} fit, ${alignmentValue} alignment${fitValue === 'layout' ? `, ${scaleValue}x scale` : ''}`;
		}

	} catch (error) {
		logger.error('Error updating Rive layout:', error);
		if (statusMessageDiv) {
			statusMessageDiv.textContent = `Error updating layout: ${error.message}`;
		}
	}
}


