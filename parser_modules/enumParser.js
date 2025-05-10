/**
 * Parses global enum definitions from the Rive file or instance.
 *
 * @param {object} riveInstance - The main Rive runtime instance.
 * @param {object} [riveFile] - Optional: The RiveFile object (e.g., riveInstance.file), for fallback.
 * @returns {Array<object>} An array of parsed global enum objects, structured as
 *                          [{ _dataEnum: { name: "EnumName", values: ["Val1", "Val2"] } }],
 *                          or an empty array if parsing fails or no enums are present.
 */
export function parseGlobalEnums(riveInstance, riveFile) {
    const parsedEnums = [];

    if (riveInstance && typeof riveInstance.enums === 'function') {
        try {
            const enumsFromInstance = riveInstance.enums(); // Expected to be Array<DataEnum>
            if (Array.isArray(enumsFromInstance)) {
                enumsFromInstance.forEach(dataEnumOuter => {
                    // Access the actual data which seems to be nested under _dataEnum
                    const dataEnum = dataEnumOuter && dataEnumOuter._dataEnum ? dataEnumOuter._dataEnum : dataEnumOuter;

                    if (dataEnum && typeof dataEnum.name === 'string' && Array.isArray(dataEnum.values)) {
                        parsedEnums.push({
                            _dataEnum: {
                                name: dataEnum.name,
                                values: dataEnum.values,
                            }
                        });
                    } else {
                        console.warn("[enumParser] Item from riveInstance.enums() (after checking ._dataEnum) does not have expected .name (string) and .values (array). DataEnumOuter:", dataEnumOuter);
                        if (dataEnumOuter) {
                            console.log("[enumParser] Keys on dataEnumOuter:", Object.keys(dataEnumOuter));
                            if (dataEnumOuter._dataEnum) {
                                console.log("[enumParser] Keys on dataEnumOuter._dataEnum:", Object.keys(dataEnumOuter._dataEnum));
                                console.log("[enumParser] dataEnumOuter._dataEnum.name type:", typeof dataEnumOuter._dataEnum.name);
                                console.log("[enumParser] dataEnumOuter._dataEnum.valueCount type:", typeof dataEnumOuter._dataEnum.valueCount);
                                console.log("[enumParser] dataEnumOuter._dataEnum.valueNameByIndex type:", typeof dataEnumOuter._dataEnum.valueNameByIndex);
                            }
                        }
                        // Also log the `dataEnum` variable that was derived
                        console.log("[enumParser] The 'dataEnum' variable used in the failed check was:", dataEnum);
                        if(dataEnum) {
                             console.log("[enumParser] Keys on 'dataEnum' variable:", Object.keys(dataEnum));
                        }
                    }
                });
            } else {
                console.warn("[enumParser] riveInstance.enums() did not return an array.", enumsFromInstance);
            }
        } catch (e) {
            console.error("[enumParser] Error calling or processing riveInstance.enums():", e);
        }
    } else if (riveFile && typeof riveFile.dataEnumCount === 'number' && typeof riveFile.dataEnumByIndex === 'function') {
        console.log("[enumParser] riveInstance.enums() not found or not a function. Falling back to riveFile.dataEnumCount/ByIndex.");
        try {
            const count = riveFile.dataEnumCount;
            for (let i = 0; i < count; i++) {
                const dataEnum = riveFile.dataEnumByIndex(i);
                if (dataEnum && typeof dataEnum.name === 'string' && Array.isArray(dataEnum.values)) {
                    parsedEnums.push({
                        _dataEnum: {
                            name: dataEnum.name,
                            values: dataEnum.values,
                        }
                    });
                } else {
                    console.warn(`[enumParser] Encountered an item from .dataEnumByIndex(${i}) that is not a valid DataEnum structure:`, dataEnum);
                }
            }
        } catch (e) {
            console.error("[enumParser] Error iterating through DataEnums via riveFile:", e);
        }
    } else {
        console.warn("[enumParser] No valid method found to parse enums (checked riveInstance.enums and riveFile.dataEnumCount/ByIndex). riveInstance:", riveInstance, "riveFile:", riveFile);
    }
    return parsedEnums;
} 