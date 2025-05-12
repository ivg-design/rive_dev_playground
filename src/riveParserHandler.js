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

/**
 * Holds the current instance of the JSONEditor.
 * @type {JSONEditor | null}
 */
let jsonEditorInstance = null;
let currentRiveInstance = null; // Store the live Rive instance globally in this module

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
				} else if (parsedData) {
					if(statusMessageDiv) statusMessageDiv.textContent = `Successfully parsed. Displaying data.`;
					setupJsonEditor(parsedData); 
					
					// MODIFIED: Call initDynamicControls with only parsedData
					// riveControlInterface will be responsible for creating the Rive instance.
					initDynamicControls(parsedData);
					
				} else {
					if(statusMessageDiv) statusMessageDiv.textContent = "Parser finished with no data.";
					setupJsonEditor({ message: "Parser returned no data." });
					initDynamicControls(null);
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
