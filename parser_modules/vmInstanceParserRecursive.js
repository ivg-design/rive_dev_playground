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
	const parsedInstance = {
		instanceName: instanceNameForOutput,
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

	for (let i = 0; i < sourceBlueprint.propertyCount(); i++) {
		const propDecl = sourceBlueprint.propertyByIndex(i); // ViewModelPropertyDefinition

		if (propDecl.isViewModel) {
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
	return parsedInstance;
}
