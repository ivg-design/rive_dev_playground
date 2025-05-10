import { fetchAllRawViewModelDefinitions } from './vmDefinitionProvider.js';
import { analyzeBlueprintFromDefinition, generateBlueprintFingerprint } from './vmBlueprintAnalyzer.js';
import { parseViewModelInstanceRecursive } from './vmInstanceParserRecursive.js';

/**
 * Orchestrates the fetching, analyzing of all ViewModel blueprints,
 * and parsing of discoverable ViewModel instances, starting from the default
 * ViewModel instance of the active artboard.
 *
 * @param {object} riveFile - The RiveFile object (currently unused here as definitions come from riveInstance).
 * @param {object} riveInstance - The main Rive runtime instance.
 * @returns {object} An object containing:
 *                   - allViewModelDefinitionsAndInstances: Array of blueprint objects,
 *                     each augmented with an `instances` array containing its parsed instances.
 */
export function orchestrateViewModelParsing(riveFile, riveInstance) {
	// Phase 1: Discover and Analyze All ViewModel Blueprints (Definitions)
	const rawDefinitions = fetchAllRawViewModelDefinitions(riveFile, riveInstance);
	const allViewModelDefinitionsAndInstances = rawDefinitions.map(
		(vmDefInput) => ({ // vmDefInput is { def: RiveViewModelDefinition, name: "VmName" }
			...analyzeBlueprintFromDefinition(vmDefInput, riveInstance),
			instances: [], // Initialize an empty array for instances
		})
	);

	// Phase 2: Parse ViewModel Instances, starting with the default VM of the active artboard
	console.log("[vmOrchestrator] Attempting to find and parse default ViewModel instance of the active artboard.");

	let mainEntryPointInstance = null;
	let mainEntryPointBlueprintDef = null; // This will be the Rive ViewModelDefinition
	let suggestedInstanceName = "DefaultArtboardVmInstance";

	const activeArtboard = riveInstance.artboard; // Rive ArtboardInstance

	if (activeArtboard) {
		console.log(`[vmOrchestrator] Active artboard: '${activeArtboard.name}'. Attempting to get its default ViewModel blueprint.`);
		if (typeof riveInstance.defaultViewModel === 'function') {
			mainEntryPointBlueprintDef = riveInstance.defaultViewModel(); // Should return a Rive ViewModelDefinition

			if (mainEntryPointBlueprintDef && mainEntryPointBlueprintDef.name) {
				console.log(`[vmOrchestrator] Default ViewModel blueprint for artboard '${activeArtboard.name}' is '${mainEntryPointBlueprintDef.name}'.`);
				suggestedInstanceName = mainEntryPointBlueprintDef.name; // Default to blueprint name

				// Attempt 1: Check if riveInstance.viewModelInstance is this default, auto-bound instance
				if (riveInstance.viewModelInstance && 
					typeof riveInstance.viewModelInstance === 'object' && 
					riveInstance.viewModelInstance.source && 
					riveInstance.viewModelInstance.source.name === mainEntryPointBlueprintDef.name) {
					
					mainEntryPointInstance = riveInstance.viewModelInstance;
					suggestedInstanceName = mainEntryPointInstance.name || `${mainEntryPointBlueprintDef.name}_autobound`;
					console.log(`[vmOrchestrator] Found main instance via riveInstance.viewModelInstance matching default blueprint: '${suggestedInstanceName}'.`);
				
				// Attempt 2: If not directly bound or doesn't match, try getting default instance from the blueprint
				} else if (typeof mainEntryPointBlueprintDef.defaultInstance === 'function') {
					console.log(`[vmOrchestrator] riveInstance.viewModelInstance not the one, or no .source. Trying ${mainEntryPointBlueprintDef.name}.defaultInstance().`);
					mainEntryPointInstance = mainEntryPointBlueprintDef.defaultInstance();
					if (mainEntryPointInstance) {
						suggestedInstanceName = mainEntryPointInstance.name || `${mainEntryPointBlueprintDef.name}_fromDefaultInstance`;
						console.log(`[vmOrchestrator] Found main instance via ${mainEntryPointBlueprintDef.name}.defaultInstance(): '${suggestedInstanceName}'.`);
					} else {
						console.warn(`[vmOrchestrator] Call to ${mainEntryPointBlueprintDef.name}.defaultInstance() did not return an instance.`);
						mainEntryPointBlueprintDef = null; // Clear blueprint if instance cannot be obtained
					}
				} else {
					console.warn(`[vmOrchestrator] Default VM blueprint '${mainEntryPointBlueprintDef.name}' does not have a .defaultInstance() method.`);
					mainEntryPointBlueprintDef = null; // Clear blueprint if instance cannot be obtained
				}
			} else {
				console.warn("[vmOrchestrator] riveInstance.defaultViewModel() did not return a valid blueprint or blueprint has no name.");
			}
		} else {
			console.warn("[vmOrchestrator] riveInstance.defaultViewModel is not a function. Cannot get default blueprint for active artboard.");
		}
	} else {
		console.warn("[vmOrchestrator] No active artboard found (riveInstance.artboard is null/undefined). Cannot determine default ViewModel to parse.");
	}

	// If a main entry point instance and its blueprint definition were found, parse it recursively
	if (mainEntryPointInstance && mainEntryPointBlueprintDef) {
		console.log(`[vmOrchestrator] Parsing entry point instance: '${suggestedInstanceName}' (Blueprint Definition: '${mainEntryPointBlueprintDef.name}')`);
		parseViewModelInstanceRecursive(
			mainEntryPointInstance,         // The Rive ViewModelInstance to parse
			suggestedInstanceName,        // Name for output
			mainEntryPointBlueprintDef,   // The Rive ViewModelDefinition for this instance
			allViewModelDefinitionsAndInstances, // The global list for updates and context
			riveInstance                  // The Rive runtime
		);
	} else {
		console.warn("[vmOrchestrator] Could not determine a main entry point ViewModel instance to start parsing. Instance list may be empty or incomplete.");
	}

	return {
		allViewModelDefinitionsAndInstances,
	};
}
