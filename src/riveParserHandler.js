/**
 * @file main.js
 * Client-side script to handle user interactions for selecting a Rive file,
 * choosing a parser, and displaying the parsed Rive data using JSONEditor.
 * It orchestrates calls to the Rive parser and updates the UI accordingly.
 */

import { initDynamicControls } from './riveControlInterface.js';
import { processDataForControls } from './dataToControlConnector.js';
import { createLogger } from './utils/debugger/debugLogger.js';

// Create a logger for this module
const logger = createLogger('parserHandler');

// Log Rive globals on script load for debugging
logger.debug("Pre-Init typeof window.rive:", typeof window.rive, "Value:", window.rive);
logger.debug("Pre-Init typeof window.Rive:", typeof window.Rive, "Value:", window.Rive); // Note uppercase R

// DOM element references
const riveFilePicker = document.getElementById('riveFilePicker');
const outputDiv = document.getElementById('output'); 
const statusMessageDiv = document.getElementById('statusMessage');

// View containers
const liveControlsView = document.getElementById('liveControlsView');
const parserInspectorView = document.getElementById('parserInspectorView');

// Buttons for view toggling
const toggleViewBtn = document.getElementById('toggleViewBtn');
const closeInspectorBtn = document.getElementById('closeInspectorBtn');

// Artboard and State Machine selection controls
const artboardStateMachineControls = document.getElementById('artboardStateMachineControls');
const artboardSelector = document.getElementById('artboardSelector');
const animationSelector = document.getElementById('animationSelector');
const stateMachineSelector = document.getElementById('stateMachineSelector');
const applySelectionBtn = document.getElementById('applySelectionBtn');

// Playback control buttons
const playAnimationBtn = document.getElementById('playAnimationBtn');
const pauseAnimationBtn = document.getElementById('pauseAnimationBtn');
const stopAnimationBtn = document.getElementById('stopAnimationBtn');
const startStateMachineBtn = document.getElementById('startStateMachineBtn');
const stopStateMachineBtn = document.getElementById('stopStateMachineBtn');

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

/**
 * Initializes or updates the JSONEditor instance with the provided JSON data.
 * If an instance already exists, it updates its content. Otherwise, it creates a new instance.
 * @param {object | null} jsonData - The JSON data to display. Can be the parsed Rive data, 
 *                                   an error object, or a placeholder message object.
 */
function setupJsonEditor(jsonData) {
	if (!outputDiv) {
		logger.warn("Output div for JSONEditor not found."); 
		return;
	}

	/**
	 * @type {import 'jsoneditor'.JSONEditorOptions}
	 */
	const options = {
		mode: 'tree',
		modes: ['tree', 'view', 'code', 'text', 'preview'],
		search: true,
		enableTransform: false,
		/**
		 * Customizes the display name for object and array nodes in the tree view.
		 * @param {object} params - Parameters for the node.
		 * @param {string[]} params.path - The path to the node.
		 * @param {'object'|'array'} params.type - The type of the node ('object' or 'array').
		 * @param {number} params.size - The number of children in the node.
		 * @param {object|Array} params.value - The actual JavaScript object or array.
		 * @returns {string | undefined} The custom name to display, or undefined for default.
		 */
		onNodeName: function({path, type, size, value}) {
			if (type === 'object') {
				if (value && typeof value === 'object' && size > 0) {
					const keys = Object.keys(value);
					if (keys.length > 0) {
						const firstKey = keys[0];
						const firstValue = value[firstKey];
						if (typeof firstValue === 'string') {
							const maxLength = 30; 
							let previewString = firstValue.length > maxLength ? firstValue.substring(0, maxLength) + "..." : firstValue;
							return `\"${previewString}\"`; 
						}
					}
				}
				return undefined; 
			}
			if (type === 'array') {
				return `Array [${size}]`;
			}
			return undefined; 
		},
		/**
		 * Handles errors reported by the JSONEditor instance itself.
		 * @param {Error} err - The error object from JSONEditor.
		 */
		onError: function (err) {
			logger.error("JSONEditor Error:", err.toString());
			if(statusMessageDiv) statusMessageDiv.textContent = "JSONEditor error: " + err.toString();
		}
	};

	if (jsonEditorInstance) {
		logger.debug("JSONEditor instance exists, setting new data.");
		try {
			jsonEditorInstance.set(jsonData || {}); 
		} catch (e) {
			logger.error("Error setting data in JSONEditor:", e);
			try { jsonEditorInstance.set({ error: "Failed to load new data", details: e.toString() }); } catch (e2) { /* ignore further error on setting error */ }
		}
	} else {
		logger.debug("Creating new JSONEditor instance.");
		try {
			if (outputDiv) { // Ensure outputDiv exists before creating editor
				jsonEditorInstance = new JSONEditor(outputDiv, options, jsonData || { message: "No data loaded yet." });
			}
		} catch (e) {
			logger.error("Error creating JSONEditor instance:", e);
			if(outputDiv) outputDiv.innerHTML = `<p style='color:red;'>Failed to initialize JSONEditor: ${e.message}</p>`;
		}
	}
}

/**
 * Toggles visibility between the Live Controls View and the Parser Inspector View.
 * @param {boolean} showInspector - If true, shows the Parser Inspector; otherwise shows Live Controls.
 */
function toggleViews(showInspector) {
	if (showInspector) {
		if(liveControlsView) liveControlsView.style.display = 'none';
		if(parserInspectorView) parserInspectorView.style.display = 'block'; // Or 'flex' if it's a flex container
		if(toggleViewBtn) toggleViewBtn.textContent = 'Show Live Controls';
	} else {
		if(parserInspectorView) parserInspectorView.style.display = 'none';
		if(liveControlsView) liveControlsView.style.display = 'block'; // Or 'flex'
		if(toggleViewBtn) toggleViewBtn.textContent = 'Show Parsed Data Inspector';
	}
}

// Initialize JSONEditor and set initial view state on DOMContentLoaded.
document.addEventListener('DOMContentLoaded', () => {
	setupJsonEditor({ message: "Please select a Rive file to parse." });
	// Default to live controls view (parser inspector is hidden by default via CSS in HTML)
	if(parserInspectorView) parserInspectorView.style.display = 'none'; // Ensure it is hidden
	if(liveControlsView) liveControlsView.style.display = 'block'; // Ensure it is visible
});

// Event listeners for view toggle buttons
if (toggleViewBtn) {
	toggleViewBtn.addEventListener('click', () => {
		const isInspectorVisible = parserInspectorView && getComputedStyle(parserInspectorView).display !== 'none';
		toggleViews(!isInspectorVisible);
	});
}
if (closeInspectorBtn) {
	closeInspectorBtn.addEventListener('click', () => {
		toggleViews(false); // Show live controls view
	});
}

// Event listener for the Rive file picker.
riveFilePicker.addEventListener('change', handleFileSelect);

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
if (playAnimationBtn) {
	playAnimationBtn.addEventListener('click', handlePlayAnimation);
}
if (pauseAnimationBtn) {
	pauseAnimationBtn.addEventListener('click', handlePauseAnimation);
}
if (stopAnimationBtn) {
	stopAnimationBtn.addEventListener('click', handleStopAnimation);
}
if (startStateMachineBtn) {
	startStateMachineBtn.addEventListener('click', handleStartStateMachine);
}
if (stopStateMachineBtn) {
	stopStateMachineBtn.addEventListener('click', handleStopStateMachine);
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
		option.textContent = artboard.name;
		
		// Select the default artboard if it matches
		if (parsedData.defaultElements && parsedData.defaultElements.artboardName === artboard.name) {
			option.selected = true;
			selectedArtboard = artboard.name;
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
 * Populates the animation selector based on the selected artboard
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
		option.textContent = 'No Animations';
		animationSelector.appendChild(option);
		selectedAnimation = null;
		logger.info(`No animations found for artboard: ${artboardName}`);
		return;
	}

	// Add animation options
	selectedArtboardData.animations.forEach((animation, index) => {
		const option = document.createElement('option');
		option.value = animation.name;
		option.textContent = `${animation.name} (${animation.duration.toFixed(2)}s)`;
		
		// Select the first animation by default
		if (index === 0) {
			option.selected = true;
			selectedAnimation = animation.name;
		}
		
		animationSelector.appendChild(option);
	});

	logger.info(`Populated animation selector with ${selectedArtboardData.animations.length} animations for artboard ${artboardName}. Selected: ${selectedAnimation}`);
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
		option.textContent = stateMachine.name;
		
		// Select "State Machine 1" by default if it exists, otherwise select the first one
		if (stateMachine.name === "State Machine 1" || 
			(index === 0 && !selectedArtboardData.stateMachines.find(sm => sm.name === "State Machine 1"))) {
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
 * Handles animation selection change
 */
function handleAnimationChange() {
	selectedAnimation = animationSelector.value;
	logger.info(`Animation selection changed to: ${selectedAnimation}`);
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

	logger.info(`Applying selection - Artboard: ${selectedArtboard}, Animation: ${selectedAnimation || 'None'}, State Machine: ${selectedStateMachine || 'None'}`);

	// Update the parsed data with the new selection
	if (currentParsedData && currentParsedData.defaultElements) {
		currentParsedData.defaultElements.artboardName = selectedArtboard;
		currentParsedData.defaultElements.stateMachineNames = selectedStateMachine ? [selectedStateMachine] : [];
	}

	// Reinitialize the dynamic controls with the updated selection
	initDynamicControls(currentParsedData);
	
	if (statusMessageDiv) {
		statusMessageDiv.textContent = `Applied selection - Artboard: ${selectedArtboard}${selectedAnimation ? `, Animation: ${selectedAnimation}` : ''}${selectedStateMachine ? `, State Machine: ${selectedStateMachine}` : ''}`;
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
 * Handles playing the selected animation
 */
function handlePlayAnimation() {
	const riveInstance = getLiveRiveInstance();
	if (!riveInstance) {
		logger.warn('No live Rive instance available for animation playback');
		return;
	}

	if (!selectedAnimation) {
		logger.warn('No animation selected');
		return;
	}

	try {
		logger.info(`Playing animation: ${selectedAnimation}`);
		riveInstance.play(selectedAnimation);
		
		if (statusMessageDiv) {
			statusMessageDiv.textContent = `Playing animation: ${selectedAnimation}`;
		}
	} catch (error) {
		logger.error('Error playing animation:', error);
		if (statusMessageDiv) {
			statusMessageDiv.textContent = `Error playing animation: ${error.message}`;
		}
	}
}

/**
 * Handles pausing the selected animation
 */
function handlePauseAnimation() {
	const riveInstance = getLiveRiveInstance();
	if (!riveInstance) {
		logger.warn('No live Rive instance available for animation control');
		return;
	}

	if (!selectedAnimation) {
		logger.warn('No animation selected');
		return;
	}

	try {
		logger.info(`Pausing animation: ${selectedAnimation}`);
		riveInstance.pause(selectedAnimation);
		
		if (statusMessageDiv) {
			statusMessageDiv.textContent = `Paused animation: ${selectedAnimation}`;
		}
	} catch (error) {
		logger.error('Error pausing animation:', error);
		if (statusMessageDiv) {
			statusMessageDiv.textContent = `Error pausing animation: ${error.message}`;
		}
	}
}

/**
 * Handles stopping the selected animation
 */
function handleStopAnimation() {
	const riveInstance = getLiveRiveInstance();
	if (!riveInstance) {
		logger.warn('No live Rive instance available for animation control');
		return;
	}

	if (!selectedAnimation) {
		logger.warn('No animation selected');
		return;
	}

	try {
		logger.info(`Stopping animation: ${selectedAnimation}`);
		riveInstance.stop(selectedAnimation);
		
		if (statusMessageDiv) {
			statusMessageDiv.textContent = `Stopped animation: ${selectedAnimation}`;
		}
	} catch (error) {
		logger.error('Error stopping animation:', error);
		if (statusMessageDiv) {
			statusMessageDiv.textContent = `Error stopping animation: ${error.message}`;
		}
	}
}

/**
 * Handles starting the selected state machine
 */
function handleStartStateMachine() {
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
		logger.info(`Starting state machine: ${selectedStateMachine}`);
		riveInstance.play(selectedStateMachine);
		
		if (statusMessageDiv) {
			statusMessageDiv.textContent = `Started state machine: ${selectedStateMachine}`;
		}
	} catch (error) {
		logger.error('Error starting state machine:', error);
		if (statusMessageDiv) {
			statusMessageDiv.textContent = `Error starting state machine: ${error.message}`;
		}
	}
}

/**
 * Handles stopping the selected state machine
 */
function handleStopStateMachine() {
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
		logger.info(`Stopping state machine: ${selectedStateMachine}`);
		riveInstance.stop(selectedStateMachine);
		
		if (statusMessageDiv) {
			statusMessageDiv.textContent = `Stopped state machine: ${selectedStateMachine}`;
		}
	} catch (error) {
		logger.error('Error stopping state machine:', error);
		if (statusMessageDiv) {
			statusMessageDiv.textContent = `Error stopping state machine: ${error.message}`;
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
					
					// Populate and show artboard/animation/state machine selectors
					populateArtboardSelector(parsedData);
					if (selectedArtboard) {
						populateAnimationSelector(selectedArtboard);
						populateStateMachineSelector(selectedArtboard);
					}
					
					// Show the artboard/state machine controls
					if (artboardStateMachineControls) {
						artboardStateMachineControls.style.display = 'block';
					}
					
					// MODIFIED: Call initDynamicControls with only parsedData
					// riveControlInterface will be responsible for creating the Rive instance.
					initDynamicControls(parsedData);
					
				} else {
					if(statusMessageDiv) statusMessageDiv.textContent = "Parser finished with no data.";
					setupJsonEditor({ message: "Parser returned no data." });
					initDynamicControls(null);
					
					// Hide artboard/state machine controls when no data
					if (artboardStateMachineControls) {
						artboardStateMachineControls.style.display = 'none';
					}
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
