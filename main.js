// main.js (Client-side entry point for testing)
import { parseRiveFile } from './parser_modules/riveParserOrchestrator.js';

const riveFilePicker = document.getElementById('riveFilePicker');
const outputDiv = document.getElementById('output');
const statusMessageDiv = document.getElementById('statusMessage');
const artboardNameForSmCalibrationInput = document.getElementById('artboardNameForSmCalibration');
const smNameForSmCalibrationInput = document.getElementById('smNameForSmCalibration');

riveFilePicker.addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    const parserChoice = document.querySelector('input[name="parserChoice"]:checked').value;

    if (!window.rive) {
        console.error("[MainJS] Rive engine (window.rive) not found!");
        statusMessageDiv.textContent = "Error: Rive engine (window.rive) not found!";
        outputDiv.textContent = "Error: Rive engine (window.rive) not found! Make sure rive.js is loaded correctly.";
        return;
    }
    const riveEngine = window.rive;

    if (parserChoice === 'original') {
        console.log("[MainJS] Original parser.js selected.");
        
        let fileToParseForOriginal = null;
        let riveSrcForOriginal = 'animations/diagram_v3.riv'; // Default hardcoded path
        let messageForOriginal = "using hardcoded 'animations/diagram_v3.riv'";

        // if (file && file.name) { // Check if a file was selected in the input // DEBUG: Temporarily disable using selected file
        //     fileToParseForOriginal = file;
        //     riveSrcForOriginal = URL.createObjectURL(fileToParseForOriginal);
        //     messageForOriginal = `using selected file '${fileToParseForOriginal.name}'`;
        //     console.log(`[MainJS] Original parser will use selected file: ${fileToParseForOriginal.name}`);
        // } else {
        //     console.log("[MainJS] No file selected for original parser, using hardcoded default.");
        // }
        // DEBUG: Force original parser to use its internal default path
        riveSrcForOriginal = null; 
        messageForOriginal = "forcing internal default 'animations/diagram_v3.riv' for debugging";
        console.log("[MainJS] DEBUG: Forcing original parser to use its internal default path.");

        statusMessageDiv.textContent = `Running original parser.js (${messageForOriginal})... Output will be in console and WebSocket.`;
        outputDiv.innerHTML = `<p>Original parser.js is running (${messageForOriginal}).</p><p>Check the browser console for its logs. If 'node parse-rive.js' is running, it will also send data via WebSocket.</p>`;
        
        // Ensure the canvas used by original parser.js is available and visible
        let riveCanvas = document.getElementById('rive-canvas');
        if (!riveCanvas) {
            console.warn("[MainJS] Canvas with id 'rive-canvas' not found for original parser. Creating one.");
            riveCanvas = document.createElement('canvas');
            riveCanvas.id = 'rive-canvas';
            riveCanvas.width = 500; // Default size, can be styled via CSS too
            riveCanvas.height = 500;
            // Append it somewhere, e.g., to the output container or body
            document.getElementById('outputContainer').appendChild(riveCanvas);
            riveCanvas.style.display = 'block'; // Make it visible if it wasn't
        } else {
            riveCanvas.style.display = 'block'; // Ensure it's visible
        }

        if (typeof runOriginalClientParser === 'function') {
            try {
                runOriginalClientParser(riveEngine, riveCanvas, riveSrcForOriginal); // riveSrcForOriginal will be null
                // If an object URL was created, revoke it after a delay or when no longer needed.
                // For simplicity here, we might not revoke it immediately if the Rive instance needs it.
                // Consider revoking if 'riveInstance.destroy()' or similar is called in original parser.
                // if (fileToParseForOriginal) { URL.revokeObjectURL(riveSrcForOriginal); } // Example, but timing is critical
            } catch (e) {
                console.error("[MainJS] Error calling runOriginalClientParser:", e);
                statusMessageDiv.textContent = "Error running original parser.js. Check console.";
                outputDiv.innerHTML += `<p style='color:red;'>Error running original parser: ${e.message}</p>`;
            }
        } else {
            console.error("[MainJS] runOriginalClientParser function not found. Ensure parser.js is loaded correctly before main.js.");
            statusMessageDiv.textContent = "Error: Original parser function not found.";
            outputDiv.innerHTML += "<p style='color:red;'>Error: runOriginalClientParser function not found. Check script loading order.</p>";
        }
        return; // Stop further processing for original parser
    }

    // Proceed with Modular Parser if 'modular' is selected
    if (!file) {
        statusMessageDiv.textContent = "No file selected (for Modular Parser).";
        outputDiv.textContent = "JSON output will appear here...";
        return;
    }

    console.log(`[MainJS] Selected file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
    statusMessageDiv.textContent = `Loading and parsing ${file.name}...`;
    outputDiv.textContent = "Parsing in progress...";

    const reader = new FileReader();
    reader.onload = function(e) {
        const riveFileBuffer = e.target.result; // This is an ArrayBuffer

        console.log("[MainJS] Rive engine found. Calling parseRiveFile...");

        const artboardNameToUse = artboardNameForSmCalibrationInput.value.trim() || null;
        const smNameToUse = smNameForSmCalibrationInput.value.trim() || null;

        parseRiveFile(riveEngine, riveFileBuffer, artboardNameToUse, smNameToUse)
            .then(result => {
                console.log("[MainJS] Parsing Complete. Full Result Object:", result);
                
                const jsonOutput = JSON.stringify(result, (key, value) => {
                    // Custom replacer to avoid stringifying rawDef (Rive objects) if they are too complex or circular
                    if (key === 'rawDef') return '[RiveObjectReference]'; 
                    return value;
                }, 2);

                outputDiv.textContent = jsonOutput;
                statusMessageDiv.textContent = `Successfully parsed ${file.name}.`;
                
                // If you had a WebSocket to send data to a server:
                // if (ws && ws.readyState === WebSocket.OPEN) {
                //     ws.send(JSON.stringify({ type: 'parseResult', data: result, fileName: file.name }));
                // }
            })
            .catch(error => {
                console.error("[MainJS] Error during parsing process:", error);
                outputDiv.textContent = `Error parsing file: ${error.message}\n\n${error.stack}\n\nSee console for more details.`;
                statusMessageDiv.textContent = `Error parsing ${file.name}.`;
            });
    };

    reader.onerror = function(e) {
        console.error("[MainJS] FileReader error:", e);
        statusMessageDiv.textContent = "Error reading file.";
        outputDiv.textContent = "Error reading file.";
    };

    reader.readAsArrayBuffer(file);
}

// Example WebSocket setup (optional, uncomment and configure if needed)
/*
let ws;
function setupWebSocket(url = 'ws://localhost:3000') {
    ws = new WebSocket(url);
    ws.onopen = () => {
        console.log(`[MainJS] WebSocket connection established to ${url}.`);
        statusMessageDiv.textContent = "WebSocket connected. Ready to parse.";
    };
    ws.onmessage = (event) => {
        console.log('[MainJS] Message from server:', event.data);
    };
    ws.onerror = (error) => {
        console.error('[MainJS] WebSocket error:', error);
        statusMessageDiv.textContent = "WebSocket connection error.";
    };
    ws.onclose = () => {
        console.log('[MainJS] WebSocket connection closed.');
        statusMessageDiv.textContent = "WebSocket disconnected.";
    };
}
// Call setupWebSocket() if you want to use WebSockets.
// setupWebSocket(); 
*/

console.log("[MainJS] Initialized. Waiting for file selection."); 