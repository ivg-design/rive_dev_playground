/**
 * Helper function to safely access nested Rive property values.
 * @param {object} propObj - The Rive property object (e.g., from vmInstanceObj.number('propName')).
 * @param {string} typeNameForError - Name of the type for error messages.
 * @returns {any} The extracted value or an error string/null.
 */
export function getNestedRiveValue(propObj, typeNameForError) {
    if (propObj && propObj._viewModelInstanceValue && propObj._viewModelInstanceValue.hasOwnProperty('value')) {
        return propObj._viewModelInstanceValue.value === undefined ? null : propObj._viewModelInstanceValue.value;
    }
    return `Value (propObj._viewModelInstanceValue.value) not found for ${typeNameForError}`;
}

/**
 * Gets a number value from a Rive ViewModel instance property.
 * @param {object} vmInstanceObj - The Rive ViewModelInstance object.
 * @param {string} propName - The name of the property.
 * @returns {number|string} The number value or an error string.
 */
export function getNumberValue(vmInstanceObj, propName) {
    if (typeof vmInstanceObj.number === 'function') {
        const propObj = vmInstanceObj.number(propName);
        return getNestedRiveValue(propObj, 'Number');
    }
    return 'vmInstanceObj.number is not a function';
}

/**
 * Gets a string value from a Rive ViewModel instance property.
 * @param {object} vmInstanceObj - The Rive ViewModelInstance object.
 * @param {string} propName - The name of the property.
 * @returns {string|null} The string value, null, or an error string.
 */
export function getStringValue(vmInstanceObj, propName) {
    if (typeof vmInstanceObj.string === 'function') {
        const propObj = vmInstanceObj.string(propName);
        return getNestedRiveValue(propObj, 'String');
    }
    return 'vmInstanceObj.string is not a function';
}

/**
 * Gets a boolean value from a Rive ViewModel instance property.
 * @param {object} vmInstanceObj - The Rive ViewModelInstance object.
 * @param {string} propName - The name of the property.
 * @returns {boolean|string|null} The boolean value, null, or an error string.
 */
export function getBooleanValue(vmInstanceObj, propName) {
    if (typeof vmInstanceObj.boolean === 'function') {
        const propObj = vmInstanceObj.boolean(propName);
        return getNestedRiveValue(propObj, 'Boolean');
    }
    return 'vmInstanceObj.boolean is not a function';
}

/**
 * Gets an enum value from a Rive ViewModel instance property.
 * Tries .enum() first, then falls back to .string().
 * @param {object} vmInstanceObj - The Rive ViewModelInstance object.
 * @param {string} propName - The name of the property.
 * @returns {string|null} The enum value (as string), null, or an error string.
 */
export function getEnumValue(vmInstanceObj, propName) {
    if (typeof vmInstanceObj.enum === 'function') {
        const propObj = vmInstanceObj.enum(propName);
        const value = getNestedRiveValue(propObj, 'Enum (via .enum)');
        // If .enum() fails or returns error string, try .string() as a fallback
        if (typeof value === 'string' && value.startsWith('Value (propObj._viewModelInstanceValue.value) not found')) {
             if (typeof vmInstanceObj.string === 'function') {
                const stringPropObj = vmInstanceObj.string(propName);
                return getNestedRiveValue(stringPropObj, 'Enum (via .string fallback)');
            }
            return 'vmInstanceObj.string is not a function for enum fallback';
        }
        return value;
    } else if (typeof vmInstanceObj.string === 'function') { // Fallback if .enum() itself doesn't exist
        const propObj = vmInstanceObj.string(propName);
        return getNestedRiveValue(propObj, 'Enum (via .string primary fallback)');
    }
    return 'vmInstanceObj.enum (and .string) is not a function for enumType';
}

/**
 * Gets a color value from a Rive ViewModel instance property.
 * Returns the raw numeric value or string, hex conversion happens later.
 * @param {object} vmInstanceObj - The Rive ViewModelInstance object.
 * @param {string} propName - The name of the property.
 * @returns {number|string} The color value (numeric ARGB or string) or an error string.
 */
export function getColorValue(vmInstanceObj, propName) {
    if (typeof vmInstanceObj.color === 'function') {
        const propObj = vmInstanceObj.color(propName);
        if (propObj && propObj._viewModelInstanceValue && typeof propObj._viewModelInstanceValue.value === 'number') {
            return propObj._viewModelInstanceValue.value; 
        } else if (propObj && propObj._viewModelInstanceValue && typeof propObj._viewModelInstanceValue.value === 'string') {
            return propObj._viewModelInstanceValue.value; 
        } else if (propObj && typeof propObj.value === 'number') {
            return propObj.value; 
        } else if (propObj && typeof propObj.value === 'string') {
            return propObj.value; 
        } else if (typeof propObj === 'number') {
            return propObj; 
        }
        return `Color not in expected ARGB format or directly as hex string (propObj: ${JSON.stringify(propObj)})`;
    }
    return 'vmInstanceObj.color is not a function';
} 