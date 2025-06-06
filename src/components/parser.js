/**
 * @file parser.js
 * Handles the client-side parsing of Rive files to extract animation, artboard, asset, and ViewModel information.
 */

/**
 * Recursively parses a ViewModel instance to extract its properties and nested ViewModels
 * This function safely handles enum properties and other complex structures that might cause WASM aborts
 * @param {object} vmInstance - The ViewModel instance to parse
 * @param {string} instanceName - The name of the instance
 * @param {object} vmDefinition - The ViewModel definition/blueprint
 * @returns {object} Parsed ViewModel instance data
 */
function parseViewModelInstanceRecursive(vmInstance, instanceName, vmDefinition) {
	// Use window.parserLogger if available, otherwise fallback to console
	const logger = window.parserLogger || console;
	const logPrefix = window.parserLogger ? "" : "[parseViewModelInstanceRecursive] ";
	
	logger.debug(logPrefix + `Starting recursive parsing of ViewModel instance: ${instanceName}`);
	
	const result = {
		instanceName: instanceName,
		sourceBlueprintName: vmDefinition ? vmDefinition.name : "Unknown",
		inputs: [],
		nestedViewModels: [],
	};

	if (!vmInstance) {
		logger.warn(logPrefix + `ViewModel instance is null for ${instanceName}`);
		return result;
	}

	try {
		// Safely get properties with comprehensive error handling
		let properties = [];
		try {
			if (vmInstance.properties && Array.isArray(vmInstance.properties)) {
				properties = vmInstance.properties;
				logger.debug(logPrefix + `Found ${properties.length} properties on ${instanceName}`);
			} else if (typeof vmInstance.getProperties === "function") {
				properties = vmInstance.getProperties();
				logger.debug(logPrefix + `Retrieved ${properties.length} properties via getProperties() for ${instanceName}`);
			} else {
				logger.warn(logPrefix + `No properties found on ViewModel instance ${instanceName}`);
			}
		} catch (propertiesError) {
			logger.error(logPrefix + `Error accessing properties for ${instanceName}:`, propertiesError);
			// Continue with empty properties array
		}

		// Process each property with individual error handling
		for (let i = 0; i < properties.length; i++) {
			const prop = properties[i];
			if (!prop || !prop.name) {
				logger.warn(logPrefix + `Property ${i} is invalid for ${instanceName}`);
				continue;
			}

			logger.debug(logPrefix + `Processing property ${prop.name} (type: ${prop.type}) for ${instanceName}`);

			try {
				// Handle different property types with specific error handling
				if (prop.type === "viewModel") {
					// Handle nested ViewModels
					try {
						logger.debug(logPrefix + `Attempting to access nested ViewModel: ${prop.name}`);
						
						let nestedVmInstance = null;
						if (typeof vmInstance.viewModel === "function") {
							nestedVmInstance = vmInstance.viewModel(prop.name);
						} else if (vmInstance[prop.name] && typeof vmInstance[prop.name] === "object") {
							nestedVmInstance = vmInstance[prop.name];
						}

						if (nestedVmInstance) {
							logger.debug(logPrefix + `Successfully accessed nested ViewModel: ${prop.name}`);
							
							// Recursively parse nested ViewModel with error boundary
							try {
								const nestedResult = parseViewModelInstanceRecursive(
									nestedVmInstance,
									prop.name,
									null // We don't have the nested definition
								);
								result.nestedViewModels.push(nestedResult);
								logger.debug(logPrefix + `Successfully parsed nested ViewModel: ${prop.name}`);
							} catch (nestedParseError) {
								logger.error(logPrefix + `Error parsing nested ViewModel ${prop.name}:`, nestedParseError);
								// Add placeholder for failed nested ViewModel
								result.nestedViewModels.push({
									instanceName: prop.name,
									sourceBlueprintName: "ParseError",
									inputs: [],
									nestedViewModels: [],
									error: nestedParseError.message
								});
							}
						} else {
							logger.warn(logPrefix + `Could not access nested ViewModel: ${prop.name}`);
						}
					} catch (nestedVmError) {
						logger.error(logPrefix + `Error accessing nested ViewModel ${prop.name}:`, nestedVmError);
					}
				} else {
					// Handle regular properties (non-viewModel types)
					const inputEntry = {
						name: prop.name,
						type: prop.type,
						value: null,
						enumTypeName: null,
						enumValues: [],
					};

					try {
						// Safely get property value based on type
						switch (prop.type) {
							case "boolean":
								try {
									if (typeof vmInstance.boolean === "function") {
										const boolProp = vmInstance.boolean(prop.name);
										inputEntry.value = boolProp ? boolProp.value : null;
									}
								} catch (boolError) {
									logger.warn(logPrefix + `Error accessing boolean property ${prop.name}:`, boolError);
								}
								break;

							case "number":
								try {
									if (typeof vmInstance.number === "function") {
										const numProp = vmInstance.number(prop.name);
										inputEntry.value = numProp ? numProp.value : null;
									}
								} catch (numError) {
									logger.warn(logPrefix + `Error accessing number property ${prop.name}:`, numError);
								}
								break;

							case "string":
								try {
									if (typeof vmInstance.string === "function") {
										const stringProp = vmInstance.string(prop.name);
										inputEntry.value = stringProp ? stringProp.value : null;
									}
								} catch (stringError) {
									logger.warn(logPrefix + `Error accessing string property ${prop.name}:`, stringError);
								}
								break;

							case "color":
								try {
									if (typeof vmInstance.color === "function") {
										const colorProp = vmInstance.color(prop.name);
										inputEntry.value = colorProp ? colorProp.value : null;
									}
								} catch (colorError) {
									logger.warn(logPrefix + `Error accessing color property ${prop.name}:`, colorError);
								}
								break;

							case "enumType":
								// CRITICAL: This is where WASM aborts often occur with newer files
								logger.debug(logPrefix + `CRITICAL: Attempting to access enum property ${prop.name} - this may cause WASM abort`);
								
								try {
									// Try multiple approaches to safely access enum properties
									let enumProp = null;
									let enumValues = [];
									
									// Approach 1: Direct enum access
									if (typeof vmInstance.enum === "function") {
										try {
											enumProp = vmInstance.enum(prop.name);
											if (enumProp) {
												inputEntry.value = enumProp.value;
												if (enumProp.values && Array.isArray(enumProp.values)) {
													enumValues = [...enumProp.values];
												}
												logger.debug(logPrefix + `Successfully accessed enum ${prop.name} via enum() method`);
											}
										} catch (enumDirectError) {
											// Use WASM-specific error logging
											if (logger.wasmError) {
												logger.wasmError(enumDirectError, {
													operation: 'enum_access',
													propertyName: prop.name,
													instanceName: instanceName,
													approach: 'direct_enum_access'
												});
											} else {
												logger.warn(logPrefix + `Direct enum access failed for ${prop.name}:`, enumDirectError);
											}
											
											// Approach 2: Fallback to string access
											try {
												if (typeof vmInstance.string === "function") {
													const stringFallback = vmInstance.string(prop.name);
													if (stringFallback) {
														inputEntry.value = stringFallback.value;
														logger.debug(logPrefix + `Fallback: accessed enum ${prop.name} via string() method`);
													}
												}
											} catch (stringFallbackError) {
												if (logger.wasmError) {
													logger.wasmError(stringFallbackError, {
														operation: 'enum_access',
														propertyName: prop.name,
														instanceName: instanceName,
														approach: 'string_fallback'
													});
												} else {
													logger.error(logPrefix + `Both enum and string access failed for ${prop.name}:`, stringFallbackError);
												}
											}
										}
									} else {
										logger.warn(logPrefix + `enum() method not available for ${prop.name}, trying string fallback`);
										
										// Direct fallback to string if enum method doesn't exist
										try {
											if (typeof vmInstance.string === "function") {
												const stringProp = vmInstance.string(prop.name);
												inputEntry.value = stringProp ? stringProp.value : null;
											}
										} catch (stringError) {
											if (logger.wasmError) {
												logger.wasmError(stringError, {
													operation: 'enum_access',
													propertyName: prop.name,
													instanceName: instanceName,
													approach: 'string_only'
												});
											} else {
												logger.error(logPrefix + `String fallback failed for enum ${prop.name}:`, stringError);
											}
										}
									}

									// Try to determine enum type name from property declaration
									try {
										if (prop.enumDefinition && prop.enumDefinition.name) {
											inputEntry.enumTypeName = prop.enumDefinition.name;
										} else if (prop.enumName) {
											inputEntry.enumTypeName = prop.enumName;
										} else if (prop.definition && prop.definition.name) {
											inputEntry.enumTypeName = prop.definition.name;
										} else if (prop.typeName) {
											inputEntry.enumTypeName = prop.typeName;
										} else {
											// Fallback to property name
											inputEntry.enumTypeName = prop.name;
											logger.warn(logPrefix + `Could not determine enum type name for ${prop.name}, using property name as fallback`);
										}
									} catch (enumTypeError) {
										if (logger.wasmError) {
											logger.wasmError(enumTypeError, {
												operation: 'enum_access',
												propertyName: prop.name,
												instanceName: instanceName,
												approach: 'type_name_detection'
											});
										} else {
											logger.error(logPrefix + `Error determining enum type for ${prop.name}:`, enumTypeError);
										}
										inputEntry.enumTypeName = prop.name;
									}

									inputEntry.enumValues = enumValues;
									
									logger.debug(logPrefix + `Completed enum property processing for ${prop.name}`);
									
								} catch (enumCriticalError) {
									// Use enhanced WASM error logging for critical errors
									if (logger.wasmError) {
										logger.wasmError(enumCriticalError, {
											operation: 'enum_access',
											propertyName: prop.name,
											instanceName: instanceName,
											approach: 'critical_failure',
											vmDefinition: vmDefinition ? vmDefinition.name : 'unknown'
										});
									} else {
										logger.error(logPrefix + `CRITICAL ERROR processing enum property ${prop.name}:`, enumCriticalError);
									}
									
									// This might be where the WASM abort occurs - provide safe fallback
									inputEntry.value = null;
									inputEntry.enumTypeName = prop.name;
									inputEntry.enumValues = [];
									inputEntry.error = enumCriticalError.message;
								}
								break;

							case "trigger":
								try {
									if (typeof vmInstance.trigger === "function") {
										const triggerProp = vmInstance.trigger(prop.name);
										// Triggers don't have values, just existence
										inputEntry.value = triggerProp ? true : false;
									}
								} catch (triggerError) {
									logger.warn(logPrefix + `Error accessing trigger property ${prop.name}:`, triggerError);
								}
								break;

							default:
								logger.warn(logPrefix + `Unknown property type ${prop.type} for ${prop.name}`);
								break;
						}
					} catch (propertyAccessError) {
						logger.error(logPrefix + `Error accessing property ${prop.name} of type ${prop.type}:`, propertyAccessError);
						inputEntry.error = propertyAccessError.message;
					}

					result.inputs.push(inputEntry);
					logger.debug(logPrefix + `Added property ${prop.name} to inputs`);
				}
			} catch (propError) {
				logger.error(logPrefix + `Error processing property ${prop.name}:`, propError);
				// Add error entry to maintain structure
				result.inputs.push({
					name: prop.name,
					type: prop.type || "unknown",
					value: null,
					error: propError.message
				});
			}
		}

		logger.debug(logPrefix + `Completed parsing ${instanceName}: ${result.inputs.length} inputs, ${result.nestedViewModels.length} nested VMs`);
		
	} catch (criticalError) {
		logger.error(logPrefix + `CRITICAL ERROR parsing ViewModel instance ${instanceName}:`, criticalError);
		result.error = criticalError.message;
		result.inputs = [];
		result.nestedViewModels = [];
	}

	return result;
}

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
function runOriginalClientParser(
	riveEngine,
	canvasElement,
	riveFilePathFromParam,
	callback,
) {
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
					window.parserLogger.error("Error:", err);
				} else {
					console.error("[Original Parser Fallback CB] Error:", err);
				}
			}
			// if (data) console.log("[Original Parser Fallback CB] Data:", data);
		};

	// Use window.parserLogger if available, otherwise fallback to console
	const logger = window.parserLogger || console;
	const logPrefix = window.parserLogger ? "" : "[Parser Entry] ";

	logger.debug(logPrefix + "riveEngine received:", riveEngine);
	logger.debug(logPrefix + "canvasElement received:", canvasElement);
	logger.debug(
		logPrefix + "riveFilePathFromParam received:",
		riveFilePathFromParam,
	);

	// If riveEngine is not passed, try to use window.rive as a fallback
	const riveToUse = window.rive;
	logger.debug(logPrefix + "riveToUse resolved to:", riveToUse);

	if (!riveToUse) {
		const errorMsg = "Rive runtime not loaded or provided";
		logger.error(logPrefix + errorMsg);
		finalCallback({ error: errorMsg }, null); // Pass null for instance on early error
		return;
	}
	// console.log('[Original Parser] Rive object:', riveToUse); // Optional: keep if useful for user

	const collectedAssets = [];
	// Use the provided file path if available, otherwise use default
	let riveFileToLoad = riveFilePathFromParam || "animations/super_simple.riv";
	logger.info(logPrefix + "Using Rive file:", riveFileToLoad);

	const canvas = canvasElement || document.getElementById("rive-canvas");
	logger.debug(logPrefix + "canvas (final element for Rive):", canvas);
	if (!canvas) {
		const errorMsg =
			"Canvas element 'rive-canvas' not found or not provided.";
		logger.error(logPrefix + errorMsg);
		finalCallback({ error: errorMsg }, null); // Pass null for instance on early error
		return;
	}
	// console.log(`[Original Parser] Using canvas:`, canvas); // Optional
	// console.log(`[Original Parser] Attempting to load Rive file from src: '${riveFileToLoad}'`); // Optional

	// We are using the @rive-app/webgl2 runtime, so it should use WebGL2 by default.

	// --- DEBUGGING RIVE CONSTRUCTOR INPUTS ---
	logger.debug(logPrefix + "About to instantiate Rive. src:", riveFileToLoad);
	logger.debug(logPrefix + "Canvas element:", canvas);
	if (canvas) {
		logger.debug(
			logPrefix + "Canvas clientWidth:",
			canvas.clientWidth,
			"clientHeight:",
			canvas.clientHeight,
			"offsetParent:",
			canvas.offsetParent,
		);
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
			
			// Add comprehensive error handling and diagnostics
			logger.debug(logPrefix + "onLoad callback fired - beginning parsing phase");
			
			try {
				riveInstance.resizeDrawingSurfaceToCanvas(); // need to add  window resize event listener to call this
				logger.debug(logPrefix + "resizeDrawingSurfaceToCanvas() completed successfully");
			} catch (resizeError) {
				logger.error(logPrefix + "Error during resizeDrawingSurfaceToCanvas():", resizeError);
				// Continue parsing even if resize fails
			}

			// Wrap the entire parsing logic in comprehensive error handling
			try {
				logger.debug(logPrefix + "Starting file parsing and data extraction");
				
				// Test basic Rive instance access first
				logger.debug(logPrefix + "Testing basic Rive instance properties...");
				const testBasicAccess = () => {
					try {
						const loaded = riveInstance.loaded;
						const canvas = riveInstance.canvas;
						logger.debug(logPrefix + "Basic access test passed - loaded:", loaded, "canvas:", !!canvas);
						return true;
					} catch (e) {
						logger.error(logPrefix + "Basic access test failed:", e);
						return false;
					}
				};
				
				if (!testBasicAccess()) {
					throw new Error("Failed basic Rive instance access test");
				}

				// Test file access
				logger.debug(logPrefix + "Testing Rive file access...");
				let riveFile = null;
				try {
					riveFile = riveInstance.file;
					if (!riveFile) {
						throw new Error("riveInstance.file is null or undefined");
					}
					logger.debug(logPrefix + "File access successful");
				} catch (fileError) {
					logger.error(logPrefix + "Error accessing riveInstance.file:", fileError);
					throw new Error(`File access failed: ${fileError.message}`);
				}

				// Test artboard access
				logger.debug(logPrefix + "Testing artboard access...");
				let defaultArtboardRiveObject = null;
				try {
					defaultArtboardRiveObject = riveInstance.artboard;
					if (!defaultArtboardRiveObject) {
						logger.warn(logPrefix + "No default artboard found");
					} else {
						logger.debug(logPrefix + "Default artboard access successful:", defaultArtboardRiveObject.name);
					}
				} catch (artboardError) {
					logger.error(logPrefix + "Error accessing artboard:", artboardError);
					// Continue without artboard
				}

				const argbToHex = (a) => {
					if (typeof a !== "number")
						return `NOT_AN_ARGB_NUMBER (${typeof a}: ${a})`;
					return (
						"#" +
						(a & 0xffffff).toString(16).padStart(6, "0").toUpperCase()
					);
				};

				const result = {
					artboards: [],
					assets: collectedAssets,
					allViewModelDefinitionsAndInstances: [],
					enums: [], // Add enums field to store global enum definitions
					// Add a new field to store default information
					defaultElements: {
						artboardName: null,
						stateMachineNames: [],
						viewModelName: null,
					},
				};

				// --- Default Artboard Info ---
				if (defaultArtboardRiveObject) {
					result.defaultElements.artboardName = defaultArtboardRiveObject.name;
					logger.debug(
						logPrefix + `Default artboard name: ${defaultArtboardRiveObject.name}`,
					);
				}

				// --- Default State Machine Info ---
				// Get the default state machine names from the default artboard
				if (defaultArtboardRiveObject) {
					try {
						logger.debug(logPrefix + "Extracting state machine information...");
						const smCount = defaultArtboardRiveObject.stateMachineCount();
						logger.debug(logPrefix + `Found ${smCount} state machines`);
						
						for (let i = 0; i < smCount; i++) {
							try {
								const sm = defaultArtboardRiveObject.stateMachineByIndex(i);
								if (sm && sm.name) {
									result.defaultElements.stateMachineNames.push(sm.name);
									logger.debug(logPrefix + `State machine ${i}: ${sm.name}`);
								}
							} catch (smError) {
								logger.error(logPrefix + `Error accessing state machine ${i}:`, smError);
								// Continue with next state machine
							}
						}
					} catch (smCountError) {
						logger.error(logPrefix + "Error getting state machine count:", smCountError);
					}
				}

				// --- Enum Definitions Parsing ---
				logger.debug(logPrefix + "Starting enum definitions parsing...");
				
				try {
					if (typeof riveInstance.enums === "function") {
						logger.debug(logPrefix + "Attempting to access global enums via riveInstance.enums()...");
						const globalEnums = riveInstance.enums();
						
						if (globalEnums && Array.isArray(globalEnums)) {
							logger.debug(logPrefix + `Found ${globalEnums.length} global enum definitions`);
							
							for (let i = 0; i < globalEnums.length; i++) {
								try {
									const enumDef = globalEnums[i];
									if (enumDef && enumDef.name) {
										const enumEntry = {
											name: enumDef.name,
											values: enumDef.values || []
										};
										
										result.enums.push(enumEntry);
										logger.debug(logPrefix + `Enum ${i}: ${enumDef.name} with ${enumEntry.values.length} values: [${enumEntry.values.join(', ')}]`);
									} else {
										logger.warn(logPrefix + `Enum ${i} has no name or is invalid`);
									}
								} catch (enumError) {
									logger.error(logPrefix + `Error processing enum ${i}:`, enumError);
									// Continue with next enum
								}
							}
						} else {
							logger.warn(logPrefix + "riveInstance.enums() returned null or non-array result");
						}
					} else {
						logger.warn(logPrefix + "riveInstance.enums() method not available");
					}
				} catch (enumParsingError) {
					logger.error(logPrefix + "Error during enum parsing:", enumParsingError);
					// Continue with other parsing - enums are not critical
				}

				// --- ViewModel Definitions Parsing (CRITICAL SECTION) ---
				logger.debug(logPrefix + "Starting ViewModel definitions parsing - CRITICAL SECTION");
				
				const allFoundViewModelDefinitions = [];
				let vmDefinitionCount = 0;
				const MAX_VM_DEFS_TO_PROBE = 10;

				// Test ViewModel access methods safely
				try {
					logger.debug(logPrefix + "Testing ViewModel access methods...");
					
					// Test viewModelCount first
					if (typeof riveInstance.viewModelCount === "function") {
						try {
							vmDefinitionCount = riveInstance.viewModelCount();
							logger.debug(logPrefix + `viewModelCount() returned: ${vmDefinitionCount}`);
						} catch (vmCountError) {
							logger.error(logPrefix + "Error calling viewModelCount():", vmCountError);
							vmDefinitionCount = 0;
						}
					} else {
						logger.warn(logPrefix + "viewModelCount() method not available");
					}

					// Test viewModelByIndex access
					if (typeof riveInstance.viewModelByIndex === "function" && vmDefinitionCount > 0) {
						logger.debug(logPrefix + `Attempting to access ${vmDefinitionCount} ViewModels via viewModelByIndex...`);
						
						for (let vmdIndex = 0; vmdIndex < vmDefinitionCount; vmdIndex++) {
							try {
								logger.debug(logPrefix + `Accessing ViewModel ${vmdIndex}...`);
								const vmDef = riveInstance.viewModelByIndex(vmdIndex);
								
								if (vmDef && vmDef.name) {
									logger.debug(logPrefix + `ViewModel ${vmdIndex} name: ${vmDef.name}`);
									allFoundViewModelDefinitions.push({
										def: vmDef,
										name: vmDef.name,
									});
								} else {
									logger.warn(logPrefix + `ViewModel ${vmdIndex} has no name or is invalid`);
								}
							} catch (vmDefError) {
								logger.error(logPrefix + `CRITICAL ERROR accessing ViewModel ${vmdIndex}:`, vmDefError);
								// This might be where the WASM abort occurs
								throw new Error(`ViewModel access failed at index ${vmdIndex}: ${vmDefError.message}`);
							}
						}
					} else if (riveFile && typeof riveFile.viewModelByIndex === "function") {
						logger.debug(logPrefix + "Falling back to riveFile.viewModelByIndex...");
						// Fallback to riveFile.viewModelByIndex if riveInstance.viewModelByIndex doesn't exist
						// console.warn("[Original Parser] riveInstance.viewModelByIndex() not found. Falling back to riveFile.viewModelByIndex(). Property access might be limited.");
						let consecutiveDefinitionErrors = 0;
						const MAX_CONSECUTIVE_VM_DEF_ERRORS = 3;
						// Reset vmdIndex for this loop, but use vmDefinitionCount if available and reliable, or MAX_VM_DEFS_TO_PROBE
						let loopLimit =
							vmDefinitionCount > 0
								? vmDefinitionCount
								: MAX_VM_DEFS_TO_PROBE;
						let vmdIndex = 0; // reset for this loop
						while (
							vmdIndex < loopLimit &&
							consecutiveDefinitionErrors < MAX_CONSECUTIVE_VM_DEF_ERRORS
						) {
							try {
								logger.debug(logPrefix + `Accessing riveFile ViewModel ${vmdIndex}...`);
								const vmDef = riveFile.viewModelByIndex(vmdIndex);
								if (vmDef && vmDef.name) {
									allFoundViewModelDefinitions.push({
										def: vmDef,
										name: vmDef.name,
									});
									consecutiveDefinitionErrors = 0;
									logger.debug(logPrefix + `riveFile ViewModel ${vmdIndex} name: ${vmDef.name}`);
								} else {
									consecutiveDefinitionErrors++;
									logger.warn(logPrefix + `riveFile ViewModel ${vmdIndex} invalid, consecutive errors: ${consecutiveDefinitionErrors}`);
								}
								vmdIndex++;
							} catch (e) {
								logger.error(
									logPrefix +
										`Error in riveFile.viewModelByIndex loop (index ${vmdIndex}):`,
									e,
								);
								// If one errors, we might not want to continue if count is unreliable
								throw new Error(`riveFile ViewModel access failed at index ${vmdIndex}: ${e.message}`);
							}
						}
					} else {
						logger.error(
							logPrefix +
								"Cannot parse ViewModel definitions: no viewModelByIndex method found on Rive instance or file.",
						);
					}

					logger.debug(logPrefix + `ViewModel definitions parsing completed. Found ${allFoundViewModelDefinitions.length} definitions.`);

				} catch (vmParsingError) {
					logger.error(logPrefix + "CRITICAL ERROR during ViewModel parsing:", vmParsingError);
					// Don't throw here, continue with other parsing
					logger.warn(logPrefix + "Continuing with parsing despite ViewModel error...");
				}

				// --- ViewModel Instances Parsing (ANOTHER CRITICAL SECTION) ---
				logger.debug(logPrefix + "Starting ViewModel instances parsing...");
				
				try {
					// Parse ViewModel instances for each definition found
					for (const vmDefEntry of allFoundViewModelDefinitions) {
						try {
							logger.debug(logPrefix + `Processing ViewModel definition: ${vmDefEntry.name}`);
							
							const vmDef = vmDefEntry.def;
							const vmDefName = vmDefEntry.name;

							// Check if this ViewModel has instances
							let instanceCount = 0;
							try {
								if (typeof vmDef.instanceCount === "number") {
									instanceCount = vmDef.instanceCount;
								} else if (typeof vmDef.instanceCount === "function") {
									instanceCount = vmDef.instanceCount();
								}
								logger.debug(logPrefix + `ViewModel ${vmDefName} has ${instanceCount} instances`);
							} catch (instanceCountError) {
								logger.error(logPrefix + `Error getting instance count for ${vmDefName}:`, instanceCountError);
								continue;
							}

							if (instanceCount > 0) {
								// Process instances for this ViewModel
								for (let instanceIndex = 0; instanceIndex < instanceCount; instanceIndex++) {
									try {
										logger.debug(logPrefix + `Processing instance ${instanceIndex} of ${vmDefName}...`);
										
										let vmInstance = null;
										try {
											vmInstance = vmDef.instanceByIndex(instanceIndex);
										} catch (instanceAccessError) {
											logger.error(logPrefix + `Error accessing instance ${instanceIndex} of ${vmDefName}:`, instanceAccessError);
											continue;
										}

										if (vmInstance) {
											// This is where the recursive parsing might cause issues
											logger.debug(logPrefix + `Parsing instance ${instanceIndex} recursively...`);
											
											try {
												const parsedInstance = parseViewModelInstanceRecursive(
													vmInstance,
													vmInstance.name || `${vmDefName}_instance_${instanceIndex}`,
													vmDef,
												);
												
												result.allViewModelDefinitionsAndInstances.push({
													definitionName: vmDefName,
													instanceName: vmInstance.name || `${vmDefName}_instance_${instanceIndex}`,
													parsedData: parsedInstance,
												});
												
												logger.debug(logPrefix + `Successfully parsed instance ${instanceIndex} of ${vmDefName}`);
											} catch (recursiveParseError) {
												logger.error(logPrefix + `CRITICAL ERROR during recursive parsing of ${vmDefName} instance ${instanceIndex}:`, recursiveParseError);
												// This might be where the WASM abort occurs
												throw new Error(`Recursive parsing failed for ${vmDefName} instance ${instanceIndex}: ${recursiveParseError.message}`);
											}
										}
									} catch (instanceError) {
										logger.error(logPrefix + `Error processing instance ${instanceIndex} of ${vmDefName}:`, instanceError);
										// Continue with next instance
									}
								}
							}
						} catch (vmDefError) {
							logger.error(logPrefix + `Error processing ViewModel definition ${vmDefEntry.name}:`, vmDefError);
							// Continue with next definition
						}
					}
					
					logger.debug(logPrefix + "ViewModel instances parsing completed successfully");
					
				} catch (vmInstancesError) {
					logger.error(logPrefix + "CRITICAL ERROR during ViewModel instances parsing:", vmInstancesError);
					// Continue with other parsing
				}

				// --- Default ViewModel Instance (POTENTIAL CRITICAL SECTION) ---
				logger.debug(logPrefix + "Processing default ViewModel instance...");
				
				try {
					if (defaultArtboardRiveObject) {
						const defaultVmBlueprint = riveInstance.defaultViewModel();
						if (defaultVmBlueprint && defaultVmBlueprint.name) {
							logger.debug(logPrefix + `Default ViewModel found: ${defaultVmBlueprint.name}`);
							
							let mainInstanceForDefaultArtboard = null;
							let mainInstanceNameForOutput = "UnknownDefaultInstanceName";
							
							try {
								if (riveInstance.viewModelInstance) {
									mainInstanceForDefaultArtboard = riveInstance.viewModelInstance;
									mainInstanceNameForOutput =
										mainInstanceForDefaultArtboard.name ||
										`${defaultVmBlueprint.name}_autoboundInstance`;
									logger.debug(logPrefix + `Using riveInstance.viewModelInstance: ${mainInstanceNameForOutput}`);
								} else if (typeof defaultVmBlueprint.defaultInstance === "function") {
									mainInstanceForDefaultArtboard = defaultVmBlueprint.defaultInstance();
									if (mainInstanceForDefaultArtboard)
										mainInstanceNameForOutput =
											mainInstanceForDefaultArtboard.name ||
											`${defaultVmBlueprint.name}_defaultVmDefInstance`;
									logger.debug(logPrefix + `Using defaultVmBlueprint.defaultInstance(): ${mainInstanceNameForOutput}`);
								}
								
								if (
									defaultVmBlueprint.instanceCount === 1 &&
									defaultVmBlueprint.instanceNames &&
									defaultVmBlueprint.instanceNames.length === 1 &&
									defaultVmBlueprint.instanceNames[0] === ""
								) {
									mainInstanceNameForOutput = "Instance";
									logger.debug(logPrefix + "Using simplified instance name: Instance");
								}
								
								if (mainInstanceForDefaultArtboard) {
									logger.debug(logPrefix + `Parsing default ViewModel instance recursively...`);
									
									try {
										const parsedDefaultArtboardVm = parseViewModelInstanceRecursive(
											mainInstanceForDefaultArtboard,
											mainInstanceNameForOutput,
											defaultVmBlueprint,
										);
										
										let artboardEntryForDefault = result.artboards.find(
											(ab) => ab.name === defaultArtboardRiveObject.name,
										);
										if (!artboardEntryForDefault) {
											artboardEntryForDefault = {
												name: defaultArtboardRiveObject.name,
												animations: [],
												stateMachines: [],
												viewModels: [],
											};
											result.artboards.push(artboardEntryForDefault);
										}
										artboardEntryForDefault.viewModels.push(parsedDefaultArtboardVm);
										
										logger.debug(logPrefix + "Default ViewModel instance parsed successfully");
									} catch (defaultVmParseError) {
										logger.error(logPrefix + "CRITICAL ERROR parsing default ViewModel instance:", defaultVmParseError);
										// Continue without default ViewModel
									}
								}
							} catch (defaultVmAccessError) {
								logger.error(logPrefix + "Error accessing default ViewModel instance:", defaultVmAccessError);
							}
						}
					}
				} catch (defaultVmError) {
					logger.error(logPrefix + "Error processing default ViewModel:", defaultVmError);
				}

				// --- Artboard Info Loop (Animations, State Machine Names & Inputs from Contents) ---
				logger.debug(logPrefix + "Starting artboard information extraction...");
				
				try {
					const artboardCount = riveFile.artboardCount ? riveFile.artboardCount() : 0;
					logger.debug(logPrefix + `Processing ${artboardCount} artboards...`);
					
					for (let i = 0; i < artboardCount; i++) {
						try {
							logger.debug(logPrefix + `Processing artboard ${i}...`);
							const artboardDef = riveFile.artboardByIndex(i); // This is an ArtboardDefinition from riveFile
							if (!artboardDef) {
								logger.warn(logPrefix + `Artboard ${i} is null or undefined`);
								continue;
							}

							let currentArtboardEntry = result.artboards.find(
								(ab) => ab.name === artboardDef.name,
							);
							if (!currentArtboardEntry) {
								currentArtboardEntry = {
									name: artboardDef.name,
									animations: [],
									stateMachines: [],
									viewModels: [],
								};
								result.artboards.push(currentArtboardEntry);
							}

							// Process animations
							try {
								const animationCount =
									typeof artboardDef.animationCount === "function"
										? artboardDef.animationCount()
										: 0;
								logger.debug(logPrefix + `Artboard ${artboardDef.name} has ${animationCount} animations`);
								
								for (let j = 0; j < animationCount; j++) {
									try {
										const animation = artboardDef.animationByIndex(j);
										if (animation) {
											currentArtboardEntry.animations.push({
												name: animation.name,
												fps: animation.fps,
												duration: animation.duration,
												workStart: animation.workStart,
												workEnd: animation.workEnd,
											});
											logger.debug(logPrefix + `Animation ${j}: ${animation.name} (${animation.duration}s)`);
										}
									} catch (animError) {
										logger.error(logPrefix + `Error processing animation ${j} of artboard ${artboardDef.name}:`, animError);
									}
								}
							} catch (animCountError) {
								logger.error(logPrefix + `Error getting animation count for artboard ${artboardDef.name}:`, animCountError);
							}

							// Process state machines
							try {
								const smCountOnArtboard =
									typeof artboardDef.stateMachineCount === "function"
										? artboardDef.stateMachineCount()
										: 0;
								logger.debug(logPrefix + `Artboard ${artboardDef.name} has ${smCountOnArtboard} state machines`);
								
								for (let k = 0; k < smCountOnArtboard; k++) {
									try {
										const stateMachine = artboardDef.stateMachineByIndex(k);
										if (stateMachine) {
											const smName = stateMachine.name;
											logger.debug(logPrefix + `State machine ${k}: ${smName}`);
											
											// Create state machine instance to get inputs
											try {
												const smInstance = new riveToUse.StateMachineInstance(
													stateMachine,
													artboardDef,
												);
												
												const inputsArray = [];
												const inputCount = smInstance.inputCount();
												logger.debug(logPrefix + `State machine ${smName} has ${inputCount} inputs`);
												
												for (let l = 0; l < inputCount; l++) {
													try {
														const input = smInstance.input(l);
														inputsArray.push({
															name: input.name,
															type: input.type,
														});
														logger.debug(logPrefix + `Input ${l}: ${input.name} (type: ${input.type})`);
													} catch (inputError) {
														logger.error(logPrefix + `Error processing input ${l} of state machine ${smName}:`, inputError);
													}
												}
												
												currentArtboardEntry.stateMachines.push({
													name: smName,
													inputs: inputsArray,
												});
											} catch (smInstanceError) {
												logger.error(logPrefix + `Error creating state machine instance for ${smName}:`, smInstanceError);
												// Add state machine without inputs
												currentArtboardEntry.stateMachines.push({
													name: smName,
													inputs: [],
												});
											}
										}
									} catch (smError) {
										logger.error(logPrefix + `Error processing state machine ${k} of artboard ${artboardDef.name}:`, smError);
									}
								}
							} catch (smCountError) {
								logger.error(logPrefix + `Error getting state machine count for artboard ${artboardDef.name}:`, smCountError);
							}
							
							logger.debug(logPrefix + `Completed processing artboard ${artboardDef.name}`);
						} catch (artboardError) {
							logger.error(logPrefix + `Error processing artboard ${i}:`, artboardError);
						}
					}
					
					logger.debug(logPrefix + "Artboard information extraction completed");
				} catch (artboardLoopError) {
					logger.error(logPrefix + "Error during artboard loop:", artboardLoopError);
				}

				// --- Set Default ViewModel Name ---
				if (allFoundViewModelDefinitions.length > 0) {
					result.defaultElements.viewModelName =
						allFoundViewModelDefinitions[0].name;
					logger.debug(
						logPrefix + `Default ViewModel name set to: ${result.defaultElements.viewModelName}`,
					);
				}

				// --- Set Default Source ---
				result.defaultElements.src = riveFileToLoad;

				// --- Clean Result ---
				const cleanResult = JSON.parse(JSON.stringify(result));
				logger.debug(logPrefix + "Parsing completed successfully");

				// Cleanup the instance used for parsing
				if (riveInstance && typeof riveInstance.cleanup === "function") {
					logger.debug(logPrefix + "Cleaning up parser Rive instance.");
					riveInstance.cleanup();
				}
				finalCallback(null, cleanResult); // Pass only the data
				
			} catch (criticalError) {
				// Use enhanced WASM error detection and logging
				if (logger.wasmError) {
					logger.wasmError(criticalError, {
						operation: 'file_parsing',
						phase: 'critical_parsing_phase',
						riveFileSource: riveFileToLoad,
						hasViewModels: allFoundViewModelDefinitions.length > 0,
						artboardCount: result.artboards.length
					});
				} else {
					logger.error(logPrefix + "CRITICAL ERROR during parsing phase:", criticalError);
					logger.error(logPrefix + "Error stack:", criticalError.stack);
				}
				
				// Provide detailed error information with WASM diagnostics
				const errorDetails = {
					message: criticalError.message,
					stack: criticalError.stack,
					phase: "parsing",
					riveFileSource: riveFileToLoad,
					timestamp: new Date().toISOString(),
					wasmDiagnostics: logger.getWASMDiagnostics ? logger.getWASMDiagnostics() : null
				};
				
				// Cleanup on error
				if (riveInstance && typeof riveInstance.cleanup === "function") {
					try {
						riveInstance.cleanup();
						logger.debug(logPrefix + "Cleaned up Rive instance after error");
					} catch (cleanupError) {
						if (logger.wasmError) {
							logger.wasmError(cleanupError, {
								operation: 'cleanup',
								phase: 'error_cleanup'
							});
						} else {
							logger.error(logPrefix + "Error during cleanup:", cleanupError);
						}
					}
				}
				
				finalCallback({ 
					error: "Critical parsing error - see console for details", 
					details: errorDetails 
				}, null);
			}
		},
		onError: (err) => {
			const errorMsg = "Problem loading file; may be corrupt!"; // More prominent error message
			logger.error(logPrefix + errorMsg, err);
			logger.error(
				logPrefix + "[Parser Rive Error] Options used for new Rive():",
				JSON.stringify(riveOptions, null, 2),
			); // Log options on error
			// No instance to pass on load error
			finalCallback({ error: errorMsg, details: err.toString() }, null);
		},
	};

	logger.debug(
		logPrefix +
			"[Parser Pre-Init] Options for new Rive (exampleIndex.mjs inspired):",
	);
	// Custom logger for options because functions won't stringify well
	Object.keys(riveOptions).forEach((key) => {
		if (typeof riveOptions[key] === "function") {
			logger.debug(logPrefix + `  ${key}: function`);
		} else {
			logger.debug(logPrefix + `  ${key}:`, riveOptions[key]);
		}
	});

	const riveInstance = new riveToUse.Rive(riveOptions);
	logger.debug(
		logPrefix + "[Parser Post-Init] Rive instance created (or attempted):",
		riveInstance,
	);

	// The rest of the onLoad logic, including finalCallback, remains the same.
	// The onError for the Rive constructor will handle the "corrupt file" error.
}
