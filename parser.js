const ws = new WebSocket('ws://' + window.location.host);
ws.onopen = () => console.log('Connected to server');
ws.onerror = (err) => console.error('WebSocket error:', err);

// Wait for Rive to be available
window.addEventListener('load', () => {
	console.log('Window loaded, Rive object:', window.rive);

	if (!window.rive) {
		console.error('Rive runtime not loaded');
		return;
	}

	const collectedAssets = [];

	const riveInstance = new window.rive.Rive({
		src: 'animations/diagram_v3.riv',
		canvas: document.getElementById('rive-canvas'),
		// artboard: "Diagram",
		// stateMachines: "State Machine 1",
		autobind: true,
		autoplay: true,
		assetLoader: (asset, bytes) => {
			collectedAssets.push({
				name: asset.name,
				type: asset.type,
				cdnUuid: asset.cdnUuid,
			});
			return false;
		},
		onLoad: () => {
			console.log('Rive file loaded successfully.');

			const argbToHex = (a) => {
				if (typeof a !== 'number') return `NOT_AN_ARGB_NUMBER (${typeof a}: ${a})`;
				return '#' + (a & 0xffffff).toString(16).padStart(6, '0').toUpperCase();
			};

			const result = {
				artboards: [],
				assets: collectedAssets,
				allViewModelDefinitionsAndInstances: [],
			};

			const riveFile = riveInstance.file;
			if (!riveFile) {
				console.error('Rive file object not available after load.');
				ws.send(JSON.stringify(result));
				return;
			}

			// --- Dynamic State Machine Input Type Calibration ---
			const DYNAMIC_SM_INPUT_TYPE_MAP = {};
			let activeSMNameForCalibration = null;
			let activeArtboardNameForCalibration = null;

			if (riveInstance.artboard && riveInstance.stateMachines && riveInstance.stateMachines.length > 0) {
				activeArtboardNameForCalibration = riveInstance.artboard.name;
				activeSMNameForCalibration = riveInstance.stateMachines[0]; // Assume first specified SM for calibration
				console.log(`Calibrating SM input types using Artboard: '${activeArtboardNameForCalibration}', SM: '${activeSMNameForCalibration}'`);

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
					console.log('Dynamic SM Input Type Map after calibration:', DYNAMIC_SM_INPUT_TYPE_MAP);
				} catch (e) {
					console.error(`Error during SM input type calibration for SM '${activeSMNameForCalibration}':`, e);
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

				if (!sourceBlueprint) {
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
						let value = 'COULD_NOT_GET_VALUE';
						try {
							const inputInfo = { name: propDecl.name, type: propDecl.type, value: 'UNASSIGNED' };

							switch (propDecl.type) {
								case 'number':
									if (typeof vmInstanceObj.number === 'function') {
										const propObj = vmInstanceObj.number(propDecl.name);
										if (propObj && propObj._viewModelInstanceValue && propObj._viewModelInstanceValue.hasOwnProperty('value')) {
											inputInfo.value = propObj._viewModelInstanceValue.value === undefined ? null : propObj._viewModelInstanceValue.value;
										} else {
											inputInfo.value = 'Number propObj._viewModelInstanceValue.value not found';
										}
									} else {
										inputInfo.value = 'vmInstanceObj.number is not a function';
									}
									break;
								case 'string':
									if (typeof vmInstanceObj.string === 'function') {
										const propObj = vmInstanceObj.string(propDecl.name);
										if (propObj && propObj._viewModelInstanceValue && propObj._viewModelInstanceValue.hasOwnProperty('value')) {
											inputInfo.value = propObj._viewModelInstanceValue.value === undefined ? null : propObj._viewModelInstanceValue.value;
										} else {
											inputInfo.value = 'String propObj._viewModelInstanceValue.value not found';
										}
									} else {
										inputInfo.value = 'vmInstanceObj.string is not a function';
									}
									break;
								case 'boolean':
									if (typeof vmInstanceObj.boolean === 'function') {
										const propObj = vmInstanceObj.boolean(propDecl.name);
										if (propObj && propObj._viewModelInstanceValue && propObj._viewModelInstanceValue.hasOwnProperty('value')) {
											inputInfo.value = propObj._viewModelInstanceValue.value === undefined ? null : propObj._viewModelInstanceValue.value;
										} else {
											inputInfo.value = 'Boolean propObj._viewModelInstanceValue.value not found';
										}
									} else {
										inputInfo.value = 'vmInstanceObj.boolean is not a function';
									}
									break;
								case 'enumType':
									if (typeof vmInstanceObj.enum === 'function') {
										const propObj = vmInstanceObj.enum(propDecl.name);
										if (propObj && propObj._viewModelInstanceValue && propObj._viewModelInstanceValue.hasOwnProperty('value')) {
											inputInfo.value = propObj._viewModelInstanceValue.value === undefined ? null : propObj._viewModelInstanceValue.value;
										} else {
											inputInfo.value = 'Enum (via .enum) propObj._viewModelInstanceValue.value not found';
										}
									} else {
										if (typeof vmInstanceObj.string === 'function') {
											const propObj = vmInstanceObj.string(propDecl.name);
											if (propObj && propObj._viewModelInstanceValue && propObj._viewModelInstanceValue.hasOwnProperty('value')) {
												inputInfo.value = propObj._viewModelInstanceValue.value === undefined ? null : propObj._viewModelInstanceValue.value;
											} else {
												inputInfo.value = 'Enum (via .string fallback) propObj._viewModelInstanceValue.value not found';
											}
										} else {
											inputInfo.value = 'vmInstanceObj.enum (and .string) is not a function for enumType';
										}
									}
									break;
								case 'color':
									if (typeof vmInstanceObj.color === 'function') {
										const propObj = vmInstanceObj.color(propDecl.name);
										if (propObj && propObj._viewModelInstanceValue && typeof propObj._viewModelInstanceValue.value === 'number') {
											inputInfo.value = argbToHex(propObj._viewModelInstanceValue.value);
										} else if (propObj && propObj._viewModelInstanceValue && typeof propObj._viewModelInstanceValue.value === 'string') {
											inputInfo.value = propObj._viewModelInstanceValue.value;
										} else if (propObj && typeof propObj.value === 'number') {
											inputInfo.value = argbToHex(propObj.value);
										} else if (propObj && typeof propObj.value === 'string') {
											inputInfo.value = propObj.value;
										} else if (typeof propObj === 'number') {
											inputInfo.value = argbToHex(propObj);
										} else {
											inputInfo.value = `Color not in expected ARGB format (propObj: ${JSON.stringify(propObj)})`;
										}
									} else {
										inputInfo.value = 'vmInstanceObj.color is not a function';
									}
									break;
								case 'trigger':
									inputInfo.value = 'N/A (Trigger)';
									break;
								default:
									inputInfo.value = `UNHANDLED_PROPERTY_TYPE: ${propDecl.type}`;
							}
							currentViewModelInfo.inputs.push(inputInfo);
						} catch (e) {
							// If an error occurs in the switch, push with the error message
							currentViewModelInfo.inputs.push({ name: propDecl.name, type: propDecl.type, value: `ERROR_IN_SWITCH: ${e.message}` });
						}
					}
				});
				return currentViewModelInfo;
			}

			// --- Phase 1: List All ViewModel Blueprints ---
			const allFoundViewModelDefinitions = [];
			let vmdIndex = 0;
			let consecutiveDefinitionErrors = 0;
			const MAX_CONSECUTIVE_VM_DEF_ERRORS = 3; 
			const MAX_VM_DEFS_TO_PROBE = 200; 

			if (riveFile && typeof riveFile.viewModelByIndex === 'function') {
				while (vmdIndex < MAX_VM_DEFS_TO_PROBE && consecutiveDefinitionErrors < MAX_CONSECUTIVE_VM_DEF_ERRORS) {
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
						break;
					}
				}
			} else {
				console.error('riveFile.viewModelByIndex is not a function. Cannot parse ViewModel definitions.');
			}

			allFoundViewModelDefinitions.forEach((vmDefElement) => {
				const vmDef = vmDefElement.def;
				const blueprintOutputEntry = {
					blueprintName: vmDef.name,
					blueprintProperties: [],
					instanceNamesFromDefinition: vmDef.instanceNames || [],
					instanceCountFromDefinition: typeof vmDef.instanceCount === 'number' ? vmDef.instanceCount : -1,
					parsedInstances: [],
				};
				const currentBlueprintPropsArray = [];
				if (vmDef.properties && Array.isArray(vmDef.properties)) {
					vmDef.properties.forEach((p) => {
						if (p && p.name && p.type) currentBlueprintPropsArray.push({ name: p.name, type: p.type });
					});
				} else if (typeof vmDef.propertyCount === 'function') {
					const propCount = vmDef.propertyCount();
					for (let k = 0; k < propCount; k++) {
						const p = vmDef.propertyByIndex(k);
						if (p && p.name && p.type) currentBlueprintPropsArray.push({ name: p.name, type: p.type });
					}
				}
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
												console.warn(`SM Input '${inputFromContents.name}': Encountered unmapped numeric type '${inputFromContents.type}' from contents.`);
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
						console.warn('riveInstance.contents or riveInstance.contents.artboards is not available for parsing SM inputs.');
					}
					currentArtboardEntry.stateMachines.push(smInfo);
				}
			}

			// --- Collect Global Enum Definitions ---
			if (typeof riveInstance.enums === 'function') {
				try {
					result.globalEnums = riveInstance.enums();
				} catch (e) {
					console.error('Error calling riveInstance.enums():', e);
					result.globalEnums = 'ERROR_CALLING_riveInstance.enums';
				}
			} else if (riveFile && typeof riveFile.enums === 'function') {
				try {
					result.globalEnums = riveFile.enums();
				} catch (e) {
					console.error('Error calling riveFile.enums():', e);
					result.globalEnums = 'ERROR_CALLING_riveFile.enums';
				}
			} else {
				result.globalEnums = 'COULD_NOT_RETRIEVE_GLOBAL_ENUMS_NO_METHOD';
			}

			console.log('Final Parsed Rive file structure:', JSON.parse(JSON.stringify(result)));
			ws.send(JSON.stringify(result));
		},
		onError: (err) => {
			console.error('Error loading Rive file:', err);
			ws.send(JSON.stringify({ error: err.toString() }));
		},
	});
});
