/**
 * Creates an asset collector object, which includes an array to store collected assets
 * and a callback function to be used with the Rive constructor's `loadAsset` option.
 *
 * The `loadAsset` callback is invoked by the Rive runtime when it encounters an asset
 * that needs to be loaded (e.g. images, fonts) if custom asset loading is desired.
 * In this parser's context, we're not custom-loading, but using it as a hook to list assets.
 *
 * @param {object} rive - The Rive runtime library object (e.g., window.rive), primarily to access enums if needed.
 * @returns {object} An object with:
 *                   - collectedAssets: An array that will be populated with asset details ({ name, cdnUuid }).
 *                   - assetLoaderCallback: The function to be passed to the Rive constructor as `loadAsset`.
 */
export function createAssetCollector(rive) {
	const collectedAssets = [];

	/**
	 * Callback for Rive's loadAsset option.
	 * @param {object} asset - A Rive FileAsset object (properties: name, cdnUuid, fileExtension, type, etc.)
	 * @returns {boolean} true to indicate Rive should proceed with its default loading for the asset.
	 */
	const assetLoaderCallback = (asset) => {
		if (asset) {
			const assetName = asset.name || 'Unnamed Asset';
			const assetCdnUuid = asset.cdnUuid || ''; // Default to empty string if null/undefined

			collectedAssets.push({
				name: assetName,
				cdnUuid: assetCdnUuid,
			});
		}
		// Return true so Rive continues to load the asset using its internal mechanisms.
		// We are just using this as a hook to collect asset information.
		return true;
	};

	return {
		collectedAssets,
		assetLoaderCallback,
	};
}
