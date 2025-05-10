import { generateBlueprintFingerprint } from './vmBlueprintAnalyzer.js';

/**
 * Handles the processing of a nested ViewModel property for a ViewModel instance.
 *
 * @param {object} vmInstanceObj - The parent Rive ViewModelInstance object.
 * @param {object} propDecl - The property declaration (ViewModelPropertyDefinition) for the nested ViewModel.
 * @param {Array<object>} allFoundViewModelDefinitions - Array of pre-analyzed blueprint objects for cross-referencing.
 * @param {object} rive - The Rive runtime instance.
 * @param {function} parseViewModelInstanceRecursive_callback - The main recursive parsing function.
 * @returns {object} The parsed nested ViewModel instance structure, or an error object.
 */
export function handleNestedViewModelProperty(vmInstanceObj, propDecl, allFoundViewModelDefinitions, rive, parseViewModelInstanceRecursive_callback) {
	const propName = propDecl.name;
	const nestedVmInstance = vmInstanceObj.viewModel(propName);

	if (nestedVmInstance) {
		const blueprintForNested = nestedVmInstance.source; // This is the ViewModelDefinition for the nested instance

		if (blueprintForNested) {
			// Optional: Cross-reference with allFoundViewModelDefinitions
			const knownBlueprintEntry = allFoundViewModelDefinitions.find(
				(b) => b.rawDef === blueprintForNested || (b.blueprintName === blueprintForNested.name && b.fingerprint === generateBlueprintFingerprint(blueprintForNested, rive)) // Assuming generateBlueprintFingerprint is available and correct
			);
			if (!knownBlueprintEntry) {
				console.warn(`[processNestedViewModel] Nested VM '${propName}' (blueprint '${blueprintForNested.name}') under parent instance uses a blueprint not found in the pre-scanned list. Proceeding with the direct source.`);
			}

			return parseViewModelInstanceRecursive_callback(
				nestedVmInstance,
				propName, // Use property name as instance name for nested
				blueprintForNested,
				allFoundViewModelDefinitions,
				rive
			);
		} else {
			console.error(`[processNestedViewModel] Nested VM instance '${propName}' (property of parent) does not have a .source (ViewModelDefinition).`);
			return {
				instanceName: propName,
				blueprintName: 'Unknown (Source Definition Missing)',
				error: "Nested VM instance's source blueprint definition is missing.",
				properties: [],
				nestedViewModels: [],
			};
		}
	} else {
		console.warn(`[processNestedViewModel] Nested ViewModel instance '${propName}' not found on parent instance. This might be expected if it's optional or uninitialized.`);
		return {
			instanceName: propName,
			blueprintName: 'Unknown (Instance not found)',
			error: 'Nested VM instance could not be retrieved from parent.',
			properties: [],
			nestedViewModels: [],
		};
	}
}
