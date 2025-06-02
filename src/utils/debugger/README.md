# Rive Instance Chrome DevTools Formatter

## Overview

This comprehensive Chrome DevTools formatter provides a structured, hierarchical view of Rive animation engine instances directly in the browser's developer tools console. It makes debugging and inspecting Rive animations much easier by organizing all the complex instance data into readable, expandable sections.

## Features

### 🎯 Core Instance Information
- Loading state, canvas details, source file information
- Device pixel ratio, volume, touch scroll settings
- Destruction state and readiness for playback

### ⚙️ Runtime Components  
- Runtime, renderer, artboard, and file availability
- Artboard bounds, animation counts, audio capabilities
- File references and artboard counts

### 🎬 Animations & State Machines
- Complete animation and state machine listings
- Playback states (playing, paused, stopped)
- Individual animation details with timing information
- State machine inputs and current states

### 📊 Performance Metrics
- Real-time FPS monitoring
- Frame time analysis with min/max/average calculations
- Frame count tracking and duration samples
- Render timing statistics

### 📡 Event Management
- Event manager and task queue status
- Active listeners count and types
- Event cleanup function availability
- Audio event listener tracking

### 🖼️ Layout & Rendering
- Layout configuration (fit mode, alignment, scale factor)
- Artboard dimensions and bounds
- Canvas size information and zero-size detection

### 🔗 View Models & Data Binding
- View model instance details
- Data enums and property counts
- Reference counting and lifecycle management

### 📦 Asset Management
- Rive file availability and reference counting
- Asset loader configuration
- CDN settings and file destruction state

### 🛠️ Methods & API
- Available method listings
- API endpoint availability checking

### 🐛 Debug Information
- Constructor information and prototype chain
- Object keys count and binding details
- Frame request ID and canvas observation state

## Installation & Setup

### 1. Enable Chrome DevTools Custom Formatters

**Important:** You must enable custom formatters in Chrome DevTools for the best experience.

1. Open Chrome DevTools (F12)
2. Go to Settings (⚙️ gear icon)
3. Navigate to **Preferences**
4. Under **Console**, check ✅ **"Enable custom formatters"**
5. Reload the page

### 2. Automatic Loading

The formatter is automatically loaded when you include the debugger utilities:

```html
<!-- Already included in index.html -->
<script type="module" src="src/utils/debugger/index.js"></script>
```

### 3. Verification

After loading, you should see these console messages:
```
[RiveFormatter] 🎯 Rive Instance Formatter Loaded
[RiveFormatter] 📋 Usage: The formatter will automatically detect Rive instances in the console.
[RiveFormatter] 🔍 Look for window.riveInstanceGlobal to inspect the current Rive instance.
[RiveFormatter] 🛠️ Use formatRiveInstance(instance) for manual analysis.
```

## Usage

### Automatic Formatting

Once enabled, any Rive instance logged to the console will automatically be formatted:

```javascript
// This will show the formatted view
console.log(window.riveInstanceGlobal);
```

### Manual Analysis

Use the global function for detailed analysis:

```javascript
// Manual instance analysis
formatRiveInstance(window.riveInstanceGlobal);
```

### Accessing the Current Instance

The application exposes the current Rive instance globally:

```javascript
// Access the current Rive instance
window.riveInstanceGlobal

// Check if it's loaded
window.riveInstanceGlobal?.loaded

// Get performance metrics
window.riveInstanceGlobal?.fps
window.riveInstanceGlobal?.frameCount
```

## Debugging Utilities

### Global Debug Objects

```javascript
// Rive formatter utilities
window.RiveDebugFormatter.formatRiveInstance(instance)
window.RiveFormatterUtils.isRiveInstance(obj)

// Logger utilities  
window.DebugLogger.createLogger('myModule')
window.DebugLogger.LoggerAPI.setModuleLevel('controlInterface', 4)
```

### Performance Analysis

```javascript
// Get performance stats
const instance = window.riveInstanceGlobal;
if (instance) {
    console.log('FPS:', instance.fps);
    console.log('Frame Time:', instance.frameTime + 'ms');
    console.log('Frame Count:', instance.frameCount);
    
    // Get duration statistics
    const durations = instance.durations || [];
    if (durations.length > 0) {
        const avg = durations.reduce((a,b) => a+b, 0) / durations.length;
        console.log('Average Frame Duration:', avg.toFixed(2) + 'ms');
    }
}
```

### Animation Control

```javascript
// Control animations
const instance = window.riveInstanceGlobal;
if (instance && instance.loaded) {
    // Play animation
    instance.play(['animationName']);
    
    // Pause animation
    instance.pause(['animationName']);
    
    // Stop all
    instance.stop();
    
    // Get current state
    console.log('Playing:', instance.isPlaying);
    console.log('Paused:', instance.isPaused);
}
```

### State Machine Interaction

```javascript
// Access state machine inputs
const instance = window.riveInstanceGlobal;
const inputs = instance.stateMachineInputs('StateMachineName');

inputs.forEach(input => {
    console.log(`Input: ${input.name}, Type: ${input.type}, Value: ${input.value}`);
    
    // Modify boolean input
    if (input.type === 59) { // Boolean
        input.value = true;
    }
    
    // Fire trigger
    if (input.type === 58) { // Trigger
        input.fire();
    }
});
```

## Formatted View Structure

When you inspect `window.riveInstanceGlobal` in the console, you'll see:

```
🟢 Rive Instance Status: Loaded Canvas: rive-canvas Source: animation.riv
├── 🎯 Core Instance
│   ├── Loaded: true
│   ├── Canvas Size: 800 × 600
│   └── Volume: 1
├── ⚙️ Runtime Components  
│   ├── Runtime Available: true
│   ├── Artboard Name: "MainArtboard"
│   └── Animation Count: 5
├── 🎬 Animations & State Machines
│   ├── Total Animations: 3
│   ├── Playing: Animation1, Animation2
│   └── State Machines (2): StateMachine1, StateMachine2
├── 📊 Performance Metrics
│   ├── Current FPS: 60.00
│   ├── Frame Time: 16.67ms
│   └── Frame Count: 1543
└── ... (additional sections)
```

## Troubleshooting

### Formatter Not Working

1. **Check Custom Formatters**: Ensure "Enable custom formatters" is checked in DevTools settings
2. **Reload Page**: After enabling formatters, reload the page
3. **Console Messages**: Look for initialization messages starting with `[RiveFormatter]`
4. **Browser Compatibility**: Only works in Chromium-based browsers (Chrome, Edge, etc.)

### Instance Not Found

```javascript
// Check if instance exists
if (!window.riveInstanceGlobal) {
    console.warn('No Rive instance found. Load a Rive file first.');
} else if (!window.riveInstanceGlobal.loaded) {
    console.warn('Rive instance exists but not loaded yet.');
}
```

### Performance Issues

The formatter is designed to be lightweight, but for complex instances:

```javascript
// Disable formatter logging if needed
window.RiveDebugFormatter.FormatterLogger.enabled = false;

// Check instance complexity
const instance = window.riveInstanceGlobal;
console.log('Object keys:', Object.keys(instance).length);
console.log('Animations:', instance.animator?.animations?.length || 0);
console.log('State Machines:', instance.animator?.stateMachines?.length || 0);
```

## API Reference

### FormatterUtils

```javascript
// Check if object is Rive instance
FormatterUtils.isRiveInstance(obj)

// Safely get nested property
FormatterUtils.safeGet(obj, 'path.to.property', defaultValue)

// Format bytes
FormatterUtils.formatBytes(1024) // "1 KB"

// Format timing
FormatterUtils.formatTiming(16.67) // "16.67ms"

// Get array preview
FormatterUtils.getArrayPreview(['a', 'b', 'c'], 2) // "[a, b, ...+1]"
```

### Manual Formatting

```javascript
// Get formatted header
RiveInstanceFormatter.header(instance)

// Get formatted body
RiveInstanceFormatter.body(instance)

// Create custom sections
RiveInstanceFormatter.createSection('Custom Title', content)
```

## Tips for Effective Debugging

1. **Load a Rive File First**: The formatter works best when a Rive file is actually loaded
2. **Use Expandable Sections**: Click on section headers to expand/collapse details
3. **Monitor Performance**: Keep the Performance Metrics section open during testing
4. **Check Event Management**: Monitor active listeners and event cleanup
5. **Verify State Changes**: Watch animation and state machine states in real-time

## Contributing

To extend the formatter:

1. Add new sections in `RiveInstanceFormatter.body()`
2. Create corresponding data gathering methods
3. Update the documentation
4. Test with various Rive files and configurations

## Version History

- **v1.0.0**: Initial comprehensive formatter with all major sections
- Supports all Rive instance properties and methods
- Performance metrics and real-time monitoring
- Complete event management tracking 