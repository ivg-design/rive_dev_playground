// parser_modules/processInputProperty.js

import { argbToHex } from './utils.js';

/**
 * Handles the processing of a simple input property from a ViewModel instance.
 * Retrieves its name, type, and attempts to get its value.
 *
 * @param {object} vmInstanceObj - The Rive ViewModelInstance object.
 * @param {object} propDecl - The property declaration object (ViewModelPropertyDefinition).
 * @param {object} rive - The Rive runtime instance (currently unused here but good for consistency).
 * @returns {object} An object representing the parsed input property { name, type, value }.
 */
export function handleInputProperty(vmInstanceObj, propDecl, rive) {
	const inputProperty = {
		name: propDecl.name,
		type: propDecl.type, // Type from the declaration (e.g., "boolean", "number", "string", "color", "enumType")
		value: 'UNINITIALIZED_VALUE'
	};

	let propObj = null; // This will hold the object returned by vmInstanceObj.type(name)

	try {
		switch (propDecl.type) {
			case 'number':
				if (typeof vmInstanceObj.number === 'function') {
					propObj = vmInstanceObj.number(propDecl.name);
					if (propObj && propObj._viewModelInstanceValue && propObj._viewModelInstanceValue.hasOwnProperty('value')) {
						inputProperty.value = propObj._viewModelInstanceValue.value === undefined ? null : propObj._viewModelInstanceValue.value;
					} else if (propObj && propObj.hasOwnProperty('value')) { // Fallback, less common
						inputProperty.value = propObj.value === undefined ? null : propObj.value;
					} else {
						inputProperty.value = `Value not found for Number (propObj: ${JSON.stringify(propObj)})`;
					}
				} else {
					inputProperty.value = 'vmInstanceObj.number is not a function';
				}
				break;
			case 'string':
				if (typeof vmInstanceObj.string === 'function') {
					propObj = vmInstanceObj.string(propDecl.name);
					if (propObj && propObj._viewModelInstanceValue && propObj._viewModelInstanceValue.hasOwnProperty('value')) {
						inputProperty.value = propObj._viewModelInstanceValue.value === undefined ? null : propObj._viewModelInstanceValue.value;
					} else if (propObj && propObj.hasOwnProperty('value')) {
						inputProperty.value = propObj.value === undefined ? null : propObj.value;
					} else {
						inputProperty.value = `Value not found for String (propObj: ${JSON.stringify(propObj)})`;
					}
				} else {
					inputProperty.value = 'vmInstanceObj.string is not a function';
				}
				break;
			case 'boolean':
				if (typeof vmInstanceObj.boolean === 'function') {
					propObj = vmInstanceObj.boolean(propDecl.name);
					if (propObj && propObj._viewModelInstanceValue && propObj._viewModelInstanceValue.hasOwnProperty('value')) {
						inputProperty.value = propObj._viewModelInstanceValue.value === undefined ? null : propObj._viewModelInstanceValue.value;
					} else if (propObj && propObj.hasOwnProperty('value')) {
						inputProperty.value = propObj.value === undefined ? null : propObj.value;
					} else {
						inputProperty.value = `Value not found for Boolean (propObj: ${JSON.stringify(propObj)})`;
					}
				} else {
					inputProperty.value = 'vmInstanceObj.boolean is not a function';
				}
				break;
			case 'enumType': // Assuming 'enumType' is the type string from propDecl
				if (typeof vmInstanceObj.enum === 'function') {
					propObj = vmInstanceObj.enum(propDecl.name);
					if (propObj && propObj._viewModelInstanceValue && propObj._viewModelInstanceValue.hasOwnProperty('value')) {
						inputProperty.value = propObj._viewModelInstanceValue.value === undefined ? null : propObj._viewModelInstanceValue.value;
					} else if (propObj && propObj.hasOwnProperty('value')) {
						inputProperty.value = propObj.value === undefined ? null : propObj.value;
					} else {
						inputProperty.value = `Value not found for Enum (propObj: ${JSON.stringify(propObj)})`;
					}
				} else {
					inputProperty.value = 'vmInstanceObj.enum is not a function (for enumType)';
				}
				break;
			case 'color':
				if (typeof vmInstanceObj.color === 'function') {
					propObj = vmInstanceObj.color(propDecl.name);
					if (propObj && propObj._viewModelInstanceValue && typeof propObj._viewModelInstanceValue.value === 'number') {
						inputProperty.value = argbToHex(propObj._viewModelInstanceValue.value);
					} else if (propObj && typeof propObj.value === 'number') { // Fallback
						inputProperty.value = argbToHex(propObj.value);
					} else {
						inputProperty.value = `Value not found for Color or not numeric (propObj: ${JSON.stringify(propObj)})`;
					}
				} else {
					inputProperty.value = 'vmInstanceObj.color is not a function';
				}
				break;
			case 'trigger':
				inputProperty.value = 'N/A (Trigger type has no persistent value to get)';
				break;
			case 'viewModel': // This case should ideally not be hit if vmInstanceParserRecursive routes correctly
				console.warn(`[processInputProperty] Received propDecl with type 'viewModel' (${propDecl.name}). This should be handled by handleNestedViewModelProperty.`);
				inputProperty.value = `UNHANDLED_AS_INPUT_PROPERTY: ${propDecl.type}`;
				break;
			default:
				inputProperty.value = `UNKNOWN_PROPERTY_TYPE_IN_SWITCH: ${propDecl.type}`;
				console.warn(`[processInputProperty] Unknown property type encountered in switch: ${propDecl.type} for property ${propDecl.name}`);
		}
	} catch (e) {
		inputProperty.value = `ERROR_GETTING_VALUE: ${e.message}`;
		console.error(`[processInputProperty] Error getting value for property '${propDecl.name}' (type '${propDecl.type}'):`, e);
		console.error("[processInputProperty] vmInstanceObj at time of error:", vmInstanceObj);
		console.error("[processInputProperty] propDecl at time of error:", propDecl);
		console.error("[processInputProperty] propObj at time of error:", propObj);
	}

	return inputProperty;
}
