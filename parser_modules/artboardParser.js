// parser_modules/artboardParser.js

import { parseStateMachinesForArtboard } from './stateMachineParser.js';
import { parseViewModelInstanceRecursive } from './vmInstanceParserRecursive.js'; // Assuming this is still relevant for non-default VMs

/**
 * Parses all artboards from a Rive file, including their animations, state machines (with inputs),
 * and potentially associated ViewModel instances (if a default one was parsed and passed).
 *
 * @param {object} riveFile - The RiveFile object from the Rive instance.
 * @param {object} riveInstance - The main Rive runtime instance (for accessing .contents and other runtime features).
 * @param {object} parsedDefaultVmInstance - The already parsed main/default ViewModel instance for the default artboard (if any).
 * @param {object} dynamicSmInputTypeMap - A map for dynamic SM input type calibration (passed to SM parser).
 * @param {Array<object>} allAnalyzedBlueprints - Array of all analyzed ViewModel blueprints (needed for parsing other VM instances if required).
 * @returns {Array<object>} An array of parsed artboard objects.
 */
export function parseArtboards(riveFile, riveInstance, parsedDefaultVmInstance, dynamicSmInputTypeMap, allAnalyzedBlueprints) {
	const artboardsOutput = [];
	if (!riveFile || typeof riveFile.artboardCount !== 'function') {
		console.error("[artboardParser] riveFile is invalid or missing artboardCount function.");
		return artboardsOutput;
	}

	const artboardCount = riveFile.artboardCount();

	for (let i = 0; i < artboardCount; i++) {
		const artboardDef = riveFile.artboardByIndex(i);
		if (!artboardDef || !artboardDef.name) {
			console.warn(`[artboardParser] Skipping artboard at index ${i} due to missing definition or name.`);
			continue;
		}

		const artboardEntry = {
			name: artboardDef.name,
			animations: [],
			stateMachines: [],
			viewModels: [], // For ViewModel instances specific to this artboard
		};

		// Parse Animations
		const animationCount = typeof artboardDef.animationCount === 'function' ? artboardDef.animationCount() : 0;
		for (let j = 0; j < animationCount; j++) {
			const animDef = artboardDef.animationByIndex(j);
			if (animDef && animDef.name) {
				artboardEntry.animations.push({
					name: animDef.name,
					fps: animDef.fps,
					duration: animDef.duration, // Duration in frames
					workStart: animDef.workStart,
					workEnd: animDef.workEnd,
					loopType: animDef.loop, // loopType as a number (e.g., 0: one-shot, 1: loop, 2: ping-pong)
					numericLoopType: animDef.loop, // Keep original numeric value
				});
			}
		}

		// Parse State Machines (this will now get all SMs for the current artboardDef)
		artboardEntry.stateMachines = parseStateMachinesForArtboard(riveInstance, artboardDef, dynamicSmInputTypeMap);

		// Handle ViewModel Instances for this artboard
		// If this is the default artboard and a default VM instance was already parsed, add it.
		// Note: `riveInstance.artboard` points to the *active* artboard on the instance.
		// We should compare by name to see if artboardDef is the one for which parsedDefaultVmInstance is relevant.
		if (parsedDefaultVmInstance && riveInstance.artboard && riveInstance.artboard.name === artboardDef.name) {
			// Check if it's not already added (e.g., if orchestrator added it to a placeholder)
			if (!artboardEntry.viewModels.find(vm => vm.instanceName === parsedDefaultVmInstance.instanceName && vm.sourceBlueprintName === parsedDefaultVmInstance.sourceBlueprintName)) {
				artboardEntry.viewModels.push(parsedDefaultVmInstance);
			}
		}

		// TODO: Future - Parse other specific ViewModel instances linked to *this* artboard if the Rive API supports querying them.
		// For now, only the main/default VM instance (parsed by vmOrchestrator) is handled here if it belongs to this artboard.

		artboardsOutput.push(artboardEntry);
	}

	return artboardsOutput;
}
