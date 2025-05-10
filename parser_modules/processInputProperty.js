// parser_modules/processInputProperty.js

import { argbToHex } from './utils.js';

/**
 * Handles the processing of a simple input property from a ViewModel instance.
 * Retrieves its name, type, and attempts to get its value.
 *
 * @param {object} vmInstanceObj - The Rive ViewModelInstance object.
 * @param {object} propDecl - The property declaration object (ViewModelPropertyDefinition).
 * @param {object} rive - The Rive runtime instance.
 * @returns {object} An object representing the parsed input property { name, type, value }.
 */
export function handleInputProperty(vmInstanceObj, propDecl, rive) {
	const inputProperty = {
		name: propDecl.name,
		type: propDecl.type,
		value: 'UNINITIALIZED_VALUE'
	};

	let propObj = null;

	try {
		switch (propDecl.type) {
			case 'number':
				// console.log(`[processInputProperty DEBUG] Property: '${propDecl.name}', Type: '${propDecl.type}'`, { vmInstanceObj, propDecl });
				if (typeof vmInstanceObj.number === 'function') {
					propObj = vmInstanceObj.number(propDecl.name);
					// console.log(`[processInputProperty DEBUG] propObj for '${propDecl.name}':`, propObj);
					// if (propObj) {
					// 	console.log(`[processInputProperty DEBUG] propObj.value for '${propDecl.name}':`, propObj.value);
					// 	console.log(`[processInputProperty DEBUG] propObj._viewModelInstanceValue for '${propDecl.name}':`, propObj._viewModelInstanceValue);
					// 	if (propObj._viewModelInstanceValue) console.log(`[processInputProperty DEBUG] propObj._viewModelInstanceValue.value for '${propDecl.name}':`, propObj._viewModelInstanceValue.value);
					// }
					if (propObj && propObj._viewModelInstanceValue && propObj._viewModelInstanceValue.hasOwnProperty('value')) {
						inputProperty.value = propObj._viewModelInstanceValue.value === undefined ? null : propObj._viewModelInstanceValue.value;
					} else if (propObj && propObj.hasOwnProperty('value')) { // Fallback to direct .value if _viewModelInstanceValue is not present
						inputProperty.value = propObj.value === undefined ? null : propObj.value;
					} else {
						inputProperty.value = `Value not found (propObj: ${JSON.stringify(propObj)})`;
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
						inputProperty.value = `Value not found (propObj: ${JSON.stringify(propObj)})`;
					}
				} else {
					inputProperty.value = 'vmInstanceObj.string is not a function';
				}
				break;
			case 'boolean':
				// console.log(`[processInputProperty DEBUG] Property: '${propDecl.name}', Type: '${propDecl.type}'`, { vmInstanceObj, propDecl });
				if (typeof vmInstanceObj.boolean === 'function') {
					propObj = vmInstanceObj.boolean(propDecl.name);
					// console.log(`[processInputProperty DEBUG] propObj for '${propDecl.name}':`, propObj);
					// if (propObj) {
					// 	console.log(`[processInputProperty DEBUG] propObj.value for '${propDecl.name}':`, propObj.value);
					// 	console.log(`[processInputProperty DEBUG] propObj._viewModelInstanceValue for '${propDecl.name}':`, propObj._viewModelInstanceValue);
					// 	if (propObj._viewModelInstanceValue) console.log(`[processInputProperty DEBUG] propObj._viewModelInstanceValue.value for '${propDecl.name}':`, propObj._viewModelInstanceValue.value);
					// }
					if (propObj && propObj._viewModelInstanceValue && propObj._viewModelInstanceValue.hasOwnProperty('value')) {
						inputProperty.value = propObj._viewModelInstanceValue.value === undefined ? null : propObj._viewModelInstanceValue.value;
					} else if (propObj && propObj.hasOwnProperty('value')) {
						inputProperty.value = propObj.value === undefined ? null : propObj.value;
					} else {
						inputProperty.value = `Value not found (propObj: ${JSON.stringify(propObj)})`;
					}
				} else {
					inputProperty.value = 'vmInstanceObj.boolean is not a function';
				}
				break;
			case 'enumType':
				if (typeof vmInstanceObj.enum === 'function') {
					propObj = vmInstanceObj.enum(propDecl.name);
					if (propObj && propObj._viewModelInstanceValue && propObj._viewModelInstanceValue.hasOwnProperty('value')) {
						inputProperty.value = propObj._viewModelInstanceValue.value === undefined ? null : propObj._viewModelInstanceValue.value;
					} else if (propObj && propObj.hasOwnProperty('value')) {
						inputProperty.value = propObj.value === undefined ? null : propObj.value;
					} else {
						inputProperty.value = `Value not found (propObj: ${JSON.stringify(propObj)})`;
					}
				} else {
					// Original parser had a fallback to .string for enums, this might be specific to some Rive versions
					console.warn(`[processInputProperty] vmInstanceObj.enum is not a function for '${propDecl.name}'. Consider if a fallback to .string is needed like in original parser.`);
					inputProperty.value = 'vmInstanceObj.enum is not a function';
				}
				break;
			case 'color':
				if (typeof vmInstanceObj.color === 'function') {
					propObj = vmInstanceObj.color(propDecl.name);
					let colorValue = undefined;
					if (propObj && propObj._viewModelInstanceValue && typeof propObj._viewModelInstanceValue.value === 'number') {
						colorValue = propObj._viewModelInstanceValue.value;
					} else if (propObj && typeof propObj.value === 'number') { // Fallback for direct .value if it's a number
						colorValue = propObj.value;
					} else if (propObj && propObj._viewModelInstanceValue && typeof propObj._viewModelInstanceValue.value === 'string') { // Handle if color is already string hex
						colorValue = propObj._viewModelInstanceValue.value; // Will be returned as is if not numeric
					} else if (propObj && typeof propObj.value === 'string') {
						colorValue = propObj.value;
					}

					if (typeof colorValue === 'number') {
						inputProperty.value = argbToHex(colorValue);
					} else if (typeof colorValue === 'string') { // If it was already a string (e.g. hex from Rive)
						inputProperty.value = colorValue;
					} else {
						inputProperty.value = `Value not found or not numeric/string (propObj: ${JSON.stringify(propObj)}, colorValue: ${colorValue})`;
					}
				} else {
					inputProperty.value = 'vmInstanceObj.color is not a function';
				}
				break;
			case 'trigger':
				inputProperty.value = 'N/A (Trigger type has no persistent value to get)';
				break;
			case 'viewModel':
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
