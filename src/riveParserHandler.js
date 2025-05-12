/**
 * @file main.js
 * Client-side script to handle user interactions for selecting a Rive file,
 * choosing a parser, and displaying the parsed Rive data using JSONEditor.
 * It orchestrates calls to the Rive parser and updates the UI accordingly.
 */

import { initDynamicControls } from './riveControlInterface.js';

// Log Rive globals on script load for debugging
console.log("[ParserHandler Pre-Init] typeof window.rive:", typeof window.rive, "Value:", window.rive);
console.log("[ParserHandler Pre-Init] typeof window.Rive:", typeof window.Rive, "Value:", window.Rive); // Note uppercase R

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
		// console.error("[MainJS] Output div for JSONEditor not found."); 
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
			console.error("[JSONEditor] Error:", err.toString());
			if(statusMessageDiv) statusMessageDiv.textContent = "JSONEditor error: " + err.toString();
		}
	};

	if (jsonEditorInstance) {
		// console.log("[MainJS] JSONEditor instance exists, setting new data.");
		try {
			jsonEditorInstance.set(jsonData || {}); 
		} catch (e) {
			console.error("[MainJS] Error setting data in JSONEditor:", e);
			try { jsonEditorInstance.set({ error: "Failed to load new data", details: e.toString() }); } catch (e2) { /* ignore further error on setting error */ }
		}
	} else {
		// console.log("[MainJS] Creating new JSONEditor instance.");
		try {
			if (outputDiv) { // Ensure outputDiv exists before creating editor
				jsonEditorInstance = new JSONEditor(outputDiv, options, jsonData || { message: "No data loaded yet." });
			}
		} catch (e) {
			console.error("[MainJS] Error creating JSONEditor instance:", e);
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
		console.error("[MainJS] Rive engine (window.rive) not found!");
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
		// console.log(`[MainJS] Will use selected file: ${file.name}`);
	} else {
		riveSrcForOriginal = null; // Parser.js handles its default
	}
	if(statusMessageDiv) statusMessageDiv.textContent = `Running Rive parser (${messageForOriginal})...`;

	const riveCanvas = document.getElementById('rive-canvas');
	console.log("[ParserHandler Debug] riveCanvas element fetched in handleFileSelect:", riveCanvas); // DEBUG LINE
	if (!riveCanvas) {
		console.error("[ParserHandler Error] Canvas element with ID 'rive-canvas' not found in DOM!");
		// Optionally, update UI to reflect this critical error
		// return; // Might be too early to return, let parser.js handle its internal fallback for now
	} 

	if (typeof runOriginalClientParser === 'function') {
		try {
			runOriginalClientParser(riveEngine, riveCanvas, riveSrcForOriginal, function(error, parsedData, liveRiveInstanceFromParser) {
				if (error) {
					console.error("[MainJS] Parser reported error:", error);
					if(statusMessageDiv) statusMessageDiv.textContent = `Error from parser: ${error.error || 'Unknown error'}`;
					setupJsonEditor({ error: `Parser error: ${error.error || 'Unknown error'}`, details: error.details });
					currentRiveInstance = null;
					initDynamicControls(null, null); // Clear or show error in dynamic controls
				} else if (parsedData) {
					if(statusMessageDiv) statusMessageDiv.textContent = `Successfully parsed. Displaying data.`;
					setupJsonEditor(parsedData); 
					
					// IMPORTANT: We need the *actual* Rive instance that was created by runOriginalClientParser
					// and is rendering on the canvas for the dynamic controls to work.
					// The `riveEngine` passed into runOriginalClientParser is just the Rive library itself.
					// For now, we assume liveRiveInstanceFromParser is provided by the callback.
					currentRiveInstance = liveRiveInstanceFromParser; 
					
					// Use the default elements information to create a better experience
					if (parsedData.defaultElements) {
						console.log("[ParserHandler] Default elements found:", parsedData.defaultElements);
						
						// Use the collected info instead of relying on autoplay/autobind
						if (parsedData.defaultElements.artboardName && 
							parsedData.defaultElements.stateMachineNames && 
							parsedData.defaultElements.stateMachineNames.length > 0) {
							
							console.log(`[ParserHandler] Using specific artboard "${parsedData.defaultElements.artboardName}" and state machines:`, 
								parsedData.defaultElements.stateMachineNames);
							
							// We might want to create a new Rive instance with specific parameters
							// but for now, we'll use the existing instance which should already have the
							// artboard and state machines activated by the parser
						}
					}
					
					if (currentRiveInstance) {
						initDynamicControls(currentRiveInstance, parsedData);
					} else {
						console.warn("[MainJS] Live Rive instance not received from parser. Dynamic controls may not work.");
						// Attempt to use the global Rive instance if available, though it might not be the one with the file loaded.
						// This is a fallback and ideally parser.js callback should provide the correct instance.
						if(window.rive && window.rive.lastInstance) { // Speculative: check if Rive runtime exposes last created instance
							currentRiveInstance = window.rive.lastInstance; 
							 initDynamicControls(currentRiveInstance, parsedData);
						} else {
							initDynamicControls(null, parsedData); // Pass data, but no instance
						}
					}
				} else {
					if(statusMessageDiv) statusMessageDiv.textContent = "Parser finished with no data.";
					setupJsonEditor({ message: "Parser returned no data." });
					currentRiveInstance = null;
					initDynamicControls(null, null);
				}
			}); 
		} catch (e) {
			console.error("[MainJS] Error calling runOriginalClientParser:", e);
			if(statusMessageDiv) statusMessageDiv.textContent = "Error running parser. Check console.";
			setupJsonEditor({ error: `Error calling parser: ${e.message}` });
		}
	} else {
		console.error("[MainJS] runOriginalClientParser function not found.");
		if(statusMessageDiv) statusMessageDiv.textContent = "Error: Parser function not found.";
		setupJsonEditor({ error: "Parser function not found." });
	}
}
