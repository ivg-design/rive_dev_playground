/**
 * @file dataToControlConnector.js
 * Bridge module that processes parser.js output into a structured format that
 * the riveControlInterface.js can use to build UI controls with proper connections.
 */

import { createLogger } from '../utils/debugger/debugLogger.js';

// Create a logger for this module
const logger = createLogger('dataConnector');

/**
 * Debug helper to test if VM property binding is working correctly
 * @param {Object} vmInstance - The viewModel instance to test
 * @param {string} propertyName - Optional property name to test, or will find the first available
 * @returns {boolean} True if binding appears to be working
 */
function debugTestVMBinding(vmInstance, propertyName = null) {
	if (!vmInstance) {
		logger.error('Cannot test VM binding: No VM instance provided');
		return false;
	}

	logger.trace('==== VM BINDING TEST ====');
	logger.trace(`Testing VM binding on instance:`, vmInstance);

	// Get VM properties
	if (!vmInstance.properties || !Array.isArray(vmInstance.properties)) {
		logger.error('Cannot test VM binding: VM has no properties array');
		return false;
	}

	// Find a property to test (preferably a simple one like boolean or number)
	let testProperty = null;
	let liveProperty = null;

	if (propertyName) {
		// If specific property was requested, try to find it
		testProperty = vmInstance.properties.find((p) => p.name === propertyName && (p.type === 'boolean' || p.type === 'number' || p.type === 'string'));
	} else {
		// Otherwise find the first suitable property
		testProperty = vmInstance.properties.find((p) => (p.type === 'boolean' || p.type === 'number' || p.type === 'string') && p.type !== 'viewModel');
	}

	if (!testProperty) {
		logger.error('Cannot test VM binding: No suitable property found');
		return false;
	}

	logger.trace(`Selected test property: ${testProperty.name} (${testProperty.type})`);

	// Get the live property based on type
	try {
		switch (testProperty.type) {
			case 'boolean':
				liveProperty = vmInstance.boolean(testProperty.name);
				break;
			case 'number':
				liveProperty = vmInstance.number(testProperty.name);
				break;
			case 'string':
				liveProperty = vmInstance.string(testProperty.name);
				break;
			default:
				logger.error(`Cannot test property type: ${testProperty.type}`);
				return false;
		}
	} catch (e) {
		logger.error(`Error accessing property ${testProperty.name}:`, e);
		return false;
	}

	if (!liveProperty) {
		logger.error(`Could not get live property for ${testProperty.name}`);
		return false;
	}

	// Save original value
	const originalValue = liveProperty.value;
	logger.trace(`Original value: ${originalValue}`);

	// Try to modify the value
	try {
		let newValue;
		switch (testProperty.type) {
			case 'boolean':
				newValue = !originalValue;
				break;
			case 'number':
				newValue = (originalValue || 0) + 1;
				break;
			case 'string':
				newValue = (originalValue || '') + '_test';
				break;
		}

		logger.trace(`Setting new value: ${newValue}`);
		// Direct property assignment like in exampleIndex.mjs - no draw() calls
		liveProperty.value = newValue;

		// Verify change was accepted
		logger.trace(`Reading value after change: ${liveProperty.value}`);
		const changeWorked = liveProperty.value === newValue;

		if (changeWorked) {
			logger.trace('✅ VM binding TEST PASSED - Property accepts changes');
		} else {
			logger.error('❌ VM binding TEST FAILED - Property does not accept changes');
		}

		// Restore original value
		liveProperty.value = originalValue;
		logger.trace(`Restored original value: ${originalValue}`);
		logger.trace('==== VM BINDING TEST COMPLETE ====');

		return changeWorked;
	} catch (e) {
		logger.error(`Error modifying property ${testProperty.name}:`, e);
		logger.trace('==== VM BINDING TEST FAILED ====');
		return false;
	}
}

/**
 * Process parsed data into an organized structure optimized for UI controls.
 * This eliminates duplicated lookups and provides a clean structure for the UI builder.
 *
 * @param {Object} parsedData - The data structure from parser.js
 * @param {Object} riveInstance - The live Rive instance from the WebGL2 runtime
 * @return {Object} Structure optimized for control UI creation
 */
export function processDataForControls(parsedData, riveInstance) {
	if (!parsedData || !riveInstance) {
		logger.error('Missing parsed data or Rive instance');
		return null;
	}

	logger.info('Processing parsed data for UI controls');

	// Get active/default elements
	const defaultElements = parsedData.defaultElements || {};
	const activeArtboardName = defaultElements.artboardName || (riveInstance.artboard ? riveInstance.artboard.name : null);
	const activeStateMachineNames = defaultElements.stateMachineNames || riveInstance.stateMachines || [];
	const activeViewModelName = defaultElements.viewModelName;

	logger.info(`Active artboard: ${activeArtboardName}`);
	logger.info(`Active state machines: ${activeStateMachineNames.join(', ')}`);
	logger.info(`Active viewModel: ${activeViewModelName}`);

	// Structure for StateMachine controls with live input references
	const stateMachineControls = [];

	// Process state machines and gather their inputs
	if (activeStateMachineNames && activeStateMachineNames.length > 0) {
		activeStateMachineNames.forEach((smName) => {
			if (!smName) return;

			try {
				// Get direct reference to live inputs for this state machine
				const liveInputs = typeof riveInstance.stateMachineInputs === 'function' ? riveInstance.stateMachineInputs(smName) : [];

				if (liveInputs && liveInputs.length > 0) {
					// Find matching SM in parsed data for reference
					const parsedSM = findStateMachineInParsedData(parsedData, activeArtboardName, smName);

					const controlsForSM = {
						name: smName,
						isActive: true,
						inputs: liveInputs.map((input) => ({
							name: input.name,
							type: input.type,
							liveInput: input, // Direct reference to the live input
							// Include any additional parsed info if available
							parsedInfo: parsedSM ? parsedSM.inputs.find((i) => i.name === input.name) : null,
						})),
					};

					stateMachineControls.push(controlsForSM);
				}
			} catch (e) {
				logger.error(`Error processing state machine '${smName}':`, e);
			}
		});
	}

	// Structure for ViewModel controls with direct live property references
	const viewModelControls = [];

	// CRITICAL PART: Get the main ViewModel instance that's bound to the animation
	// First priority: Use the direct viewModelInstance from riveInstance like in exampleIndex.mjs
	let mainViewModelInstance = null;

	if (riveInstance.viewModelInstance) {
		logger.info('Found primary ViewModel via riveInstance.viewModelInstance (like exampleIndex.mjs)');
		mainViewModelInstance = riveInstance.viewModelInstance;
	} else if (activeArtboardName && riveInstance[activeArtboardName]) {
		// Try via artboard name pattern
		logger.info(`Found ViewModel via riveInstance["${activeArtboardName}"]`);
		mainViewModelInstance = riveInstance[activeArtboardName];
	} else if (riveInstance.artboard && riveInstance.artboard.defaultViewModel) {
		// Try via artboard.defaultViewModel() if available
		try {
			const vmDef = riveInstance.artboard.defaultViewModel();
			if (vmDef && typeof vmDef.defaultInstance === 'function') {
				mainViewModelInstance = vmDef.defaultInstance();
				logger.info('Found ViewModel via artboard.defaultViewModel().defaultInstance()');
			}
		} catch (e) {
			logger.warn('Error getting ViewModel via artboard.defaultViewModel():', e);
		}
	} else if (typeof riveInstance.defaultViewModel === 'function') {
		// Fallback to defaultViewModel() pattern
		try {
			const vmDef = riveInstance.defaultViewModel();
			logger.debug('Got VM definition from defaultViewModel()', vmDef);

			if (vmDef) {
				if (typeof vmDef.defaultInstance === 'function') {
					mainViewModelInstance = vmDef.defaultInstance();
					logger.info('Got VM from defaultViewModel().defaultInstance()');
				} else if (vmDef.instanceCount > 0 && typeof vmDef.getInstance === 'function') {
					mainViewModelInstance = vmDef.getInstance(0);
					logger.info('Got VM from defaultViewModel().getInstance(0)');
				}
			}
		} catch (e) {
			logger.warn('Error trying to get VM via defaultViewModel():', e);
		}
	}

	if (mainViewModelInstance) {
		logger.info('Successfully found ViewModel instance:', mainViewModelInstance);

		// TEST ViewModel BINDING
		const bindingResult = debugTestVMBinding(mainViewModelInstance);
		if (!bindingResult) {
			logger.warn('🚨 ViewModel binding test FAILED - Controls may not update the animation!');
		} else {
			logger.info('✅ ViewModel binding test PASSED - Controls should update the animation');

			// Log but don't directly modify key properties for reference
			try {
				// Look for Pills Active property
				if (mainViewModelInstance.properties.some((p) => p.name === 'Pills Active')) {
					const prop = mainViewModelInstance.boolean('Pills Active');
					logger.info(`Current 'Pills Active' value: ${prop.value}`);
				}

				// Look for Pills In property
				if (mainViewModelInstance.properties.some((p) => p.name === 'Pills In')) {
					const prop = mainViewModelInstance.boolean('Pills In');
					logger.info(`Current 'Pills In' value: ${prop.value}`);
				}

				// Add window helper for the main instance without any sync/monitoring
				window.vm = mainViewModelInstance;
				logger.info('ViewModel instance exposed as window.vm for console debugging');
			} catch (e) {
				logger.warn('Error accessing key properties:', e);
			}
		}

		// Create main VM entry for UI controls
		const mainVmInfo = {
			instanceName: activeViewModelName || 'Instance',
			blueprintName: activeViewModelName || mainViewModelInstance.name || 'Unknown',
			liveInstance: mainViewModelInstance,
			properties: [],
			nestedViewModels: [],
		};

		// Get direct properties following the exampleIndex.mjs pattern
		if (mainViewModelInstance.properties && Array.isArray(mainViewModelInstance.properties)) {
			logger.debug(`Processing ${mainViewModelInstance.properties.length} properties on main VM`);

			// Process direct properties first (non-viewModel types)
			mainViewModelInstance.properties.forEach((prop) => {
				if (prop.type === 'viewModel') return; // Skip nested VMs for now

				try {
					// Direct property access just like in exampleIndex.mjs
					let vmProperty = null;

					switch (prop.type) {
						case 'boolean':
							vmProperty = mainViewModelInstance.boolean(prop.name);
							break;
						case 'number':
							vmProperty = mainViewModelInstance.number(prop.name);
							break;
						case 'string':
							vmProperty = mainViewModelInstance.string(prop.name);
							break;
						case 'color':
							vmProperty = mainViewModelInstance.color(prop.name);
							break;
						case 'enumType':
							vmProperty = mainViewModelInstance.enum ? mainViewModelInstance.enum(prop.name) : mainViewModelInstance.string(prop.name);
							break;
						case 'trigger':
							// Special handling for triggers if needed
							try {
								if (typeof mainViewModelInstance.trigger === 'function') {
									vmProperty = mainViewModelInstance.trigger(prop.name);
								}
							} catch (e) {
								logger.warn(`Trigger property access error for ${prop.name}:`, e);
							}
							break;
					}

					if (vmProperty) {
						const propertyEntry = {
							name: prop.name,
							type: prop.type, // This is Rive's type for the property kind
							liveProperty: vmProperty
						};
						if (prop.type === 'enumType') {
							const parsedVmBlueprint = findViewModelInParsedData(parsedData, activeArtboardName, mainViewModelInstance.name);
							if (parsedVmBlueprint && parsedVmBlueprint.inputs) {
								const parsedInputInfo = parsedVmBlueprint.inputs.find(inp => inp.name === prop.name);
								if (parsedInputInfo && parsedInputInfo.enumTypeName) {
									propertyEntry.enumTypeName = parsedInputInfo.enumTypeName;
									logger.trace(`[dataConnector] Main VM prop '${prop.name}': Using enumTypeName '${parsedInputInfo.enumTypeName}' from parser data.`);
									logger.debug(`[dataConnector] Main VM prop '${prop.name}': Set enumTypeName to '${parsedInputInfo.enumTypeName}'`);
								} else {
									logger.warn(`[dataConnector] Main VM prop '${prop.name}': Did not find enumTypeName in parsed data for blueprint '${mainViewModelInstance.name}'. UI will use property name as fallback for enum list.`);
									logger.debug(`[dataConnector] Main VM prop '${prop.name}': No enumTypeName found, using property name '${prop.name}' as fallback`);
									logger.debug(`[dataConnector] parsedInputInfo:`, parsedInputInfo);
									// Fallback: let createControlForProperty use prop.name for lookup
									propertyEntry.enumTypeName = prop.name; 
								}
							} else {
								logger.warn(`[dataConnector] Main VM prop '${prop.name}': Could not find parsed VM blueprint '${mainViewModelInstance.name}' or its inputs to get enumTypeName. UI will use property name as fallback.`);
								propertyEntry.enumTypeName = prop.name; 
							}
						}
						mainVmInfo.properties.push(propertyEntry);
						// logger.debug(`Added main VM property: ${prop.name} (${prop.type})`); // Already a debug log
					}
				} catch (e) {
					logger.warn(`Error accessing property ${prop.name}:`, e);
				}
			});

			// Now process nested ViewModels
			const nestedVmProps = mainViewModelInstance.properties.filter((p) => p.type === 'viewModel');
			logger.debug(`Found ${nestedVmProps.length} nested VM properties`);

			nestedVmProps.forEach((vmProp) => {
				try {
					// Direct access to nested VM like in exampleIndex.mjs
					const nestedVmInstance = mainViewModelInstance.viewModel(vmProp.name);

					if (nestedVmInstance) {
						logger.debug(`Processing nested VM: ${vmProp.name}`);

						// Test binding for this nested VM too
						debugTestVMBinding(nestedVmInstance);

						// Build nested VM controls recursively
						const nestedVmInfo = buildNestedVMControls(nestedVmInstance, vmProp.name, parsedData);

						if (nestedVmInfo) {
							mainVmInfo.nestedViewModels.push(nestedVmInfo);
						}
					}
				} catch (e) {
					logger.warn(`Error accessing nested VM ${vmProp.name}:`, e);
				}
			});
		}

		viewModelControls.push(mainVmInfo);
	} else {
		logger.warn('No main ViewModel instance found - using placeholders');

		// Fallback to placeholder structure from parsed data
		if (parsedData && parsedData.artboards) {
			const artboard = parsedData.artboards.find((a) => a.name === activeArtboardName);
			if (artboard && artboard.viewModels && artboard.viewModels.length > 0) {
				const mainVM = artboard.viewModels[0];

				if (mainVM) {
					// Create a placeholder structure with isPlaceholder flag
					const placeholderInfo = {
						instanceName: mainVM.instanceName || 'Instance',
						blueprintName: mainVM.sourceBlueprintName || activeViewModelName || 'Unknown',
						liveInstance: null,
						properties: [],
						nestedViewModels: [],
						isPlaceholder: true,
					};

					// Add properties from parsed data
					if (mainVM.inputs && mainVM.inputs.length > 0) {
						mainVM.inputs.forEach((input) => {
							placeholderInfo.properties.push({
								name: input.name,
								type: input.type,
								value: input.value,
								isPlaceholder: true,
							});
						});
					}

					// Add nested VMs from parsed data
					if (mainVM.nestedViewModels && mainVM.nestedViewModels.length > 0) {
						mainVM.nestedViewModels.forEach((nestedVM) => {
							placeholderInfo.nestedViewModels.push({
								instanceName: nestedVM.instanceName,
								blueprintName: nestedVM.sourceBlueprintName,
								properties: (nestedVM.inputs || []).map((input) => ({
									name: input.name,
									type: input.type,
									value: input.value,
									isPlaceholder: true,
								})),
								nestedViewModels: [],
								isPlaceholder: true,
							});
						});
					}

					viewModelControls.push(placeholderInfo);
				}
			}
		}
	}

	logger.info(`Final viewModelControls structure has ${viewModelControls.length} entries`);


			// IMPORTANT: Move the default ViewModel name log to be the absolute last thing
		if (mainViewModelInstance) {
        const vmName = mainViewModelInstance.name || ' ';
        console.dir(mainViewModelInstance)
		const vmSourceInfo = activeViewModelName || 'Default Instance';
		// Add timeout to ensure this is the absolute last log (with longer delay)
		setTimeout(() => {
			// Optional: Clear console to make this the only visible output
			// Only uncomment if you want to clear everything else
			// console.clear();
			// Clear and prominent log for the default ViewModel name
			logger.info('\n===============================================');
			logger.info(`🔍 DEFAULT VIEWMODEL: ${vmName} (${vmSourceInfo})`);
			logger.info('===============================================');
			const allEnums = riveInstance.enums();
			logger.info('🔍 ALL ENUM DEFINITIONS:', allEnums);
			if (allEnums && allEnums.length > 0) {
				allEnums.forEach((enumDef, index) => {
					logger.info(`🔍 Enum ${index + 1}: Name='${enumDef.name}', Values:`, enumDef.values);
				});
			}
			logger.info('===============================================\n');

		}, 100);
	}

	return {
		activeArtboardName,
		activeStateMachineNames,
		activeViewModelName,
		stateMachineControls,
		viewModelControls,
	};
}

/**
 * Recursively build nested VM controls following the exampleIndex.mjs pattern
 */
function buildNestedVMControls(vmInstance, instanceName, parsedData) {
	if (!vmInstance) return null;

	const result = {
		instanceName: instanceName,
		blueprintName: vmInstance.name || instanceName,
		liveInstance: vmInstance,
		properties: [],
		nestedViewModels: [],
	};

	// Direct property access like in exampleIndex.mjs
	if (vmInstance.properties && Array.isArray(vmInstance.properties)) {
		logger.debug(`[buildNestedVMControls] VM '${instanceName}' has ${vmInstance.properties.length} properties`);
		logger.debug(`[buildNestedVMControls] VM '${instanceName}' available methods:`, {
			hasEnum: typeof vmInstance.enum === 'function',
			hasString: typeof vmInstance.string === 'function',
			hasBoolean: typeof vmInstance.boolean === 'function',
			hasNumber: typeof vmInstance.number === 'function',
			hasColor: typeof vmInstance.color === 'function',
			hasTrigger: typeof vmInstance.trigger === 'function'
		});
		
		// Process regular properties
		vmInstance.properties.forEach((prop) => {
			if (prop.type === 'viewModel') return; // Skip nested VMs for now

			try {
				let liveProperty = null;

				logger.debug(`[buildNestedVMControls] Processing property '${prop.name}' of type '${prop.type}' in VM '${instanceName}'`);

				switch (prop.type) {
					case 'boolean':
						liveProperty = vmInstance.boolean(prop.name);
						break;
					case 'number':
						liveProperty = vmInstance.number(prop.name);
						break;
					case 'string':
						liveProperty = vmInstance.string(prop.name);
						break;
					case 'color':
						liveProperty = vmInstance.color(prop.name);
						break;
					case 'enumType':
						logger.debug(`[buildNestedVMControls] Attempting to access enum property '${prop.name}' via vmInstance.enum()`);
						if (typeof vmInstance.enum === 'function') {
							try {
								liveProperty = vmInstance.enum(prop.name);
								logger.debug(`[buildNestedVMControls] Successfully got enum property '${prop.name}':`, liveProperty);
							} catch (e) {
								logger.warn(`[buildNestedVMControls] Error accessing enum property '${prop.name}' via vmInstance.enum():`, e);
								// Fallback to string method
								if (typeof vmInstance.string === 'function') {
									try {
										liveProperty = vmInstance.string(prop.name);
										logger.debug(`[buildNestedVMControls] Fallback: got enum property '${prop.name}' via string():`, liveProperty);
									} catch (e2) {
										logger.error(`[buildNestedVMControls] Fallback also failed for '${prop.name}':`, e2);
									}
								}
							}
						} else {
							logger.warn(`[buildNestedVMControls] vmInstance.enum is not a function for property '${prop.name}', trying string fallback`);
							liveProperty = vmInstance.string ? vmInstance.string(prop.name) : null;
						}
						break;
					case 'trigger':
						if (typeof vmInstance.trigger === 'function') {
							liveProperty = vmInstance.trigger(prop.name);
						}
						break;
				}

				if (liveProperty) {
					logger.debug(`[buildNestedVMControls] Successfully created liveProperty for '${prop.name}' in VM '${instanceName}'`);
					const nestedPropEntry = {
						name: prop.name,
						type: prop.type,
						liveProperty: liveProperty
					};
					if (prop.type === 'enumType') {
						let parsedVmBlueprint = null;
						if (parsedData && parsedData.allViewModelDefinitionsAndInstances && vmInstance.name) {
							const foundVmDef = parsedData.allViewModelDefinitionsAndInstances.find(def => def.blueprintName === vmInstance.name);
							// The `inputs` we need were stored under `blueprintProperties` by the parser for the definition
							if (foundVmDef) parsedVmBlueprint = { name: foundVmDef.blueprintName, inputs: foundVmDef.blueprintProperties }; 
						}

						if (parsedVmBlueprint && parsedVmBlueprint.inputs) {
							const parsedInputInfo = parsedVmBlueprint.inputs.find(inp => inp.name === prop.name);
							if (parsedInputInfo && parsedInputInfo.enumTypeName) {
								nestedPropEntry.enumTypeName = parsedInputInfo.enumTypeName;
								logger.trace(`[dataConnector] Nested VM prop '${instanceName}.${prop.name}': Using enumTypeName '${parsedInputInfo.enumTypeName}' from parser data (blueprint: ${vmInstance.name}).`);
							} else {
								logger.warn(`[dataConnector] Nested VM prop '${instanceName}.${prop.name}': Did not find enumTypeName in parsed data for blueprint '${vmInstance.name}'. UI will use property name as fallback.`);
								nestedPropEntry.enumTypeName = prop.name; 
							}
						} else {
							 logger.warn(`[dataConnector] Nested VM prop '${instanceName}.${prop.name}': Could not find parsed blueprint definition '${vmInstance.name}' or its properties. UI will use property name as fallback.`);
							 nestedPropEntry.enumTypeName = prop.name; 
						}
					}
					result.properties.push(nestedPropEntry);
					logger.debug(`[buildNestedVMControls] Added nested property ${instanceName}.${prop.name} (${prop.type}) to result`);
				} else {
					logger.warn(`[buildNestedVMControls] Failed to get liveProperty for '${prop.name}' in VM '${instanceName}' - property will be skipped`);
				}
			} catch (e) {
				logger.warn(`[buildNestedVMControls] Error accessing nested property ${prop.name}:`, e);
			}
		});

		// Process deeper nested ViewModels
		const nestedVmProps = vmInstance.properties.filter((p) => p.type === 'viewModel');
		if (nestedVmProps.length > 0) {
			logger.trace(`Found ${nestedVmProps.length} deeper nested VMs in ${instanceName}`);

			nestedVmProps.forEach((vmProp) => {
				try {
					const deeperVmInstance = vmInstance.viewModel(vmProp.name);
					if (deeperVmInstance) {
						const deeperVmInfo = buildNestedVMControls(deeperVmInstance, vmProp.name, parsedData);
						if (deeperVmInfo) {
							result.nestedViewModels.push(deeperVmInfo);
						}
					}
				} catch (e) {
					logger.warn(`Error processing deeper nested VM ${vmProp.name}:`, e);
				}
			});
		}
	}

	return result;
}

/**
 * Find a specific state machine within the parsed data structure.
 */
function findStateMachineInParsedData(parsedData, artboardName, stateMachineName) {
	if (!parsedData || !parsedData.artboards || !artboardName || !stateMachineName) return null;

	const artboard = parsedData.artboards.find((ab) => ab.name === artboardName);
	if (!artboard || !artboard.stateMachines) return null;

	return artboard.stateMachines.find((sm) => sm.name === stateMachineName);
}

/**
 * Find a specific ViewModel within the parsed data structure.
 *
 * @param {Object} parsedData - The parsed data from parser.js
 * @param {string} artboardName - The artboard name to look in
 * @param {string} viewModelName - The ViewModel blueprint name to find
 * @return {Object|null} The ViewModel data or null if not found
 */
function findViewModelInParsedData(parsedData, artboardName, viewModelName) {
	if (!parsedData || !parsedData.artboards || !artboardName) return null;

	const artboard = parsedData.artboards.find((ab) => ab.name === artboardName);
	if (!artboard || !artboard.viewModels) return null;

	// If viewModelName is provided, find the specific VM with that blueprint name
	if (viewModelName) {
		return artboard.viewModels.find((vm) => vm.sourceBlueprintName === viewModelName);
	}

	// Otherwise, return the first ViewModel (usually there's just one)
	return artboard.viewModels[0];
}
