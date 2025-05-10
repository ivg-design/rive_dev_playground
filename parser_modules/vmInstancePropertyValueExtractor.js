import { argbToHex } from './utils.js';
import {
    getNumberValue,
    getStringValue,
    getBooleanValue,
    getEnumValue,
    getColorValue
} from './riveValueGetters.js';

/**
 * Extracts the value of a ViewModel instance property.
 * @param {object} vmInstanceObj - The Rive ViewModelInstance object.
 * @param {object} propDecl - Property declaration from ViewModelDefinition { name, type, isViewModel, ... }
 * @param {object} rive - The Rive runtime (currently unused but kept for API consistency if needed later)
 * @returns {{ name: string, typeString: string, value: any, isColor: boolean }}
 */
export function extractVmInstancePropertyValue(vmInstanceObj, propDecl, rive) {
    // rive is unused for now.

    let rawValue;
    const propName = propDecl.name;
    const propType = propDecl.type; // This is the type string from the blueprint, e.g. "number", "string", "color"

    try {
        switch (propType) {
            case 'number':
                rawValue = getNumberValue(vmInstanceObj, propName);
                break;
            case 'string':
                rawValue = getStringValue(vmInstanceObj, propName);
                break;
            case 'boolean':
                rawValue = getBooleanValue(vmInstanceObj, propName);
                break;
            case 'enumType': // Assuming propDecl.type from blueprint is 'enumType' for enums
                rawValue = getEnumValue(vmInstanceObj, propName);
                break;
            case 'color':
                rawValue = getColorValue(vmInstanceObj, propName);
                break;
            case 'trigger':
                rawValue = 'N/A (Trigger)';
                break;
            default:
                rawValue = `UNHANDLED_PROPERTY_TYPE: ${propType}`;
        }
    } catch (e) {
        rawValue = `ERROR_IN_PROPERTY_EXTRACTION: ${e.message}`;
    }

    const isColorType = propType === 'color';
    let finalValue = rawValue;

    // If it's a color and the rawValue is a number, convert to hex.
    // If rawValue is already a string (potentially hex), it's used as is.
    if (isColorType && typeof rawValue === 'number') {
        finalValue = argbToHex(rawValue);
    }

    return {
        name: propName,
        typeString: propType, // The original type string from the definition
        value: finalValue,
        isColor: isColorType, // Flag to indicate if the original type was 'color'
    };
} 