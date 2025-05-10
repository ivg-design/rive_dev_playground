// parser_modules/vmInstanceParserRecursive.js

import { handleInputProperty } from './processInputProperty.js';
import { handleNestedViewModelProperty } from './processNestedViewModel.js';

/**
 * Recursively parses a ViewModel instance, including its properties and nested ViewModels.
 *
 * @param {object} vmInstanceObj - The Rive ViewModelInstance object to parse.
 * @param {string} instanceNameForOutput - The name to assign to this instance in the output.
 * @param {object} sourceBlueprint - The Rive ViewModelDefinition for this instance (typically vmInstanceObj.source).
 * @param {Array<object>} allFoundViewModelDefinitions - Array of pre-analyzed blueprint objects for cross-referencing.
 * @param {object} rive - The Rive runtime instance.
 * @returns {object} A structured object representing the parsed ViewModel instance.
 */
export function parseViewModelInstanceRecursive(vmInstanceObj, instanceNameForOutput, sourceBlueprint, allFoundViewModelDefinitions, rive) {
	let finalInstanceName = instanceNameForOutput;

	if (vmInstanceObj && sourceBlueprint) {
		const riveInstanceName = vmInstanceObj.name; // Name of this specific instance in Rive (from editor)

		// Condition A: Is it the sole instance of its definition globally in the Rive file?
		// sourceBlueprint is ViewModelDefinition. It should have instanceCount.
		const isSoleDefinedInstance = (typeof sourceBlueprint.instanceCount === 'number' && sourceBlueprint.instanceCount === 1);

		// Condition B: Is this specific Rive instance's name (from editor) an empty string?
		const isRiveInstanceNameEmpty = (riveInstanceName === '');

		// If it's the sole instance defined for its blueprint, OR if its specific Rive editor name is empty, use "Instance".
		if (isSoleDefinedInstance || isRiveInstanceNameEmpty) {
			finalInstanceName = "Instance";
		}
	} // If vmInstanceObj or sourceBlueprint is null, finalInstanceName remains instanceNameForOutput

	console.log(`[vmInstanceParserRecursive] Parsing instance. Suggested: '${instanceNameForOutput}', Final: '${finalInstanceName}', Blueprint: '${sourceBlueprint ? sourceBlueprint.name : 'UnknownBlueprint'}'`);
	if (sourceBlueprint) {
		console.log("[vmInstanceParserRecursive] Inspecting received sourceBlueprint:", sourceBlueprint);
		console.log("[vmInstanceParserRecursive] Keys on sourceBlueprint:", Object.keys(sourceBlueprint));
		console.log("[vmInstanceParserRecursive] typeof sourceBlueprint.properties:", typeof sourceBlueprint.properties);
		if (Array.isArray(sourceBlueprint.properties)) {
			console.log("[vmInstanceParserRecursive] sourceBlueprint.properties IS an array. Length:", sourceBlueprint.properties.length);
		}
		console.log("[vmInstanceParserRecursive] typeof sourceBlueprint.propertyCount:", typeof sourceBlueprint.propertyCount);
		console.log("[vmInstanceParserRecursive] typeof sourceBlueprint.propertyByIndex:", typeof sourceBlueprint.propertyByIndex);
	} else {
		console.warn("[vmInstanceParserRecursive] sourceBlueprint is null or undefined. Cannot parse properties.");
	}

	const parsedInstance = {
		instanceName: finalInstanceName,
		blueprintName: sourceBlueprint ? sourceBlueprint.name : 'Unknown Blueprint',
		properties: [],
		nestedViewModels: [],
	};

	if (!vmInstanceObj) {
		console.error(`[vmInstanceParserRecursive] VM instance object is null/undefined for '${instanceNameForOutput}'. Cannot parse.`);
		parsedInstance.error = 'VM instance object was null/undefined.';
		return parsedInstance;
	}

	if (!sourceBlueprint) {
		console.error(`[vmInstanceParserRecursive] Source blueprint (ViewModelDefinition) is null/undefined for VM instance '${instanceNameForOutput}'. Cannot parse properties.`);
		parsedInstance.error = 'Source blueprint (ViewModelDefinition) was null/undefined.';
		if (vmInstanceObj.source) {
			parsedInstance.blueprintName = vmInstanceObj.source.name;
		}
		return parsedInstance;
	}

	parsedInstance.blueprintName = sourceBlueprint.name; // Ensure it's correctly set

	let propertiesToIterate = [];

	if (sourceBlueprint.properties && Array.isArray(sourceBlueprint.properties)) {
		// Case 1: Properties are directly available as an array (e.g., from riveInstance.defaultViewModel())
		console.log("[vmInstanceParserRecursive] Iterating properties directly from sourceBlueprint.properties array.");
		propertiesToIterate = sourceBlueprint.properties;
	} else if (typeof sourceBlueprint.propertyCount === 'function' && typeof sourceBlueprint.propertyByIndex === 'function') {
		// Case 2: Properties are accessed via methods (e.g., from riveFile.viewModelByIndex())
		console.log("[vmInstanceParserRecursive] Iterating properties using sourceBlueprint.propertyCount() and propertyByIndex().");
		const propCount = sourceBlueprint.propertyCount();
		for (let i = 0; i < propCount; i++) {
			const prop = sourceBlueprint.propertyByIndex(i);
			if (prop) {
				propertiesToIterate.push(prop);
			}
		}
	} else {
		console.warn(`[vmInstanceParserRecursive] ViewModel blueprint '${sourceBlueprint.name}' does not provide properties as an array or via count/ByIndex methods. Cannot iterate properties.`);
	}

	for (const propDecl of propertiesToIterate) { // ViewModelPropertyDefinition
		console.log(`[vmInstanceParserRecursive] Processing property: '${propDecl.name}', isViewModel: ${propDecl.isViewModel}, type from propDecl: ${propDecl.type}`); // DIAGNOSTIC LOG

		// Determine if the property is a ViewModel. Prefer .isViewModel if available, otherwise check .type.
		const isActuallyViewModel = (propDecl.isViewModel === true) || (propDecl.isViewModel === undefined && propDecl.type === 'viewModel');

		if (isActuallyViewModel) {
			const nestedVmResult = handleNestedViewModelProperty(
				vmInstanceObj,
				propDecl,
				allFoundViewModelDefinitions,
				rive,
				parseViewModelInstanceRecursive // Pass self for recursion
			);
			parsedInstance.nestedViewModels.push(nestedVmResult);
		} else {
			// Input Property
			const inputPropertyResult = handleInputProperty(vmInstanceObj, propDecl, rive);
			parsedInstance.properties.push(inputPropertyResult);
		}
	}

	// After fully parsing this instance (including its own nested VMs),
	// add it to the `instances` array of its blueprint in the global list.
	if (sourceBlueprint && sourceBlueprint.name && allFoundViewModelDefinitions) {
		const targetBlueprintEntry = allFoundViewModelDefinitions.find(
			bp => bp.blueprintName === sourceBlueprint.name
		);
		if (targetBlueprintEntry) {
			// Avoid adding duplicates if this instance (by name) is already there
			// This is a simple check; more robust might be needed if instance names aren't unique within a blueprint scope
			// or if an instance could be processed multiple times by direct calls to this function (unlikely with current orchestrator).
			const alreadyExists = targetBlueprintEntry.instances.some(
				inst => inst.instanceName === parsedInstance.instanceName
			);
			if (!alreadyExists) {
				targetBlueprintEntry.instances.push(parsedInstance);
				console.log(`[vmInstanceParserRecursive] Added instance '${parsedInstance.instanceName}' to blueprint '${sourceBlueprint.name}' in global list.`);
			} else {
				console.log(`[vmInstanceParserRecursive] Instance '${parsedInstance.instanceName}' (Blueprint: '${sourceBlueprint.name}') already in global list. Skipping add.`);
			}
		} else {
			console.warn(`[vmInstanceParserRecursive] Could not find blueprint '${sourceBlueprint.name}' in allFoundViewModelDefinitions to add parsed instance '${parsedInstance.instanceName}'.`);
		}
	} else {
		console.warn(`[vmInstanceParserRecursive] Cannot add parsed instance '${parsedInstance.instanceName}' to global list due to missing sourceBlueprint, name, or definitions list.`);
	}

	return parsedInstance;
}
