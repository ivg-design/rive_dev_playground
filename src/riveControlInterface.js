/**
 * @file riveControlInterface.js
 * Handles the creation and management of dynamic UI controls for interacting
 * with live Rive animations (State Machine inputs, ViewModel properties).
 */

import { processDataForControls } from './dataToControlConnector.js';
import { createLogger } from './utils/debugger/debugLogger.js';

// Create a logger for this module
const logger = createLogger('controlInterface');

// To store a reference to the live Rive instance and parsed data if needed globally within this module
let riveInstance = null;
let parsedRiveData = null;
let dynamicControlsInitialized = false;
let structuredControlData = null; // Will store the processed data from dataToControlConnector
let uiUpdateInterval = null; // <<< ADDED: For polling interval ID

// Store the Rive engine reference globally if needed, or pass it around
// For simplicity, assuming window.rive is available as in other files.
const RiveEngine = window.rive;

/* ---------- helpers (adapted from exampleIndex.mjs) ------------------ */
const argbToHex = (a) => {
    if (typeof a !== 'number') return '#000000'; // Default or error color
    return '#' + (a & 0xffffff).toString(16).padStart(6, '0').toUpperCase();
};
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

// If fmt is not available, we can use a simpler log or JSON.stringify
function simpleFmt(val) {
    if (val === undefined || val === null) return '';
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.join(', ');
    // Basic object check, could be more robust like the original fmt
    if (typeof val === 'object' && val.name) return val.name;
    if (typeof val === 'object' && Array.isArray(val.data)) return val.data.join(', ');
    try {
        return JSON.stringify(val);
    } catch {
        return String(val);
    }
}

function handleConstructorStateChange(sm, st) {
    console.log("%%%%%%%% CONSTRUCTOR onStateChange Fired %%%%%%%%");
    console.log("SM:", simpleFmt(sm));
    console.log("ST:", simpleFmt(st));
    // Call updateControlsFromRive() to sync UI based on state machine changes.
    console.log("%%%%%%%% CONSTRUCTOR onStateChange: Calling updateControlsFromRive() %%%%%%%%");
    updateControlsFromRive();
}

/**
 * Creates a control element for a specific property with direct reference to the live input
 * @param {Object} property The property object with name, type, and liveProperty reference
 * @return {HTMLElement} The control element
 */
function createControlForProperty(property) {
    if (!property) {
        logger.warn('Cannot create control: Invalid property');
        return null;
    }
    
    // Check if this is a placeholder property (no live reference)
    const isPlaceholder = property.isPlaceholder || !property.liveProperty;
    const { name, type } = property;
    const liveProperty = property.liveProperty;
    
    logger.debug(`Creating control for ${type} property: ${name}, isPlaceholder: ${isPlaceholder}`);
    
    let ctrl = null;
    
    try {
        switch (type) {
            case 'string':
                ctrl = document.createElement('textarea');
                if (isPlaceholder) {
                    ctrl.value = (property.value || '').replace(/\\n/g, '\n');
                    ctrl.disabled = true;
                } else {
                    const initialRiveValue = (liveProperty.value || '').replace(/\\n/g, '\n');
                    ctrl.value = initialRiveValue;
                    
                    ctrl.addEventListener('input', () => { 
                        const newValue = ctrl.value.replace(/\n/g, '\\\\n');
                        console.log(`[App] Event: Attempting to set ${name} to:`, newValue);
                        liveProperty.value = newValue;
                    });
                }
                break;
            
            case 'boolean':
                ctrl = document.createElement('input');
                ctrl.type = 'checkbox';
                if (isPlaceholder) {
                    ctrl.checked = !!property.value;
                    ctrl.disabled = true;
                } else {
                    ctrl.checked = !!liveProperty.value;
                    ctrl.addEventListener('change', () => {
                        const newValue = ctrl.checked;
                        console.log(`[App] Event: Attempting to set ${name} to:`, newValue);
                        liveProperty.value = newValue;
                    });
                }
                break;
            
            case 'number':
                ctrl = document.createElement('input');
                ctrl.type = 'number';
                if (isPlaceholder) {
                    ctrl.value = property.value || 0;
                    ctrl.disabled = true;
                } else {
                    ctrl.value = liveProperty.value || 0;
                    ctrl.addEventListener('input', () => {
                        const newValue = parseFloat(ctrl.value) || 0;
                        console.log(`[App] Event: Attempting to set ${name} to:`, newValue);
                        liveProperty.value = newValue;
                    });
                }
                break;
            
            case 'color':
                ctrl = document.createElement('input');
                ctrl.type = 'color';
                if (isPlaceholder) {
                    // For placeholders, use the value directly if it's a string, otherwise use default
                    ctrl.value = typeof property.value === 'string' ? property.value : '#000000';
                    ctrl.disabled = true;
                } else {
                    ctrl.value = argbToHex(liveProperty.value);
                    ctrl.addEventListener('input', () => {
                        const newValue = hexToArgb(ctrl.value);
                        console.log(`[App] Event: Attempting to set ${name} (${ctrl.value}) to:`, newValue);
                        liveProperty.value = newValue;
                    });
                }
                break;
            
            case 'enumType':
                ctrl = document.createElement('select');
                
                if (isPlaceholder) {
                    const option = new Option(property.value || 'Unknown', property.value || '');
                    ctrl.appendChild(option);
                    ctrl.disabled = true;
                } else {
                    // Get enum values if available
                    if (riveInstance && typeof riveInstance.enums === 'function') {
                        const allEnums = riveInstance.enums();
                        const enumValues = allEnums.find(d => d.name === name)?.values || [];
                        
                        enumValues.forEach(v => {
                            const option = new Option(v, v);
                            ctrl.appendChild(option);
                        });
                        
                        if (liveProperty.value) {
                            ctrl.value = liveProperty.value;
                        }
                    }
                    
                    ctrl.addEventListener('change', () => {
                        const newValue = ctrl.value;
                        console.log(`[App] Event: Attempting to set ${name} to:`, newValue);
                        liveProperty.value = newValue;
                    });
                }
                break;
            
            case 'trigger':
                ctrl = document.createElement('button');
                ctrl.textContent = 'Fire Trigger';
                
                if (isPlaceholder) {
                    ctrl.disabled = true;
                } else {
                    ctrl.addEventListener('click', () => {
                        console.log(`[App] Event: Attempting to fire trigger ${name}`);
                        if (typeof liveProperty.fire === 'function') {
                            liveProperty.fire();
                        } else {
                            const oldValue = liveProperty.value;
                            liveProperty.value = true;
                            setTimeout(() => {
                                liveProperty.value = oldValue;
                            }, 100);
                        }
                    });
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
 * Initializes and builds the dynamic control UI based on the parsed data.
 * This function will now create its own Rive instance.
 * 
 * @param {object} parsedDataFromHandler - The structured data object from parser.js.
 */
export function initDynamicControls(parsedDataFromHandler) {
    logger.info('Initializing dynamic controls with parsed data:', parsedDataFromHandler);

    // Clear previous instance and polling interval
    if (riveInstance && typeof riveInstance.cleanup === 'function') {
        riveInstance.cleanup();
    }
    if (uiUpdateInterval) {
        clearInterval(uiUpdateInterval);
        uiUpdateInterval = null;
    }
    riveInstance = null;
    parsedRiveData = parsedDataFromHandler;
    dynamicControlsInitialized = false;
    structuredControlData = null;

    const controlsContainer = document.getElementById('dynamicControlsContainer');
    if (!controlsContainer) {
        logger.error('Dynamic controls container #dynamicControlsContainer not found. Cannot initialize.');
        return;
    }
    controlsContainer.innerHTML = '<p>Loading Rive animation and controls...</p>'; // Initial message

    if (!parsedDataFromHandler || !parsedDataFromHandler.defaultElements) {
        logger.error('No parsed data or defaultElements found. Cannot create Rive instance.');
        controlsContainer.innerHTML = '<p>Error: Missing critical parsed data to load Rive animation.</p>';
        return;
    }

    if (!RiveEngine) {
        logger.error('Rive engine (window.rive) not available. Cannot create Rive instance.');
        controlsContainer.innerHTML = '<p>Error: Rive engine not available.</p>';
        return;
    }

    const canvas = document.getElementById('rive-canvas');
    if (!canvas) {
        logger.error("Canvas element 'rive-canvas' not found. Cannot create Rive instance.");
        controlsContainer.innerHTML = '<p>Error: Canvas element not found.</p>';
        return;
    }

    const { src, artboardName, stateMachineNames } = parsedDataFromHandler.defaultElements;
    if (!src || !artboardName) { 
        logger.error('Missing src or artboardName in parsed data. Cannot create Rive instance.');
        if(controlsContainer) controlsContainer.innerHTML = '<p>Error: Missing Rive source or artboard name.</p>';
        return; 
    }

    // Define options first, WITHOUT onLoad or onError that would need the instance methods directly
    const riveOptions = {
        src: src,
        canvas: canvas,
        artboard: artboardName,
        stateMachines: stateMachineNames, 
        autoplay: false,
        autoBind: true,
        onStateChange: handleConstructorStateChange,
        // No onLoad/onError here, they will be attached using instance.on()
    };

    logger.info('Creating new Rive instance with options:', { 
        src: riveOptions.src, 
        artboard: riveOptions.artboard, 
        stateMachines: riveOptions.stateMachines,
        autoplay: riveOptions.autoplay,
        autoBind: riveOptions.autoBind
    });

    try {
        // Create the new instance and assign to module-scoped variable immediately
        riveInstance = new RiveEngine.Rive(riveOptions);
    } catch (e) {
        logger.error('Error during Rive instance construction:', e);
        if(controlsContainer) controlsContainer.innerHTML = `<p>Error constructing Rive: ${e.toString()}</p>`;
        riveInstance = null; // Ensure it's null on error
        return;
    }
    
    if (!riveInstance || typeof riveInstance.on !== 'function') {
        logger.error('Newly created Rive instance is invalid or does not have .on method');
        if(controlsContainer) controlsContainer.innerHTML = '<p>Error initializing Rive instance.</p>';
        return;
    }

    logger.info('[controlInterface] [INFO] New Rive instance successfully constructed. Setting up listeners...');

    // Now, set up Load and LoadError listeners on this specific instance
    const EventType = RiveEngine.EventType; // Get EventType from the RiveEngine

    riveInstance.on(EventType.Load, () => {
        logger.info('[controlInterface] [INFO] Rive instance EventType.Load fired.');
        dynamicControlsInitialized = true;

        try {
            riveInstance.resizeDrawingSurfaceToCanvas();
        } catch (e_resize) {
            console.error('[controlInterface] onLoad (via instance.on): ERROR during resizeDrawingSurfaceToCanvas:', e_resize);
            if(controlsContainer) controlsContainer.innerHTML = '<p>Error during Rive resize.</p>';
            return; 
        }
        
        structuredControlData = processDataForControls(parsedRiveData, riveInstance);

        if (!structuredControlData) {
            logger.error('Failed to process data for controls with new Rive instance.');
            if(controlsContainer) controlsContainer.innerHTML = '<p>Error: Could not process data for controls.</p>';
            return;
        }
        
        // PROGRAMMATICALLY SET "Diagram Enter" TO FALSE ON LOAD
        if (structuredControlData && structuredControlData.stateMachineControls) {
            const smName = (parsedRiveData && parsedRiveData.defaultElements && parsedRiveData.defaultElements.stateMachineNames && parsedRiveData.defaultElements.stateMachineNames.length > 0) 
                            ? parsedRiveData.defaultElements.stateMachineNames[0] 
                            : "State Machine 1"; // Fallback if name isn't in parsedData
            const smControl = structuredControlData.stateMachineControls.find(sm => sm.name === smName);
            if (smControl && smControl.inputs) {
                const diagramEnterInput = smControl.inputs.find(input => input.name === "Diagram Enter");
                if (diagramEnterInput && diagramEnterInput.liveInput && diagramEnterInput.liveInput.value !== false) {
                    logger.info(`[controlInterface] Programmatically setting '${smName} -> Diagram Enter' to false on initial load.`);
                    diagramEnterInput.liveInput.value = false;
                    // The first run of polling should pick this up for the UI if not immediate.
                }
            }
        }
        // END PROGRAMMATIC SET

        setupEventListeners(); 
        
        buildControlsUI();

        // Manually play the primary state machine
        const smName = (parsedRiveData && parsedRiveData.defaultElements && parsedRiveData.defaultElements.stateMachineNames && parsedRiveData.defaultElements.stateMachineNames.length > 0) 
                        ? parsedRiveData.defaultElements.stateMachineNames[0] 
                        : "State Machine 1"; // Fallback
        if (riveInstance && typeof riveInstance.play === 'function') {
            riveInstance.play(smName);
        }
    });

    riveInstance.on(EventType.LoadError, (err) => {
        logger.error('Rive EventType.LoadError fired:', err);
        if(controlsContainer) controlsContainer.innerHTML = `<p>Error loading Rive animation (LoadError event): ${err.toString()}</p>`;
        riveInstance = null; // Clear the instance
        dynamicControlsInitialized = false;
    });
}

/**
 * Sets up event listeners for the Rive instance
 */
function setupEventListeners() {
    if (!riveInstance || typeof riveInstance.on !== 'function') {
        logger.warn('[controlInterface] Attempted to setup listeners, but Rive instance is invalid or has no .on method');
        return;
    }
    
    const EventType = RiveEngine.EventType; // Ensure RiveEngine is window.rive or equivalent
    if (!EventType) {
        logger.error('[controlInterface] RiveEngine.EventType is not available. Cannot setup Rive listeners.');
        return;
    }

    // Remove previous listeners before adding new ones, to prevent duplicates if this function is called multiple times on the same instance
    // (Though with current flow, it should only be called once per new instance)
    try {
        if (typeof riveInstance.removeAllEventListeners === 'function') {
            // logger.debug('[controlInterface] Removing all existing Rive event listeners before re-adding.');
            // riveInstance.removeAllEventListeners(); // Be cautious if other parts might add listeners we don't know about
        } 
    } catch (e) {
        logger.warn('[controlInterface] Error trying to remove previous listeners:', e);
    }

    logger.info('[controlInterface] Setting up Rive instance event listeners (StateChanged, ValueChanged, RiveEvent).');

    if (EventType.StateChanged) {
        riveInstance.on(EventType.StateChanged, (event) => {
            console.log("!!!!!!!!!!!! RIVE JS EVENT: StateChanged Fired !!!!!!!!!!", event);
            logger.debug('[controlInterface] Rive StateChanged event:', event);
            updateControlsFromRive(); 
        });
    }
    if (EventType.ValueChanged) { 
        riveInstance.on(EventType.ValueChanged, (event) => {
            console.log("!!!!!!!!!!!! RIVE JS EVENT: ValueChanged Fired !!!!!!!!!!", event);
            logger.debug('[controlInterface] Rive ValueChanged event:', event);
            updateControlsFromRive();
        });
    }
    if (EventType.RiveEvent) { 
        riveInstance.on(EventType.RiveEvent, (event) => {
            console.log("!!!!!!!!!!!! RIVE JS EVENT: RiveEvent (Custom) Fired !!!!!!!!!!", event);
            logger.debug('[controlInterface] Rive RiveEvent (custom):', event);
            // We might want to call updateControlsFromRive() here too if custom events can alter VM/SM Input states
            // updateControlsFromRive(); 
        });
    }
    // Any other specific events from Rive docs can be added here if needed.
}

/**
 * Builds the dynamic control UI using the processed data
 */
function buildControlsUI() {
    const controlsContainer = document.getElementById('dynamicControlsContainer');
    if (!controlsContainer) {
        logger.error('Dynamic controls container #dynamicControlsContainer not found.');
        return;
    }

    controlsContainer.innerHTML = ''; // Clear previous controls

    if (!structuredControlData) {
        controlsContainer.innerHTML = '<p>No control data available. Cannot build controls.</p>';
        return;
    }

    const mainTitle = document.createElement('h3');
    mainTitle.textContent = 'Live Rive Controls';
    controlsContainer.appendChild(mainTitle);

    // Add header with active information
    const infoDiv = document.createElement('div');
    infoDiv.className = 'default-info';
    
    if (structuredControlData.activeArtboardName) {
        infoDiv.innerHTML += `<p><strong>Active Artboard:</strong> ${structuredControlData.activeArtboardName}</p>`;
    }
    
    if (structuredControlData.activeStateMachineNames && structuredControlData.activeStateMachineNames.length > 0) {
        infoDiv.innerHTML += `<p><strong>Active State Machines:</strong> ${structuredControlData.activeStateMachineNames.join(', ')}</p>`;
    }
    
    if (structuredControlData.activeViewModelName) {
        infoDiv.innerHTML += `<p><strong>Active ViewModel:</strong> ${structuredControlData.activeViewModelName}</p>`;
    }
    
    controlsContainer.appendChild(infoDiv);

    // Build State Machine Controls
    if (structuredControlData.stateMachineControls && structuredControlData.stateMachineControls.length > 0) {
        buildStateMachineControls(controlsContainer, structuredControlData.stateMachineControls);
    }

    // Build ViewModel Controls - now directly adding to the container without an extra parent level
    if (structuredControlData.viewModelControls && structuredControlData.viewModelControls.length > 0) {
        buildViewModelControls(controlsContainer, structuredControlData.viewModelControls);
    }
}

/**
 * Builds controls for State Machines
 * @param {HTMLElement} container The container element
 * @param {Array} stateMachines The state machine controls data
 */
function buildStateMachineControls(container, stateMachines) {
    const smSection = document.createElement('details');
    smSection.className = 'control-section';
    smSection.open = true;
    
    const smSummary = document.createElement('summary');
    smSummary.textContent = 'State Machine Controls';
    smSection.appendChild(smSummary);
    
    stateMachines.forEach(sm => {
        const smDetails = document.createElement('details');
        smDetails.className = 'control-subsection';
        smDetails.open = false;
        
        const smName = document.createElement('summary');
        smName.textContent = `SM: ${sm.name}`;
        smDetails.appendChild(smName);
        
        // Add controls for each input
        if (sm.inputs && sm.inputs.length > 0) {
            sm.inputs.forEach(input => {
                const { name, type, liveInput } = input;
                
                let ctrl = null;
                let notes = type;
                
                // Reference the enum from window.rive if available
                const riveRef = window.rive || {};
                const SMInputType = riveRef.StateMachineInputType || {};
                
                if (type === SMInputType.Boolean || type === 'boolean') {
                    ctrl = document.createElement('input');
                    ctrl.type = 'checkbox';
                    ctrl.checked = !!liveInput.value;
                    ctrl.addEventListener('change', () => 
                        liveInput.value = ctrl.checked
                    );
                } else if (type === SMInputType.Number || type === 'number') {
                    ctrl = document.createElement('input');
                    ctrl.type = 'number';
                    ctrl.value = liveInput.value || 0;
                    ctrl.addEventListener('input', () => 
                        liveInput.value = parseFloat(ctrl.value) || 0
                    );
                } else if (type === SMInputType.Trigger || type === 'trigger') {
                    ctrl = document.createElement('button');
                    ctrl.textContent = 'Fire';
                    ctrl.addEventListener('click', () => 
                        liveInput.fire()
                    );
                }
                
                if (ctrl) {
                    smDetails.appendChild(makeRow(name, ctrl, notes));
                }
            });
        } else {
            const noInputs = document.createElement('p');
            noInputs.className = 'info-note';
            noInputs.textContent = 'No inputs available for this state machine';
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
function buildViewModelControls(container, viewModels) {
    if (!viewModels || viewModels.length === 0) {
        logger.info('No ViewModel controls to build');
        return;
    }

    logger.info(`Building controls for ${viewModels.length} ViewModels`);
    
    // Process each ViewModel directly without the redundant parent level
    viewModels.forEach(vm => {
        logger.debug(`Building controls for VM: ${vm.instanceName}`);
        const vmDetails = document.createElement('details');
        vmDetails.className = 'control-section'; // Use the same class as top-level sections
        vmDetails.open = true;
        
        const vmSummary = document.createElement('summary');
        vmSummary.textContent = `VM: ${vm.instanceName} ${vm.blueprintName ? `(${vm.blueprintName})` : ''}`;
        vmDetails.appendChild(vmSummary);
        
        // Add direct property controls
        if (vm.properties && vm.properties.length > 0) {
            logger.debug(`Adding ${vm.properties.length} properties for ${vm.instanceName}`);
            vm.properties.forEach(prop => {
                const ctrl = createControlForProperty(prop);
                if (ctrl) {
                    vmDetails.appendChild(makeRow(prop.name, ctrl, prop.type));
                }
            });
        } else {
            logger.debug(`No properties found for ${vm.instanceName}`);
            const noProps = document.createElement('p');
            noProps.className = 'info-note';
            noProps.textContent = 'No direct properties in this ViewModel';
            vmDetails.appendChild(noProps);
        }
        
        // Add nested ViewModels (recursively)
        if (vm.nestedViewModels && vm.nestedViewModels.length > 0) {
            logger.debug(`Adding ${vm.nestedViewModels.length} nested VMs for ${vm.instanceName}`);
            buildNestedViewModelControls(vmDetails, vm.nestedViewModels);
        }
        
        container.appendChild(vmDetails);
    });
}

/**
 * Recursively builds controls for nested ViewModels
 * @param {HTMLElement} container The parent container element
 * @param {Array} nestedViewModels The nested ViewModel controls data
 * @param {number} depth Current nesting depth (for styling)
 */
function buildNestedViewModelControls(container, nestedViewModels, depth = 1) {
    nestedViewModels.forEach(vm => {
        const nestedDetails = document.createElement('details');
        nestedDetails.className = `control-subsection nested-level-${depth}`; // Consistent styling
        nestedDetails.open = false; // Collapsed by default
        
        const nestedSummary = document.createElement('summary');
        nestedSummary.textContent = `Nested: ${vm.instanceName}`; // Remove the redundant triangle
        nestedDetails.appendChild(nestedSummary);
        
        // Add direct property controls
        if (vm.properties && vm.properties.length > 0) {
            vm.properties.forEach(prop => {
                const ctrl = createControlForProperty(prop);
                if (ctrl) {
                    nestedDetails.appendChild(makeRow(prop.name, ctrl, prop.type));
                }
            });
        } else {
            const noProps = document.createElement('p');
            noProps.className = 'info-note';
            noProps.textContent = 'No properties in this nested ViewModel';
            nestedDetails.appendChild(noProps);
        }
        
        // Recursively process deeper nested ViewModels
        if (vm.nestedViewModels && vm.nestedViewModels.length > 0) {
            buildNestedViewModelControls(nestedDetails, vm.nestedViewModels, depth + 1);
        }
        
        container.appendChild(nestedDetails);
    });
}

/**
 * Updates UI controls to reflect current Rive property values
 * This ensures bidirectional feedback when properties change internally
 */
function updateControlsFromRive() {
    console.log('>>> UI UPDATE: updateControlsFromRive() Called'); // Log 2
    logger.debug('Updating controls from Rive...');
    
    // Update boolean controls
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        const row = checkbox.closest('.control-row');
        if (row) {
            const label = row.querySelector('label');
            if (label) {
                const propName = label.textContent.split('(')[0].trim();
                // Try to find the property in our structured data and update the UI
                updateControlValueFromRive(propName, checkbox);
            }
        }
    });
    
    // Update number controls
    document.querySelectorAll('input[type="number"]').forEach(input => {
        const row = input.closest('.control-row');
        if (row) {
            const label = row.querySelector('label');
            if (label) {
                const propName = label.textContent.split('(')[0].trim();
                updateControlValueFromRive(propName, input);
            }
        }
    });
    
    // Update select (enum) controls
    document.querySelectorAll('select').forEach(select => {
        const row = select.closest('.control-row');
        if (row) {
            const label = row.querySelector('label');
            if (label) {
                const propName = label.textContent.split('(')[0].trim();
                updateControlValueFromRive(propName, select);
            }
        }
    });
    
    // Update color inputs
    document.querySelectorAll('input[type="color"]').forEach(colorInput => {
        const row = colorInput.closest('.control-row');
        if (row) {
            const label = row.querySelector('label');
            if (label) {
                const propName = label.textContent.split('(')[0].trim();
                updateControlValueFromRive(propName, colorInput);
            }
        }
    });
    
    // Update textareas for string inputs
    document.querySelectorAll('textarea').forEach(textarea => {
        const row = textarea.closest('.control-row');
        if (row) {
            const label = row.querySelector('label');
            if (label) {
                const propName = label.textContent.split('(')[0].trim();
                updateControlValueFromRive(propName, textarea);
            }
        }
    });
}

/**
 * Updates a specific control's value from the current Rive property value
 */
function updateControlValueFromRive(propName, controlElement) {
    if (!structuredControlData || !structuredControlData.viewModelControls) return;
    if (document.activeElement === controlElement && controlElement.type !== 'checkbox' && controlElement.type !== 'select-one') {
        return;
    }

    // --- Re-define findProperty helper --- 
    const findProperty = (vmArray, targetPropName) => {
        for (const vm of vmArray) {
            const prop = vm.properties?.find(p => p.name === targetPropName);
            if (prop && prop.liveProperty) {
                return prop.liveProperty;
            }
            if (vm.nestedViewModels?.length > 0) {
                const nestedProp = findProperty(vm.nestedViewModels, targetPropName);
                if (nestedProp) return nestedProp;
            }
        }
        return null;
    };
    // --- End findProperty helper ---

    const liveProperty = findProperty(structuredControlData.viewModelControls, propName);

    if (liveProperty) {
        if (controlElement.type === 'checkbox') {
            const riveValueBool = !!liveProperty.value;
            if (controlElement.checked !== riveValueBool) {
                controlElement.checked = riveValueBool;
            }
        } else if (controlElement.type === 'number') {
            const controlValueNum = parseFloat(controlElement.value);
            const riveValueNum = liveProperty.value === null || liveProperty.value === undefined ? NaN : parseFloat(liveProperty.value);
            if (isNaN(controlValueNum) && isNaN(riveValueNum)) {
                // Both NaN, do nothing
            } else if (controlValueNum !== riveValueNum) {
                controlElement.value = riveValueNum !== undefined && !isNaN(riveValueNum) ? riveValueNum : '';
            }
        } else if (controlElement.type === 'color') {
            const riveHexValue = argbToHex(liveProperty.value);
            if (controlElement.value.toUpperCase() !== riveHexValue) {
                controlElement.value = riveHexValue;
            }
        } else if (controlElement.type === 'select-one') {
            const riveValueString = liveProperty.value === null || liveProperty.value === undefined ? '' : String(liveProperty.value);
            if (controlElement.value !== riveValueString) {
                controlElement.value = riveValueString;
            }
        } else if (controlElement.tagName.toLowerCase() === 'textarea') {
            const riveTextValue = (liveProperty.value === null || liveProperty.value === undefined ? '' : String(liveProperty.value)).replace(/\\n/g, '\n');
            if (controlElement.value !== riveTextValue) {
                controlElement.value = riveTextValue;
            }
        }
    }
}

/**
 * Function to update controls if Rive data changes without a full re-parse (e.g., internal state change).
 * For now, it might just re-initialize if called.
 */
export function updateDynamicControls() {
    if (dynamicControlsInitialized && riveInstance && parsedRiveData) {
        logger.info('updateDynamicControls called. Re-initializing.');
        initDynamicControls(parsedRiveData);
    } else {
        logger.warn('updateDynamicControls called but not initialized or Rive data missing.');
    }
}
