/**
 * @file riveControlInterface.js
 * Handles the creation and management of dynamic UI controls for interacting
 * with live Rive animations (State Machine inputs, ViewModel properties).
 */

// To store a reference to the live Rive instance and parsed data if needed globally within this module
let riveInstance = null;
let parsedRiveData = null;
let dynamicControlsInitialized = false;

/* ---------- helpers (adapted from exampleIndex.mjs) ------------------ */
const argbToHex = (a) => {
    if (typeof a !== 'number') return '#000000'; // Default or error color
    return '#' + (a & 0xffffff).toString(16).padStart(6, '0').toUpperCase();
}
const hexToArgb = (h) => {
    if (!h || typeof h !== 'string' || !h.startsWith('#')) return 0; // Default or error value
    return parseInt('FF' + h.slice(1), 16) | 0; // Ensure it's an integer
};

const makeRow = (label, el, notes = '') => {
    const row = document.createElement('div');
    row.className = 'control-row';
    const lab = document.createElement('label');
    lab.textContent = label;
    row.appendChild(lab);
    row.appendChild(el);
    if (notes) {
        const noteSpan = document.createElement('span');
        noteSpan.className = 'control-notes';
        noteSpan.textContent = ` (${notes})`;
        lab.appendChild(noteSpan); // Append notes to the label for better layout
    }
    return row;
};

/**
 * Initializes and builds the dynamic control UI based on the Rive instance and parsed data.
 * This function will be called by riveParserHandler.js after a Rive file is successfully parsed.
 * 
 * @param {object} liveRiveInstance - The active Rive instance from the Rive WebGL2 runtime.
 * @param {object} newParsedData - The structured data object from parser.js.
 */
export function initDynamicControls(liveRiveInstance, newParsedData) {
    riveInstance = liveRiveInstance;
    parsedRiveData = newParsedData;
    dynamicControlsInitialized = true;

    const controlsContainer = document.getElementById('dynamicControlsContainer');
    if (!controlsContainer) {
        console.error("[RiveControls] Dynamic controls container #dynamicControlsContainer not found.");
        return;
    }

    controlsContainer.innerHTML = ''; // Clear previous controls

    if (!riveInstance) {
        controlsContainer.innerHTML = '<p>Rive instance not available. Cannot build controls.</p>';
        return;
    }
    if (!parsedRiveData || !parsedRiveData.artboards) {
        controlsContainer.innerHTML = '<p>Parsed Rive data not available or incomplete. Cannot build controls.</p>';
        return;
    }

    const mainTitle = document.createElement('h3');
    mainTitle.textContent = "Live Rive Controls";
    controlsContainer.appendChild(mainTitle);

    // Iterate through artboards
    parsedRiveData.artboards.forEach(artboard => {
        if (!artboard.name) return; // Skip if artboard has no name

        const artboardSection = document.createElement('details');
        artboardSection.className = 'control-section';
        artboardSection.open = true; // Default to open
        const artboardSummary = document.createElement('summary');
        artboardSummary.textContent = `Artboard: ${artboard.name}`;
        artboardSection.appendChild(artboardSummary);

        // --- State Machine Controls --- (RE-ENABLING FOR DETAILED LOGGING)
        if (artboard.stateMachines && artboard.stateMachines.length > 0) {
            const smContainer = document.createElement('div');
            smContainer.className = 'sm-controls-container';
            artboard.stateMachines.forEach(smData => {
                if (!smData.name) {
                    console.warn("[RiveControls] SM data found without a name in artboard:", artboard.name);
                    return;
                }
                console.log(`[RiveControls] Processing SM: '${smData.name}' in artboard '${artboard.name}'`);
                
                const liveArtboard = riveInstance.artboardByName(artboard.name);
                if (!liveArtboard) {
                    console.warn(`[RiveControls] Live artboard NOT FOUND: '${artboard.name}'`);
                    return;
                }

                const liveSM = liveArtboard.stateMachineByName(smData.name);
                if (!liveSM) {
                    console.warn(`[RiveControls] Live SM NOT FOUND: '${smData.name}' in artboard '${artboard.name}'`);
                    return;
                }

                // Get the live inputs directly from the live StateMachineInstance
                // The .inputs property is usually an array of the live input objects.
                const liveSmInputs = liveSM.inputs; 

                console.log(`[RiveControls] Live inputs for SM '${smData.name}':`, liveSmInputs);

                if (!liveSmInputs) {
                    console.warn(`[RiveControls] No live inputs array/property found for SM '${smData.name}'.`);
                    return;
                }
                // No need to check liveSmInputs.length === 0 if smData.inputs.length > 0 here, 
                // because if liveSM.inputs exists, it should contain all inputs defined for that SM.
                // We will check individually when trying to find a liveInput by name.

                const smSection = document.createElement('details');
                smSection.className = 'control-subsection';
                smSection.open = true;
                const smSummary = document.createElement('summary');
                smSummary.textContent = `SM: ${smData.name}`;
                smSection.appendChild(smSummary);

                smData.inputs.forEach(inputData => {
                    if (!inputData.name) {
                        console.warn("[RiveControls] Parsed SM input found without a name for SM:", smData.name);
                        return;
                    }
                    console.log(`[RiveControls]  Attempting to find live input: '${inputData.name}' for SM '${smData.name}'`);
                    const liveInput = liveSmInputs.find(i => i.name === inputData.name);
                    
                    if (!liveInput) {
                        console.warn(`[RiveControls]   Live input NOT FOUND for '${inputData.name}' in SM '${smData.name}'. Available live inputs:`, liveSmInputs.map(i => i.name));
                        return;
                    }
                    console.log(`[RiveControls]   Found live input '${inputData.name}', type from parser: '${inputData.type}', live value:`, liveInput.value);

                    let ctrl;
                    let notes = inputData.type; 

                    if (inputData.type === 'Boolean') {
                        ctrl = document.createElement('input');
                        ctrl.type = 'checkbox';
                        ctrl.checked = liveInput.value;
                        ctrl.addEventListener('change', () => liveInput.value = ctrl.checked);
                    } else if (inputData.type === 'Number') {
                        ctrl = document.createElement('input');
                        ctrl.type = 'number';
                        ctrl.value = liveInput.value;
                        ctrl.addEventListener('input', () => liveInput.value = parseFloat(ctrl.value) || 0);
                    } else if (inputData.type === 'Trigger') {
                        ctrl = document.createElement('button');
                        ctrl.textContent = 'Fire';
                        ctrl.addEventListener('click', () => liveInput.fire());
                        notes = 'Trigger'; 
                    } else {
                        notes += ' (No UI Control)';
                    }

                    if (ctrl) {
                        smSection.appendChild(makeRow(inputData.name, ctrl, notes));
                    }
                });
                if(smSection.querySelectorAll('.control-row').length > 0) {
                    smContainer.appendChild(smSection);
                }
            });
            if (smContainer.hasChildNodes()) artboardSection.appendChild(smContainer);
        }
        
        // --- ViewModel Controls (Placeholder for now) ---
        if (artboard.viewModels && artboard.viewModels.length > 0) {
            const vmTitle = document.createElement('h5');
            vmTitle.textContent = "View Models:";
            artboardSection.appendChild(vmTitle);
            // TODO: Implement ViewModel control generation here
            artboard.viewModels.forEach(vmData => {
                const vmPlaceholder = document.createElement('p');
                vmPlaceholder.textContent = `  VM: ${vmData.instanceName} (Controls TBD)`;
                artboardSection.appendChild(vmPlaceholder);
            });
        }

        if (artboardSection.querySelectorAll('.sm-controls-container > details').length > 0 || 
            (artboard.viewModels && artboard.viewModels.length > 0)) {
            controlsContainer.appendChild(artboardSection);
        }
    });

    // Example: Add a button to test interaction (remove later)
    const testButton = document.createElement('button');
    testButton.textContent = "Test Rive Interaction (see console)";
    testButton.onclick = () => {
        if (riveInstance) {
            console.log("[RiveControls] Test: Rive instance available.", riveInstance);
            // Try to get a known SM input if one exists from a loaded file
            // This is just for testing; actual controls will be data-driven
        }
    };
    controlsContainer.appendChild(testButton);
}

/**
 * Function to update controls if Rive data changes without a full re-parse (e.g., internal state change).
 * For now, it might just re-initialize if called.
 */
export function updateDynamicControls() {
    if (dynamicControlsInitialized && riveInstance && parsedRiveData) {
        console.log("[RiveControls] updateDynamicControls called. Re-initializing.");
        initDynamicControls(riveInstance, parsedRiveData);
    } else {
        console.warn("[RiveControls] updateDynamicControls called but not initialized or Rive data missing.");
    }
} 