import { fetchAllRawViewModelDefinitions } from './vmDefinitionProvider.js';
import { analyzeBlueprintFromDefinition } from './vmBlueprintAnalyzer.js';
import { parseViewModelInstanceRecursive } from './vmInstanceParserRecursive.js';

/**
 * Orchestrates the fetching, analyzing of all ViewModel blueprints,
 * and parsing of the main ViewModel instance from the default artboard (if one is active and has a default VM).
 *
 * @param {object} riveFile - The RiveFile object.
 * @param {object} riveInstance - The main Rive runtime instance.
 * @returns {object} An object containing:
 *                   - allAnalyzedBlueprints: Array of all discovered ViewModel blueprint objects.
 *                   - parsedDefaultVmInstance: The parsed structure of the main ViewModel instance.
 *                                              Null if no default VM instance is found or parsed.
 */
export function orchestrateViewModelParsing(riveFile, riveInstance) {
	// Phase 1: Discover and Analyze All ViewModel Blueprints (Definitions)
	const rawDefinitions = fetchAllRawViewModelDefinitions(riveFile, riveInstance);
	const allAnalyzedBlueprints = rawDefinitions.map(
		(rawDefInput) => analyzeBlueprintFromDefinition(rawDefInput)
	);

	// Phase 2: Parse the Main/Default ViewModel Instance
	let parsedDefaultVmInstance = null;
	let mainVmInstance = null;
	let mainVmBlueprint = null;
	let mainVmInstanceName = 'DefaultVmInstance'; // Default output name if specific name can't be derived

	console.log("[vmOrchestrator] Attempting to get main ViewModel instance (logic inspired by original parser.js).");

	// The original parser.js used riveInstance.artboard to know which artboard was default,
	// then riveInstance.defaultViewModel() to get its blueprint, then tried to get an instance.
	const activeArtboard = riveInstance.artboard; // The artboard currently active on the Rive instance

	if (!activeArtboard) {
		console.warn("[vmOrchestrator] No active artboard found on riveInstance. Cannot determine default ViewModel to parse.");
	} else {
		console.log(`[vmOrchestrator] Active artboard: '${activeArtboard.name}'. Attempting to get its default ViewModel blueprint.`);

		// Try getting the default ViewModelDefinition from the Rive instance itself.
		// This assumes defaultViewModel() is a method on the main Rive instance, as per parser.js inspection.
		if (typeof riveInstance.defaultViewModel === 'function') {
			try {
				mainVmBlueprint = riveInstance.defaultViewModel(); // This should be a ViewModelDefinition

				if (mainVmBlueprint && mainVmBlueprint.name) {
					console.log(`[vmOrchestrator] Successfully obtained default ViewModel blueprint: '${mainVmBlueprint.name}' for active artboard '${activeArtboard.name}'.`);
					mainVmInstanceName = mainVmBlueprint.name; // Use blueprint name as default instance name

					// Attempt 1: Check riveInstance.viewModelInstance (object property) - direct instance binding
					// This is if a VM was specified in Rive constructor and autobind=true made it directly available.
					console.log(`[vmOrchestrator] Checking riveInstance.viewModelInstance (type: ${typeof riveInstance.viewModelInstance})`);
					if (riveInstance.viewModelInstance && 
						typeof riveInstance.viewModelInstance === 'object' && 
						riveInstance.viewModelInstance.source && 
						riveInstance.viewModelInstance.source.name === mainVmBlueprint.name) {
						
						mainVmInstance = riveInstance.viewModelInstance;
						mainVmInstanceName = mainVmInstance.name || `${mainVmBlueprint.name}_instance_from_property`;
						console.log(`[vmOrchestrator] Success: Main VM instance found via riveInstance.viewModelInstance property. Instance name: '${mainVmInstanceName}'.`);
					} else {
						console.log("[vmOrchestrator] riveInstance.viewModelInstance property is not the direct instance or doesn't match blueprint. Trying blueprint.defaultInstance().");
						// Attempt 2: Try to get an instance from the blueprint's defaultInstance() method
						if (typeof mainVmBlueprint.defaultInstance === 'function') {
							mainVmInstance = mainVmBlueprint.defaultInstance();
							if (mainVmInstance) {
								mainVmInstanceName = mainVmInstance.name || `${mainVmBlueprint.name}_instance_from_defaultInstance`;
								console.log(`[vmOrchestrator] Success: Main VM instance found via mainVmBlueprint.defaultInstance(). Instance name: '${mainVmInstanceName}'.`);
							} else {
								console.warn("[vmOrchestrator] mainVmBlueprint.defaultInstance() did not return an instance.");
							}
						} else {
							console.warn("[vmOrchestrator] mainVmBlueprint.defaultInstance is not a function.");
						}
					}
				} else {
					console.warn("[vmOrchestrator] riveInstance.defaultViewModel() did not return a valid blueprint or blueprint has no name.");
				}
			} catch (e) {
				console.error("[vmOrchestrator] Error calling riveInstance.defaultViewModel():", e);
			}
		} else {
			console.warn("[vmOrchestrator] riveInstance.defaultViewModel is not a function. Cannot get default blueprint.");
		}
	}

	// If a main ViewModel instance and its blueprint were found, parse it recursively
	if (mainVmInstance && mainVmBlueprint) {
		console.log(`[vmOrchestrator] Parsing main VM instance: '${mainVmInstanceName}' (Blueprint: '${mainVmBlueprint.name}')`);
		parsedDefaultVmInstance = parseViewModelInstanceRecursive(
			mainVmInstance,
			mainVmInstanceName,
			mainVmBlueprint,
			allAnalyzedBlueprints, // Context of all known blueprints
			riveInstance
		);
	} else {
		console.warn('[vmOrchestrator] Could not determine a main ViewModel instance and/or its blueprint to parse for the active artboard.');
	}

	return {
		allAnalyzedBlueprints,
		parsedDefaultVmInstance,
	};
}
