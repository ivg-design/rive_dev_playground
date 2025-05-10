export function analyzeBlueprintFromDefinition(vmDefInput) {
    const vmDef = vmDefInput.def; // Assuming input is { def, name }
    const blueprintOutputEntry = {
        blueprintName: vmDefInput.name,
        rawDef: vmDef, // Keep a reference to the original Rive definition object
        properties: [],
        fingerprint: ''
        // instanceNamesFromDefinition and instanceCountFromDefinition will be added by the orchestrator
    };

    const currentBlueprintPropsArray = [];
    if (vmDef.properties && Array.isArray(vmDef.properties)) {
        vmDef.properties.forEach((p) => {
            if (p && p.name && p.type) currentBlueprintPropsArray.push({ name: p.name, type: p.type });
        });
    } else if (typeof vmDef.propertyCount === 'function') {
        const propCount = vmDef.propertyCount();
        for (let k = 0; k < propCount; k++) {
            const p = vmDef.propertyByIndex(k);
            if (p && p.name && p.type) currentBlueprintPropsArray.push({ name: p.name, type: p.type });
        }
    }
    currentBlueprintPropsArray.sort((a, b) => a.name.localeCompare(b.name));
    
    blueprintOutputEntry.properties = currentBlueprintPropsArray;
    blueprintOutputEntry.fingerprint = currentBlueprintPropsArray.map((p) => `${p.name}:${p.type}`).join('|');
    
    return blueprintOutputEntry;
} 