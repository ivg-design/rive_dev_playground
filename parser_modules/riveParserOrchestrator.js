// parser_modules/riveParserOrchestrator.js

import { createAssetCollector } from './assetParser.js';
import { parseGlobalEnums } from './enumParser.js';
import { orchestrateViewModelParsing } from './vmOrchestrator.js';
import { calibrateSmInputTypes } from './stateMachineParser.js'; // SM Parser also exports parseStateMachinesForArtboard
import { parseArtboards } from './artboardParser.js';

/**
 * Parses a Rive file buffer to extract a comprehensive JSON structure detailing
 * artboards, animations, state machines, assets, ViewModels, and enums.
 *
 * @param {object} riveEngine - The Rive library/engine object (e.g., window.rive).
 * @param {ArrayBuffer} riveFileBuffer - The ArrayBuffer of the .riv file.
 * @param {string} [artboardNameForSmCalibration=null] - Optional: Name of an artboard to use for SM input type calibration.
 * @param {string} [smNameForSmCalibration=null] - Optional: Name of an SM on that artboard for SM input type calibration.
 * @returns {Promise<object>} A Promise that resolves with the comprehensive JSON structure, or rejects on error.
 */
export function parseRiveFile(riveEngine, riveFileBuffer, artboardNameForSmCalibration = null, smNameForSmCalibration = null) {
	return new Promise((resolve, reject) => {
		if (!riveEngine || !riveFileBuffer) {
			console.error('[RiveParserOrchestrator] Rive engine or file buffer not provided.');
			return reject(new Error('Rive engine or file buffer not provided.'));
		}

		const { collectedAssets, assetLoaderCallback } = createAssetCollector(riveEngine);

		const riveParams = {
			buffer: riveFileBuffer,
			assetLoader: assetLoaderCallback,
			onLoad: (instance) => {
				try {
					console.log('[RiveParserOrchestrator] Rive file loaded successfully.');
					const riveInstance = instance; // Keep a reference to the instance from onLoad
					const riveFile = riveInstance.file;

					// 1. Calibrate SM Input Types (optional, but good to do early if params provided)
					let dynamicSmInputTypeMap = {};
					if (artboardNameForSmCalibration && smNameForSmCalibration) {
						console.log(`[RiveParserOrchestrator] Attempting SM input type calibration with Artboard: '${artboardNameForSmCalibration}', SM: '${smNameForSmCalibration}'.`);
						dynamicSmInputTypeMap = calibrateSmInputTypes(riveInstance, artboardNameForSmCalibration, smNameForSmCalibration);
					} else {
						console.log('[RiveParserOrchestrator] SM input type calibration parameters not provided, skipping explicit calibration. Parser will rely on default codes.');
					}

					// 2. Parse Global Enums
					const globalEnums = parseGlobalEnums(riveFile);

					// 3. Orchestrate ViewModel Parsing
					const { allAnalyzedBlueprints, parsedDefaultVmInstance } = orchestrateViewModelParsing(riveFile, riveInstance);

					// 4. Transform allAnalyzedBlueprints for the final JSON structure
					const allViewModelDefinitionsAndInstances = allAnalyzedBlueprints.map((bp) => ({
						blueprintName: bp.blueprintName,
						blueprintProperties: bp.properties, // Now correctly contains only non-VM input properties
						instanceNamesFromDefinition: bp.instanceNamesFromDefinition,
						instanceCountFromDefinition: bp.instanceCountFromDefinition,
						// rawDef: bp.rawDef, // Optional: could include for deeper inspection
						// fingerprint: bp.fingerprint, // Optional: could include for deeper inspection
						parsedInstances: [], // As per original spec, this remains empty for now
					}));

					// 5. Parse Artboards (passing the processed default VM instance and SM type map)
					const artboards = parseArtboards(riveFile, riveInstance, parsedDefaultVmInstance, dynamicSmInputTypeMap);

					// 6. Assets were collected by the assetLoaderCallback via the `collectedAssets` array
					const assets = collectedAssets;

					// 7. Assemble Final Result
					const result = {
						artboards,
						assets,
						allViewModelDefinitionsAndInstances,
						globalEnums,
					};

					console.log('[RiveParserOrchestrator] Parsing complete.');
					resolve(result);
				} catch (e) {
					console.error('[RiveParserOrchestrator] Error during parsing logic after Rive load:', e);
					reject(e);
				}
			},
			onLoadError: (error) => {
				console.error('[RiveParserOrchestrator] Rive onLoadError:', error);
				reject(error);
			},
		};

		// If calibration parameters are provided, pass them to Rive constructor to ensure the artboard/SM are active
		// This helps `calibrateSmInputTypes` if it relies on `riveInstance.stateMachineInstance()` for live types.
		if (artboardNameForSmCalibration) {
			riveParams.artboard = artboardNameForSmCalibration;
			if (smNameForSmCalibration) {
				// Rive constructor expects stateMachines to be an array of names or SMDef objects
				riveParams.stateMachines = [smNameForSmCalibration];
			}
		}

		new riveEngine.Rive(riveParams);
	});
}
