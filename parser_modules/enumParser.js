/**
 * Parses global enum definitions from the Rive file or instance.
 *
 * @param {object} riveFileOrInstance - The RiveFile object or the main Rive runtime instance.
 *                                      It should have an `enums()` method.
 * @returns {Array<object>} An array of parsed global enum objects, structured as
 *                          [{ _dataEnum: { name: "EnumName", values: ["Val1", "Val2"] } }],
 *                          or an empty array if parsing fails or no enums are present.
 */
export function parseGlobalEnums(riveFileOrInstance) {
    const parsedEnums = [];
    if (riveFileOrInstance && typeof riveFileOrInstance.enums === 'function') {
        try {
            const enumsFromRive = riveFileOrInstance.enums(); // This returns an array of DataEnum objects
            if (Array.isArray(enumsFromRive)) {
                enumsFromRive.forEach(dataEnum => {
                    // Assuming dataEnum directly has .name and .values properties
                    if (dataEnum && typeof dataEnum.name === 'string' && Array.isArray(dataEnum.values)) {
                        parsedEnums.push({
                            _dataEnum: {
                                name: dataEnum.name,
                                values: dataEnum.values,
                            }
                        });
                    } else {
                        console.warn("[enumParser] Encountered an item from .enums() that is not a valid DataEnum structure:", dataEnum);
                    }
                });
            }
        } catch (e) {
            console.error("[enumParser] Error calling or processing .enums():", e);
        }
    } else {
        console.warn("[enumParser] riveFileOrInstance.enums is not a function or instance not provided.");
    }
    return parsedEnums;
} 