// parser_modules/riveParserOrchestrator.js

import { createAssetCollector } from './assetParser.js';
import { parseGlobalEnums } from './enumParser.js';
import { orchestrateViewModelParsing } from './vmOrchestrator.js';
import { calibrateSmInputTypes } from './stateMachineParser.js'; // SM Parser also exports parseStateMachinesForArtboard
import { parseArtboards } from './artboardParser.js';

/**
 * Parses a Rive file buffer to extract a comprehensive JSON structure detailing
 * artboards, animations, state machines, assets, ViewModels, and enums.
 *
 * @param {object} riveEngine - The Rive library/engine object (e.g., window.rive).
 * @param {ArrayBuffer} riveFileBuffer - The ArrayBuffer of the .riv file.
 * @param {string} [artboardNameForSmCalibration=null] - Optional: Name of an artboard to use for SM input type calibration.
 * @param {string} [smNameForSmCalibration=null] - Optional: Name of an SM on that artboard for SM input type calibration.
 * @returns {Promise<object>} A Promise that resolves with the comprehensive JSON structure, or rejects on error.
 */
export function parseRiveFile(riveEngine, riveFileBuffer, artboardNameForSmCalibration = null, smNameForSmCalibration = null) {
	return new Promise((resolve, reject) => {
		if (!riveEngine || !riveFileBuffer) {
			console.error("[RiveParserOrchestrator] Rive engine or file buffer not provided.");
			return reject(new Error("Rive engine or file buffer not provided."));
		}

		const { collectedAssets, assetLoaderCallback } = createAssetCollector(riveEngine);

		// Create a dummy canvas element if in a browser environment
		// The @rive-app/canvas runtime might require a canvas for initialization, even if not rendering.
		let dummyCanvas = null;
		if (typeof document !== 'undefined') {
			dummyCanvas = document.createElement('canvas');
			console.log("[RiveParserOrchestrator] Created dummy canvas for Rive parameters.");
		} else {
			console.warn("[RiveParserOrchestrator] 'document' is not defined. Cannot create dummy canvas. Rive instantiation might fail if it requires a canvas.");
		}

		// This will store the instance returned by `new RiveConstructor()`
		// It's defined outside riveParams so it can be captured by the onLoad closure.
		let capturedRiveInstanceFromConstructor = null;

		const riveParams = {
			buffer: riveFileBuffer,
			canvas: dummyCanvas,
			assetLoader: assetLoaderCallback,
			onLoad: function(eventOrInstanceArgument) { // 'this' might be the Rive instance, or eventOrInstanceArgument
				console.log("[RiveParserOrchestrator] onLoad CALLED.");
				console.log("[RiveParserOrchestrator] DIAGNOSTIC: 'this' inside onLoad:", this);
				console.log("[RiveParserOrchestrator] DIAGNOSTIC: Argument to onLoad (eventOrInstanceArgument):", eventOrInstanceArgument);
				console.log("[RiveParserOrchestrator] DIAGNOSTIC: 'capturedRiveInstanceFromConstructor':", capturedRiveInstanceFromConstructor);

				let riveInstanceToUse = null;

				// Priority 1: Check 'this' (common for class instance methods or event handlers bound to instance)
				if (this && typeof this.play === 'function' && this.file !== undefined) {
					console.log("[RiveParserOrchestrator] Using 'this' from onLoad as the Rive instance.");
					riveInstanceToUse = this;
				// Priority 2: Check the instance captured from `new RiveConstructor()`
				} else if (capturedRiveInstanceFromConstructor && typeof capturedRiveInstanceFromConstructor.play === 'function' && capturedRiveInstanceFromConstructor.file !== undefined) {
					console.log("[RiveParserOrchestrator] Using 'capturedRiveInstanceFromConstructor' as the Rive instance.");
					riveInstanceToUse = capturedRiveInstanceFromConstructor;
				// Priority 3: Check the argument passed to onLoad, if it's not the simple event object
				} else if (eventOrInstanceArgument && typeof eventOrInstanceArgument.play === 'function' && eventOrInstanceArgument.file !== undefined) {
 					console.log("[RiveParserOrchestrator] Using argument 'eventOrInstanceArgument' as the Rive instance.");
 					riveInstanceToUse = eventOrInstanceArgument;
				} else {
					console.error("[RiveParserOrchestrator] CRITICAL: Could not identify the actual Rive instance from 'this', captured constructor return, or onLoad argument.");
					try { console.log("Keys on 'this':", Object.keys(this)); } catch(e){ console.error("Error logging keys for 'this':", e);}
					try { console.log("Keys on 'capturedRiveInstanceFromConstructor':", Object.keys(capturedRiveInstanceFromConstructor)); } catch(e){ console.error("Error logging keys for 'capturedRiveInstanceFromConstructor':", e);}
					try { console.log("Keys on 'eventOrInstanceArgument':", Object.keys(eventOrInstanceArgument)); } catch(e){ console.error("Error logging keys for 'eventOrInstanceArgument':", e);}
					reject(new Error("Failed to obtain valid Rive instance after load."));
					return;
				}

				// Actual parsing logic starts here, using riveInstanceToUse
				try {
					console.log("[RiveParserOrchestrator] Proceeding with parsing. Identified Rive instance:", riveInstanceToUse);
					const riveFile = riveInstanceToUse.file;

					// --- Additional DIAGNOSTIC LOGS for instance and file capabilities ---
					console.log("[RiveParserOrchestrator] DIAGNOSTIC: typeof riveInstanceToUse.enums:", typeof riveInstanceToUse.enums);
					console.log("[RiveParserOrchestrator] DIAGNOSTIC: typeof riveInstanceToUse.file.viewModelCount:", typeof riveInstanceToUse.file.viewModelCount);
					if (riveInstanceToUse.file.hasOwnProperty('viewModelCount')) {
						console.log("[RiveParserOrchestrator] DIAGNOSTIC: riveInstanceToUse.file.viewModelCount (property value):", riveInstanceToUse.file.viewModelCount);
					} else if (typeof riveInstanceToUse.file.viewModelCount === 'function') {
						try { console.log("[RiveParserOrchestrator] DIAGNOSTIC: riveInstanceToUse.file.viewModelCount():", riveInstanceToUse.file.viewModelCount()); } catch(e){ console.error("Error calling viewModelCount():", e);}
					}
					console.log("[RiveParserOrchestrator] DIAGNOSTIC: typeof riveInstanceToUse.file.viewModelDefinitionCount:", typeof riveInstanceToUse.file.viewModelDefinitionCount);
					if (riveInstanceToUse.file.hasOwnProperty('viewModelDefinitionCount')) {
						console.log("[RiveParserOrchestrator] DIAGNOSTIC: riveInstanceToUse.file.viewModelDefinitionCount (property value):", riveInstanceToUse.file.viewModelDefinitionCount);
					} else if (typeof riveInstanceToUse.file.viewModelDefinitionCount === 'function') {
						try { console.log("[RiveParserOrchestrator] DIAGNOSTIC: riveInstanceToUse.file.viewModelDefinitionCount():", riveInstanceToUse.file.viewModelDefinitionCount()); } catch(e){ console.error("Error calling viewModelDefinitionCount():", e);}
					}
					console.log("[RiveParserOrchestrator] DIAGNOSTIC: typeof riveInstanceToUse.defaultViewModelInstance:", typeof riveInstanceToUse.defaultViewModelInstance);
					console.log("[RiveParserOrchestrator] DIAGNOSTIC: typeof riveInstanceToUse.viewModelInstance:", typeof riveInstanceToUse.viewModelInstance);
					// --- END additional DIAGNOSTICS ---

					// --- START DIAGNOSTIC LOGS FOR riveFile (post-instance selection) ---
					console.log("---------------------------------------------------------------------------");
					console.log("[RiveParserOrchestrator] DIAGNOSTIC (post-instance-selection): Inspecting riveFile object:", riveFile);
					if (riveFile) {
						console.log("[RiveParserOrchestrator] DIAGNOSTIC: typeof riveFile:", typeof riveFile);
						console.log("[RiveParserOrchestrator] DIAGNOSTIC: riveFile constructor name:", riveFile.constructor ? riveFile.constructor.name : "N/A");
						console.log("[RiveParserOrchestrator] DIAGNOSTIC: typeof riveFile.artboardCount:", typeof riveFile.artboardCount, "Value:", typeof riveFile.artboardCount === 'function' ? riveFile.artboardCount() : riveFile.artboardCount);
						console.log("[RiveParserOrchestrator] DIAGNOSTIC: typeof riveFile.viewModelByIndex:", typeof riveFile.viewModelByIndex);
						console.log("[RiveParserOrchestrator] DIAGNOSTIC: typeof riveFile.dataEnumByIndex:", typeof riveFile.dataEnumByIndex);
						try { console.log("[RiveParserOrchestrator] DIAGNOSTIC: Keys on riveFile:", Object.keys(riveFile)); } catch (e) { console.error("Error getting keys for riveFile:", e); }
					} else {
						console.error("[RiveParserOrchestrator] DIAGNOSTIC: riveFile is STILL NULL/UNDEF after instance selection!");
					}
					console.log("---------------------------------------------------------------------------");
					// --- END DIAGNOSTIC LOGS ---

					if (!riveFile) {
						console.error("[RiveParserOrchestrator] CRITICAL: riveFile is undefined even after selecting Rive instance. Cannot proceed.");
						reject(new Error("riveFile is undefined after Rive instance selection."));
						return;
					}

					let dynamicSmInputTypeMap = {};
					if (artboardNameForSmCalibration && smNameForSmCalibration) {
						dynamicSmInputTypeMap = calibrateSmInputTypes(riveInstanceToUse, artboardNameForSmCalibration, smNameForSmCalibration);
					} else {
						// console.log("[RiveParserOrchestrator] SM input type calibration parameters not provided...");
					}

					const globalEnums = parseGlobalEnums(riveInstanceToUse, riveFile);
					const { allAnalyzedBlueprints, parsedDefaultVmInstance } = orchestrateViewModelParsing(riveFile, riveInstanceToUse);

					// Log the structure of riveInstanceToUse.contents for debugging SM input parsing
					console.log('[RiveParserOrchestrator] riveInstanceToUse.contents:', JSON.stringify(riveInstanceToUse.contents, null, 2));

					const artboards = parseArtboards(riveFile, riveInstanceToUse, parsedDefaultVmInstance, dynamicSmInputTypeMap);
					const assets = collectedAssets;

					const result = {
						artboards,
						assets,
						allViewModelDefinitionsAndInstances: allAnalyzedBlueprints.map((bp) => ({
							blueprintName: bp.blueprintName,
							blueprintProperties: bp.properties,
							instanceNamesFromDefinition: bp.instanceNamesFromDefinition,
							instanceCountFromDefinition: bp.instanceCountFromDefinition,
							parsedInstances: [],
						})),
						globalEnums,
					};

					console.log("[RiveParserOrchestrator] Parsing complete.");
					resolve(result);
				} catch (e) {
					console.error("[RiveParserOrchestrator] Error during parsing logic (using identified Rive instance):", e);
					reject(e);
				}
			},
			onLoadError: (error) => {
				console.error("[RiveParserOrchestrator] Rive onLoadError:", error);
				reject(error);
			},
		};

		// If calibration parameters are provided, pass them to Rive constructor to ensure the artboard/SM are active
		// This helps `calibrateSmInputTypes` if it relies on `riveInstance.stateMachineInstance()` for live types.
		if (artboardNameForSmCalibration) {
			riveParams.artboard = artboardNameForSmCalibration;
			if (smNameForSmCalibration) {
				// Rive constructor expects stateMachines to be an array of names or SMDef objects
				riveParams.stateMachines = [smNameForSmCalibration];
			}
		}
        
        console.log("[RiveParserOrchestrator] About to instantiate Rive. riveParams prepared with wrapped onLoad:", riveParams);
        
        let RiveConstructor = null;
        if (riveEngine && typeof riveEngine.Rive === 'function') {
            RiveConstructor = riveEngine.Rive;
            console.log("[RiveParserOrchestrator] Found Rive constructor at riveEngine.Rive:", RiveConstructor);
        } else if (riveEngine && riveEngine.default && typeof riveEngine.default.Rive === 'function') {
            // Fallback for some module bundling scenarios where Rive might be under a .default
            RiveConstructor = riveEngine.default.Rive;
            console.log("[RiveParserOrchestrator] Found Rive constructor at riveEngine.default.Rive:", RiveConstructor);
        } else if (typeof riveEngine === 'function' && riveEngine.name === 'Rive') {
            // Fallback if riveEngine itself is the Rive class (less likely with window.rive)
             RiveConstructor = riveEngine;
             console.log("[RiveParserOrchestrator] riveEngine itself appears to be the Rive constructor:", RiveConstructor);
        }

        if (!RiveConstructor) {
            const errMsg = "[RiveParserOrchestrator] CRITICAL: Rive constructor not found on riveEngine object or its .default property.";
            console.error(errMsg, "riveEngine was:", riveEngine);
            reject(new Error(errMsg));
            return; // Stop further execution in the promise
        }
        
        console.log("[RiveParserOrchestrator] riveParams being passed to Rive constructor:", riveParams);
		
		// Capture the instance returned by the constructor
		capturedRiveInstanceFromConstructor = new RiveConstructor(riveParams);
		console.log("[RiveParserOrchestrator] Instance created by new RiveConstructor() and stored in capturedRiveInstanceFromConstructor:", capturedRiveInstanceFromConstructor);

		// Modify onLoad to log `this` and the captured `constructedRiveInstance`
		const originalOnLoad = riveParams.onLoad;
		riveParams.onLoad = function(eventInstance) { // Renaming 'instance' to 'eventInstance' for clarity
			console.log("[RiveParserOrchestrator] onLoad CALLED. Logging 'this' and 'eventInstance':");
			console.log("[RiveParserOrchestrator] DIAGNOSTIC: 'this' inside onLoad:", this);
			console.log("[RiveParserOrchestrator] DIAGNOSTIC: 'eventInstance' (argument to onLoad):", eventInstance);
			console.log("[RiveParserOrchestrator] DIAGNOSTIC: 'capturedRiveInstanceFromConstructor' (captured from new RiveConstructor()):", capturedRiveInstanceFromConstructor);

			// Determine the actual Rive instance to use
			let actualRiveInstance = null;
			if (capturedRiveInstanceFromConstructor && typeof capturedRiveInstanceFromConstructor.play === 'function' && capturedRiveInstanceFromConstructor.file) {
				console.log("[RiveParserOrchestrator] Using 'capturedRiveInstanceFromConstructor' as it looks like a valid Rive instance.");
				actualRiveInstance = capturedRiveInstanceFromConstructor;
			} else if (this && typeof this.play === 'function' && this.file) {
				console.log("[RiveParserOrchestrator] Using 'this' from onLoad as it looks like a valid Rive instance.");
				actualRiveInstance = this;
			} else {
				console.error("[RiveParserOrchestrator] CRITICAL: Could not identify the actual Rive instance from constructedRiveInstance or 'this' in onLoad.");
				reject(new Error("Failed to obtain valid Rive instance after load."));
				return;
			}

			// Call the original onLoad logic with the eventInstance, but the main parsing will use actualRiveInstance
			// The original onLoad in our case contains all the parsing logic which expects the *actual* Rive instance.
			// So we will pass the actualRiveInstance to it.
			originalOnLoad(actualRiveInstance); // Pass the identified actual Rive instance
		};

		// Re-assign the potentially modified riveParams if RiveConstructor uses them AFTER this setup.
		// However, the Rive constructor likely consumes them upon new RiveConstructor().
		// The key is that the `onLoad` in `riveParams` is now our wrapper.
		// If `new RiveConstructor(riveParams)` was already called, we need to ensure our wrapped onLoad is used.
		// The above `new RiveConstructor(riveParams)` will use the initial `riveParams.onLoad`.
		// This is tricky. Let's restructure: define parameters fully, then instantiate.
	});
}
