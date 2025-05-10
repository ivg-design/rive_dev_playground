export function fetchAllRawViewModelDefinitions(riveFile, riveInstance) {
	const allFoundViewModelDefinitions = [];
	let vmdIndex = 0;

	// Get count from riveFile but prefer fetching definitions from riveInstance
	const vmDefinitionCount = (riveFile && typeof riveFile.viewModelCount === 'function') 
							? riveFile.viewModelCount() 
							: 0;
	
	console.log(`[vmDefinitionProvider] Found ${vmDefinitionCount} ViewModel definitions according to riveFile.viewModelCount().`);

	if (riveInstance && typeof riveInstance.viewModelByIndex === 'function') {
		console.log("[vmDefinitionProvider] Using riveInstance.viewModelByIndex() to fetch definitions.");
		for (vmdIndex = 0; vmdIndex < vmDefinitionCount; vmdIndex++) {
			try {
				const vmDef = riveInstance.viewModelByIndex(vmdIndex); 
				if (vmDef && vmDef.name) {
					allFoundViewModelDefinitions.push({ def: vmDef, name: vmDef.name });
				} else {
					console.warn(`[vmDefinitionProvider] riveInstance.viewModelByIndex(${vmdIndex}) returned falsy or nameless vmDef.`);
				}
			} catch (e) {
				console.error(`[vmDefinitionProvider] Error in riveInstance.viewModelByIndex loop (index ${vmdIndex}):`, e);
				// If one errors, we might not want to continue if count is unreliable
				break; 
			}
		}
	} else if (riveFile && typeof riveFile.viewModelByIndex === 'function') {
		// Fallback to riveFile.viewModelByIndex
		console.warn("[vmDefinitionProvider] riveInstance.viewModelByIndex() not found or riveInstance not provided. Falling back to riveFile.viewModelByIndex(). Property access might be limited.");
		// Loop up to vmDefinitionCount (if > 0) or just iterate carefully if count was 0 or unavailable
		const loopLimit = vmDefinitionCount > 0 ? vmDefinitionCount : 200; // 200 as a fallback MAX_VM_DEFS_TO_PROBE
		let consecutiveErrors = 0;
		const MAX_ERRORS = 3;
		for (vmdIndex = 0; vmdIndex < loopLimit && consecutiveErrors < MAX_ERRORS; vmdIndex++) {
			try {
				const vmDef = riveFile.viewModelByIndex(vmdIndex);
				if (vmDef && vmDef.name) {
					allFoundViewModelDefinitions.push({ def: vmDef, name: vmDef.name });
					consecutiveErrors = 0;
				} else {
					// This case might occur if loopLimit is from MAX_VM_DEFS_TO_PROBE and we go out of bounds
					console.warn(`[vmDefinitionProvider] riveFile.viewModelByIndex(${vmdIndex}) returned invalid or nameless definition (in fallback).`);
					consecutiveErrors++; 
				}
			} catch (e) {
				console.error(`[vmDefinitionProvider] Error calling riveFile.viewModelByIndex(${vmdIndex}) (in fallback):`, e);
				consecutiveErrors++;
				if (consecutiveErrors >= MAX_ERRORS) break;
			}
		}
	} else {
		console.error('[vmDefinitionProvider] Neither riveInstance.viewModelByIndex nor riveFile.viewModelByIndex is available. Cannot parse ViewModel definitions.');
	}
	return allFoundViewModelDefinitions;
}
