/**
 * @file main.js
 * Client-side script to handle user interactions for selecting a Rive file,
 * choosing a parser, and displaying the parsed Rive data using JSONEditor.
 * It orchestrates calls to the Rive parser and updates the UI accordingly.
 */

// DOM element references
const riveFilePicker = document.getElementById('riveFilePicker');
const outputDiv = document.getElementById('output'); 
const statusMessageDiv = document.getElementById('statusMessage');

/**
 * Holds the current instance of the JSONEditor.
 * @type {JSONEditor | null}
 */
let jsonEditorInstance = null;

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

// Initialize JSONEditor with a placeholder message when the DOM is ready.
document.addEventListener('DOMContentLoaded', () => {
	setupJsonEditor({ message: "Please select a Rive file to parse." });
});

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
	if (!riveCanvas) {
		// console.warn("[MainJS] Canvas with id 'rive-canvas' not found. It might be needed by the parser.");
	} 

	if (typeof runOriginalClientParser === 'function') {
		try {
			runOriginalClientParser(riveEngine, riveCanvas, riveSrcForOriginal, function(error, parsedData) {
				if (error) {
					console.error("[MainJS] Parser reported error:", error);
					if(statusMessageDiv) statusMessageDiv.textContent = `Error from parser: ${error.error || 'Unknown error'}`;
					setupJsonEditor({ error: `Parser error: ${error.error || 'Unknown error'}`, details: error.details });
				} else if (parsedData) {
					if(statusMessageDiv) statusMessageDiv.textContent = `Successfully parsed. Displaying in JSONEditor.`;
					setupJsonEditor(parsedData);
				} else {
					if(statusMessageDiv) statusMessageDiv.textContent = "Parser finished with no data.";
					setupJsonEditor({ message: "Parser returned no data." });
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

// console.log("[MainJS] Initialized for JSONEditor. Waiting for file selection.");
