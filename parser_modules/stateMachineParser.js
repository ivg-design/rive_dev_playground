// parser_modules/stateMachineParser.js

const SM_INPUT_TYPE_CODE_MAP = {
    56: "Number",  // From user summary
    58: "Trigger", // From user summary
    59: "Boolean", // From user summary
};

/**
 * Parses State Machines and their inputs for a given artboard definition.
 *
 * @param {object} artboardDef - The Rive ArtboardDefinition object.
 * @param {object} riveInstance - The main Rive runtime instance (for riveInstance.contents).
 * @param {object} [dynamicSmInputTypeMap={}] - Optional map for dynamically calibrated SM input types.
 * @returns {Array<object>} An array of parsed state machine objects,
 *                          e.g., [{ name: "SM Name", inputs: [{ name: "InputName", type: "Boolean" }] }]
 */
export function parseStateMachinesForArtboard(artboardDef, riveInstance, dynamicSmInputTypeMap = {}) {
    const parsedStateMachines = [];
    if (!artboardDef) {
        console.error("[stateMachineParser] Artboard definition is null/undefined.");
        return parsedStateMachines;
    }

    const artboardName = artboardDef.name;
    const artboardContents = riveInstance.contents?.artboards?.[artboardName];

    if (!artboardContents) {
        console.warn(`[stateMachineParser] No contents found for artboard '${artboardName}' in riveInstance.contents. Cannot parse SM inputs from contents.`);
    }

    const smCount = artboardDef.stateMachineCount();
    for (let i = 0; i < smCount; i++) {
        const smDefFromFile = artboardDef.stateMachineByIndex(i);
        const smNameFromFile = smDefFromFile.name;
        const currentSmData = { name: smNameFromFile, inputs: [] };

        const smFromContents = artboardContents?.stateMachines?.[smNameFromFile];

        if (smFromContents && Array.isArray(smFromContents.inputs)) {
            smFromContents.inputs.forEach(inputFromContents => {
                let typeString = "Unknown";
                if (typeof inputFromContents.type === 'string') {
                    typeString = inputFromContents.type;
                } else if (typeof inputFromContents.type === 'number') {
                    if (SM_INPUT_TYPE_CODE_MAP.hasOwnProperty(inputFromContents.type)) {
                        typeString = SM_INPUT_TYPE_CODE_MAP[inputFromContents.type];
                    } else if (dynamicSmInputTypeMap && dynamicSmInputTypeMap.hasOwnProperty(inputFromContents.type)) {
                        typeString = dynamicSmInputTypeMap[inputFromContents.type];
                        console.log(`[stateMachineParser] Used dynamic map for SM input type '${inputFromContents.type}' -> '${typeString}' for input '${inputFromContents.name}' in SM '${smNameFromFile}'.`);
                    } else {
                        console.warn(`[stateMachineParser] Unknown numeric SM input type code '${inputFromContents.type}' for input '${inputFromContents.name}' in SM '${smNameFromFile}'.`);
                    }
                } else {
                    console.warn(`[stateMachineParser] SM input '${inputFromContents.name}' in SM '${smNameFromFile}' has an unexpected type format: ${typeof inputFromContents.type}`);
                }
                currentSmData.inputs.push({ name: inputFromContents.name, type: typeString });
            });
        } else {
            // Even if not in contents, list the SM, just with empty inputs from contents perspective.
            // The Rive API (smDefFromFile.inputCount()) could be a fallback but summary emphasizes contents.
            console.warn(`[stateMachineParser] State machine '${smNameFromFile}' on artboard '${artboardName}' not found in riveInstance.contents or has no inputs array there. Inputs (if any) from contents will be empty.`);
        }
        parsedStateMachines.push(currentSmData);
    }

    return parsedStateMachines;
}

/**
 * Calibrates and creates a dynamic map for State Machine input types.
 * This function should be called once after the Rive instance is initialized
 * with an artboard and SM that has inputs, to build the map.
 *
 * @param {object} riveInstance - The main Rive runtime instance.
 * @param {string} artboardNameForCalibration - The name of the artboard used for calibration.
 * @param {string} smNameForCalibration - The name of the State Machine on that artboard used for calibration.
 * @returns {object} The dynamically generated SM input type map (e.g., {0: "Boolean", 1: "Number"}).
 */
export function calibrateSmInputTypes(riveInstance, artboardNameForCalibration, smNameForCalibration) {
    const DYNAMIC_SM_INPUT_TYPE_MAP = {};
    if (!riveInstance || !artboardNameForCalibration || !smNameForCalibration) {
        console.warn("[calibrateSmInputTypes] Missing Rive instance, artboard name, or SM name for calibration.");
        return DYNAMIC_SM_INPUT_TYPE_MAP;
    }

    const liveSmInstance = riveInstance.stateMachineInstance(smNameForCalibration, artboardNameForCalibration);
    const smFromContents = riveInstance.contents?.artboards?.[artboardNameForCalibration]?.stateMachines?.[smNameForCalibration];

    if (liveSmInstance && smFromContents && Array.isArray(smFromContents.inputs)) {
        const liveInputs = liveSmInstance.inputs;
        if (liveInputs.length !== smFromContents.inputs.length) {
            console.warn(`[calibrateSmInputTypes] Mismatch between live inputs count (${liveInputs.length}) and contents inputs count (${smFromContents.inputs.length}) for SM '${smNameForCalibration}'. Calibration may be inaccurate.`);
        }

        for (let i = 0; i < liveInputs.length; i++) {
            const liveInput = liveInputs[i];
            // Find corresponding input in contents by name, as order might not be guaranteed or match
            const contentInput = smFromContents.inputs.find(ci => ci.name === liveInput.name);

            if (liveInput && contentInput && typeof contentInput.type === 'number' &&
                !SM_INPUT_TYPE_CODE_MAP.hasOwnProperty(contentInput.type)) { // Only map if not a definitive known code
                
                let liveTypeString = "Unknown";
                if (liveInput.type === riveInstance.rive.StateMachineInputType.Boolean) {
                    liveTypeString = "Boolean";
                } else if (liveInput.type === riveInstance.rive.StateMachineInputType.Number) {
                    liveTypeString = "Number";
                } else if (liveInput.type === riveInstance.rive.StateMachineInputType.Trigger) {
                    liveTypeString = "Trigger";
                }

                if (DYNAMIC_SM_INPUT_TYPE_MAP.hasOwnProperty(contentInput.type) && DYNAMIC_SM_INPUT_TYPE_MAP[contentInput.type] !== liveTypeString) {
                    console.warn(`[calibrateSmInputTypes] Conflicting type for code ${contentInput.type}: already mapped to ${DYNAMIC_SM_INPUT_TYPE_MAP[contentInput.type]}, now seeing ${liveTypeString} for input '${liveInput.name}'. Using first mapping.`);
                } else if (!DYNAMIC_SM_INPUT_TYPE_MAP.hasOwnProperty(contentInput.type)){
                    DYNAMIC_SM_INPUT_TYPE_MAP[contentInput.type] = liveTypeString;
                    console.log(`[calibrateSmInputTypes] Calibrated SM input type: Code ${contentInput.type} -> ${liveTypeString} (from input '${liveInput.name}')`);
                }
            }
        }
    } else {
        console.warn(`[calibrateSmInputTypes] Could not perform SM input type calibration for SM '${smNameForCalibration}'. Live instance or contents not found/valid.`);
    }
    return DYNAMIC_SM_INPUT_TYPE_MAP;
}