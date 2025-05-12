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

// Helper to get and process a ViewModel property
function getViewModelProperty(viewModelInstance, propertyName, propertyType) {
    if (!viewModelInstance) {
        console.log(`[RiveControls] Cannot access ViewModel property - viewModelInstance is null/undefined`);
        return null;
    }
    
    try {
        let input = null;
        
        console.log(`[RiveControls] Accessing ${propertyType} property '${propertyName}' from VM:`, 
            viewModelInstance.name || 'unnamed VM');
        
        switch (propertyType) {
            case 'string':
                if (typeof viewModelInstance.string === 'function') {
                    input = viewModelInstance.string(propertyName);
                    console.log(`[RiveControls] Got string property '${propertyName}':`, input ? input.value : 'null');
                } else {
                    console.warn(`[RiveControls] This VM doesn't have a string() function`);
                }
                break;
            case 'boolean':
                if (typeof viewModelInstance.boolean === 'function') {
                    input = viewModelInstance.boolean(propertyName);
                    console.log(`[RiveControls] Got boolean property '${propertyName}':`, input ? input.value : 'null');
                } else {
                    console.warn(`[RiveControls] This VM doesn't have a boolean() function`);
                }
                break;
            case 'number':
                if (typeof viewModelInstance.number === 'function') {
                    input = viewModelInstance.number(propertyName);
                    console.log(`[RiveControls] Got number property '${propertyName}':`, input ? input.value : 'null');
                } else {
                    console.warn(`[RiveControls] This VM doesn't have a number() function`);
                }
                break;
            case 'color':
                if (typeof viewModelInstance.color === 'function') {
                    input = viewModelInstance.color(propertyName);
                    console.log(`[RiveControls] Got color property '${propertyName}':`, 
                        input && typeof input.value === 'number' ? argbToHex(input.value) : 'invalid value');
                } else {
                    console.warn(`[RiveControls] This VM doesn't have a color() function`);
                }
                break;
            case 'enumType':
                if (typeof viewModelInstance.enum === 'function') {
                    input = viewModelInstance.enum(propertyName);
                    console.log(`[RiveControls] Got enum property '${propertyName}':`, input ? input.value : 'null');
                } else if (typeof viewModelInstance.string === 'function') {
                    // Sometimes enum values can be accessed via string
                    console.warn(`[RiveControls] VM has no enum() function, trying string() fallback for '${propertyName}'`);
                    input = viewModelInstance.string(propertyName);
                    console.log(`[RiveControls] Got enum (via string) property '${propertyName}':`, input ? input.value : 'null');
                } else {
                    console.warn(`[RiveControls] This VM doesn't have enum() or string() functions`);
                }
                break;
            case 'viewModel':
                if (typeof viewModelInstance.viewModel === 'function') {
                    input = viewModelInstance.viewModel(propertyName);
                    console.log(`[RiveControls] Got nested viewModel '${propertyName}'`);
                } else {
                    console.warn(`[RiveControls] This VM doesn't have a viewModel() function`);
                }
                break;
        }
        
        return input;
    } catch (e) {
        console.error(`[RiveControls] Error accessing ViewModel property '${propertyName}' of type '${propertyType}':`, e);
        return null;
    }
}

// Create a control element for a specific input type
function createControlForInput(input, inputType) {
    if (!input) return null;
    
    let ctrl = null;
    
    switch (inputType) {
        case 'string':
            ctrl = document.createElement('textarea');
            ctrl.value = (input.value || '').replace(/\\n/g, '\n');
            ctrl.addEventListener('input', () => {
                try {
                    input.value = ctrl.value.replace(/\n/g, '\\n');
                } catch (e) {
                    console.error('[RiveControls] Error setting string value:', e);
                }
            });
            break;
            
        case 'boolean':
            ctrl = document.createElement('input');
            ctrl.type = 'checkbox';
            ctrl.checked = !!input.value;
            ctrl.addEventListener('change', () => {
                try {
                    input.value = ctrl.checked;
                } catch (e) {
                    console.error('[RiveControls] Error setting boolean value:', e);
                }
            });
            break;
            
        case 'number':
            ctrl = document.createElement('input');
            ctrl.type = 'number';
            ctrl.value = input.value || 0;
            ctrl.addEventListener('input', () => {
                try {
                    input.value = parseFloat(ctrl.value) || 0;
                } catch (e) {
                    console.error('[RiveControls] Error setting number value:', e);
                }
            });
            break;
            
        case 'color':
            ctrl = document.createElement('input');
            ctrl.type = 'color';
            try {
                ctrl.value = argbToHex(input.value);
                ctrl.addEventListener('input', () => {
                    try {
                        input.value = hexToArgb(ctrl.value);
                    } catch (e) {
                        console.error('[RiveControls] Error setting color value:', e);
                    }
                });
            } catch (e) {
                console.error('[RiveControls] Error setting initial color value:', e);
                ctrl.value = '#000000';
            }
            break;
            
        case 'enumType':
            ctrl = document.createElement('select');
            
            // Try to get possible enum values
            if (riveInstance && typeof riveInstance.enums === 'function') {
                try {
                    const allEnums = riveInstance.enums();
                    const enumValues = allEnums.find(d => d.name === input.name)?.values || [];
                    
                    enumValues.forEach(v => {
                        const option = new Option(v, v);
                        ctrl.appendChild(option);
                    });
                    
                    if (input.value) {
                        ctrl.value = input.value;
                    }
                } catch (e) {
                    console.error('[RiveControls] Error getting enum values:', e);
                }
            }
            
            ctrl.addEventListener('change', () => {
                try {
                    input.value = ctrl.value;
                } catch (e) {
                    console.error('[RiveControls] Error setting enum value:', e);
                }
            });
            break;
    }
    
    return ctrl;
}

// Helper to format values from Rive
function formatRiveValue(x) {
    if (x === undefined || x === null) return '';
    if (typeof x === 'string') return x;
    if (Array.isArray(x)) return x.join(', ');
    if (typeof x === 'object') {
        // Rive WebGL2 ships an object `{type:"statechange", data:[...]}`
        if (Array.isArray(x.data)) return x.data.join(', ');
        if ('name' in x) return x.name;
        return JSON.stringify(x);
    }
    return String(x);
}

/**
 * Initializes and builds the dynamic control UI based on the Rive instance and parsed data.
 * This function will be called by riveParserHandler.js after a Rive file is successfully parsed.
 * 
 * @param {object} liveRiveInstance - The active Rive instance from the Rive WebGL2 runtime.
 * @param {object} newParsedData - The structured data object from parser.js.
 */
export function initDynamicControls(liveRiveInstance, newParsedData) {
    console.log("[RiveControls] Initializing dynamic controls with instance:", liveRiveInstance);
    
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
    if (!parsedRiveData) {
        controlsContainer.innerHTML = '<p>Parsed Rive data not available. Cannot build controls.</p>';
        return;
    }
    
    // Ensure we have basic artboards data
    if (!parsedRiveData.artboards) {
        console.error("[RiveControls] Parsed data missing required 'artboards' property:", parsedRiveData);
        controlsContainer.innerHTML = '<p>Parsed data incomplete - missing artboards information. Cannot build controls.</p>';
        return;
    }

    const mainTitle = document.createElement('h3');
    mainTitle.textContent = "Live Rive Controls";
    controlsContainer.appendChild(mainTitle);

    // Get default/active elements info (with fallbacks)
    const defaultElements = parsedRiveData.defaultElements || {};
    const defaultArtboardName = defaultElements.artboardName || 
                               (riveInstance.artboard ? riveInstance.artboard.name : null);
    const defaultStateMachineNames = defaultElements.stateMachineNames || 
                                    (riveInstance.stateMachines || []);
    
    // Add a header with default artboard and state machine info
    if (defaultArtboardName) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'default-info';
        infoDiv.innerHTML = `<p><strong>Active Artboard:</strong> ${defaultArtboardName}</p>`;
        
        if (defaultStateMachineNames && defaultStateMachineNames.length > 0) {
            infoDiv.innerHTML += `<p><strong>Active State Machines:</strong> ${defaultStateMachineNames.join(', ')}</p>`;
        }
        
        controlsContainer.appendChild(infoDiv);
    }

    // Dump debug info
    console.log("[RiveControls] Active artboard:", defaultArtboardName);
    console.log("[RiveControls] Active state machines:", defaultStateMachineNames);

    // First, check if we have state machines from the parsed data
    if (defaultStateMachineNames && defaultStateMachineNames.length > 0) {
        const activeSMSection = document.createElement('details');
        activeSMSection.className = 'control-section';
        activeSMSection.open = true;
        const activeSMSummary = document.createElement('summary');
        activeSMSummary.textContent = "Active State Machines";
        activeSMSection.appendChild(activeSMSummary);
        
        const smContainer = document.createElement('div');
        smContainer.className = 'sm-controls-container';
        
        // Use the state machine names from the defaultElements
        defaultStateMachineNames.forEach(smName => {
            if (!smName) return; // Skip empty names
            
            // Create a section for each state machine
            const smSection = document.createElement('details');
            smSection.className = 'control-subsection';
            smSection.open = true;
            const smSummary = document.createElement('summary');
            smSummary.textContent = `SM: ${smName} (Active)`;
            smSection.appendChild(smSummary);
            
            // Try to add a "force play" button
            const playButton = document.createElement('button');
            playButton.textContent = "Force Play";
            playButton.className = "play-button";
            playButton.addEventListener('click', () => {
                try {
                    riveInstance.play(smName);
                    console.log(`[RiveControls] Manually played state machine: ${smName}`);
                    // Refresh controls after playing
                    setTimeout(() => initDynamicControls(riveInstance, parsedRiveData), 300);
                } catch (e) {
                    console.error(`[RiveControls] Error playing state machine: ${smName}`, e);
                }
            });
            smSection.appendChild(playButton);
                
            // Try to get inputs for this state machine
            let hasInputs = false;
            try {
                // Make sure we get inputs directly from the Rive instance
                let inputs;
                if (typeof riveInstance.stateMachineInputs === 'function') {
                    inputs = riveInstance.stateMachineInputs(smName);
                    console.log(`[RiveControls] Found inputs for '${smName}' using stateMachineInputs():`, inputs);
                } else {
                    console.warn(`[RiveControls] No stateMachineInputs method found on Rive instance for '${smName}'`);
                    inputs = [];
                }
                
                if (inputs && Array.isArray(inputs) && inputs.length > 0) {
                    inputs.forEach(input => {
                        if (!input || !input.name) return;
                        
                        console.log(`[RiveControls] Found active input: ${input.name}, type:`, input.type);
                        
                        let ctrl;
                        let notes = 'Active';
                        
                        // Reference the enum from window.rive if available
                        const riveRef = window.rive || {};
                        const SMInputType = riveRef.StateMachineInputType || {};
                        
                        if (input.type === SMInputType.Boolean || input.type === 'boolean') {
                            ctrl = document.createElement('input');
                            ctrl.type = 'checkbox';
                            ctrl.checked = input.value;
                            ctrl.addEventListener('change', () => {
                                try {
                                    input.value = ctrl.checked;
                                } catch (err) {
                                    console.error(`[RiveControls] Error setting Boolean value for '${input.name}':`, err);
                                }
                            });
                        } else if (input.type === SMInputType.Number || input.type === 'number') {
                            ctrl = document.createElement('input');
                            ctrl.type = 'number';
                            ctrl.value = input.value;
                            ctrl.addEventListener('input', () => {
                                try {
                                    input.value = parseFloat(ctrl.value) || 0;
                                } catch (err) {
                                    console.error(`[RiveControls] Error setting Number value for '${input.name}':`, err);
                                }
                            });
                        } else if (input.type === SMInputType.Trigger || input.type === 'trigger') {
                            ctrl = document.createElement('button');
                            ctrl.textContent = 'Fire';
                            ctrl.addEventListener('click', () => {
                                try {
                                    input.fire();
                                } catch (err) {
                                    console.error(`[RiveControls] Error firing Trigger for '${input.name}':`, err);
                                }
                            });
                            notes = 'Trigger (Active)';
                        } else {
                            // Unknown or unsupported type
                            const typeStr = typeof input.type === 'number' ? `Type ${input.type}` : String(input.type);
                            notes = `Unknown type: ${typeStr}`;
                        }
                        
                        if (ctrl) {
                            smSection.appendChild(makeRow(input.name, ctrl, notes));
                            hasInputs = true;
                        }
                    });
                } else {
                    const noInputsNote = document.createElement('p');
                    noInputsNote.className = 'info-note';
                    noInputsNote.textContent = "No inputs available for this state machine.";
                    smSection.appendChild(noInputsNote);
                }
            } catch (err) {
                console.error(`[RiveControls] Error accessing inputs for SM '${smName}':`, err);
                const errorNote = document.createElement('p');
                errorNote.className = 'error-note';
                errorNote.textContent = "Error accessing inputs.";
                smSection.appendChild(errorNote);
            }
            
            // Add this section to the container
            smContainer.appendChild(smSection);
        });
        
        if (smContainer.hasChildNodes()) {
            activeSMSection.appendChild(smContainer);
            controlsContainer.appendChild(activeSMSection);
        }
    } else {
        console.log("[RiveControls] No state machines found in parsed data.");
        
        // Add a message that no state machines were found
        const noSmMessage = document.createElement('div');
        noSmMessage.className = 'info-section';
        noSmMessage.innerHTML = '<p>No state machines found in this Rive file.</p>';
        controlsContainer.appendChild(noSmMessage);
    }

    // Second, display artboards from parsed data with their state machines
    // (this is more for informational purposes if artboards aren't active)
    const artboardsSection = document.createElement('details');
    artboardsSection.className = 'control-section';
    artboardsSection.open = true;
    const artboardsSummary = document.createElement('summary');
    artboardsSummary.textContent = "Available Artboards";
    artboardsSection.appendChild(artboardsSummary);
    
    let hasArtboardContent = false;

    // Iterate through artboards from parsed data
    parsedRiveData.artboards.forEach(artboard => {
        if (!artboard.name) return; // Skip if artboard has no name
        
        const isActiveArtboard = riveInstance.artboard && riveInstance.artboard.name === artboard.name;

        const artboardSection = document.createElement('details');
        artboardSection.className = 'control-section';
        artboardSection.open = isActiveArtboard; // Open active by default, others closed
        const artboardSummary = document.createElement('summary');
        artboardSummary.textContent = `Artboard: ${artboard.name}${isActiveArtboard ? ' (Active)' : ''}`;
        artboardSection.appendChild(artboardSummary);

        // If it has state machines, list them (mostly informational)
        if (artboard.stateMachines && artboard.stateMachines.length > 0) {
            const smContainer = document.createElement('div');
            smContainer.className = 'sm-controls-container';
            
            artboard.stateMachines.forEach(smData => {
                if (!smData.name) return;
                
                const isActive = isActiveArtboard && riveInstance.stateMachines && 
                                riveInstance.stateMachines.includes(smData.name);
                
                const smSection = document.createElement('details');
                smSection.className = 'control-subsection';
                smSection.open = isActive; // Only open active ones by default
                const smSummary = document.createElement('summary');
                smSummary.textContent = `SM: ${smData.name}${isActive ? ' (Active)' : ''}`;
                smSection.appendChild(smSummary);
                
                // Only show inputs if they exist and artboard isn't active
                // (active artboards already handled above)
                if (smData.inputs && smData.inputs.length > 0 && !isActive) {
                    // For non-active, just show parsed input information
                    smData.inputs.forEach(inputData => {
                        if (!inputData.name) return;
                        
                        // Create placeholder controls that don't actually control anything
                        // but show what inputs are available
                        let ctrl;
                        const notes = `${inputData.type} (Not Active)`;
                        
                        if (inputData.type === 'Boolean') {
                            ctrl = document.createElement('input');
                            ctrl.type = 'checkbox';
                            ctrl.disabled = true;
                        } else if (inputData.type === 'Number') {
                            ctrl = document.createElement('input');
                            ctrl.type = 'number';
                            ctrl.disabled = true;
                        } else if (inputData.type === 'Trigger') {
                            ctrl = document.createElement('button');
                            ctrl.textContent = 'Fire';
                            ctrl.disabled = true;
                        }
                        
                        if (ctrl) {
                            smSection.appendChild(makeRow(inputData.name, ctrl, notes));
                        }
                    });
                }
                
                if(smSection.querySelectorAll('.control-row').length > 0 || isActive) {
                    smContainer.appendChild(smSection);
                    hasArtboardContent = true;
                }
            });
            
            if (smContainer.hasChildNodes()) {
                artboardSection.appendChild(smContainer);
            }
        }
        
        // --- ViewModel Controls ---
        if (artboard.viewModels && artboard.viewModels.length > 0) {
            hasArtboardContent = true;
            const vmContainer = document.createElement('div');
            vmContainer.className = 'vm-controls-container';
            
            const vmTitle = document.createElement('h5');
            vmTitle.textContent = "View Models:";
            vmContainer.appendChild(vmTitle);
            
            artboard.viewModels.forEach(vmData => {
                // Create a collapsible section for each ViewModel
                const vmSection = document.createElement('details');
                vmSection.className = 'vm-subsection';
                vmSection.open = isActiveArtboard; // Only open for active artboard
                
                const vmSummary = document.createElement('summary');
                vmSummary.textContent = `VM: ${vmData.instanceName} (${vmData.sourceBlueprintName})`;
                vmSection.appendChild(vmSummary);
                
                // Check if this is the active ViewModel for this artboard
                const isActiveVM = isActiveArtboard && 
                    defaultElements.viewModelName === vmData.sourceBlueprintName;
                
                // Add interactive controls for inputs if this is the active ViewModel
                if (isActiveVM && riveInstance.viewModelInstance) {
                    const vmInstance = riveInstance.viewModelInstance;
                    let hasControls = false;
                    
                    // Process each input to create controls
                    if (vmData.inputs && vmData.inputs.length > 0) {
                        vmData.inputs.forEach(input => {
                            // Skip if no name or type
                            if (!input.name || !input.type) return;
                            
                            // Get the live property from the ViewModel instance
                            const vmProperty = getViewModelProperty(vmInstance, input.name, input.type);
                            
                            if (vmProperty) {
                                // Create control for this property
                                const control = createControlForInput(vmProperty, input.type);
                                
                                if (control) {
                                    vmSection.appendChild(makeRow(input.name, control, input.type));
                                    hasControls = true;
                                }
                            }
                        });
                    }
                    
                    // Process nested ViewModels
                    if (vmData.nestedViewModels && vmData.nestedViewModels.length > 0) {
                        vmData.nestedViewModels.forEach(nestedVM => {
                            const nestedSection = document.createElement('details');
                            nestedSection.className = 'nested-vm';
                            const nestedSummary = document.createElement('summary');
                            nestedSummary.textContent = `Nested: ${nestedVM.instanceName}`;
                            nestedSection.appendChild(nestedSummary);
                            
                            // Try to get the nested ViewModel instance
                            try {
                                const nestedInstance = vmInstance.viewModel(nestedVM.instanceName);
                                
                                if (nestedInstance && nestedVM.inputs && nestedVM.inputs.length > 0) {
                                    nestedVM.inputs.forEach(input => {
                                        // Skip if no name or type
                                        if (!input.name || !input.type) return;
                                        
                                        // Get the live property from the nested ViewModel instance
                                        const vmProperty = getViewModelProperty(nestedInstance, input.name, input.type);
                                        
                                        if (vmProperty) {
                                            // Create control for this property
                                            const control = createControlForInput(vmProperty, input.type);
                                            
                                            if (control) {
                                                nestedSection.appendChild(makeRow(input.name, control, input.type));
                                                hasControls = true;
                                            }
                                        }
                                    });
                                }
                            } catch (e) {
                                console.error(`[RiveControls] Error accessing nested ViewModel '${nestedVM.instanceName}':`, e);
                            }
                            
                            // Only add if it has controls
                            if (nestedSection.querySelectorAll('.control-row').length > 0) {
                                vmSection.appendChild(nestedSection);
                            }
                        });
                    }
                    
                    // If no controls were added, add a message
                    if (!hasControls) {
                        const noControlsMsg = document.createElement('p');
                        noControlsMsg.className = 'info-note';
                        noControlsMsg.textContent = "No editable properties found.";
                        vmSection.appendChild(noControlsMsg);
                    }
                } else {
                    // Show static property list for non-active ViewModels
                    if (vmData.inputs && vmData.inputs.length > 0) {
                        const inputsList = document.createElement('ul');
                        inputsList.className = 'vm-inputs-list';
                        
                        vmData.inputs.forEach(input => {
                            const li = document.createElement('li');
                            li.textContent = `${input.name} (${input.type}): ${input.value}`;
                            inputsList.appendChild(li);
                        });
                        
                        vmSection.appendChild(inputsList);
                    }
                    
                    // Add a note that this is not the active ViewModel
                    if (isActiveArtboard && !isActiveVM) {
                        const notActiveNote = document.createElement('p');
                        notActiveNote.className = 'info-note';
                        notActiveNote.textContent = "This is not the active ViewModel - controls are read-only.";
                        vmSection.appendChild(notActiveNote);
                    }
                }
                
                vmContainer.appendChild(vmSection);
            });
            
            artboardSection.appendChild(vmContainer);
        }

        if (artboard.animations && artboard.animations.length > 0) {
            hasArtboardContent = true;
            const animTitle = document.createElement('h5');
            animTitle.textContent = "Animations:";
            artboardSection.appendChild(animTitle);
            
            const animList = document.createElement('ul');
            artboard.animations.forEach(anim => {
                const li = document.createElement('li');
                li.textContent = `${anim.name} (${anim.fps}fps, ${anim.duration.toFixed(2)}s)`;
                animList.appendChild(li);
            });
            
            artboardSection.appendChild(animList);
        }

        // Only add artboard section if it has content
        if (hasArtboardContent || isActiveArtboard) {
            artboardsSection.appendChild(artboardSection);
        }
    });

    // Only add artboards section if it has content
    if (hasArtboardContent) {
        controlsContainer.appendChild(artboardsSection);
    }

    // Special section just for the active ViewModel (more prominent)
    if (riveInstance.viewModelInstance) {
        const activeVMSection = document.createElement('details');
        activeVMSection.className = 'control-section active-vm-section';
        activeVMSection.open = true;
        const activeVMSummary = document.createElement('summary');
        activeVMSummary.textContent = "Active View Model Controls";
        activeVMSection.appendChild(activeVMSummary);
        
        const vmInstance = riveInstance.viewModelInstance;
        console.log("[RiveControls] Found active viewModelInstance:", vmInstance);
        
        // Try to find this instance in our parsed data to get its structure
        const activeArtboard = riveInstance.artboard ? riveInstance.artboard.name : null;
        if (activeArtboard) {
            const artboardData = parsedRiveData.artboards.find(a => a.name === activeArtboard);
            
            if (artboardData && artboardData.viewModels && artboardData.viewModels.length > 0) {
                let hasAddedAnyVMControls = false;
                
                artboardData.viewModels.forEach(vmData => {
                    console.log(`[RiveControls] Processing ViewModel: ${vmData.instanceName} (${vmData.sourceBlueprintName})`);
                    
                    const isMainVM = vmData.instanceName === "Instance" || 
                        defaultElements.viewModelName === vmData.sourceBlueprintName;
                    
                    // Only process controls for the main VM in this section
                    if (isMainVM) {
                        let hasAddedControls = processViewModelControls(vmInstance, vmData, activeVMSection);
                        hasAddedAnyVMControls = hasAddedAnyVMControls || hasAddedControls;
                    }
                });
                
                if (!hasAddedAnyVMControls) {
                    const noControlsNote = document.createElement('p');
                    noControlsNote.className = 'info-note';
                    noControlsNote.textContent = "No interactive ViewModel properties found.";
                    activeVMSection.appendChild(noControlsNote);
                }
                
                controlsContainer.appendChild(activeVMSection);
            } else {
                console.log("[RiveControls] Active artboard data or viewModels not found in parsed data");
            }
        }
    }

    // Add a button to test interaction
    const testButton = document.createElement('button');
    testButton.textContent = "Test Rive Interaction";
    testButton.onclick = () => {
        if (riveInstance) {
            console.log("[RiveControls] Test: Rive instance available.", riveInstance);
            
            // Display active state machines if available
            if (riveInstance.stateMachines && Array.isArray(riveInstance.stateMachines)) {
                console.log("[RiveControls] Test: Active state machines:", riveInstance.stateMachines);
                
                // Try to get inputs for the first state machine
                if (riveInstance.stateMachines.length > 0) {
                    try {
                        const firstSmInputs = riveInstance.stateMachineInputs(riveInstance.stateMachines[0]);
                        console.log(`[RiveControls] Test: Inputs for first SM '${riveInstance.stateMachines[0]}':`, firstSmInputs);
                        
                        // Trigger a state change if a trigger input exists
                        const triggerInput = firstSmInputs.find(input => {
                            const riveRef = window.rive || {};
                            const SMInputType = riveRef.StateMachineInputType || {};
                            return input.type === SMInputType.Trigger || input.type === 'trigger';
                        });
                        
                        if (triggerInput) {
                            console.log(`[RiveControls] Test: Firing trigger '${triggerInput.name}'`);
                            triggerInput.fire();
                        }
                    } catch (err) {
                        console.error("[RiveControls] Test: Error accessing inputs for first SM:", err);
                    }
                }
            } else {
                console.log("[RiveControls] Test: No active state machines found. Checking for artboard...");
                if (riveInstance.artboard) {
                    console.log("[RiveControls] Test: Active artboard is:", riveInstance.artboard.name);
                }
            }
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

// Add this helper function after getViewModelProperty
function processViewModelControls(vmInstance, vmData, containerElement) {
    if (!vmInstance || !vmData || !containerElement) return false;
    
    console.log(`[RiveControls] Processing VM controls for: ${vmData.instanceName}`);
    
    // DEBUG: Log available properties to help diagnose nested viewModels
    try {
        if (vmInstance.properties && Array.isArray(vmInstance.properties)) {
            console.log(`[RiveControls] VM has ${vmInstance.properties.length} properties:`, 
                vmInstance.properties.map(p => `${p.name} (${p.type})`));
            
            // Specifically log viewModel properties
            const viewModelProps = vmInstance.properties.filter(p => p.type === 'viewModel');
            if (viewModelProps.length > 0) {
                console.log(`[RiveControls] VM has ${viewModelProps.length} nested viewModels:`, 
                    viewModelProps.map(p => p.name));
            }
        } else if (typeof vmInstance.propertyCount === 'function') {
            const count = vmInstance.propertyCount();
            console.log(`[RiveControls] VM has ${count} properties (via propertyCount function)`);
            
            // Try to list them
            const props = [];
            for (let i = 0; i < count; i++) {
                const prop = vmInstance.propertyByIndex(i);
                if (prop && prop.name) props.push(`${prop.name} (${prop.type})`);
            }
            console.log(`[RiveControls] VM properties:`, props);
            
            // Log viewModel properties
            const viewModelProps = props.filter(p => p.includes('(viewModel)'));
            if (viewModelProps.length > 0) {
                console.log(`[RiveControls] VM has nested viewModels:`, viewModelProps);
            }
        }
    } catch (e) {
        console.log(`[RiveControls] Error inspecting VM properties:`, e);
    }
    
    let hasAddedControls = false;
    
    // Process direct inputs
    if (vmData.inputs && vmData.inputs.length > 0) {
        vmData.inputs.forEach(input => {
            // Skip if no name or type
            if (!input.name || !input.type) return;
            
            console.log(`[RiveControls] - Processing VM input: ${input.name} (${input.type})`);
            
            // Get the live property from the ViewModel instance
            const vmProperty = getViewModelProperty(vmInstance, input.name, input.type);
            
            if (vmProperty) {
                console.log(`[RiveControls] -- Found live property for ${input.name}, value:`, vmProperty.value);
                
                // Create control for this property
                const control = createControlForInput(vmProperty, input.type);
                
                if (control) {
                    containerElement.appendChild(makeRow(input.name, control, input.type));
                    hasAddedControls = true;
                }
            } else {
                console.log(`[RiveControls] -- No live property found for ${input.name}`);
            }
        });
    }
    
    // Process nested ViewModels
    if (vmData.nestedViewModels && vmData.nestedViewModels.length > 0) {
        console.log(`[RiveControls] Processing ${vmData.nestedViewModels.length} nested ViewModels for ${vmData.instanceName}`);
        
        vmData.nestedViewModels.forEach(nestedVM => {
            console.log(`[RiveControls] Attempting to access nested VM: ${nestedVM.instanceName}`);
            
            try {
                // Try to access the nested VM instance
                const nestedInstance = vmInstance.viewModel(nestedVM.instanceName);
                
                if (nestedInstance) {
                    console.log(`[RiveControls] Found nested VM instance: ${nestedVM.instanceName}`, nestedInstance);
                    
                    const nestedSection = document.createElement('details');
                    nestedSection.className = 'nested-vm';
                    nestedSection.open = true;
                    
                    const nestedSummary = document.createElement('summary');
                    nestedSummary.textContent = `${nestedVM.instanceName}`;
                    nestedSection.appendChild(nestedSummary);
                    
                    // Log nested VM inputs for debugging
                    if (nestedVM.inputs && nestedVM.inputs.length > 0) {
                        console.log(`[RiveControls] Nested VM ${nestedVM.instanceName} has ${nestedVM.inputs.length} inputs:`, 
                            nestedVM.inputs.map(i => `${i.name} (${i.type})`));
                    }
                    
                    // Process each input in the nested ViewModel
                    let hasNestedControls = false;
                    
                    if (nestedVM.inputs && nestedVM.inputs.length > 0) {
                        nestedVM.inputs.forEach(input => {
                            if (!input.name || !input.type) return;
                            
                            console.log(`[RiveControls] Processing nested VM input: ${input.name} (${input.type})`);
                            
                            try {
                                // Direct property access based on type
                                let vmProperty = null;
                                
                                switch (input.type) {
                                    case 'string':
                                        vmProperty = nestedInstance.string(input.name);
                                        break;
                                    case 'boolean':
                                        vmProperty = nestedInstance.boolean(input.name);
                                        break;
                                    case 'number':
                                        vmProperty = nestedInstance.number(input.name);
                                        break;
                                    case 'color':
                                        vmProperty = nestedInstance.color(input.name);
                                        break;
                                    case 'enumType':
                                        vmProperty = nestedInstance.enum(input.name);
                                        break;
                                }
                                
                                if (vmProperty) {
                                    console.log(`[RiveControls] Created control for nested VM property: ${input.name}, value:`, vmProperty.value);
                                    
                                    // Create control for this property
                                    const control = createControlForInput(vmProperty, input.type);
                                    
                                    if (control) {
                                        nestedSection.appendChild(makeRow(input.name, control, input.type));
                                        hasNestedControls = true;
                                    }
                                }
                            } catch (e) {
                                console.error(`[RiveControls] Error accessing nested VM property '${input.name}':`, e);
                            }
                        });
                    }
                    
                    // Also check for further nested ViewModels (recursively)
                    if (nestedVM.nestedViewModels && nestedVM.nestedViewModels.length > 0) {
                        console.log(`[RiveControls] Nested VM ${nestedVM.instanceName} has further nested VMs`, 
                            nestedVM.nestedViewModels.map(vm => vm.instanceName));
                        
                        // Process these recursively
                        const deepNestedControls = processViewModelControls(nestedInstance, nestedVM, nestedSection);
                        hasNestedControls = hasNestedControls || deepNestedControls;
                    }
                    
                    // Only add if it has controls
                    if (hasNestedControls) {
                        containerElement.appendChild(nestedSection);
                        hasAddedControls = true;
                    } else {
                        console.log(`[RiveControls] Nested VM ${nestedVM.instanceName} had no usable controls`);
                    }
                } else {
                    console.warn(`[RiveControls] Nested ViewModel instance '${nestedVM.instanceName}' not found`);
                }
            } catch (e) {
                console.error(`[RiveControls] Error accessing nested VM '${nestedVM.instanceName}':`, e);
            }
        });
    }
    
    return hasAddedControls;
} 