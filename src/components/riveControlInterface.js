/**
 * @file riveControlInterface.js
 * Handles the creation and management of dynamic UI controls for interacting
 * with live Rive animations (State Machine inputs, ViewModel properties).
 */

import { processDataForControls } from './dataToControlConnector.js';
import { createLogger } from '../utils/debugger/debugLogger.js';

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

const makeRow = (label, el, notes = '', dataPath = null) => {
    const row = document.createElement('div');
    row.className = 'control-row';
    if (dataPath) {
        row.setAttribute('data-property-path', dataPath);
    }
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
    logger.debug("CONSTRUCTOR onStateChange Fired");
    logger.debug("SM:", simpleFmt(sm));
    logger.debug("ST:", simpleFmt(st));
    // Call updateControlsFromRive() to sync UI based on state machine changes.
    logger.debug("CONSTRUCTOR onStateChange: Calling updateControlsFromRive()");
    updateControlsFromRive();
}

/**
 * Smart enum matching based on word similarity
 * @param {string} propertyName - The property name to match (e.g., "CTRL>Eye picker")
 * @param {Array} allEnums - Array of enum definitions
 * @returns {Array} Array of matching enum definitions
 */
function findSmartEnumMatches(propertyName, allEnums) {
    if (!propertyName || !allEnums || allEnums.length === 0) {
        return [];
    }
    
    // Extract meaningful words from the property name
    // Remove common prefixes/suffixes and split on common delimiters
    const cleanPropertyName = propertyName
        .replace(/^(CTRL>|SYS>|EMOTE>|STAT>)/i, '') // Remove common prefixes
        .replace(/(picker|selector|control|ctrl)$/i, '') // Remove common suffixes
        .trim();
    
    // Split into words and filter out short/common words
    const propertyWords = cleanPropertyName
        .split(/[\s>_-]+/)
        .map(word => word.toLowerCase())
        .filter(word => word.length > 2 && !['the', 'and', 'for', 'with'].includes(word));
    
    logger.debug(`[Smart Enum Match] Property '${propertyName}' -> cleaned words: [${propertyWords.join(', ')}]`);
    
    const matches = [];
    
    for (const enumDef of allEnums) {
        const enumName = enumDef.name || '';
        const enumWords = enumName
            .split(/[\s>_-]+/)
            .map(word => word.toLowerCase())
            .filter(word => word.length > 2);
        
        logger.debug(`[Smart Enum Match] Comparing '${propertyName}' words [${propertyWords.join(', ')}] with '${enumName}' words [${enumWords.join(', ')}]`);
        
        // Check for word overlap with strict matching rules
        const commonWords = [];
        const matchDetails = [];
        
        for (const propWord of propertyWords) {
            for (const enumWord of enumWords) {
                let matched = false;
                let matchType = '';
                
                // Exact match is always good
                if (enumWord === propWord) {
                    matched = true;
                    matchType = 'exact';
                } else if (enumWord.length >= 4 && propWord.length >= 4) {
                    // For substring matching, both words must be reasonably long
                    // and the match must be significant (not just a small part)
                    const minLength = Math.min(enumWord.length, propWord.length);
                    const matchThreshold = Math.ceil(minLength * 0.7);
                    
                    if (enumWord.includes(propWord) && propWord.length >= matchThreshold) {
                        matched = true;
                        matchType = `substring (${propWord} in ${enumWord}, ${propWord.length}/${minLength} chars)`;
                    } else if (propWord.includes(enumWord) && enumWord.length >= matchThreshold) {
                        matched = true;
                        matchType = `substring (${enumWord} in ${propWord}, ${enumWord.length}/${minLength} chars)`;
                    }
                }
                
                if (matched && !commonWords.includes(propWord)) {
                    commonWords.push(propWord);
                    matchDetails.push(`${propWord}↔${enumWord} (${matchType})`);
                }
            }
        }
        
        if (commonWords.length > 0) {
            logger.debug(`[Smart Enum Match] ✅ Match found between '${propertyName}' and '${enumName}': ${matchDetails.join(', ')}`);
            matches.push(enumDef);
        } else {
            logger.debug(`[Smart Enum Match] ❌ No match between '${propertyName}' and '${enumName}'`);
        }
    }
    
    return matches;
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
                        logger.debug(`[App] Event: Attempting to set ${name} to:`, newValue);
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
                        logger.debug(`[App] Event: Attempting to set ${name} to:`, newValue);
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
                        logger.debug(`[App] Event: Attempting to set ${name} to:`, newValue);
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
                        logger.debug(`[App] Event: Attempting to set ${name} (${ctrl.value}) to:`, newValue);
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
                    if (riveInstance && typeof riveInstance.enums === 'function') {
                        const allEnums = riveInstance.enums();
                        
                        logger.debug(`[Enum Debug] Property Name: '${property.name}', enumTypeName: '${property.enumTypeName}'`);
                        logger.debug(`[Enum Debug] Available global enum names:`, allEnums.map(e => e.name));
                        
                        // NEW APPROACH: Get the actual enum type from the live property
                        let enumDef = null;
                        let actualEnumTypeName = null;
                        
                        // Try to get the enum type name from the live property itself
                        if (liveProperty && typeof liveProperty.enumType === 'string') {
                            actualEnumTypeName = liveProperty.enumType;
                            logger.debug(`[Enum Debug] Found enumType on live property: '${actualEnumTypeName}'`);
                            enumDef = allEnums.find(d => d.name === actualEnumTypeName);
                        }
                        
                        // If that didn't work, try the enumTypeName from parser
                        if (!enumDef && property.enumTypeName) {
                            logger.debug(`[Enum Debug] Trying enumTypeName from parser: '${property.enumTypeName}'`);
                            enumDef = allEnums.find(d => d.name === property.enumTypeName);
                        }
                        
                        // If still not found, try property name
                        if (!enumDef) {
                            logger.debug(`[Enum Debug] Trying property name: '${property.name}'`);
                            enumDef = allEnums.find(d => d.name === property.name);
                        }
                        
                        // If still not found, try case-insensitive search on all attempts
                        if (!enumDef) {
                            logger.debug(`[Enum Debug] Trying case-insensitive searches`);
                            const searchTerms = [actualEnumTypeName, property.enumTypeName, property.name].filter(Boolean);
                            for (const term of searchTerms) {
                                enumDef = allEnums.find(d => d.name.toLowerCase() === term.toLowerCase());
                                if (enumDef) {
                                    logger.debug(`[Enum Debug] Found via case-insensitive match: '${term}' -> '${enumDef.name}'`);
                                    break;
                                }
                            }
                        }
                        
                        // If still not found, try smart word-based matching
                        if (!enumDef) {
                            logger.debug(`[Enum Debug] Trying smart word-based matching`);
                            const searchTerms = [actualEnumTypeName, property.enumTypeName, property.name].filter(Boolean);
                            
                            for (const term of searchTerms) {
                                const matches = findSmartEnumMatches(term, allEnums);
                                if (matches.length === 1) {
                                    enumDef = matches[0];
                                    logger.debug(`[Enum Debug] Found via smart word match: '${term}' -> '${enumDef.name}'`);
                                    break;
                                } else if (matches.length > 1) {
                                    logger.warn(`[Enum Debug] Smart word matching found multiple matches for '${term}': ${matches.map(m => m.name).join(', ')}. Skipping to avoid ambiguity.`);
                                }
                            }
                        }
                        
                        // If still not found, try simple partial matching as last resort
                        if (!enumDef) {
                            logger.debug(`[Enum Debug] Trying simple partial matching as last resort`);
                            const searchTerms = [actualEnumTypeName, property.enumTypeName, property.name].filter(Boolean);
                            for (const term of searchTerms) {
                                enumDef = allEnums.find(d => d.name.includes(term) || term.includes(d.name));
                                if (enumDef) {
                                    logger.debug(`[Enum Debug] Found via simple partial match: '${term}' -> '${enumDef.name}'`);
                                    break;
                                }
                            }
                        }
                        
                        logger.debug(`[Enum Debug] Final enumDef found:`, enumDef);

                        const enumValues = enumDef?.values || [];
                        
                        if (enumValues.length === 0) {
                            logger.warn(`[controlInterface] No values found for enum property '${property.name}'. Tried: actualEnumType='${actualEnumTypeName}', enumTypeName='${property.enumTypeName}', propertyName='${property.name}'`);
                            // Add a placeholder option
                            const option = new Option('No values available', '');
                            option.disabled = true;
                            ctrl.appendChild(option);
                        } else {
                            logger.debug(`[Enum Debug] Successfully found ${enumValues.length} enum values:`, enumValues);
                            enumValues.forEach(v => {
                                const option = new Option(v, v);
                                ctrl.appendChild(option);
                            });
                            
                            if (liveProperty.value !== undefined && liveProperty.value !== null) {
                                ctrl.value = String(liveProperty.value);
                            } else if (enumValues.length > 0) {
                                ctrl.value = enumValues[0]; // Default to first if Rive value is null/undefined
                            }
                        }
                    } else {
                        logger.warn('[controlInterface] riveInstance.enums() not available');
                        const option = new Option('Enums not available', '');
                        option.disabled = true;
                        ctrl.appendChild(option);
                    }
                    
                    ctrl.addEventListener('change', () => { 
                        const newValue = ctrl.value;
                        logger.debug(`[App] Event: Attempting to set ${name} to:`, newValue);
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
                        logger.debug(`[App] Event: Attempting to fire trigger ${name}`);
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
        logger.debug('[controlInterface] Cleaning up previous Rive instance');
        riveInstance.cleanup();
    }
    if (uiUpdateInterval) {
        clearInterval(uiUpdateInterval);
        uiUpdateInterval = null;
        logger.debug('[controlInterface] Cleared UI update interval');
    }
    
    // Clear global references
    if (window.riveInstanceGlobal && window.riveInstanceGlobal !== riveInstance) {
        try {
            if (typeof window.riveInstanceGlobal.cleanup === 'function') {
                window.riveInstanceGlobal.cleanup();
            }
        } catch (e) {
            logger.warn('[controlInterface] Error cleaning up global Rive instance:', e);
        }
        window.riveInstanceGlobal = null;
    }
    
    if (window.vm) {
        window.vm = null;
        logger.debug('[controlInterface] Cleared global VM reference');
    }
    
    // Note: Window resize listener cleanup is now handled by riveParserHandler.js
    riveInstance = null;
    parsedRiveData = parsedDataFromHandler;
    dynamicControlsInitialized = false;
    structuredControlData = null;
    
    logger.debug('[controlInterface] State reset complete, initializing with new data');

    const controlsContainer = document.getElementById('dynamicControlsContainer');
    if (!controlsContainer) {
        logger.error('Dynamic controls container #dynamicControlsContainer not found. Cannot initialize.');
        return;
    }
    controlsContainer.innerHTML = '<p>Loading Rive animation and controls...</p>'; // Initial message

    if (!parsedDataFromHandler || !parsedDataFromHandler.defaultElements) {
        logger.error('[controlInterface] No parsed data or defaultElements found. Cannot create Rive instance.');
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

    const { 
        src,
        artboardName,
        stateMachineNames: availableSMs, // Array of SM names from parser
        viewModelName: parsedViewModelName // viewModelName from parser defaultElements
    } = parsedDataFromHandler.defaultElements;

    if (!src || !artboardName) { 
        logger.error('[controlInterface] Missing src or artboardName. Cannot create Rive instance.');
        if(controlsContainer) controlsContainer.innerHTML = '<p>Error: Missing Rive source or artboard name.</p>';
        return; 
    }

    let smToPlay = null;
    if (availableSMs && availableSMs.length > 0) {
        if (availableSMs.includes("State Machine 1")) {
            smToPlay = "State Machine 1";
        } else {
            smToPlay = availableSMs[0]; 
        }
        logger.info(`[controlInterface] Selected state machine to play: ${smToPlay}`);
    } else {
        logger.info('[controlInterface] No state machines found in parsed data to autoplay.');
    }

    const riveOptions = {
        src: src,
        canvas: canvas,
        artboard: artboardName,
        stateMachines: smToPlay, 
        autoplay: true, // Autoplay the selected state machine
        autoBind: true,
        onStateChange: handleConstructorStateChange,
    };

    logger.info('[controlInterface] Creating new Rive instance with options:', { 
        src: riveOptions.src, 
        artboard: riveOptions.artboard, 
        stateMachines: riveOptions.stateMachines,
        autoplay: riveOptions.autoplay,
        autoBind: riveOptions.autoBind
    });

    try {
        riveInstance = new RiveEngine.Rive(riveOptions);
    } catch (e) {
        logger.error('[controlInterface] Error during Rive instance construction:', e);
        if(controlsContainer) controlsContainer.innerHTML = `<p>Error constructing Rive: ${e.toString()}</p>`;
        riveInstance = null;
        return;
    }
    
    if (!riveInstance || typeof riveInstance.on !== 'function') {
        logger.error('Newly created Rive instance is invalid or does not have .on method');
        if(controlsContainer) controlsContainer.innerHTML = '<p>Error initializing Rive instance.</p>';
        return;
    }

    logger.info('[controlInterface] New Rive instance constructed. Setting up Load/LoadError listeners.');
    const EventType = RiveEngine.EventType;

    riveInstance.on(EventType.Load, () => {
        logger.info('[controlInterface] Rive instance EventType.Load fired.');
        dynamicControlsInitialized = true;
        try {
            riveInstance.resizeDrawingSurfaceToCanvas();
        } catch (e_resize) {
            console.error('[controlInterface] onLoad ERROR during resize:', e_resize);
            if(controlsContainer) controlsContainer.innerHTML = '<p>Error during Rive resize.</p>';
            return; 
        }
        
        // Check for ViewModel existence after load and autoBind
        if (!riveInstance.viewModelInstance && !parsedViewModelName) {
            logger.info('[controlInterface] No ViewModel instance found after load and no default VM name parsed.');
            // structuredControlData will likely be minimal or null
        } else if (riveInstance.viewModelInstance) {
            logger.info('[controlInterface] ViewModel instance found on Rive instance after load.');
        } else if (parsedViewModelName) {
            logger.warn(`[controlInterface] Parsed default ViewModel name was '${parsedViewModelName}', but no viewModelInstance found after load.`);
        }

        structuredControlData = processDataForControls(parsedRiveData, riveInstance);
        
        if (!structuredControlData && (riveInstance.viewModelInstance || parsedViewModelName)) {
            logger.error('[controlInterface] Failed to process data, but a ViewModel was expected/found.');
        }
        
        // Programmatically set "Diagram Enter" to false if it exists
        if (structuredControlData && structuredControlData.stateMachineControls && smToPlay) {
            const targetSMName = Array.isArray(smToPlay) ? smToPlay[0] : smToPlay; // Use the actual SM name we tried to play
            const smControl = structuredControlData.stateMachineControls.find(sm => sm.name === targetSMName);
            if (smControl && smControl.inputs) {
                const diagramEnterInput = smControl.inputs.find(input => input.name === "Diagram Enter");
                if (diagramEnterInput && diagramEnterInput.liveInput && diagramEnterInput.liveInput.value !== false) {
                    logger.info(`[controlInterface] Programmatically setting '${targetSMName} -> Diagram Enter' to false.`);
                    diagramEnterInput.liveInput.value = false;
                }
            }
        }

        setupEventListeners(); 
        buildControlsUI();

        // Note: Window resize listener is now handled by riveParserHandler.js
        // to avoid conflicts and ensure proper coordination

        // Expose this Rive instance to the window for debugging
        window.riveInstanceGlobal = riveInstance;
        logger.info('[controlInterface] Rive instance exposed as window.riveInstanceGlobal for console debugging.');
        
        // Initialize Asset Manager with the new Rive instance
        try {
            import('./assetManager.js').then(({ initializeAssetManager }) => {
                initializeAssetManager(riveInstance);
                logger.info('[controlInterface] Asset Manager initialized with Rive instance');
            }).catch(error => {
                logger.error('[controlInterface] Error importing Asset Manager:', error);
            });
        } catch (error) {
            logger.error('[controlInterface] Error initializing Asset Manager:', error);
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
            logger.debug('[controlInterface] RIVE JS EVENT: StateChanged Fired', event);
            updateControlsFromRive(); 
        });
    }
    if (EventType.ValueChanged) { 
        riveInstance.on(EventType.ValueChanged, (event) => {
            logger.debug('[controlInterface] RIVE JS EVENT: ValueChanged Fired', event);
            updateControlsFromRive();
        });
    }
    if (EventType.RiveEvent) { 
        riveInstance.on(EventType.RiveEvent, (event) => {
            logger.debug('[controlInterface] RIVE JS EVENT: RiveEvent (Custom) Fired', event);
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
        logger.warn('[controlInterface] No structured data available for buildControlsUI.');
        const noDataMsg = document.createElement('p');
        noDataMsg.className = 'info-note';
        noDataMsg.textContent = 'No control data processed. Cannot build controls.';
        controlsContainer.appendChild(noDataMsg);
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
        // Check if this is the default ViewModel from parsed data
        const isDefaultVM = parsedRiveData && parsedRiveData.defaultElements && 
            parsedRiveData.defaultElements.viewModelName === structuredControlData.activeViewModelName;
        
        const vmDisplayName = isDefaultVM ? 
            `${structuredControlData.activeViewModelName} (Default)` : 
            structuredControlData.activeViewModelName;
            
        infoDiv.innerHTML += `<p><strong>Active ViewModel:</strong> ${vmDisplayName}</p>`;
    }
    
    controlsContainer.appendChild(infoDiv);

    // Build State Machine Controls
    if (structuredControlData.stateMachineControls && structuredControlData.stateMachineControls.length > 0) {
        buildStateMachineControls(controlsContainer, structuredControlData.stateMachineControls);
    } else {
        // Optional: Message if no SM controls (e.g., if file has no SMs)
        // const noSmMsg = document.createElement('p'); noSmMsg.textContent = 'No State Machines found.';
        // controlsContainer.appendChild(noSmMsg);
    }

    // Create a dedicated section for ViewModel Controls for clarity
    const vmSection = document.createElement('div');
    vmSection.id = 'viewmodel-controls-section';
    // const vmHeader = document.createElement('h4'); vmHeader.textContent = 'ViewModel Controls'; vmSection.appendChild(vmHeader);
    controlsContainer.appendChild(vmSection);

    if (structuredControlData.viewModelControls && structuredControlData.viewModelControls.length > 0) {
        buildViewModelControls(vmSection, structuredControlData.viewModelControls);
    } else {
        logger.info('[controlInterface] No ViewModel controls to build (or no ViewModel found).');
        const noVmMsg = document.createElement('p');
        noVmMsg.className = 'info-note';
        noVmMsg.textContent = 'No ViewModel properties available for control in this Rive file.';
        vmSection.appendChild(noVmMsg);
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
function buildViewModelControls(container, viewModels, parentPath = '') {
    if (!viewModels || viewModels.length === 0) {
        // logger.info('No ViewModel controls to build'); // Already logged by caller
        return;
    }

    // logger.info(`Building controls for ${viewModels.length} ViewModels at path: '${parentPath}'`);
    
    viewModels.forEach(vm => {
        const currentVmPath = parentPath ? `${parentPath}/${vm.instanceName}` : vm.instanceName;
        // logger.debug(`Building controls for VM: ${vm.instanceName} (Path: ${currentVmPath})`);
        const vmDetails = document.createElement('details');
        vmDetails.className = 'control-section'; // Use the same class as top-level sections
        vmDetails.open = true;
        
        const vmSummary = document.createElement('summary');
        vmSummary.textContent = `VM: ${vm.instanceName} ${vm.blueprintName ? `(${vm.blueprintName})` : ''}`;
        vmDetails.appendChild(vmSummary);
        
        // Add direct property controls
        if (vm.properties && vm.properties.length > 0) {
            // logger.debug(`Adding ${vm.properties.length} properties for ${vm.instanceName}`);
            vm.properties.forEach(prop => {
                const propPath = `${currentVmPath}/${prop.name}`;
                const ctrl = createControlForProperty(prop); // createControlForProperty doesn't need the path
                if (ctrl) {
                    vmDetails.appendChild(makeRow(prop.name, ctrl, prop.type, propPath));
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
            // logger.debug(`Adding ${vm.nestedViewModels.length} nested VMs for ${vm.instanceName}`);
            // Pass the currentVmPath as the parentPath for nested VMs
            buildNestedViewModelControls(vmDetails, vm.nestedViewModels, currentVmPath, 1); 
        }
        
        container.appendChild(vmDetails);
    });
}

/**
 * Recursively builds controls for nested ViewModels
 * @param {HTMLElement} container The parent container element
 * @param {Array} nestedViewModels The nested ViewModel controls data
 * @param {string} parentPath The current path to the nested ViewModel
 * @param {number} depth Current nesting depth (for styling)
 */
function buildNestedViewModelControls(container, nestedViewModels, parentPath, depth = 1) {
    nestedViewModels.forEach(vm => {
        const currentVmPath = `${parentPath}/${vm.instanceName}`;
        const nestedDetails = document.createElement('details');
        nestedDetails.className = `control-subsection nested-level-${depth}`;
        nestedDetails.open = false; 
        
        const nestedSummary = document.createElement('summary');
        nestedSummary.textContent = `Nested: ${vm.instanceName}`;
        nestedDetails.appendChild(nestedSummary);
        
        if (vm.properties && vm.properties.length > 0) {
            vm.properties.forEach(prop => {
                const propPath = `${currentVmPath}/${prop.name}`;
                const ctrl = createControlForProperty(prop);
                if (ctrl) {
                    nestedDetails.appendChild(makeRow(prop.name, ctrl, prop.type, propPath));
                }
            });
        } else {
            const noProps = document.createElement('p');
            noProps.className = 'info-note';
            noProps.textContent = 'No properties in this nested ViewModel';
            nestedDetails.appendChild(noProps);
        }
        
        if (vm.nestedViewModels && vm.nestedViewModels.length > 0) {
            // Pass the currentVmPath for deeper nesting
            buildNestedViewModelControls(nestedDetails, vm.nestedViewModels, currentVmPath, depth + 1);
        }
        
        container.appendChild(nestedDetails);
    });
}

/**
 * Updates UI controls to reflect current Rive property values
 * This ensures bidirectional feedback when properties change internally
 */
function updateControlsFromRive() {
    // logger.debug('Updating controls from Rive...'); // Keep this commented unless needed for extreme verbosity
    
    const allControlRows = document.querySelectorAll('#dynamicControlsContainer .control-row');

    allControlRows.forEach(row => {
        const path = row.getAttribute('data-property-path');
        const labelEl = row.querySelector('label');
        const controlEl = row.querySelector('input, select, textarea');

        if (path && labelEl && controlEl) {
            // Extract the base property name from the label, as before
            // This is mostly for logging/debugging, path is the primary lookup key now.
            const propNameFromLabel = labelEl.childNodes[0].nodeValue.trim().replace(/:$/, ''); 
            updateControlValueFromRive(propNameFromLabel, controlEl, path);
        } else {
            // logger.warn('[Polling] Found a control row without full path/label/control', row);
        }
    });
}

function updateControlValueFromRive(propNameForLogging, controlElement, path) {
    if (!structuredControlData || !structuredControlData.viewModelControls) return;
    if (document.activeElement === controlElement && controlElement.type !== 'checkbox' && controlElement.type !== 'select-one') {
        return;
    }

    const findPropertyByPath = (rootVmArray, pathString) => {
        if (!pathString) return null;
        const segments = pathString.split('/');
        if (segments.length === 0) return null;

        let currentVmLevel = rootVmArray;
        let targetVm = null;

        // Find the root VM if the path starts with its instanceName
        // Assumes rootVmArray contains the top-level VM(s)
        const rootVmInstanceName = segments[0];
        targetVm = currentVmLevel.find(vm => vm.instanceName === rootVmInstanceName);

        if (!targetVm) {
            // logger.warn(`[findPropertyByPath] Root VM '${rootVmInstanceName}' not found in path: ${pathString}`);
            return null;
        }

        // Navigate through nested VMs for segments between root and the final property name
        for (let i = 1; i < segments.length - 1; i++) {
            const nestedVmName = segments[i];
            if (targetVm && targetVm.nestedViewModels && targetVm.nestedViewModels.length > 0) {
                const foundNestedVm = targetVm.nestedViewModels.find(nvm => nvm.instanceName === nestedVmName);
                if (foundNestedVm) {
                    targetVm = foundNestedVm;
                } else {
                    // logger.warn(`[findPropertyByPath] Nested VM '${nestedVmName}' not found in path: ${pathString}`);
                    targetVm = null;
                    break;
                }
            } else {
                // logger.warn(`[findPropertyByPath] No nested VMs in '${targetVm?.instanceName}' to find '${nestedVmName}' in path: ${pathString}`);
                targetVm = null;
                break;
            }
        }

        if (!targetVm) {
            // logger.warn(`[findPropertyByPath] Could not navigate to target VM for path: ${pathString}`);
            return null;
        }

        // The last segment is the property name
        const targetPropName = segments[segments.length - 1];
        const finalProp = targetVm.properties?.find(p => p.name === targetPropName);

        if (finalProp && finalProp.liveProperty) {
            return finalProp.liveProperty;
        } else {
            // logger.warn(`[findPropertyByPath] Property '${targetPropName}' not found in VM '${targetVm.instanceName}' for path: ${pathString}`);
            return null;
        }
    };

    const liveProperty = findPropertyByPath(structuredControlData.viewModelControls, path);

    if (liveProperty) {
        // logger.debug(`[Polling Path] Checking UI for '${path}', Rive value:`, liveProperty.value);

        if (controlElement.type === 'checkbox') {
            const riveValueBool = !!liveProperty.value;
            if (controlElement.checked !== riveValueBool) {
                // console.log(`[Polling Path] Updating CHECKBOX for '${path}' from ${controlElement.checked} to ${riveValueBool}`);
                controlElement.checked = riveValueBool;
            }
        } else if (controlElement.type === 'number') {
            // ... (robust number comparison as before) ...
            const controlValueNum = parseFloat(controlElement.value);
            const riveValueNum = liveProperty.value === null || liveProperty.value === undefined ? NaN : parseFloat(liveProperty.value);
            if (isNaN(controlValueNum) && isNaN(riveValueNum)) { /* Both NaN */ } 
            else if (controlValueNum !== riveValueNum) {
                // console.log(`[Polling Path] Updating NUMBER for '${path}'...`);
                controlElement.value = riveValueNum !== undefined && !isNaN(riveValueNum) ? riveValueNum : '';
            }
        } else if (controlElement.type === 'color') {
            // ... (robust color comparison as before) ...
            const riveHexValue = argbToHex(liveProperty.value);
            if (controlElement.value.toUpperCase() !== riveHexValue) {
                // console.log(`[Polling Path] Updating COLOR for '${path}'...`);
                controlElement.value = riveHexValue;
            }
        } else if (controlElement.type === 'select-one') {
            // ... (robust select comparison as before) ...
            const riveValueString = liveProperty.value === null || liveProperty.value === undefined ? '' : String(liveProperty.value);
            if (controlElement.value !== riveValueString) {
                // console.log(`[Polling Path] Updating SELECT for '${path}'...`);
                controlElement.value = riveValueString;
            }
        } else if (controlElement.tagName.toLowerCase() === 'textarea') {
            // ... (robust textarea comparison as before) ...
            const riveTextValue = (liveProperty.value === null || liveProperty.value === undefined ? '' : String(liveProperty.value)).replace(/\\n/g, '\n');
            if (controlElement.value !== riveTextValue) {
                // console.log(`[Polling Path] Updating TEXTAREA for '${path}'...`);
                controlElement.value = riveTextValue;
            }
        }
    } else {
        // This warning is now more significant as path-based lookup should be precise.
        logger.warn(`[Polling Path] Property for path '${path}' (label: '${propNameForLogging}') not found in structuredControlData.`); 
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

// Note: Resize handling has been moved to riveParserHandler.js to avoid conflicts
