// parser_modules/artboardParser.js

import { parseStateMachinesForArtboard } from './stateMachineParser.js';

/**
 * Parses all artboards in a Rive file, including their animations, state machines,
 * and attaches the pre-parsed main ViewModel instance to the default artboard.
 *
 * @param {object} riveFile - The RiveFile object.
 * @param {object} riveInstance - The main Rive runtime instance.
 * @param {object} parsedDefaultVmInstance - The pre-parsed main ViewModel instance for the default/active artboard.
 *                                           Can be null if no default VM was parsed.
 * @param {object} [dynamicSmInputTypeMap={}] - Optional map for dynamically calibrated SM input types.
 * @returns {Array<object>} An array of parsed artboard objects.
 */
export function parseArtboards(riveFile, riveInstance, parsedDefaultVmInstance, dynamicSmInputTypeMap = {}) {
	const parsedArtboards = [];
	if (!riveFile || typeof riveFile.artboardCount !== 'function') {
		console.error('[artboardParser] riveFile is invalid or does not have artboardCount method.');
		return parsedArtboards;
	}

	const defaultArtboardNameOnInstance = riveInstance?.artboard?.name;

	const artboardCount = riveFile.artboardCount();
	for (let i = 0; i < artboardCount; i++) {
		const artboardDef = riveFile.artboardByIndex(i);
		if (!artboardDef) {
			console.warn(`[artboardParser] Could not retrieve artboard definition at index ${i}.`);
			continue;
		}

		const artboardData = {
			name: artboardDef.name,
			animations: [],
			stateMachines: [],
			viewModels: [], // For VM instances; primarily for the default artboard
		};

		// Parse Animations
		const animCount = artboardDef.animationCount();
		for (let k = 0; k < animCount; k++) {
			const animDef = artboardDef.animationByIndex(k);
			if (animDef) {
				artboardData.animations.push({
					name: animDef.name,
					fps: animDef.fps,
					duration: animDef.duration,
					workStart: animDef.workStart, // Note: these can be large if not set, Rive uses sentinel
					workEnd: animDef.workEnd,
					// loop: animDef.loop, // rive.Loop enum e.g. Loop.loop, Loop.pingPong, Loop.oneShot
					// speed: animDef.speed, // This is on AnimationInstance, not Definition
				});
			}
		}

		// Parse State Machines
		artboardData.stateMachines = parseStateMachinesForArtboard(artboardDef, riveInstance, dynamicSmInputTypeMap);

		// Attach ViewModel instance if this is the default/active artboard and a VM instance was parsed
		if (parsedDefaultVmInstance && defaultArtboardNameOnInstance && artboardDef.name === defaultArtboardNameOnInstance) {
			artboardData.viewModels.push(parsedDefaultVmInstance);
		}

		parsedArtboards.push(artboardData);
	}

	return parsedArtboards;
}
