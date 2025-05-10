// parser_modules/stateMachineParser.js

// Definitive numeric type codes from Rive runtime for SM inputs
const SM_INPUT_TYPE_TRIGGER = 58;
const SM_INPUT_TYPE_BOOLEAN = 59;
const SM_INPUT_TYPE_NUMBER = 56;

/**
 * Calibrates State Machine input types by observing live inputs from a specified State Machine.
 * THIS FUNCTION IS KEPT FOR POTENTIAL FUTURE USE OR COMPLEX SCENARIOS BUT IS NOT
 * THE PRIMARY MECHANISM IF DIRECT TYPE CODES FROM .contents ARE RELIABLE.
 * @param {object} riveInstance - The Rive runtime instance.
 * @param {string} artboardName - The name of the artboard containing the state machine.
 * @param {string} stateMachineName - The name of the state machine to calibrate inputs for.
 * @returns {object} A map where keys are numeric types from '.contents' and values are string types.
 */
export function calibrateSmInputTypes(riveInstance, artboardName, stateMachineName) {
	const dynamicSmInputTypeMap = {};
	if (!riveInstance || !artboardName || !stateMachineName) {
		// console.warn('[calibrateSmInputTypes] Missing arguments for calibration.');
		return dynamicSmInputTypeMap;
	}

	// Ensure the target artboard and state machine are active for calibration if RiveJS requires it
	// This might involve temporarily setting them on the riveInstance if not already set,
	// though the Rive constructor params in orchestrator should handle this.

	try {
		const liveInputs = riveInstance.stateMachineInputs(stateMachineName); // Requires SM to be active on the instance

		if (liveInputs && Array.isArray(liveInputs)) {
			let artboardFromContents = null;
			if (riveInstance.contents && riveInstance.contents.artboards) {
				if (Array.isArray(riveInstance.contents.artboards)) {
					artboardFromContents = riveInstance.contents.artboards.find((ab) => ab.name === artboardName);
				} else if (typeof riveInstance.contents.artboards === 'object' && riveInstance.contents.artboards[artboardName]) {
					artboardFromContents = riveInstance.contents.artboards[artboardName];
				}
			}

			if (artboardFromContents && artboardFromContents.stateMachines) {
				const smFromContents = artboardFromContents.stateMachines.find((sm) => sm.name === stateMachineName);
				if (smFromContents && smFromContents.inputs && Array.isArray(smFromContents.inputs)) {
					liveInputs.forEach((liveInput) => {
						const inputFromContents = smFromContents.inputs.find((i) => i.name === liveInput.name);
						if (inputFromContents && typeof inputFromContents.type === 'number') {
							const numericTypeInContents = inputFromContents.type;
							// Using RiveStateMachineInputType from an assumed enum/constant file
							// This relies on the Rive runtime's enum values.
							if (liveInput.type === RiveStateMachineInputType.Boolean) {
								dynamicSmInputTypeMap[numericTypeInContents] = 'Boolean';
							} else if (liveInput.type === RiveStateMachineInputType.Number) {
								dynamicSmInputTypeMap[numericTypeInContents] = 'Number';
							} else if (liveInput.type === RiveStateMachineInputType.Trigger) {
								dynamicSmInputTypeMap[numericTypeInContents] = 'Trigger';
							} else {
								// console.log(`[calibrateSmInputTypes] Live input '${liveInput.name}' has type ${liveInput.type} not matching known RiveStateMachineInputType constants.`);
							}
						}
					});
				}
			}
		}
		// console.log('[calibrateSmInputTypes] Dynamic SM Input Type Map after calibration:', dynamicSmInputTypeMap);
	} catch (e) {
		console.error(`[calibrateSmInputTypes] Error during SM input type calibration for SM '${stateMachineName}' on artboard '${artboardName}':`, e);
	}
	return dynamicSmInputTypeMap;
}

/**
 * Parses all State Machines for a given Artboard Definition, enriching with input details from riveInstance.contents.
 *
 * @param {object} riveInstance - The main Rive runtime instance.
 * @param {object} artboardDefFromFile - The artboard definition object from riveFile.
 * @param {object} dynamicSmInputTypeMap - A map for dynamic type calibration (optional, primarily for fallback).
 * @returns {Array<object>} An array of parsed state machine objects for this artboard.
 */
export function parseStateMachinesForArtboard(riveInstance, artboardDefFromFile, dynamicSmInputTypeMap = {}) {
	const parsedStateMachines = [];
	if (!artboardDefFromFile) return parsedStateMachines;

	const artboardName = artboardDefFromFile.name;
	let artboardFromContents = null;

	// 1. Find the corresponding artboard in riveInstance.contents
	if (riveInstance.contents && riveInstance.contents.artboards) {
		if (Array.isArray(riveInstance.contents.artboards)) {
			artboardFromContents = riveInstance.contents.artboards.find(ab => ab.name === artboardName);
		} else if (typeof riveInstance.contents.artboards === 'object') { // Should not be the case based on logs, but good to have
			artboardFromContents = riveInstance.contents.artboards[artboardName];
		}
	}

	if (!artboardFromContents) {
		console.warn(`[stateMachineParser] Artboard '${artboardName}' not found in riveInstance.contents. SM inputs will be based on riveFile definitions only (likely none).`);
		// Fallback: Create SM entries from riveFile definition but mark inputs as unavailable from contents
		const smCount = typeof artboardDefFromFile.stateMachineCount === 'function' ? artboardDefFromFile.stateMachineCount() : 0;
		for (let i = 0; i < smCount; i++) {
			const smDef = artboardDefFromFile.stateMachineByIndex(i);
			if (smDef) {
				parsedStateMachines.push({
					name: smDef.name,
					inputs: [], // riveFile's SM definition doesn't typically list inputs in detail needed
					sourceNote: "Artboard not found in riveInstance.contents, input details unavailable."
				});
			}
		}
		return parsedStateMachines;
	}

	// 2. Iterate through State Machines defined in riveFile for this artboard
	const smCountOnArtboardDef = typeof artboardDefFromFile.stateMachineCount === 'function' ? artboardDefFromFile.stateMachineCount() : 0;

	for (let i = 0; i < smCountOnArtboardDef; i++) {
		const smDefRiveFile = artboardDefFromFile.stateMachineByIndex(i);
		if (!smDefRiveFile || !smDefRiveFile.name) continue;

		const smOutput = {
			name: smDefRiveFile.name,
			inputs: [],
			sourceNote: ""
		};

		// 3. Find the matching state machine in artboardFromContents
		const smFromContents = artboardFromContents.stateMachines.find(sm => sm.name === smDefRiveFile.name);

		if (smFromContents && smFromContents.inputs && Array.isArray(smFromContents.inputs)) {
			smOutput.sourceNote = "Inputs from riveInstance.contents";
			smFromContents.inputs.forEach(inputFromContents => {
				let inputTypeString = 'UnknownInputType';
				if (typeof inputFromContents.type === 'number') {
					switch (inputFromContents.type) {
						case SM_INPUT_TYPE_TRIGGER:
							inputTypeString = 'Trigger';
							break;
						case SM_INPUT_TYPE_BOOLEAN:
							inputTypeString = 'Boolean';
							break;
						case SM_INPUT_TYPE_NUMBER:
							inputTypeString = 'Number';
							break;
						default:
							// Fallback to dynamic map or mark as unmapped numeric
							inputTypeString = dynamicSmInputTypeMap[inputFromContents.type] || `NumericType:${inputFromContents.type}`;
							if (!dynamicSmInputTypeMap.hasOwnProperty(inputFromContents.type) && !([SM_INPUT_TYPE_TRIGGER, SM_INPUT_TYPE_BOOLEAN, SM_INPUT_TYPE_NUMBER].includes(inputFromContents.type))) {
								console.warn(`[stateMachineParser] SM Input '${inputFromContents.name}' on SM '${smDefRiveFile.name}' (Artboard '${artboardName}'): Encountered unmapped numeric type '${inputFromContents.type}' from contents.`);
							}
							break;
					}
				} else if (typeof inputFromContents.type === 'string') { // Should not happen based on logs, but robust
					inputTypeString = inputFromContents.type;
				} else if (inputFromContents.type !== undefined) {
					inputTypeString = `OtherType:${inputFromContents.type}`;
				}
				smOutput.inputs.push({ name: inputFromContents.name, type: inputTypeString });
			});
		} else {
			smOutput.sourceNote = `SM '${smDefRiveFile.name}' not found in contents for artboard '${artboardName}', or it has no inputs array there.`;
			console.warn(`[stateMachineParser] ${smOutput.sourceNote}`);
			// If SM is in riveFile but not contents, or contents SM has no inputs, inputs array remains empty.
		}
		parsedStateMachines.push(smOutput);
	}
	return parsedStateMachines;
}