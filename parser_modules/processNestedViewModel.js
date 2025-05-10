import { generateBlueprintFingerprint } from './vmBlueprintAnalyzer.js';

/**
 * Handles a property that is itself a nested ViewModel.
 * It tries to get the nested ViewModel instance, find its blueprint, and then recursively parse it.
 *
 * @param {object} parentVmInstance - The parent ViewModelInstance object.
 * @param {object} propDecl - The property declaration (ViewModelPropertyDefinition) for the nested ViewModel.
 * @param {Array<object>} allAnalyzedBlueprints - Array of all known analyzed blueprints, used to find the blueprint for the nested VM.
 *                                                Each element is expected to have at least `blueprintName` and `def` (the original Rive definition object).
 * @param {object} rive - The Rive runtime instance.
 * @param {function} recursiveParseFunc - A reference to parseViewModelInstanceRecursive for making recursive calls.
 * @returns {object} A structured object representing the parsed nested ViewModel instance or an error/placeholder.
 */
export function handleNestedViewModelProperty(parentVmInstance, propDecl, allAnalyzedBlueprints, rive, recursiveParseFunc) {
	const nestedVmPropertyName = propDecl.name;
	const outputInstanceName = nestedVmPropertyName; // Use the property name as the instance name in the output
	let nestedVmInstance = null;
	let nestedVmBlueprint = null;

	// Log the parent VM name if possible (useful for context)
	const parentVmName = parentVmInstance.source ? parentVmInstance.source.name : 'UnnamedParentVM';

	console.log(`[processNestedViewModel] Attempting to get nested VM for property: '${nestedVmPropertyName}' from parent VM: '${parentVmName}'`);

	try {
		if (typeof parentVmInstance.viewModel === 'function') {
			nestedVmInstance = parentVmInstance.viewModel(nestedVmPropertyName);
		} else {
			console.warn(`[processNestedViewModel] parentVmInstance.viewModel is not a function for parent '${parentVmName}'. Cannot get nested VM '${nestedVmPropertyName}'.`);
			return { instanceName: outputInstanceName, error: "Parent VM does not support .viewModel() method." };
		}

		if (nestedVmInstance) {
			const riveNestedInstanceName = nestedVmInstance.name; // This is the name Rive runtime gives the instance, might be undefined
			console.log(`[processNestedViewModel] Successfully retrieved nested VM instance for '${nestedVmPropertyName}'. Instance name from Rive: '${riveNestedInstanceName}'.`);

			// Strategy 1: Check nestedVmInstance.source directly (as per current logic)
			if (nestedVmInstance.source) {
				nestedVmBlueprint = nestedVmInstance.source;
				console.log(`[processNestedViewModel] Found blueprint for nested VM '${nestedVmPropertyName}' directly from its .source property. Blueprint name: '${nestedVmBlueprint.name}'.`);
			} else {
				console.log(`[processNestedViewModel] Nested VM '${nestedVmPropertyName}' .source is null/undefined. Trying to find blueprint by matching instance name ('${riveNestedInstanceName}') in allAnalyzedBlueprints.`);
				// Strategy 2: Match by instance name (riveNestedInstanceName) against known blueprint names
				if (riveNestedInstanceName && allAnalyzedBlueprints && Array.isArray(allAnalyzedBlueprints)) {
					const foundBlueprintAnalysis = allAnalyzedBlueprints.find(bp => bp.blueprintName === riveNestedInstanceName);
					if (foundBlueprintAnalysis && foundBlueprintAnalysis.rawDef) {
						nestedVmBlueprint = foundBlueprintAnalysis.rawDef; // Use the original Rive definition object
						console.log(`[processNestedViewModel] Found blueprint for nested VM '${nestedVmPropertyName}' by matching Rive instance name '${riveNestedInstanceName}' to blueprint '${nestedVmBlueprint.name}'.`);
					} else {
						console.log(`[processNestedViewModel] Could not find blueprint for nested VM '${nestedVmPropertyName}' by matching Rive instance name '${riveNestedInstanceName}'.`);
					}
				} else {
					console.log(`[processNestedViewModel] Cannot attempt blueprint lookup by Rive instance name for '${nestedVmPropertyName}' because Rive instance name is undefined or allAnalyzedBlueprints is unavailable.`);
				}

				// Strategy 3: Fingerprint matching (if Strategies 1 and 2 failed)
				if (!nestedVmBlueprint && allAnalyzedBlueprints && Array.isArray(allAnalyzedBlueprints)) {
					console.log(`[processNestedViewModel] Strategies 1 & 2 failed for '${nestedVmPropertyName}'. Attempting fingerprint matching.`);
					try {
						const instanceFingerprint = generateBlueprintFingerprint(nestedVmInstance, rive);
						console.log(`[processNestedViewModel] Generated fingerprint for instance '${nestedVmPropertyName}' (Rive name '${riveNestedInstanceName}'): '${instanceFingerprint}'`);

						if (instanceFingerprint && instanceFingerprint !== "no-definition-to-fingerprint") {
							const foundByFingerprint = allAnalyzedBlueprints.find(bp => bp.fingerprint === instanceFingerprint);
							if (foundByFingerprint && foundByFingerprint.rawDef) {
								nestedVmBlueprint = foundByFingerprint.rawDef;
								console.log(`[processNestedViewModel] Found blueprint for nested VM '${nestedVmPropertyName}' by FINGERPRINT matching. Blueprint name: '${nestedVmBlueprint.name}'.`);
							} else {
								console.log(`[processNestedViewModel] Could not find blueprint for nested VM '${nestedVmPropertyName}' by FINGERPRINT matching. Instance fingerprint: '${instanceFingerprint}'. Searched ${allAnalyzedBlueprints.length} blueprints.`);
								// For debugging, log all known fingerprints if match fails
								allAnalyzedBlueprints.forEach(bp => console.log(`[processNestedViewModel] Known blueprint: ${bp.blueprintName}, Fingerprint: '${bp.fingerprint}'`));
							}
						} else {
							console.log(`[processNestedViewModel] Could not find blueprint for nested VM '${nestedVmPropertyName}' by FINGERPRINT matching. Instance fingerprint: '${instanceFingerprint}'. Searched ${allAnalyzedBlueprints.length} blueprints.`);
							// For debugging, log all known fingerprints if match fails
							allAnalyzedBlueprints.forEach(bp => console.log(`[processNestedViewModel] Known blueprint: ${bp.blueprintName}, Fingerprint: '${bp.fingerprint}'`));
						}
					} catch (error) {
						console.error(`[processNestedViewModel] Error generating fingerprint for instance '${nestedVmPropertyName}':`, error);
						return { instanceName: outputInstanceName, error: "Error generating fingerprint." };
					}
				} else {
					console.log(`[processNestedViewModel] Cannot attempt fingerprint matching for '${nestedVmPropertyName}' because allAnalyzedBlueprints is unavailable.`);
					return { instanceName: outputInstanceName, error: "Cannot attempt fingerprint matching." };
				}
			}

			// If we have a blueprint, proceed to parse the nested instance
			if (nestedVmBlueprint) {
				console.log(`[processNestedViewModel] Blueprint '${nestedVmBlueprint.name}' found for nested VM '${nestedVmPropertyName}' (Instance: '${outputInstanceName}'). Proceeding to recursive parse.`);

				const nestedParsedResult = recursiveParseFunc(
					nestedVmInstance,
					outputInstanceName, // Pass the property name as the suggested instance name for the output
					nestedVmBlueprint,  // This is the ViewModelDefinition for the nested VM
					allAnalyzedBlueprints,
					rive
				);

				// The recursiveParseFunc is expected to return a fully parsed object like:
				// { instanceNameForOutput, blueprintName, properties, nestedViewModels }
				// We want to ensure the instanceName in our list is the property name.
				// The blueprintName should already be correct from the recursive call.
				return {
					instanceName: outputInstanceName, // This is the key/property name on the parent
					blueprintName: nestedVmBlueprint.name, // Ensure this is from the identified blueprint
					...nestedParsedResult // Spread the rest of the parsed data (properties, nested VMs etc.)
				};

			} else {
				console.warn(`[processNestedViewModel] Could not determine blueprint for nested VM '${nestedVmPropertyName}' (Instance: '${outputInstanceName}').`);
				return { instanceName: outputInstanceName, error: "Could not determine blueprint for nested VM.", blueprint: null };
			}

		} else {
			console.warn(`[processNestedViewModel] Nested VM instance is null for property '${nestedVmPropertyName}'.`);
			return { instanceName: outputInstanceName, error: "Nested VM instance is null.", blueprint: null };
		}
	} catch (error) {
		console.error(`[processNestedViewModel] Error handling nested VM property '${nestedVmPropertyName}':`, error);
		return { instanceName: outputInstanceName, error: `Error handling nested VM property: ${error.message}`, blueprint: null };
	}

	// This part should ideally not be reached if logic above is complete.
	// However, as a fallback, if somehow nestedVmBlueprint was identified but parsing didn't return:
	// This was the original return, which is insufficient.
	// console.warn(`[processNestedViewModel] Fallback return for '${nestedVmPropertyName}'. This might indicate an issue.`);
	// return { instanceName: outputInstanceName, blueprint: nestedVmBlueprint, error: "Reached fallback return, recursive parse might have been skipped." };
}