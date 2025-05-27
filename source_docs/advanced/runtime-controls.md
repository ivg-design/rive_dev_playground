# 🎮 Runtime Controls Guide

> **Comprehensive guide to controlling Rive animations at runtime**

This guide covers the runtime control system that allows you to dynamically control Rive animations programmatically without requiring UI controls.

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [🚀 Basic Setup](#-basic-setup)
- [🎛️ Control System](#️-control-system)
- [🔧 API Reference](#-api-reference)
- [💡 Examples](#-examples)
- [🎨 Advanced Techniques](#-advanced-techniques)

## 🎯 Overview

The runtime control system provides a streamlined way to control Rive animations programmatically, allowing you to:

- **Toggle state machine inputs**: Boolean, number, and trigger inputs
- **Update text content**: Dynamic string properties in ViewModels
- **Change colors**: Real-time color property updates
- **Select enum values**: Dropdown-style enum property control
- **Swap images at runtime**: Dynamic image asset replacement
- **Listen for animation events**: React to Rive events and state changes

## 🚀 Basic Setup

### Initialize Rive Instance

```javascript
const rive = require("@rive-app/webgl2");

// Initialize Rive with event handling
const riveInstance = new rive.Rive({
	src: "your-animation.riv",
	artboard: "YourArtboard",
	stateMachines: "Your State Machine",
	canvas: document.getElementById("rive-canvas"),
	autoplay: true,
	autoBind: true,
	onStateChange: (stateMachine, state) => {
		console.log(`State changed: ${stateMachine} -> ${state}`);
	},
	onLoad() {
		riveInstance.resizeDrawingSurfaceToCanvas();
		// Initialize your controls after load
		initializeControls();
	},
});

// Handle window resizing
window.addEventListener("resize", () =>
	riveInstance.resizeDrawingSurfaceToCanvas(),
);
```

### Control Object Structure

Create a control object that represents all modifiable properties:

```javascript
const riveControls = {
	stateMachines: {
		"State Machine 1": {
			inputs: {
				"Diagram Enter": false,
				Speed: 1.0,
				Reset: null, // trigger
			},
		},
	},
	viewModels: {
		pill_1: {
			"Button Label": "Click Me",
			"Label Color": 0xffffffff,
		},
		popup_1: {
			"Image Picker": "image1",
			Title: "Hello World",
			Content: "This is some content",
		},
	},
	imageAssets: {
		background: "https://example.com/new-background.png",
	},
};
```

## 🎛️ Control System

### Initialize Controls

After the Rive instance loads, initialize your control system:

```javascript
function initializeControls() {
	// Get the diagram view model
	const diagramVM = riveInstance.viewModelInstance;

	// Map all available properties for programmatic control
	const controlMap = buildControlMap(riveInstance, diagramVM);

	// Apply initial values if needed
	applyControls(controlMap, riveControls);

	// Now you can update controls programmatically
	// Example: updateControl(controlMap, "pill_1.Button Label", "New Label");
}
```

### Building the Control Map

Create a map of all controllable properties:

```javascript
function buildControlMap(riveInst, diagramVM) {
	const controlMap = {
		stateMachineInputs: {},
		viewModels: {},
		imageAssets: {},
	};

	// Map state machine inputs
	riveInst.stateMachineNames.forEach((smName) => {
		controlMap.stateMachineInputs[smName] = {};
		riveInst.stateMachineInputs(smName).forEach((input) => {
			controlMap.stateMachineInputs[smName][input.name] = input;
		});
	});

	// Map view model properties
	diagramVM.properties
		.filter((p) => p.type === "viewModel")
		.forEach((p) => {
			const vm = diagramVM.viewModel(p.name);
			controlMap.viewModels[p.name] = {};

			// Try to map string properties
			try {
				const stringInputs = vm.strings();
				stringInputs.forEach((name) => {
					controlMap.viewModels[p.name][name] = vm.string(name);
				});
			} catch (_e) {}

			// Try to map color properties
			try {
				const colorInputs = vm.colors();
				colorInputs.forEach((name) => {
					controlMap.viewModels[p.name][name] = vm.color(name);
				});
			} catch (_e) {}

			// Try to map enum properties
			try {
				const enumInputs = vm.enums();
				enumInputs.forEach((name) => {
					controlMap.viewModels[p.name][name] = vm.enum(name);
				});
			} catch (_e) {}
		});

	// Map image assets
	riveInst.assets().forEach((asset) => {
		if (asset.isImage) {
			controlMap.imageAssets[asset.name] = asset;
		}
	});

	return controlMap;
}
```

### Updating Controls

Update any property at runtime:

```javascript
function updateControl(controlMap, path, value) {
	const parts = path.split(".");

	// Handle state machine inputs
	if (parts[0] === "stateMachines") {
		const smName = parts[1];
		const inputName = parts[2];
		controlMap.stateMachineInputs[smName][inputName].value = value;
		return true;
	}

	// Handle view model properties
	if (parts[0] === "viewModels") {
		const vmName = parts[1];
		const propName = parts[2];
		const prop = controlMap.viewModels[vmName][propName];

		// Handle different property types
		if (typeof value === "string" && prop.type === "string") {
			prop.value = value.replace(/\n/g, "\\n");
		} else if (typeof value === "string" && prop.type === "enum") {
			prop.value = value;
		} else if (typeof value === "number" && prop.type === "color") {
			prop.value = value; // Expecting ARGB format (0xFFFFFFFF)
		}
		return true;
	}

	// Handle image assets
	if (parts[0] === "imageAssets") {
		const assetName = parts[1];
		substituteImage(controlMap.imageAssets[assetName], value);
		return true;
	}

	return false;
}

// Apply all controls at once
function applyControls(controlMap, controlValues) {
	// Apply state machine inputs
	Object.entries(controlValues.stateMachines || {}).forEach(
		([smName, inputs]) => {
			Object.entries(inputs.inputs || {}).forEach(
				([inputName, value]) => {
					updateControl(
						controlMap,
						`stateMachines.${smName}.${inputName}`,
						value,
					);
				},
			);
		},
	);

	// Apply view model properties
	Object.entries(controlValues.viewModels || {}).forEach(
		([vmName, props]) => {
			Object.entries(props).forEach(([propName, value]) => {
				updateControl(
					controlMap,
					`viewModels.${vmName}.${propName}`,
					value,
				);
			});
		},
	);

	// Apply image assets
	Object.entries(controlValues.imageAssets || {}).forEach(
		([assetName, url]) => {
			updateControl(controlMap, `imageAssets.${assetName}`, url);
		},
	);
}
```

## 🔧 API Reference

### Rive Instance Methods

| Method                     | Description                             | Returns             |
| -------------------------- | --------------------------------------- | ------------------- |
| `stateMachineNames`        | Get all state machine names             | `string[]`          |
| `stateMachineInputs(name)` | Get inputs for a specific state machine | `Input[]`           |
| `viewModelInstance`        | Get the root view model                 | `ViewModelInstance` |
| `assets()`                 | Get all assets in the Rive file         | `Asset[]`           |
| `enums()`                  | Get all enum definitions                | `Enum[]`            |
| `on(eventType, callback)`  | Listen for events                       | `void`              |

### Control Path Format

- **State machine inputs**: `stateMachines.{MACHINE_NAME}.{INPUT_NAME}`
- **View model properties**: `viewModels.{MODEL_NAME}.{PROPERTY_NAME}`
- **Image assets**: `imageAssets.{ASSET_NAME}`

### Input Types

| Type      | Description        | Value Format               |
| --------- | ------------------ | -------------------------- |
| `Boolean` | True/false toggle  | `true` or `false`          |
| `Number`  | Numeric value      | Any number                 |
| `Trigger` | One-time event     | Call `.fire()` method      |
| `String`  | Text content       | Any string                 |
| `Color`   | ARGB color value   | `0xFFRRGGBB` format        |
| `Enum`    | Predefined options | String matching enum value |

## 💡 Examples

### Basic State Machine Control

```javascript
// Toggle a boolean input
updateControl(controlMap, "stateMachines.MainSM.isVisible", true);

// Set a number input
updateControl(controlMap, "stateMachines.MainSM.speed", 2.5);

// Fire a trigger
const triggerInput = controlMap.stateMachineInputs["MainSM"]["reset"];
triggerInput.fire();
```

### ViewModel Property Updates

```javascript
// Update text content
updateControl(controlMap, "viewModels.textBox.content", "New text content");

// Change color (ARGB format)
updateControl(controlMap, "viewModels.button.backgroundColor", 0xff00ff00); // Green

// Set enum value
updateControl(controlMap, "viewModels.dropdown.selectedOption", "option2");
```

### Image Swapping

```javascript
function substituteImage(asset, url) {
	if (!asset || !url) return;

	fetch(url)
		.then((r) => r.arrayBuffer())
		.then((buf) => rive.decodeImage(new Uint8Array(buf)))
		.then((img) => {
			asset.setRenderImage(img);
			img.unref();
		})
		.catch((e) => console.error("Image decode error", e));
}

// Usage
updateControl(
	controlMap,
	"imageAssets.background",
	"https://example.com/new-bg.png",
);
```

### Event Listening

```javascript
// Listen for Rive events
riveInstance.on(rive.EventType.RiveEvent, (e) => {
	const data = e.data || {};

	if (data.type === rive.RiveEventType.General) {
		console.log(`Rive Event: ${data.name}`);
		// Trigger your custom handlers here
	} else if (data.type === rive.RiveEventType.OpenUrl) {
		console.log(`OpenUrl Event: ${data.url}`);
		// Handle URL opening
	}
});

// Listen for state changes
function handleStateChange(stateMachine, state) {
	console.log(`State Change: ${stateMachine} -> ${state}`);
	// Add your custom state change handlers here
}
```

## 🎨 Advanced Techniques

### Color Conversion Helpers

```javascript
// Convert ARGB integer to hex string
function argbToHex(argb) {
	return "#" + (argb & 0xffffff).toString(16).padStart(6, "0").toUpperCase();
}

// Convert hex string to ARGB integer
function hexToArgb(hex) {
	return parseInt("FF" + hex.slice(1), 16);
}

// Usage
const redColor = hexToArgb("#FF0000");
updateControl(controlMap, "viewModels.button.color", redColor);
```

### Batch Updates

```javascript
// Update multiple properties efficiently
function batchUpdate(controlMap, updates) {
	const startTime = performance.now();

	updates.forEach(({ path, value }) => {
		updateControl(controlMap, path, value);
	});

	const endTime = performance.now();
	console.log(`Batch update completed in ${endTime - startTime}ms`);
}

// Usage
batchUpdate(controlMap, [
	{ path: "viewModels.title.text", value: "New Title" },
	{ path: "viewModels.title.color", value: 0xff0000ff },
	{ path: "stateMachines.MainSM.isActive", value: true },
]);
```

### Animation Sequences

```javascript
// Create animated sequences
function animateProperty(controlMap, path, startValue, endValue, duration) {
	const startTime = performance.now();

	function animate() {
		const elapsed = performance.now() - startTime;
		const progress = Math.min(elapsed / duration, 1);

		// Linear interpolation
		const currentValue = startValue + (endValue - startValue) * progress;
		updateControl(controlMap, path, currentValue);

		if (progress < 1) {
			requestAnimationFrame(animate);
		}
	}

	animate();
}

// Usage
animateProperty(controlMap, "stateMachines.MainSM.progress", 0, 100, 2000); // 2 second animation
```

### Complete Usage Example

```javascript
// Initialize Rive
const riveCanvas = document.getElementById("rive-canvas");
const riveInstance = new rive.Rive({
	src: "diagram.riv",
	artboard: "Diagram",
	stateMachines: "State Machine 1",
	canvas: riveCanvas,
	autoplay: true,
	autoBind: true,
	onStateChange: handleStateChange,
	onLoad() {
		riveInstance.resizeDrawingSurfaceToCanvas();

		// Initialize control system
		const controlMap = buildControlMap(
			riveInstance,
			riveInstance.viewModelInstance,
		);

		// Update specific controls
		updateControl(controlMap, "viewModels.pill_1.Button Label", "Start");
		updateControl(controlMap, "viewModels.pill_1.Label Color", 0xff00ff00); // Green
		updateControl(
			controlMap,
			"stateMachines.State Machine 1.Diagram Enter",
			true,
		);

		// Or update all at once
		applyControls(controlMap, {
			viewModels: {
				popup_1: {
					Title: "Welcome!",
					Content: "This is controlled programmatically",
				},
			},
			imageAssets: {
				background: "https://example.com/background.png",
			},
		});
	},
});
```

## 🔧 Tips for Production Use

1. **Cache the control map** after building it to avoid rebuilding on every update
2. **Implement data validation** before updating properties
3. **Set up error handling** for missing properties or invalid values
4. **Create convenience methods** for your specific animation's common operations
5. **Use debouncing** for rapid updates to avoid performance issues
6. **Monitor performance** with the built-in debugging tools
7. **Test thoroughly** across different browsers and devices

## 🐛 Debugging Runtime Controls

Use the global debugging features to troubleshoot control issues:

```javascript
// Access global Rive instance
const rive = window.riveInstanceGlobal;

// Inspect available controls
console.log("Available controls:", getAllControllableProperties());

// Test control updates
function testControl(path, value) {
	console.log(`Testing: ${path} = ${value}`);
	const result = updateControl(controlMap, path, value);
	console.log(`Result: ${result ? "Success" : "Failed"}`);
}

// Monitor control changes
function monitorControls() {
	const snapshot1 = createStateSnapshot();
	setTimeout(() => {
		const snapshot2 = createStateSnapshot();
		const differences = compareSnapshots(snapshot1, snapshot2);
		console.log("Control changes:", differences);
	}, 1000);
}
```

This runtime controls system provides powerful programmatic control over your Rive animations, enabling dynamic, interactive experiences without manual UI controls.
