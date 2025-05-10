import { argbToHex } from './utils.js';

export function extractPropertyValue(vmInstanceObj, propDecl) {
    // propDecl is expected to be an object like { name: 'propertyName', type: 'propertyType' }
    // vmInstanceObj is the Rive ViewModelInstance object.

    const inputInfo = { name: propDecl.name, type: propDecl.type, value: 'UNASSIGNED' };

    try {
        switch (propDecl.type) {
            case 'number':
                if (typeof vmInstanceObj.number === 'function') {
                    const propObj = vmInstanceObj.number(propDecl.name);
                    if (propObj && propObj._viewModelInstanceValue && propObj._viewModelInstanceValue.hasOwnProperty('value')) {
                        inputInfo.value = propObj._viewModelInstanceValue.value === undefined ? null : propObj._viewModelInstanceValue.value;
                    } else {
                        inputInfo.value = 'Number propObj._viewModelInstanceValue.value not found';
                    }
                } else {
                    inputInfo.value = 'vmInstanceObj.number is not a function';
                }
                break;
            case 'string':
                if (typeof vmInstanceObj.string === 'function') {
                    const propObj = vmInstanceObj.string(propDecl.name);
                    if (propObj && propObj._viewModelInstanceValue && propObj._viewModelInstanceValue.hasOwnProperty('value')) {
                        inputInfo.value = propObj._viewModelInstanceValue.value === undefined ? null : propObj._viewModelInstanceValue.value;
                    } else {
                        inputInfo.value = 'String propObj._viewModelInstanceValue.value not found';
                    }
                } else {
                    inputInfo.value = 'vmInstanceObj.string is not a function';
                }
                break;
            case 'boolean':
                if (typeof vmInstanceObj.boolean === 'function') {
                    const propObj = vmInstanceObj.boolean(propDecl.name);
                    if (propObj && propObj._viewModelInstanceValue && propObj._viewModelInstanceValue.hasOwnProperty('value')) {
                        inputInfo.value = propObj._viewModelInstanceValue.value === undefined ? null : propObj._viewModelInstanceValue.value;
                    } else {
                        inputInfo.value = 'Boolean propObj._viewModelInstanceValue.value not found';
                    }
                } else {
                    inputInfo.value = 'vmInstanceObj.boolean is not a function';
                }
                break;
            case 'enumType': // Assuming propDecl.type from blueprint is 'enumType'
                if (typeof vmInstanceObj.enum === 'function') {
                    const propObj = vmInstanceObj.enum(propDecl.name);
                    if (propObj && propObj._viewModelInstanceValue && propObj._viewModelInstanceValue.hasOwnProperty('value')) {
                        inputInfo.value = propObj._viewModelInstanceValue.value === undefined ? null : propObj._viewModelInstanceValue.value;
                    } else {
                        inputInfo.value = 'Enum (via .enum) propObj._viewModelInstanceValue.value not found';
                    }
                } else {
                    // Fallback for enum if .enum() is not available
                    if (typeof vmInstanceObj.string === 'function') {
                        const propObj = vmInstanceObj.string(propDecl.name);
                        if (propObj && propObj._viewModelInstanceValue && propObj._viewModelInstanceValue.hasOwnProperty('value')) {
                            inputInfo.value = propObj._viewModelInstanceValue.value === undefined ? null : propObj._viewModelInstanceValue.value;
                        } else {
                            inputInfo.value = 'Enum (via .string fallback) propObj._viewModelInstanceValue.value not found';
                        }
                    } else {
                        inputInfo.value = 'vmInstanceObj.enum (and .string) is not a function for enumType';
                    }
                }
                break;
            case 'color':
                if (typeof vmInstanceObj.color === 'function') {
                    const propObj = vmInstanceObj.color(propDecl.name);
                    if (propObj && propObj._viewModelInstanceValue && typeof propObj._viewModelInstanceValue.value === 'number') {
                        inputInfo.value = argbToHex(propObj._viewModelInstanceValue.value);
                    } else if (propObj && propObj._viewModelInstanceValue && typeof propObj._viewModelInstanceValue.value === 'string') {
                        inputInfo.value = propObj._viewModelInstanceValue.value;
                    } else if (propObj && typeof propObj.value === 'number') {
                        inputInfo.value = argbToHex(propObj.value);
                    } else if (propObj && typeof propObj.value === 'string') {
                        inputInfo.value = propObj.value;
                    } else if (typeof propObj === 'number') {
                        inputInfo.value = argbToHex(propObj);
                    } else {
                        inputInfo.value = `Color not in expected ARGB format (propObj: ${JSON.stringify(propObj)})`;
                    }
                } else {
                    inputInfo.value = 'vmInstanceObj.color is not a function';
                }
                break;
            case 'trigger':
                inputInfo.value = 'N/A (Trigger)';
                break;
            default:
                inputInfo.value = `UNHANDLED_PROPERTY_TYPE: ${propDecl.type}`;
        }
    } catch (e) {
        inputInfo.value = `ERROR_IN_PROPERTY_EXTRACTION: ${e.message}`;
    }
    return inputInfo; // Returns the whole inputInfo object { name, type, value }
} 