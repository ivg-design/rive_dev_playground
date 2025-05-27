# Asset Manager

The Asset Manager is a powerful feature that allows you to inspect and replace embedded assets in your Rive files in real-time.

## :package: Overview

The Asset Manager panel displays all embedded assets found in your Rive file, including:

- **Images** (PNG, JPG, WebP, SVG)
- **Fonts** (TTF, OTF, WOFF, WOFF2)
- **Audio** (MP3, WAV, OGG) - _Future support_

## :mag: Asset Information

Each asset displays comprehensive metadata:

### Basic Information

- **Asset Name** - The original filename or identifier
- **Asset Type** - Image, Font, Audio, etc.
- **File Extension** - Original file format
- **Status Indicator** - Current state (embedded, replaced, error)

### Technical Details

- **Asset ID** - Unique identifier within the Rive file
- **CDN UUID** - Content delivery network identifier (if applicable)
- **Replacement Status** - Shows if asset has been modified

## :arrows_counterclockwise: Asset Replacement

### Local File Replacement

Replace assets with files from your computer:

1. **Click the file icon** :material-folder: next to the asset
2. **Select a replacement file** from your file system
3. **Watch the animation update** in real-time

!!! tip "Supported Formats" - **Images**: PNG, JPG, JPEG, WebP, SVG, GIF - **Fonts**: TTF, OTF, WOFF, WOFF2

### URL Replacement

Replace assets with files from the web:

1. **Enter a URL** in the URL input field
2. **Click "Apply URL"** :material-link: or press `Enter`
3. **The asset loads** and updates the animation

!!! warning "CORS Considerations"
Some URLs may not work due to Cross-Origin Resource Sharing (CORS) restrictions. Use direct file links when possible.

### Status Indicators

| Icon                 | Status            | Description                   |
| -------------------- | ----------------- | ----------------------------- |
| :material-paperclip: | **Embedded**      | Original asset from Rive file |
| :material-folder:    | **File Replaced** | Replaced with local file      |
| :material-link:      | **URL Replaced**  | Replaced with web URL         |
| :material-alert:     | **Error**         | Failed to load replacement    |

## :gear: Asset Operations

### Expand/Collapse Details

Click on any asset header to expand or collapse detailed information:

```
📦 Asset Name
├── Asset Type: Image
├── Asset ID: 12345
├── CDN UUID: abc-def-ghi
└── File Extension: .png
```

### Reset to Original

To restore an asset to its original embedded version:

1. **Click the Reset button** :material-refresh:
2. **The asset reverts** to the original embedded version
3. **Input fields are cleared** automatically

!!! note "Reset Limitations"
Currently, reset functionality restores the UI state but may require reloading the Rive file to fully restore the original asset.

### Asset Information Modal

Click the **Info button** :material-information: to view detailed asset information in a popup dialog.

## :computer: Code Examples

### Programmatic Asset Access

Access assets via the global Rive instance:

```javascript
// Get the asset map
const assetMap = window.riveInstanceGlobal.assetMap;

// Iterate through assets
assetMap.forEach((asset, name) => {
	console.log(`Asset: ${name}`);
	console.log(`Type: ${asset.isImage ? "Image" : "Other"}`);
	console.log(`Extension: ${asset.fileExtension}`);
});
```

### Asset Replacement API

Replace assets programmatically:

```javascript
// Replace an image asset
function replaceAsset(assetName, imageUrl) {
	fetch(imageUrl)
		.then((response) => response.arrayBuffer())
		.then((buffer) => {
			const img = window.rive.decodeImage(new Uint8Array(buffer));
			const asset = assetMap.get(assetName);
			if (asset && asset.setRenderImage) {
				asset.setRenderImage(img);
				img.unref();
			}
		});
}
```

## :bulb: Best Practices

### File Formats

!!! tip "Optimal Formats" - **Images**: Use WebP for best compression, PNG for transparency - **Fonts**: WOFF2 provides the best compression for web use - **Compatibility**: Stick to widely supported formats

### Performance Considerations

- **File Size**: Smaller assets load faster and improve performance
- **Resolution**: Match the resolution to your use case
- **Caching**: URLs may be cached by the browser

### Workflow Tips

1. **Test Locally First** - Verify assets work with local files before using URLs
2. **Keep Originals** - Always keep backup copies of original assets
3. **Document Changes** - Note which assets have been modified for your project

## :warning: Troubleshooting

### Common Issues

| Problem            | Solution                                       |
| ------------------ | ---------------------------------------------- |
| Asset won't load   | Check file format compatibility                |
| URL fails          | Verify CORS headers and direct link            |
| Animation breaks   | Ensure replacement matches original dimensions |
| Reset doesn't work | Reload the Rive file completely                |

### Debug Information

Enable debug logging to troubleshoot asset issues:

```javascript
// Enable asset manager debug logging
LoggerAPI.setModuleLevel("assetManager", LogLevel.DEBUG);
```

## :keyboard: Keyboard Shortcuts

| Shortcut | Action                        |
| -------- | ----------------------------- |
| `Click`  | Expand/collapse asset details |
| `Enter`  | Apply URL replacement         |
| `Escape` | Cancel current operation      |

---

**Related**: [User Guide](user-guide.md) | [Debugging](../advanced/debugging.md) | [Versioning](../development/versioning.md)
