/**
 * Analyzes a raw ViewModelDefinition to extract its properties, generate a fingerprint,
 * and identify names and count of nested ViewModel properties defined within it.
 *
 * @param {object} vmDefInput - An object containing the raw Rive ViewModelDefinition, e.g., { def: RiveViewModelDefinition, name: "VmName" }.
 * @param {object} rive - The Rive runtime instance (currently unused, but for future API consistency).
 * @returns {object} A structured blueprint object:
 *                   { blueprintName, rawDef, properties (non-VM inputs), fingerprint, 
 *                     nestedViewModelPropertyNames (VM property names), nestedViewModelPropertyCount (VM property count),
 *                     globalInstanceCount (global instance count), globalInstanceNames (global instance names) }
 */
export function analyzeBlueprintFromDefinition(vmDefInput, rive) {
    const vmDef = vmDefInput.def; // RiveViewModelDefinition
    const blueprintOutputEntry = {
        blueprintName: vmDefInput.name,
        rawDef: vmDef,
        properties: [], // For non-VM input properties (number, string, boolean, color, enum, trigger)
        fingerprint: '',
        
        // Properties describing nested ViewModels *defined by this blueprint*
        nestedViewModelPropertyNames: [], // Names of properties that ARE themselves ViewModels (previously instanceNamesFromDefinition)
        nestedViewModelPropertyCount: 0,  // Count of such ViewModel properties (previously instanceCountFromDefinition)

        // Properties describing how this blueprint *itself* is instanced globally in the Rive file
        // (These come directly from the Rive ViewModelDefinition object like vmDef.instanceCount)
        globalInstanceCount: (vmDef && typeof vmDef.instanceCount === 'number') ? vmDef.instanceCount : 0,
        globalInstanceNames: (vmDef && Array.isArray(vmDef.instanceNames)) ? [...vmDef.instanceNames] : [],
    };

    const allPropsForFingerprint = [];
    const inputProps = [];
    const nestedVmPropertyNames = [];

    console.log(`[vmBlueprintAnalyzer] Analyzing blueprint: '${vmDefInput.name}'`);
    console.log(`[vmBlueprintAnalyzer] vmDef object:`, vmDef);
    console.log(`[vmBlueprintAnalyzer] typeof vmDef.propertyCount: ${typeof vmDef.propertyCount}`);
    console.log(`[vmBlueprintAnalyzer] typeof vmDef.properties: ${typeof vmDef.properties}`);
    if (vmDef && vmDef.properties && Array.isArray(vmDef.properties)) {
        console.log(`[vmBlueprintAnalyzer] vmDef.properties IS an array. Length: ${vmDef.properties.length}`);
    } else if (vmDef && vmDef.properties) {
        console.log(`[vmBlueprintAnalyzer] vmDef.properties is an object, not an array. Keys: ${Object.keys(vmDef.properties).join(', ')}`);
    } else {
        console.log(`[vmBlueprintAnalyzer] vmDef.properties is null, undefined, or not an array.`);
    }
    console.log(`[vmBlueprintAnalyzer] Keys on vmDef: ${Object.keys(vmDef).join(', ')}`);

    if (vmDef && vmDef.properties && Array.isArray(vmDef.properties)) {
        console.log(`[vmBlueprintAnalyzer] Using direct .properties array for '${vmDefInput.name}'`);
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
    } else if (vmDef && typeof vmDef.propertyCount === 'number' && typeof vmDef.propertyByIndex === 'function') {
        const propCount = vmDef.propertyCount; 
        console.log(`[vmBlueprintAnalyzer] Using numeric .propertyCount (${propCount}) and .propertyByIndex() for '${vmDefInput.name}'`);
        for (let k = 0; k < propCount; k++) {
            const p = vmDef.propertyByIndex(k);
            if (p && p.name && p.type) {
                allPropsForFingerprint.push({ name: p.name, type: p.type });
                if (p.isViewModel || p.type === 'viewModel') {
                    nestedVmPropertyNames.push(p.name);
                } else {
                    inputProps.push({ name: p.name, type: p.type });
                }
            }
        }
    } else if (vmDef && typeof vmDef.propertyCount === 'function' && typeof vmDef.propertyByIndex === 'function') {
        const propCount = vmDef.propertyCount();
        console.log(`[vmBlueprintAnalyzer] Using .propertyCount() (${propCount}) and .propertyByIndex() functions for '${vmDefInput.name}'`);
        for (let k = 0; k < propCount; k++) {
            const p = vmDef.propertyByIndex(k);
            if (p && p.name && p.type) {
                allPropsForFingerprint.push({ name: p.name, type: p.type });
                if (p.isViewModel || p.type === 'viewModel') {
                    nestedVmPropertyNames.push(p.name);
                } else {
                    inputProps.push({ name: p.name, type: p.type });
                }
            }
        }
    } else {
        console.warn(`[vmBlueprintAnalyzer] Could not find/access properties for VM Definition '${vmDefInput.name}'. Fingerprint might be empty.`);
        console.log(vmDef.propertyByIndex(1));
    }

    allPropsForFingerprint.sort((a, b) => a.name.localeCompare(b.name));
    inputProps.sort((a, b) => a.name.localeCompare(b.name));
    nestedVmPropertyNames.sort((a,b) => a.localeCompare(b));

    blueprintOutputEntry.properties = inputProps;
    blueprintOutputEntry.fingerprint = allPropsForFingerprint.map((p) => `${p.name}:${p.type}`).join('|');
    
    // Assign to the new clarified keys for nested VM properties
    blueprintOutputEntry.nestedViewModelPropertyNames = nestedVmPropertyNames;
    blueprintOutputEntry.nestedViewModelPropertyCount = nestedVmPropertyNames.length;
    
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

    if (vmDef && vmDef.properties && Array.isArray(vmDef.properties)) {
        console.log(`[vmBlueprintAnalyzer-generateFingerprint] Using direct .properties array for '${vmDef.name || 'instance'}'`);
        vmDef.properties.forEach((p) => {
            if (p && p.name && p.type) propsArray.push({ name: p.name, type: p.type });
        });
    } else if (vmDef && typeof vmDef.propertyCount === 'number' && typeof vmDef.propertyByIndex === 'function') {
        const propCount = vmDef.propertyCount;
        console.log(`[vmBlueprintAnalyzer-generateFingerprint] Using numeric .propertyCount (${propCount}) and .propertyByIndex() for '${vmDef.name || 'instance'}'`);
        for (let k = 0; k < propCount; k++) {
            const p = vmDef.propertyByIndex(k);
            if (p && p.name && p.type) {
                propsArray.push({ name: p.name, type: p.type });
            }
        }
    } else if (vmDef && typeof vmDef.propertyCount === 'function' && typeof vmDef.propertyByIndex === 'function') {
        const propCount = vmDef.propertyCount();
        console.log(`[vmBlueprintAnalyzer-generateFingerprint] Using .propertyCount() (${propCount}) and .propertyByIndex() functions for '${vmDef.name || 'instance'}'`);
        for (let k = 0; k < propCount; k++) {
            const p = vmDef.propertyByIndex(k);
            if (p && p.name && p.type) {
                propsArray.push({ name: p.name, type: p.type });
            }
        }
    } else {
        console.warn(`[vmBlueprintAnalyzer-generateFingerprint] Could not find/access properties for '${vmDef.name || 'instance'}'. Fingerprint might be empty.`);
    }

    propsArray.sort((a, b) => a.name.localeCompare(b.name));
    return propsArray.map((p) => `${p.name}:${p.type}`).join('|');
} 