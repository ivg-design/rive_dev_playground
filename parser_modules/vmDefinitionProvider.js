export function fetchAllRawViewModelDefinitions(riveFile) {
    const allFoundViewModelDefinitions = [];
    let vmdIndex = 0;
    let consecutiveDefinitionErrors = 0;
    const MAX_CONSECUTIVE_VM_DEF_ERRORS = 3; 
    const MAX_VM_DEFS_TO_PROBE = 200; 

    if (riveFile && typeof riveFile.viewModelByIndex === 'function') {
        while (vmdIndex < MAX_VM_DEFS_TO_PROBE && consecutiveDefinitionErrors < MAX_CONSECUTIVE_VM_DEF_ERRORS) {
            try {
                const vmDef = riveFile.viewModelByIndex(vmdIndex);
                if (vmDef && vmDef.name) {
                    allFoundViewModelDefinitions.push({ def: vmDef, name: vmDef.name });
                    consecutiveDefinitionErrors = 0; 
                } else {
                    consecutiveDefinitionErrors++;
                }
                vmdIndex++;
            } catch (e) {
                // Expected to break when index is out of bounds
                break;
            }
        }
    } else {
        console.error('riveFile.viewModelByIndex is not a function. Cannot parse ViewModel definitions.');
    }
    return allFoundViewModelDefinitions;
} 