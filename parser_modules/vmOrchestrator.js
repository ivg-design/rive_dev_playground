import { fetchAllRawViewModelDefinitions } from './vmDefinitionProvider.js';
import { analyzeBlueprintFromDefinition } from './vmBlueprintAnalyzer.js';
import { parseViewModelInstanceRecursive } from './vmInstanceParserRecursive.js';

/**
 * Orchestrates the fetching, analyzing of all ViewModel blueprints,
 * and parsing of the main ViewModel instance from the default artboard.
 *
 * @param {object} riveFile - The RiveFile object.
 * @param {object} riveInstance - The main Rive runtime instance.
 * @returns {object} An object containing:
 *                   - allAnalyzedBlueprints: Array of all discovered ViewModel blueprint objects.
 *                   - parsedDefaultVmInstance: The parsed structure of the main ViewModel instance.
 *                                              Null if no default VM instance is found.
 */
export function orchestrateViewModelParsing(riveFile, riveInstance) {
	// Phase 1: Discover and Analyze All ViewModel Blueprints
	const rawDefinitions = fetchAllRawViewModelDefinitions(riveFile);
	const allAnalyzedBlueprints = rawDefinitions.map(
		(rawDefInput) => analyzeBlueprintFromDefinition(rawDefInput) // analyzeBlueprintFromDefinition expects { def, name }
	);

	// Phase 2: Parse the Main ViewModel Instance
	// The Rive JS runtime API for getting the "main" or "default" VM instance
	// usually involves having specified one in the Rive constructor (e.g., via viewModels option)
	// and then accessing it, often by its name if known, or if `autobind:true` was used.
	// The `riveInstance.defaultViewModel()` returns the ViewModelDefinition for the *first*
	// view model associated with the default artboard (if any).
	// `riveInstance.viewModelInstance()` (no args) might give the primary bound instance if one exists.

	let parsedDefaultVmInstance = null;
	let mainVmInstance = null;
	let mainVmBlueprint = null;
	let mainVmInstanceName = 'MainInstance'; // Default output name

	// Attempt 1: Try to get the default view model definition and its default instance
	const defaultVmDef = riveInstance.defaultViewModel(); // Returns a ViewModelDefinition
	if (defaultVmDef) {
		mainVmBlueprint = defaultVmDef;
		mainVmInstanceName = defaultVmDef.name; // Use blueprint name for the instance
		// Try to get its default instance.
		// Note: .defaultInstance() is on ViewModelDefinition.
		// The actual instance on the riveInstance might be different if mutated.
		// Let's prioritize the instance directly from riveInstance if possible,
		// assuming it's the one actively being used.
		mainVmInstance = riveInstance.viewModelInstance(defaultVmDef.name);
		if (!mainVmInstance && typeof defaultVmDef.defaultInstance === 'function') {
			// Fallback to the blueprint's default instance if not found on riveInstance by name
			mainVmInstance = defaultVmDef.defaultInstance();
			console.warn(`[vmOrchestrator] Main VM instance for '${defaultVmDef.name}' fetched via blueprint's defaultInstance(). This might not reflect live state if instance was re-bound or changed.`);
		} else if (!mainVmInstance) {
			console.warn(`[vmOrchestrator] Could not obtain main VM instance for default blueprint '${defaultVmDef.name}' from riveInstance or blueprint.defaultInstance().`);
		}
	} else {
		// Attempt 2: If no defaultViewModel, try to get any instance directly (less specific)
		// This part is heuristic. If multiple VMs are present, `viewModelInstance()` with no args
		// behavior might depend on Rive's internal logic or autobind.
		// The original parser mentioned `riveInstance.viewModelInstance` due to `autobind: true`.
		if (typeof riveInstance.viewModelInstance === 'function') {
			const anyInstance = riveInstance.viewModelInstance(); // Gets the "default" or first bound instance
			if (anyInstance && anyInstance.source) {
				mainVmInstance = anyInstance;
				mainVmBlueprint = anyInstance.source; // ViewModelDefinition
				mainVmInstanceName = mainVmBlueprint.name;
				console.warn(`[vmOrchestrator] Main VM instance obtained via riveInstance.viewModelInstance() (no args). Blueprint: '${mainVmBlueprint.name}'.`);
			}
		}
	}

	if (mainVmInstance && mainVmBlueprint) {
		console.log(`[vmOrchestrator] Parsing main VM instance: '${mainVmInstanceName}' (Blueprint: '${mainVmBlueprint.name}')`);
		parsedDefaultVmInstance = parseViewModelInstanceRecursive(
			mainVmInstance,
			mainVmInstanceName, // Name for the output object
			mainVmBlueprint, // The ViewModelDefinition for this instance
			allAnalyzedBlueprints, // Pass all known blueprints for context
			riveInstance // Pass the Rive runtime instance
		);
	} else {
		console.warn('[vmOrchestrator] Could not determine a main ViewModel instance to parse for the default artboard.');
	}

	return {
		allAnalyzedBlueprints,
		parsedDefaultVmInstance,
	};
}
