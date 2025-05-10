/**
 * Analyzes a raw ViewModelDefinition to extract its properties, generate a fingerprint,
 * and identify names and count of nested ViewModel properties defined within it.
 *
 * @param {object} vmDefInput - An object containing the raw Rive ViewModelDefinition, e.g., { def: RiveViewModelDefinition, name: "VmName" }.
 * @param {object} rive - The Rive runtime instance (currently unused, but for future API consistency).
 * @returns {object} A structured blueprint object:
 *                   { blueprintName, rawDef, properties (non-VM inputs), fingerprint, 
 *                     instanceNamesFromDefinition (VM property names), instanceCountFromDefinition (VM property count) }
 */
export function analyzeBlueprintFromDefinition(vmDefInput, rive) {
    const vmDef = vmDefInput.def; // RiveViewModelDefinition
    const blueprintOutputEntry = {
        blueprintName: vmDefInput.name,
        rawDef: vmDef,
        properties: [], // For non-VM input properties (number, string, boolean, color, enum, trigger)
        fingerprint: '',
        instanceNamesFromDefinition: [], // Names of properties that ARE themselves ViewModels
        instanceCountFromDefinition: 0,  // Count of such ViewModel properties
    };

    const allPropsForFingerprint = [];
    const inputProps = [];
    const nestedVmPropertyNames = [];

    if (vmDef && typeof vmDef.propertyCount === 'function') {
        const propCount = vmDef.propertyCount();
        for (let k = 0; k < propCount; k++) {
            const p = vmDef.propertyByIndex(k); // RiveViewModelPropertyDefinition
            if (p && p.name && p.type) {
                allPropsForFingerprint.push({ name: p.name, type: p.type });
                if (p.isViewModel || p.type === 'viewModel') {
                    nestedVmPropertyNames.push(p.name);
                } else {
                    // This is a data input property (number, string, boolean, color, enum, trigger)
                    inputProps.push({ name: p.name, type: p.type });
                }
            }
        }
    } else if (vmDef && vmDef.properties && Array.isArray(vmDef.properties)) {
        // Fallback, less common based on typical Rive API usage
        vmDef.properties.forEach((p) => {
            if (p && p.name && p.type) {
                allPropsForFingerprint.push({ name: p.name, type: p.type });
                if (p.isViewModel || p.type === 'viewModel') {
                    nestedVmPropertyNames.push(p.name);
                } else {
                    inputProps.push({ name: p.name, type: p.type });
                }
            }
        });
        console.warn(`[vmBlueprintAnalyzer] Used fallback .properties array for VM Definition '${vmDefInput.name}'.`);
    }

    allPropsForFingerprint.sort((a, b) => a.name.localeCompare(b.name));
    inputProps.sort((a, b) => a.name.localeCompare(b.name));
    nestedVmPropertyNames.sort((a,b) => a.localeCompare(b));

    blueprintOutputEntry.properties = inputProps;
    blueprintOutputEntry.fingerprint = allPropsForFingerprint.map((p) => `${p.name}:${p.type}`).join('|');
    blueprintOutputEntry.instanceNamesFromDefinition = nestedVmPropertyNames;
    blueprintOutputEntry.instanceCountFromDefinition = nestedVmPropertyNames.length;
    
    return blueprintOutputEntry;
}

/**
 * Generates a fingerprint for a given ViewModelDefinition based on ALL its properties (inputs and nested VMs).
 * This is used for cross-referencing instances if their direct .source is compared.
 * 
 * @param {object} vmDef - The Rive ViewModelDefinition object.
 * @param {object} rive - The Rive runtime (unused here but for consistency).
 * @returns {string} A string fingerprint (e.g., "prop1:string|prop2:number|nestedVM1:viewModel").
 */
export function generateBlueprintFingerprint(vmDef, rive) {
    if (!vmDef) return "no-definition-to-fingerprint";
    
    const propsArray = [];
    if (vmDef && typeof vmDef.propertyCount === 'function') {
        const propCount = vmDef.propertyCount();
        for (let k = 0; k < propCount; k++) {
            const p = vmDef.propertyByIndex(k);
            if (p && p.name && p.type) {
                propsArray.push({ name: p.name, type: p.type });
            }
        }
    } else if (vmDef && vmDef.properties && Array.isArray(vmDef.properties)) {
        vmDef.properties.forEach((p) => {
            if (p && p.name && p.type) propsArray.push({ name: p.name, type: p.type });
        });
    }
    propsArray.sort((a, b) => a.name.localeCompare(b.name));
    return propsArray.map((p) => `${p.name}:${p.type}`).join('|');
} 