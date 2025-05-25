/**
 * @file parser.js
 * Handles the client-side parsing of Rive files to extract animation, artboard, asset, and ViewModel information.
 */

/**
 * Parses a Rive file and extracts detailed information about its contents.
 * This function initializes a Rive instance, loads the specified Rive file,
 * and then traverses its structure to collect data on artboards, animations,
 * state machines, assets, ViewModel definitions, and ViewModel instances.
 *
 * @param {object} riveEngine - The Rive runtime engine (e.g., window.rive).
 * @param {HTMLCanvasElement} canvasElement - The HTML canvas element to render the Rive animation on.
 * @param {string | null} riveFilePathFromParam - The path or URL to the .riv file. If null, uses a default path.
 * @param {function(Error | null, object | null): void} callback - The callback function to execute after parsing.
 *   It receives an error object as the first argument (or null if no error),
 *   the parsed Rive data object as the second argument (or null if an error occurred).
 */
function runOriginalClientParser(riveEngine, canvasElement, riveFilePathFromParam, callback) {
	/**
	 * Default callback handler to log errors or data to the console if no specific callback is provided.
	 * @param {Error | null} err - An error object if an error occurred, otherwise null.
	 * @param {object | null} data - The parsed data object, or null if an error occurred.
	 */
	const finalCallback =
		callback ||
		function (err, data) {
			if (err) {
                if (window.parserLogger) {
                    window.parserLogger.error('Error:', err);
                } else {
                    console.error('[Original Parser Fallback CB] Error:', err);
                }
            }
			// if (data) console.log("[Original Parser Fallback CB] Data:", data);
		};

    // Use window.parserLogger if available, otherwise fallback to console
    const logger = window.parserLogger || console;
    const logPrefix = window.parserLogger ? '' : '[Parser Entry] ';

	logger.debug(logPrefix + 'riveEngine received:', riveEngine);
	logger.debug(logPrefix + 'canvasElement received:', canvasElement);
	logger.debug(logPrefix + 'riveFilePathFromParam received:', riveFilePathFromParam);

	// If riveEngine is not passed, try to use window.rive as a fallback
	const riveToUse = window.rive;
	logger.debug(logPrefix + 'riveToUse resolved to:', riveToUse);

	if (!riveToUse) {
		const errorMsg = 'Rive runtime not loaded or provided';
		logger.error(logPrefix + errorMsg);
		finalCallback({ error: errorMsg }, null); // Pass null for instance on early error
		return;
	}
	// console.log('[Original Parser] Rive object:', riveToUse); // Optional: keep if useful for user

	const collectedAssets = [];
	// Use the provided file path if available, otherwise use default
	let riveFileToLoad = riveFilePathFromParam || 'animations/super_simple.riv';
	logger.info(logPrefix + 'Using Rive file:', riveFileToLoad);

	const canvas = canvasElement || document.getElementById('rive-canvas');
	logger.debug(logPrefix + 'canvas (final element for Rive):', canvas);
	if (!canvas) {
		const errorMsg = "Canvas element 'rive-canvas' not found or not provided.";
		logger.error(logPrefix + errorMsg);
		finalCallback({ error: errorMsg }, null); // Pass null for instance on early error
		return;
	}
	// console.log(`[Original Parser] Using canvas:`, canvas); // Optional
	// console.log(`[Original Parser] Attempting to load Rive file from src: '${riveFileToLoad}'`); // Optional

	// We are using the @rive-app/webgl2 runtime, so it should use WebGL2 by default.

	// --- DEBUGGING RIVE CONSTRUCTOR INPUTS ---
	logger.debug(logPrefix + 'About to instantiate Rive. src:', riveFileToLoad);
	logger.debug(logPrefix + 'Canvas element:', canvas);
	if (canvas) {
		logger.debug(logPrefix + 'Canvas clientWidth:', canvas.clientWidth, 'clientHeight:', canvas.clientHeight, 'offsetParent:', canvas.offsetParent);
	}
	// --- END DEBUGGING ---

	// const defaultStateMachineName = 'State Machine 1'; // REMOVE Hardcoded Default
	// logger.info(logPrefix + `Using default state machine name: ${defaultStateMachineName}`); // REMOVE

	const riveOptions = {
		src: riveFileToLoad,
		canvas: canvas,
		autobind: true, // Keep autobind to make viewModelInstance available for parsing
		// autoplay: true, // REMOVE autoplay for parser's instance
		// stateMachines: defaultStateMachineName, // REMOVE stateMachines for parser's instance
		assetLoader: (asset) => {
			// console.log("[Parser] assetLoader (single arg) called for:", asset.name);
			collectedAssets.push({
				name: asset.name,
				type: asset.type,
				cdnUuid: asset.cdnUuid,
			});
			return false;
		},
		onLoad: () => {
			// console.log('[Original Parser] Rive file loaded successfully (onLoad callback fired).'); // Optional
			riveInstance.resizeDrawingSurfaceToCanvas(); // need to add  window resize event listener to call this

			const argbToHex = (a) => {
				if (typeof a !== 'number') return `NOT_AN_ARGB_NUMBER (${typeof a}: ${a})`;
				return '#' + (a & 0xffffff).toString(16).padStart(6, '0').toUpperCase();
			};

			const result = {
				artboards: [],
				assets: collectedAssets,
				allViewModelDefinitionsAndInstances: [],
				// Add a new field to store default information
				defaultElements: {
					artboardName: null,
					stateMachineNames: [],
					viewModelName: null,
				},
			};

			// Get default artboard and identify its state machines
			if (riveInstance.artboard) {
				result.defaultElements.artboardName = riveInstance.artboard.name;
				logger.info(logPrefix + `Default artboard loaded: ${result.defaultElements.artboardName}`);

				// Clear and then populate with all found state machines on this artboard
				result.defaultElements.stateMachineNames = []; 

				const artboardDef = riveInstance.file?.artboardByName(riveInstance.artboard.name);
				if (artboardDef) {
					const smCountOnArtboard = typeof artboardDef.stateMachineCount === 'function' ? artboardDef.stateMachineCount() : 0;
					logger.info(logPrefix + `Found ${smCountOnArtboard} state machine(s) on artboard "${riveInstance.artboard.name}"`);

					for (let j = 0; j < smCountOnArtboard; j++) {
						const smDefFromFile = artboardDef.stateMachineByIndex(j);
						if (smDefFromFile && smDefFromFile.name) {
							logger.info(logPrefix + `Discovered state machine: ${smDefFromFile.name}`);
							result.defaultElements.stateMachineNames.push(smDefFromFile.name);
							// DO NOT PLAY IT HERE: riveInstance.play(smDefFromFile.name);
						}
					}
				} else {
                    logger.warn(logPrefix + `Could not get artboard definition for ${riveInstance.artboard.name} from riveInstance.file`);
                }
			} else {
                logger.warn(logPrefix + "No default artboard found on riveInstance after load.");
            }

			const riveFile = riveInstance.file;
			if (!riveFile) {
				const errorMsg = 'Rive file object not available after load.';
				logger.error(logPrefix + errorMsg);
				// Still pass riveInstance here as cleanup might be desired by caller for partial success
				// For our new model, we don't want to pass the instance back on error either.
				finalCallback({ error: errorMsg }, result); 
				return;
			}

			// Capture default ViewModel info if available
			const defaultViewModel = riveInstance.defaultViewModel && typeof riveInstance.defaultViewModel === 'function' ? riveInstance.defaultViewModel() : null;

			if (defaultViewModel && defaultViewModel.name) {
				result.defaultElements.viewModelName = defaultViewModel.name;
				logger.info(logPrefix + `Default view model: ${result.defaultElements.viewModelName}`);
			}

			// --- Dynamic State Machine Input Type Calibration ---
			const DYNAMIC_SM_INPUT_TYPE_MAP = {};
			let activeSMNameForCalibration = null;
			let activeArtboardNameForCalibration = null;

			if (riveInstance.artboard && riveInstance.stateMachines && riveInstance.stateMachines.length > 0) {
				activeArtboardNameForCalibration = riveInstance.artboard.name;
				activeSMNameForCalibration = riveInstance.stateMachines[0]; // Assume first specified SM for calibration
				// console.log(`Calibrating SM input types using Artboard: '${activeArtboardNameForCalibration}', SM: '${activeSMNameForCalibration}'`);

				try {
					const liveInputs = riveInstance.stateMachineInputs(activeSMNameForCalibration);
					if (liveInputs && Array.isArray(liveInputs)) {
						// Find corresponding SM in riveInstance.contents
						let smFromContentsForCalibration = null;
						if (riveInstance.contents && riveInstance.contents.artboards) {
							let artboardFromContents = null;
							if (Array.isArray(riveInstance.contents.artboards)) {
								artboardFromContents = riveInstance.contents.artboards.find((ab) => ab.name === activeArtboardNameForCalibration);
							} else if (typeof riveInstance.contents.artboards === 'object') {
								artboardFromContents = riveInstance.contents.artboards[activeArtboardNameForCalibration];
							}
							if (artboardFromContents && artboardFromContents.stateMachines) {
								smFromContentsForCalibration = artboardFromContents.stateMachines.find((sm) => sm.name === activeSMNameForCalibration);
							}
						}

						if (smFromContentsForCalibration && smFromContentsForCalibration.inputs && Array.isArray(smFromContentsForCalibration.inputs)) {
							liveInputs.forEach((liveInput) => {
								const inputFromContents = smFromContentsForCalibration.inputs.find((i) => i.name === liveInput.name);
								if (inputFromContents && typeof inputFromContents.type === 'number') {
									const numericTypeInContents = inputFromContents.type;
									if (window.rive && window.rive.StateMachineInputType) {
										if (liveInput.type === window.rive.StateMachineInputType.Boolean) {
											DYNAMIC_SM_INPUT_TYPE_MAP[numericTypeInContents] = 'Boolean';
										} else if (liveInput.type === window.rive.StateMachineInputType.Number) {
											DYNAMIC_SM_INPUT_TYPE_MAP[numericTypeInContents] = 'Number';
										} else if (liveInput.type === window.rive.StateMachineInputType.Trigger) {
											DYNAMIC_SM_INPUT_TYPE_MAP[numericTypeInContents] = 'Trigger';
										}
									}
								}
							});
						}
					}
					// console.log('Dynamic SM Input Type Map after calibration:', DYNAMIC_SM_INPUT_TYPE_MAP);
				} catch (e) {
					logger.error(logPrefix + `Error during SM input type calibration for SM '${activeSMNameForCalibration}':`, e);
				}
			}
			// --- End Dynamic Calibration ---

			// --- Helper: Parse ViewModelInstance Recursively ---
			function parseViewModelInstanceRecursive(vmInstanceObj, instanceNameForOutput, sourceBlueprint) {
				const currentViewModelInfo = {
					instanceName: instanceNameForOutput,
					sourceBlueprintName: sourceBlueprint ? sourceBlueprint.name : 'UnknownBlueprint',
					inputs: [],
					nestedViewModels: [],
				};

				if (!sourceBlueprint || !vmInstanceObj) {
					return currentViewModelInfo;
				}

				let blueprintPropertiesToIterate = [];
				if (sourceBlueprint.properties && Array.isArray(sourceBlueprint.properties)) {
					blueprintPropertiesToIterate = sourceBlueprint.properties;
				} else if (typeof sourceBlueprint.propertyCount === 'function') {
					const propCount = sourceBlueprint.propertyCount();
					for (let i = 0; i < propCount; i++) {
						const p = sourceBlueprint.propertyByIndex(i);
						if (p) blueprintPropertiesToIterate.push(p);
					}
				}

				blueprintPropertiesToIterate.forEach((propDecl) => {
					if (propDecl.type === 'viewModel') {
						if (typeof vmInstanceObj.viewModel === 'function') {
							try {
								const nestedVmInstance = vmInstanceObj.viewModel(propDecl.name);
								if (nestedVmInstance) {
									let blueprintForNested = null;
									if (nestedVmInstance.name && result.allViewModelDefinitionsAndInstances) {
										const foundDefElement = result.allViewModelDefinitionsAndInstances.find((defEl) => defEl.blueprintName === nestedVmInstance.name);
										if (foundDefElement) {
											const originalDef = allFoundViewModelDefinitions.find((afd) => afd.name === foundDefElement.blueprintName)?.def;
											if (originalDef) blueprintForNested = originalDef;
										}
									}
									if (!blueprintForNested && result.allViewModelDefinitionsAndInstances) {
										let nestedInstanceActualProps = [];
										if (nestedVmInstance.properties && Array.isArray(nestedVmInstance.properties)) {
											nestedInstanceActualProps = nestedVmInstance.properties.map((p) => ({ name: p.name, type: p.type }));
										} else if (typeof nestedVmInstance.propertyCount === 'function') {
											const nestedPropCount = nestedVmInstance.propertyCount();
											for (let k = 0; k < nestedPropCount; k++) {
												const prop = nestedVmInstance.propertyByIndex(k);
												if (prop && prop.name && prop.type) nestedInstanceActualProps.push({ name: prop.name, type: prop.type });
											}
										}
										if (nestedInstanceActualProps.length > 0) {
											nestedInstanceActualProps.sort((a, b) => a.name.localeCompare(b.name));
											const nestedInstanceFingerprint = nestedInstanceActualProps.map((p) => `${p.name}:${p.type}`).join('|');
											const foundDefElementByFingerprint = allFoundViewModelDefinitions.find((defEl) => defEl.fingerprint === nestedInstanceFingerprint);
											if (foundDefElementByFingerprint) blueprintForNested = foundDefElementByFingerprint.def;
										}
									}
									const instanceNameForNestedOutput = propDecl.name;
									if (blueprintForNested) {
										currentViewModelInfo.nestedViewModels.push(parseViewModelInstanceRecursive(nestedVmInstance, instanceNameForNestedOutput, blueprintForNested));
									} else {
										currentViewModelInfo.nestedViewModels.push({
											instanceName: instanceNameForNestedOutput,
											sourceBlueprintName: `Error_BlueprintUndef_For_Nested (nestedRiveName: ${nestedVmInstance.name}, parentProp: ${propDecl.name})`,
											inputs: [],
											nestedViewModels: [],
										});
									}
								}
							} catch (e) {
								/* console.error(`Error parsing nested VM for prop '${propDecl.name}':`, e); */
							}
						}
					} else {
						const inputInfo = { name: propDecl.name, type: propDecl.type, value: 'UNASSIGNED' };
						try {
							switch (propDecl.type) {
								case 'number':
									if (typeof vmInstanceObj.number === 'function') {
										const propInput = vmInstanceObj.number(propDecl.name);
										inputInfo.value = propInput && propInput.value !== undefined ? propInput.value : `Number '${propDecl.name}' .value is undefined or propInput is null`;
									} else {
										inputInfo.value = 'vmInstanceObj.number is not a function';
									}
									break;
								case 'string':
									if (typeof vmInstanceObj.string === 'function') {
										const propInput = vmInstanceObj.string(propDecl.name);
										const val = propInput && propInput.value !== undefined ? propInput.value : `String '${propDecl.name}' .value is undefined or propInput is null`;
										inputInfo.value = typeof val === 'string' ? val.replace(/\\n/g, '\n') : val;
									} else {
										inputInfo.value = 'vmInstanceObj.string is not a function';
									}
									break;
								case 'boolean':
									if (typeof vmInstanceObj.boolean === 'function') {
										const propInput = vmInstanceObj.boolean(propDecl.name);
										inputInfo.value = propInput && propInput.value !== undefined ? propInput.value : `Boolean '${propDecl.name}' .value is undefined or propInput is null`;
									} else {
										inputInfo.value = 'vmInstanceObj.boolean is not a function';
									}
									break;
								case 'enumType':
									// Log the property definition to inspect its structure for enum type name
									logger.info(`[Parser Enum Inspect] Property Definition for '${propDecl.name}':`, propDecl); // Using logger, ensure 'parser' module is set to INFO or lower
									// Enhanced debugging for enum property structure
									logger.debug(`[Parser Enum Inspect] Property Definition for '${propDecl.name}':`, propDecl);
									
									// Log all available properties on propDecl for debugging
									logger.debug(`[Parser Enum Inspect] All properties on propDecl:`, Object.keys(propDecl));
									logger.debug(`[Parser Enum Inspect] propDecl.enumDefinition:`, propDecl.enumDefinition);
									logger.debug(`[Parser Enum Inspect] propDecl.enumName:`, propDecl.enumName);
									logger.debug(`[Parser Enum Inspect] propDecl.definition:`, propDecl.definition);
									logger.debug(`[Parser Enum Inspect] propDecl.typeName:`, propDecl.typeName);

									if (typeof vmInstanceObj.enum === 'function') {
										const propInput = vmInstanceObj.enum(propDecl.name);
										inputInfo.value = propInput && propInput.value !== undefined ? propInput.value : `Enum '${propDecl.name}' .value is undefined or propInput is null`;
										
										let determinedEnumTypeName = null;
										// Educated guesses for the attribute on propDecl holding the enum definition's name
										// Order of guessing might matter if multiple exist.
										if (propDecl.enumDefinition && typeof propDecl.enumDefinition.name === 'string') {
											determinedEnumTypeName = propDecl.enumDefinition.name;
										} else if (typeof propDecl.enumName === 'string') { 
											determinedEnumTypeName = propDecl.enumName;
										} else if (propDecl.definition && typeof propDecl.definition.name === 'string') { 
											determinedEnumTypeName = propDecl.definition.name;
										} else if (propDecl.typeName && typeof propDecl.typeName === 'string') { 
											determinedEnumTypeName = propDecl.typeName;
										} else if (propDecl.referenceEnumName && typeof propDecl.referenceEnumName === 'string') { // Another guess
											determinedEnumTypeName = propDecl.referenceEnumName;
										}
										// Add more guesses above if needed based on inspection of console.log(propDecl)

										if (determinedEnumTypeName) {
											inputInfo.enumTypeName = determinedEnumTypeName;
											logger.info(`[Parser] For enum property '${propDecl.name}', successfully determined enumTypeName as '${determinedEnumTypeName}'.`);
										} else {
											logger.warn(`[Parser] For enum property '${propDecl.name}', COULD NOT DETERMINE specific enumTypeName from propDecl attributes. Falling back to using property name '${propDecl.name}' as enumTypeName. This is likely incorrect and will prevent dropdown population.`);
											inputInfo.enumTypeName = propDecl.name; // Fallback
										}
									} else {
										inputInfo.value = 'vmInstanceObj.enum (and .string) is not a function for enumType';
										inputInfo.enumTypeName = propDecl.name; // Fallback
										logger.warn(`[Parser] For enum property '${propDecl.name}', vmInstanceObj.enum is not a function. Cannot get initial value or reliably determine enumTypeName.`);
									}
									break;
								case 'color':
									if (typeof vmInstanceObj.color === 'function') {
										const propInput = vmInstanceObj.color(propDecl.name);
										if (propInput && propInput.value !== undefined && typeof propInput.value === 'number') {
											inputInfo.value = argbToHex(propInput.value);
										} else {
											inputInfo.value = `Color '${propDecl.name}' .value is not an ARGB number, is undefined, or propInput is null`;
										}
									} else {
										inputInfo.value = 'vmInstanceObj.color is not a function';
									}
									break;
								case 'trigger':
									inputInfo.value = 'N/A (Trigger)'; // Triggers don't have a persistent value to get
									break;
								default:
									inputInfo.value = `UNHANDLED_PROPERTY_TYPE: ${propDecl.type}`;
							}
							currentViewModelInfo.inputs.push(inputInfo);
						} catch (e) {
							// If an error occurs in the switch, push with the error message
							currentViewModelInfo.inputs.push({ name: propDecl.name, type: propDecl.type, value: `ERROR_ACCESSING_VM_PROP: ${e.message}` });
						}
					}
				});
				return currentViewModelInfo;
			}

			// --- Phase 1: List All ViewModel Blueprints ---
			const allFoundViewModelDefinitions = [];
			let vmdIndex = 0;
			const vmDefinitionCount = riveFile && typeof riveFile.viewModelCount === 'function' ? riveFile.viewModelCount() : 0;
			// console.log(`[Original Parser] Found ${vmDefinitionCount} ViewModel definitions...`); // Optional debug
			if (typeof riveInstance.viewModelByIndex === 'function') {
				// console.log("[Original Parser] Using riveInstance.viewModelByIndex() to fetch definitions."); // Optional debug
				for (vmdIndex = 0; vmdIndex < vmDefinitionCount; vmdIndex++) {
					try {
						const vmDef = riveInstance.viewModelByIndex(vmdIndex);
						if (vmDef && vmDef.name) {
							allFoundViewModelDefinitions.push({ def: vmDef, name: vmDef.name });
						} else {
							// console.warn(`[Original Parser] riveInstance.viewModelByIndex(${vmdIndex}) returned falsy or nameless vmDef.`);
						}
					} catch (e) {
						logger.error(logPrefix + `[Original Parser] Error in riveInstance.viewModelByIndex loop (index ${vmdIndex}):`, e);
						// If one errors, we might not want to continue if count is unreliable
						break;
					}
				}
			} else if (riveFile && typeof riveFile.viewModelByIndex === 'function') {
				// Fallback to riveFile.viewModelByIndex if riveInstance.viewModelByIndex doesn't exist
				// console.warn("[Original Parser] riveInstance.viewModelByIndex() not found. Falling back to riveFile.viewModelByIndex(). Property access might be limited.");
				let consecutiveDefinitionErrors = 0;
				const MAX_CONSECUTIVE_VM_DEF_ERRORS = 3;
				// Reset vmdIndex for this loop, but use vmDefinitionCount if available and reliable, or MAX_VM_DEFS_TO_PROBE
				let loopLimit = vmDefinitionCount > 0 ? vmDefinitionCount : MAX_VM_DEFS_TO_PROBE;
				vmdIndex = 0; // reset for this loop
				while (vmdIndex < loopLimit && consecutiveDefinitionErrors < MAX_CONSECUTIVE_VM_DEF_ERRORS) {
					try {
						const vmDef = riveFile.viewModelByIndex(vmdIndex);
						if (vmDef && vmDef.name) {
							allFoundViewModelDefinitions.push({ def: vmDef, name: vmDef.name });
							consecutiveDefinitionErrors = 0;
						} else {
							consecutiveDefinitionErrors++;
						}
						vmdIndex++;
					} catch (e) {
						logger.error(logPrefix + `[Original Parser] Error in riveFile.viewModelByIndex loop (index ${vmdIndex}):`, e);
						// If one errors, we might not want to continue if count is unreliable
						break;
					}
				}
			} else {
				logger.error(logPrefix + 'Cannot parse ViewModel definitions: no viewModelByIndex method found on Rive instance or file.');
			}

			// Process each found ViewModel definition to extract its properties and create a fingerprint.
			allFoundViewModelDefinitions.forEach((vmDefElement) => {
				const vmDef = vmDefElement.def;
				// console.log(`[Original Parser - BlueprintLoop] Processing blueprint for: '${vmDef.name}'`, vmDef);
				// console.log(`[Original Parser - BlueprintLoop] typeof vmDef.properties: ${typeof vmDef.properties}`);
				if (vmDef.properties && Array.isArray(vmDef.properties)) {
					// console.log(`[Original Parser - BlueprintLoop] '${vmDef.name}' HAS .properties array, length: ${vmDef.properties.length}`);
				} else {
					// console.log(`[Original Parser - BlueprintLoop] '${vmDef.name}' DOES NOT have .properties array.`);
				}
				// console.log(`[Original Parser - BlueprintLoop] typeof vmDef.propertyCount: ${typeof vmDef.propertyCount}`);

				const blueprintOutputEntry = {
					blueprintName: vmDef.name,
					blueprintProperties: [],
					instanceNamesFromDefinition: vmDef.instanceNames || [],
					instanceCountFromDefinition: typeof vmDef.instanceCount === 'number' ? vmDef.instanceCount : -1,
					parsedInstances: [],
				};
				const currentBlueprintPropsArray = [];

				// Corrected property access logic
				let propertiesToIterate = [];
				if (vmDef.properties && Array.isArray(vmDef.properties)) {
					// console.log(`[Original Parser - BlueprintLoop] '${vmDef.name}' using direct .properties array.`);
					propertiesToIterate = vmDef.properties;
				} else if (typeof vmDef.propertyCount === 'number' && typeof vmDef.propertyByIndex === 'function') {
					// console.log(`[Original Parser - BlueprintLoop] '${vmDef.name}' using .propertyCount (number) and .propertyByIndex().`);
					const propCount = vmDef.propertyCount; // It's a number
					for (let k = 0; k < propCount; k++) {
						const p = vmDef.propertyByIndex(k);
						if (p) propertiesToIterate.push(p);
					}
				} else if (typeof vmDef.propertyCount === 'function' && typeof vmDef.propertyByIndex === 'function') {
					// console.log(`[Original Parser - BlueprintLoop] '${vmDef.name}' using .propertyCount() (function) and .propertyByIndex().`);
					const propCount = vmDef.propertyCount();
					for (let k = 0; k < propCount; k++) {
						const p = vmDef.propertyByIndex(k);
						if (p) propertiesToIterate.push(p);
					}
				} else {
					// console.warn(`[Original Parser - BlueprintLoop] '${vmDef.name}' has no recognized method to access properties (checked .properties, .propertyCount as number, .propertyCount as function).`);
				}

				propertiesToIterate.forEach((p) => {
					if (p && p.name && p.type) currentBlueprintPropsArray.push({ name: p.name, type: p.type });
				});

				currentBlueprintPropsArray.sort((a, b) => a.name.localeCompare(b.name));
				vmDefElement.fingerprint = currentBlueprintPropsArray.map((p) => `${p.name}:${p.type}`).join('|');
				blueprintOutputEntry.blueprintProperties = currentBlueprintPropsArray;
				result.allViewModelDefinitionsAndInstances.push(blueprintOutputEntry);
			});

			// --- Phase 2: Parse Default Artboard's Main VM Hierarchy ---
			const defaultArtboardRiveObject = riveInstance.artboard;
			if (defaultArtboardRiveObject) {
				const defaultVmBlueprint = riveInstance.defaultViewModel();
				if (defaultVmBlueprint && defaultVmBlueprint.name) {
					let mainInstanceForDefaultArtboard = null;
					let mainInstanceNameForOutput = 'UnknownDefaultInstanceName';
					if (riveInstance.viewModelInstance) {
						mainInstanceForDefaultArtboard = riveInstance.viewModelInstance;
						mainInstanceNameForOutput = mainInstanceForDefaultArtboard.name || `${defaultVmBlueprint.name}_autoboundInstance`;
					} else if (typeof defaultVmBlueprint.defaultInstance === 'function') {
						mainInstanceForDefaultArtboard = defaultVmBlueprint.defaultInstance();
						if (mainInstanceForDefaultArtboard) mainInstanceNameForOutput = mainInstanceForDefaultArtboard.name || `${defaultVmBlueprint.name}_defaultVmDefInstance`;
					}
					if (defaultVmBlueprint.instanceCount === 1 && defaultVmBlueprint.instanceNames && defaultVmBlueprint.instanceNames.length === 1 && defaultVmBlueprint.instanceNames[0] === '') {
						mainInstanceNameForOutput = 'Instance';
					}
					if (mainInstanceForDefaultArtboard) {
						const parsedDefaultArtboardVm = parseViewModelInstanceRecursive(mainInstanceForDefaultArtboard, mainInstanceNameForOutput, defaultVmBlueprint);
						let artboardEntryForDefault = result.artboards.find((ab) => ab.name === defaultArtboardRiveObject.name);
						if (!artboardEntryForDefault) {
							artboardEntryForDefault = { name: defaultArtboardRiveObject.name, animations: [], stateMachines: [], viewModels: [] };
							result.artboards.push(artboardEntryForDefault);
						}
						artboardEntryForDefault.viewModels.push(parsedDefaultArtboardVm);
					}
				}
			}

			// --- Artboard Info Loop (Animations, State Machine Names & Inputs from Contents) ---
			const artboardCount = riveFile.artboardCount ? riveFile.artboardCount() : 0;
			for (let i = 0; i < artboardCount; i++) {
				const artboardDef = riveFile.artboardByIndex(i); // This is an ArtboardDefinition from riveFile
				if (!artboardDef) continue;

				let currentArtboardEntry = result.artboards.find((ab) => ab.name === artboardDef.name);
				if (!currentArtboardEntry) {
					currentArtboardEntry = { name: artboardDef.name, animations: [], stateMachines: [], viewModels: [] };
					result.artboards.push(currentArtboardEntry);
				}

				const animationCount = typeof artboardDef.animationCount === 'function' ? artboardDef.animationCount() : 0;
				for (let j = 0; j < animationCount; j++) {
					const animation = artboardDef.animationByIndex(j);
					if (animation) currentArtboardEntry.animations.push({ name: animation.name, fps: animation.fps, duration: animation.duration, workStart: animation.workStart, workEnd: animation.workEnd });
				}

				const smCountOnArtboard = typeof artboardDef.stateMachineCount === 'function' ? artboardDef.stateMachineCount() : 0;
				for (let j = 0; j < smCountOnArtboard; j++) {
					const smDefFromFile = artboardDef.stateMachineByIndex(j); // SMDefinition from riveFile
					if (!smDefFromFile || !smDefFromFile.name) continue;

					const smInfo = { name: smDefFromFile.name, inputs: [] };

					// Attempt to find this state machine and its inputs in riveInstance.contents
					if (riveInstance.contents && riveInstance.contents.artboards) {
						// Find the corresponding artboard in contents (contents.artboards could be an array or object)
						let artboardFromContents = null;
						if (Array.isArray(riveInstance.contents.artboards)) {
							artboardFromContents = riveInstance.contents.artboards.find((ab) => ab.name === artboardDef.name);
						} else if (typeof riveInstance.contents.artboards === 'object') {
							// If it's an object keyed by name
							artboardFromContents = riveInstance.contents.artboards[artboardDef.name];
						}

						if (artboardFromContents && artboardFromContents.stateMachines) {
							const smFromContents = artboardFromContents.stateMachines.find((sm) => sm.name === smDefFromFile.name);
							if (smFromContents && smFromContents.inputs && Array.isArray(smFromContents.inputs)) {
								smFromContents.inputs.forEach((inputFromContents) => {
									let inputTypeString = 'UnknownInputType';

									if (typeof inputFromContents.type === 'string') {
										inputTypeString = inputFromContents.type;
									} else if (typeof inputFromContents.type === 'number') {
										// Apply definitive mapping based on user's findings from runtime code
										if (inputFromContents.type === 58) {
											inputTypeString = 'Trigger';
										} else if (inputFromContents.type === 59) {
											inputTypeString = 'Boolean';
										} else if (inputFromContents.type === 56) {
											inputTypeString = 'Number';
										} else {
											// Fallback for any other numbers not covered by the definitive mapping
											// This could also consult DYNAMIC_SM_INPUT_TYPE_MAP if that map is still deemed useful for other values
											inputTypeString = DYNAMIC_SM_INPUT_TYPE_MAP[inputFromContents.type] || `NumericType:${inputFromContents.type}`;
											if (!DYNAMIC_SM_INPUT_TYPE_MAP.hasOwnProperty(inputFromContents.type)) {
												// console.warn(`SM Input '${inputFromContents.name}': Encountered unmapped numeric type '${inputFromContents.type}' from contents.`);
											}
										}
									} else if (inputFromContents.type !== undefined) {
										inputTypeString = `OtherType:${inputFromContents.type}`;
									}
									smInfo.inputs.push({ name: inputFromContents.name, type: inputTypeString });
								});
							} else {
								// console.log(`SM '${smDefFromFile.name}' on artboard '${artboardDef.name}' found in contents, but no inputs array or inputs are missing.`);
							}
						} else {
							// console.log(`Artboard '${artboardDef.name}' not found in riveInstance.contents or has no stateMachines property.`);
						}
					} else {
						// console.warn('riveInstance.contents or riveInstance.contents.artboards is not available for parsing SM inputs.');
					}
					currentArtboardEntry.stateMachines.push(smInfo);
				}
			}

			// --- Collect Global Enum Definitions ---
			if (typeof riveInstance.enums === 'function') {
				try {
					result.globalEnums = riveInstance.enums();
				} catch (e) {
					logger.error(logPrefix + 'Error calling riveInstance.enums():', e);
					result.globalEnums = 'ERROR_CALLING_riveInstance.enums';
				}
			} else if (riveFile && typeof riveFile.enums === 'function') {
				try {
					result.globalEnums = riveFile.enums();
				} catch (e) {
					logger.error(logPrefix + 'Error calling riveFile.enums():', e);
					result.globalEnums = 'ERROR_CALLING_riveFile.enums';
				}
			} else {
				result.globalEnums = 'COULD_NOT_RETRIEVE_GLOBAL_ENUMS_NO_METHOD';
			}

			// console.log('Final Parsed Rive file structure (within parser.js):', JSON.parse(JSON.stringify(result))); // REMOVE THIS

			const cleanResult = {
				artboards: result.artboards,
				assets: result.assets,
				allViewModelDefinitionsAndInstances: result.allViewModelDefinitionsAndInstances,
				globalEnums: result.globalEnums,
				defaultElements: {
					...result.defaultElements, // Spread existing default elements
					src: riveFileToLoad       // Add the src path
				},
			};
			
			// Cleanup the instance used for parsing
			if (riveInstance && typeof riveInstance.cleanup === 'function') {
				logger.debug(logPrefix + 'Cleaning up parser Rive instance.');
				riveInstance.cleanup();
			}
			finalCallback(null, cleanResult); // Pass only the data
		},
		onError: (err) => {
			const errorMsg = 'Problem loading file; may be corrupt!'; // More prominent error message
			logger.error(logPrefix + errorMsg, err);
			logger.error(logPrefix + '[Parser Rive Error] Options used for new Rive():', JSON.stringify(riveOptions, null, 2)); // Log options on error
			// No instance to pass on load error
			finalCallback({ error: errorMsg, details: err.toString() }, null); 
		},
	};

	logger.debug(logPrefix + '[Parser Pre-Init] Options for new Rive (exampleIndex.mjs inspired):');
	// Custom logger for options because functions won't stringify well
	Object.keys(riveOptions).forEach((key) => {
		if (typeof riveOptions[key] === 'function') {
			logger.debug(logPrefix + `  ${key}: function`);
		} else {
			logger.debug(logPrefix + `  ${key}:`, riveOptions[key]);
		}
	});

	const riveInstance = new riveToUse.Rive(riveOptions);
	logger.debug(logPrefix + '[Parser Post-Init] Rive instance created (or attempted):', riveInstance);

	// The rest of the onLoad logic, including finalCallback, remains the same.
	// The onError for the Rive constructor will handle the "corrupt file" error.
}
