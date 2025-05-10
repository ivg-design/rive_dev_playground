// parser_modules/processInputProperty.js

import { extractVmInstancePropertyValue } from './vmInstancePropertyValueExtractor.js';

/**
 * Handles the processing of a simple input property for a ViewModel instance.
 *
 * @param {object} vmInstanceObj - The Rive ViewModelInstance object.
 * @param {object} propDecl - The property declaration (ViewModelPropertyDefinition) from the source blueprint.
 * @param {object} rive - The Rive runtime instance (passed to extractVmInstancePropertyValue).
 * @returns {object} An object containing the processed input property's name, type, and value.
 *                   Example: { name: 'propName', type: 'string', value: 'hello' }
 */
export function handleInputProperty(vmInstanceObj, propDecl, rive) {
	const valueExtractionResult = extractVmInstancePropertyValue(
		vmInstanceObj,
		propDecl, // Pass the full property declaration
		rive
	);

	// valueExtractionResult already contains the final value (e.g., hex for color)
	// and typeString, isColor flags.
	const inputInfo = {
		name: propDecl.name, // Or valueExtractionResult.name, should be the same
		type: valueExtractionResult.typeString,
		value: valueExtractionResult.value,
	};

	// If the original type was color, you could add an explicit flag or rely on type: 'color'
	// For now, the type string itself indicates if it was a color.
	// If isColor was important for the output structure, it could be added here:
	// if (valueExtractionResult.isColor) { inputInfo.isColor = true; }

	return inputInfo;
}
