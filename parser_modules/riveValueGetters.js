/**
 * Helper function to safely access nested Rive property values.
 * It tries various common ways Rive might expose the value on a property object.
 * @param {object} propObj - The Rive property object (e.g., from vmInstanceObj.number('propName')).
 * @param {string} typeNameForError - Name of the type for error messages.
 * @returns {any} The extracted value or an error string/null.
 */
export function getNestedRiveValue(propObj, typeNameForError) {
    if (propObj === null || propObj === undefined) {
        return `Property object for ${typeNameForError} is null or undefined`;
    }

    // 1. Check if propObj itself is the value (e.g., for direct primitive return)
    // Be careful not to misinterpret an actual object as a primitive value here if the API can return actual objects.
    // This check is more for cases where the API might return the primitive directly instead of an object wrapper.
    // For Rive VM properties, it usually returns an object, but let's be safe.
    if (typeof propObj !== 'object' && propObj !== null) { // Allow null as a valid object-like type for further checks
        // This case is less likely for standard Rive VM property accessors like .string(), .number()
        // which typically return a Rive-specific object wrapper.
        // However, if it *could* return a primitive directly, this would catch it.
        // console.warn(`[getNestedRiveValue] propObj for ${typeNameForError} is a direct primitive:`, propObj);
        // return propObj;
    }

    // 2. Check propObj.value (common pattern if not _viewModelInstanceValue)
    if (propObj && propObj.hasOwnProperty('value')) {
        return propObj.value === undefined ? null : propObj.value;
    }

    // 3. Check propObj._viewModelInstanceValue.value (original path from user discovery)
    if (propObj && propObj._viewModelInstanceValue && propObj._viewModelInstanceValue.hasOwnProperty('value')) {
        return propObj._viewModelInstanceValue.value === undefined ? null : propObj._viewModelInstanceValue.value;
    }
    
    // 4. If propObj exists but none of the above, it might be the object itself that is the "value" in some contexts
    //    or the structure is different. For simple primitive types, this usually means value not found through known paths.
    //    However, for complex types this propObj itself might be the intended complex value.
    //    Given this function is for *nested* Rive values (implying primitives from wrappers),
    //    reaching here means the primitive wasn't found in expected places.
    // console.warn(`[getNestedRiveValue] Could not find primitive value for ${typeNameForError} in standard locations of propObj:`, propObj);
    return `Value not found for ${typeNameForError} in expected locations (propObj, propObj.value, propObj._viewModelInstanceValue.value)`;
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
        if (typeof value === 'string' && value.startsWith('Value not found for Enum (via .enum)')) {
             if (typeof vmInstanceObj.string === 'function') {
                const stringPropObj = vmInstanceObj.string(propName);
                return getNestedRiveValue(stringPropObj, 'Enum (via .string fallback)');
            }
            return 'vmInstanceObj.string is not a function for enum fallback';
        }
        return value;
    } else if (typeof vmInstanceObj.string === 'function') { 
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
        // For color, the structure might be different or propObj itself could be the numeric value
        // or an object with .value or ._viewModelInstanceValue.value containing the number.
        if (propObj && propObj._viewModelInstanceValue && typeof propObj._viewModelInstanceValue.value === 'number') {
            return propObj._viewModelInstanceValue.value; 
        } else if (propObj && propObj._viewModelInstanceValue && typeof propObj._viewModelInstanceValue.value === 'string') {
            return propObj._viewModelInstanceValue.value; 
        } else if (propObj && propObj.hasOwnProperty('value') && typeof propObj.value === 'number') {
            return propObj.value; 
        } else if (propObj && propObj.hasOwnProperty('value') && typeof propObj.value === 'string') {
            return propObj.value; 
        } else if (typeof propObj === 'number') { // If the .color(propName) directly returns the number
            return propObj; 
        }
        // If it's a string, it might already be hex from Rive, so pass it through.
        if (typeof propObj === 'string') {
             return propObj;
        }
        return `Color not in expected ARGB format or directly as hex string (propObj: ${JSON.stringify(propObj)})`;
    }
    return 'vmInstanceObj.color is not a function';
} 