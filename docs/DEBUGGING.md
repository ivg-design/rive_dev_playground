# 🐛 Debugging Guide

> **Comprehensive debugging tools and techniques for Rive Playground**

This guide covers all debugging features, tools, and techniques available in the Rive Playground, including global runtime access, modular logging, and advanced debugging strategies.

## 📋 Table of Contents

- [🌐 Global Runtime Access](#-global-runtime-access)
- [📊 Debug Logging System](#-debug-logging-system)
- [🔍 Inspection Tools](#-inspection-tools)
- [⚠️ Error Handling](#️-error-handling)
- [🎛️ Runtime Controls](#️-runtime-controls)
- [📈 Performance Monitoring](#-performance-monitoring)
- [🧪 Testing & Validation](#-testing--validation)

## 🌐 Global Runtime Access

The Rive Playground exposes the current Rive instance globally for advanced debugging and runtime inspection.

### `window.riveInstanceGlobal`

Access the current Rive instance from the browser console:

```javascript
// Get the global Rive instance
const rive = window.riveInstanceGlobal;

// Check if instance is available
if (rive) {
  console.log('Rive instance is loaded and ready');
} else {
  console.log('No Rive instance currently loaded');
}
```

### Artboard Inspection

```javascript
// Get all artboard names
console.log('Artboards:', rive.artboardNames);

// Get current artboard
console.log('Current artboard:', rive.artboard?.name);

// Switch to different artboard
rive.artboard = rive.artboardByName('ArtboardName');

// Get artboard dimensions
console.log('Artboard size:', {
  width: rive.artboard?.width,
  height: rive.artboard?.height
});
```

### Animation Control

```javascript
// Get all animations
console.log('Animations:', rive.animationNames);

// Control timeline playback
const timeline = rive.animationByName('AnimationName');
if (timeline) {
  timeline.time = 0;        // Reset to start
  timeline.speed = 0.5;     // Half speed
  timeline.loopValue = 1;   // Loop once
}

// Get animation properties
console.log('Animation info:', {
  name: timeline.name,
  duration: timeline.duration,
  fps: timeline.fps,
  workStart: timeline.workStart,
  workEnd: timeline.workEnd
});
```

### State Machine Debugging

```javascript
// Get all state machines
console.log('State Machines:', rive.stateMachineNames);

// Get state machine inputs
const smInputs = rive.stateMachineInputs('StateMachineName');
smInputs.forEach(input => {
  console.log(`Input: ${input.name}`, {
    type: input.type,
    value: input.value,
    isBoolean: input.asBool !== undefined,
    isNumber: input.asNumber !== undefined,
    isTrigger: input.asTrigger !== undefined
  });
});

// Modify state machine inputs
const boolInput = rive.getBooleanInput('InputName');
if (boolInput) {
  boolInput.value = true;
}

const numberInput = rive.getNumberInput('InputName');
if (numberInput) {
  numberInput.value = 42;
}

// Trigger events
const triggerInput = rive.getTriggerInput('InputName');
if (triggerInput) {
  triggerInput.fire();
}
```

### ViewModel Inspection

```javascript
// Get the main ViewModel instance
const vm = rive.viewModelInstance;

// Inspect ViewModel properties
console.log('ViewModel properties:', vm.properties);

// Access nested ViewModels
vm.properties
  .filter(p => p.type === 'viewModel')
  .forEach(p => {
    const nestedVM = vm.viewModel(p.name);
    console.log(`Nested VM: ${p.name}`, nestedVM);
  });

// Get string properties
try {
  const stringInputs = vm.strings();
  stringInputs.forEach(name => {
    const stringInput = vm.string(name);
    console.log(`String: ${name} = "${stringInput.value}"`);
  });
} catch (e) {
  console.log('No string properties available');
}

// Get color properties
try {
  const colorInputs = vm.colors();
  colorInputs.forEach(name => {
    const colorInput = vm.color(name);
    console.log(`Color: ${name} = ${colorInput.value} (${argbToHex(colorInput.value)})`);
  });
} catch (e) {
  console.log('No color properties available');
}

// Get enum properties
try {
  const enumInputs = vm.enums();
  enumInputs.forEach(name => {
    const enumInput = vm.enum(name);
    console.log(`Enum: ${name} = "${enumInput.value}"`);
  });
} catch (e) {
  console.log('No enum properties available');
}
```

### Asset Inspection

```javascript
// Get all assets
const assets = rive.assets();
console.log('Assets:', assets);

// Filter by asset type
const imageAssets = assets.filter(asset => asset.isImage);
const fontAssets = assets.filter(asset => asset.isFont);

console.log('Image assets:', imageAssets);
console.log('Font assets:', fontAssets);

// Get asset details
imageAssets.forEach(asset => {
  console.log(`Image: ${asset.name}`, {
    uniqueId: asset.uniqueId,
    cdnUuid: asset.cdnUuid,
    fileExtension: asset.fileExtension
  });
});
```

### Utility Functions

```javascript
// Color conversion helper
function argbToHex(argb) {
  if (typeof argb !== 'number') return '#000000';
  const hex = (argb & 0xffffff).toString(16).padStart(6, '0').toUpperCase();
  return `#${hex}`;
}

// Hex to ARGB conversion
function hexToArgb(hex) {
  const cleanHex = hex.replace('#', '');
  return parseInt(`FF${cleanHex}`, 16);
}

// Get all controllable properties
function getAllControllableProperties() {
  const rive = window.riveInstanceGlobal;
  if (!rive) return null;
  
  const properties = {
    stateMachines: {},
    viewModels: {},
    assets: []
  };
  
  // State machine inputs
  rive.stateMachineNames.forEach(smName => {
    properties.stateMachines[smName] = rive.stateMachineInputs(smName);
  });
  
  // ViewModel properties
  const vm = rive.viewModelInstance;
  if (vm) {
    properties.viewModels.main = {
      strings: vm.strings?.() || [],
      colors: vm.colors?.() || [],
      enums: vm.enums?.() || [],
      numbers: vm.numbers?.() || [],
      booleans: vm.booleans?.() || []
    };
  }
  
  // Assets
  properties.assets = rive.assets();
  
  return properties;
}

// Usage
console.log('All controllable properties:', getAllControllableProperties());
```

## 📊 Debug Logging System

The Rive Playground includes a modular debug logging system with configurable levels per module.

### Debug Levels

- `error`: Only error messages
- `warn`: Warnings and errors
- `info`: Informational messages, warnings, and errors
- `debug`: All messages including detailed debug information

### Configuration

```javascript
// Set debug levels for specific modules
window.debugConfig = {
  parser: 'debug',        // Detailed parsing information
  controls: 'info',       // Control generation and updates
  layout: 'warn',         // Layout system warnings
  rive: 'debug',          // Rive runtime interactions
  ui: 'info'              // UI component updates
};

// Apply configuration
window.applyDebugConfig();
```

### Available Debug Modules

| Module | Description |
|--------|-------------|
| `parser` | Rive file parsing and data extraction |
| `controls` | Dynamic control generation and updates |
| `layout` | Golden Layout system management |
| `rive` | Rive runtime interactions and events |
| `ui` | User interface updates and interactions |
| `state` | Application state management |
| `performance` | Performance monitoring and metrics |

### Debug Functions

```javascript
// View current debug settings
console.log(window.getDebugSettings());

// Save current settings to localStorage
window.saveDebugSettings();

// Load saved settings from localStorage
window.loadDebugSettings();

// Clear all debug settings
window.clearDebugSettings();

// Reset to default settings
window.resetDebugSettings();

// Enable debug mode for all modules
window.enableAllDebug();

// Disable debug mode for all modules
window.disableAllDebug();
```

### Custom Debug Messages

```javascript
// Use the debug logger in your code
const logger = window.getDebugLogger('myModule');

logger.debug('Detailed debug information');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error message');

// With context data
logger.debug('Processing data', { data: someObject });
logger.info('Operation completed', { duration: '150ms' });
```

## 🔍 Inspection Tools

### JSON Inspector

The built-in JSON inspector provides detailed views of parsed Rive data:

```javascript
// Access the JSON editor instance
const jsonEditor = window.jsonEditorInstance;

// Get current data
const currentData = jsonEditor.get();

// Search for specific values
jsonEditor.search('searchTerm');

// Expand/collapse all nodes
jsonEditor.expandAll();
jsonEditor.collapseAll();

// Switch view modes
jsonEditor.setMode('tree');    // Tree view
jsonEditor.setMode('code');    // Code view
jsonEditor.setMode('text');    // Text view
```

### Data Extraction

```javascript
// Extract specific data from parsed results
function extractAnimationData() {
  const data = window.jsonEditorInstance?.get();
  if (!data || !data.artboards) return null;
  
  return data.artboards.map(artboard => ({
    name: artboard.name,
    animations: artboard.animations.map(anim => ({
      name: anim.name,
      duration: anim.duration,
      fps: anim.fps
    }))
  }));
}

// Extract ViewModel structure
function extractViewModelStructure() {
  const data = window.jsonEditorInstance?.get();
  if (!data || !data.allViewModelDefinitionsAndInstances) return null;
  
  return data.allViewModelDefinitionsAndInstances.map(vm => ({
    name: vm.name,
    properties: vm.properties,
    instanceCount: vm.instanceCountFromDefinition
  }));
}
```

## ⚠️ Error Handling

### Error Monitoring

```javascript
// Monitor for Rive errors
window.addEventListener('error', (event) => {
  if (event.filename?.includes('rive')) {
    console.error('Rive Runtime Error:', event.error);
  }
});

// Monitor for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});
```

### Error Recovery

```javascript
// Attempt to recover from errors
function attemptErrorRecovery() {
  try {
    // Clear current instance
    if (window.riveInstanceGlobal) {
      window.riveInstanceGlobal.cleanup?.();
      window.riveInstanceGlobal = null;
    }
    
    // Reset application state
    window.resetApplicationState?.();
    
    // Reload the last file if available
    const lastFile = localStorage.getItem('lastRiveFile');
    if (lastFile) {
      // Trigger file reload
      console.log('Attempting to reload last file...');
    }
    
  } catch (e) {
    console.error('Error recovery failed:', e);
  }
}
```

### Validation Functions

```javascript
// Validate Rive instance
function validateRiveInstance() {
  const rive = window.riveInstanceGlobal;
  
  const checks = {
    instanceExists: !!rive,
    hasArtboard: !!rive?.artboard,
    hasCanvas: !!rive?.canvas,
    isLoaded: rive?.isLoaded || false,
    hasViewModels: !!rive?.viewModelInstance
  };
  
  console.log('Rive Instance Validation:', checks);
  return Object.values(checks).every(Boolean);
}

// Validate file structure
function validateFileStructure(data) {
  const required = ['artboards', 'allViewModelDefinitionsAndInstances'];
  const missing = required.filter(key => !data[key]);
  
  if (missing.length > 0) {
    console.warn('Missing required data:', missing);
    return false;
  }
  
  return true;
}
```

## 🎛️ Runtime Controls

### Dynamic Control Testing

```javascript
// Test all dynamic controls
function testAllControls() {
  const rive = window.riveInstanceGlobal;
  if (!rive) return;
  
  // Test state machine inputs
  rive.stateMachineNames.forEach(smName => {
    const inputs = rive.stateMachineInputs(smName);
    inputs.forEach(input => {
      console.log(`Testing ${smName}.${input.name}`);
      
      if (input.asBool !== undefined) {
        input.value = !input.value;
        setTimeout(() => input.value = !input.value, 1000);
      } else if (input.asNumber !== undefined) {
        const original = input.value;
        input.value = original + 10;
        setTimeout(() => input.value = original, 1000);
      } else if (input.asTrigger !== undefined) {
        input.fire();
      }
    });
  });
}

// Test ViewModel properties
function testViewModelProperties() {
  const vm = window.riveInstanceGlobal?.viewModelInstance;
  if (!vm) return;
  
  // Test string properties
  try {
    const strings = vm.strings();
    strings.forEach(name => {
      const input = vm.string(name);
      const original = input.value;
      input.value = `Test: ${Date.now()}`;
      setTimeout(() => input.value = original, 2000);
    });
  } catch (e) {}
  
  // Test color properties
  try {
    const colors = vm.colors();
    colors.forEach(name => {
      const input = vm.color(name);
      const original = input.value;
      input.value = 0xFF00FF00; // Green
      setTimeout(() => input.value = original, 2000);
    });
  } catch (e) {}
}
```

### Performance Testing

```javascript
// Measure control update performance
function measureControlPerformance() {
  const rive = window.riveInstanceGlobal;
  if (!rive) return;
  
  const startTime = performance.now();
  let updateCount = 0;
  
  // Rapid updates test
  const interval = setInterval(() => {
    const inputs = rive.stateMachineInputs(rive.stateMachineNames[0]);
    if (inputs.length > 0 && inputs[0].asBool !== undefined) {
      inputs[0].value = !inputs[0].value;
      updateCount++;
    }
    
    if (updateCount >= 100) {
      clearInterval(interval);
      const endTime = performance.now();
      console.log(`100 updates completed in ${endTime - startTime}ms`);
      console.log(`Average: ${(endTime - startTime) / 100}ms per update`);
    }
  }, 10);
}
```

## 📈 Performance Monitoring

### Frame Rate Monitoring

```javascript
// Monitor frame rate
let frameCount = 0;
let lastTime = performance.now();

function monitorFrameRate() {
  frameCount++;
  const currentTime = performance.now();
  
  if (currentTime - lastTime >= 1000) {
    console.log(`FPS: ${frameCount}`);
    frameCount = 0;
    lastTime = currentTime;
  }
  
  requestAnimationFrame(monitorFrameRate);
}

// Start monitoring
monitorFrameRate();
```

### Memory Usage

```javascript
// Monitor memory usage (Chrome only)
function monitorMemory() {
  if (performance.memory) {
    const memory = performance.memory;
    console.log('Memory Usage:', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    });
  }
}

// Monitor every 5 seconds
setInterval(monitorMemory, 5000);
```

### Load Time Tracking

```javascript
// Track file load times
const loadTimes = {
  fileSelect: 0,
  riveLoad: 0,
  parseComplete: 0,
  uiReady: 0
};

// Use in your code
loadTimes.fileSelect = performance.now();
// ... file loading code ...
loadTimes.riveLoad = performance.now();
// ... parsing code ...
loadTimes.parseComplete = performance.now();
// ... UI updates ...
loadTimes.uiReady = performance.now();

console.log('Load Performance:', {
  fileToRive: `${loadTimes.riveLoad - loadTimes.fileSelect}ms`,
  riveToParse: `${loadTimes.parseComplete - loadTimes.riveLoad}ms`,
  parseToUI: `${loadTimes.uiReady - loadTimes.parseComplete}ms`,
  total: `${loadTimes.uiReady - loadTimes.fileSelect}ms`
});
```

## 🧪 Testing & Validation

### Automated Testing

```javascript
// Run comprehensive tests
function runDiagnostics() {
  console.log('🧪 Running Rive Playground Diagnostics...');
  
  const results = {
    riveInstance: validateRiveInstance(),
    debugSystem: testDebugSystem(),
    controls: testControlSystem(),
    performance: measureBasicPerformance()
  };
  
  console.log('📊 Diagnostic Results:', results);
  return results;
}

function testDebugSystem() {
  try {
    const originalConfig = window.getDebugSettings();
    window.debugConfig = { test: 'debug' };
    window.applyDebugConfig();
    const newConfig = window.getDebugSettings();
    window.debugConfig = originalConfig;
    window.applyDebugConfig();
    return newConfig.test === 'debug';
  } catch (e) {
    return false;
  }
}

function testControlSystem() {
  const rive = window.riveInstanceGlobal;
  if (!rive) return false;
  
  try {
    const smCount = rive.stateMachineNames.length;
    const vmExists = !!rive.viewModelInstance;
    const assetsCount = rive.assets().length;
    
    return smCount >= 0 && vmExists !== undefined && assetsCount >= 0;
  } catch (e) {
    return false;
  }
}

function measureBasicPerformance() {
  const start = performance.now();
  
  // Simulate some operations
  for (let i = 0; i < 1000; i++) {
    Math.random();
  }
  
  const end = performance.now();
  return end - start < 10; // Should complete in under 10ms
}
```

### Debug Shortcuts

Add these to your browser console for quick debugging:

```javascript
// Quick debug shortcuts
window.debug = {
  // Quick access to common objects
  rive: () => window.riveInstanceGlobal,
  data: () => window.jsonEditorInstance?.get(),
  
  // Quick tests
  test: () => runDiagnostics(),
  validate: () => validateRiveInstance(),
  
  // Quick controls
  play: () => window.riveInstanceGlobal?.play(),
  pause: () => window.riveInstanceGlobal?.pause(),
  reset: () => window.riveInstanceGlobal?.reset(),
  
  // Quick info
  info: () => {
    const rive = window.riveInstanceGlobal;
    if (!rive) return 'No Rive instance loaded';
    
    return {
      artboards: rive.artboardNames,
      animations: rive.animationNames,
      stateMachines: rive.stateMachineNames,
      currentArtboard: rive.artboard?.name
    };
  }
};

// Usage examples:
// debug.rive()     - Get Rive instance
// debug.test()     - Run diagnostics
// debug.info()     - Get quick info
// debug.play()     - Start playback
```

## 🔧 Advanced Debugging Techniques

### Custom Event Monitoring

```javascript
// Monitor all Rive events
function monitorRiveEvents() {
  const rive = window.riveInstanceGlobal;
  if (!rive) return;
  
  // Monitor state changes
  rive.on('statechange', (event) => {
    console.log('State Change:', event);
  });
  
  // Monitor Rive events
  rive.on('riveevent', (event) => {
    console.log('Rive Event:', event.data);
  });
  
  // Monitor load events
  rive.on('load', () => {
    console.log('Rive loaded successfully');
  });
  
  // Monitor error events
  rive.on('loaderror', (error) => {
    console.error('Rive load error:', error);
  });
}
```

### State Snapshots

```javascript
// Create state snapshots for debugging
function createStateSnapshot() {
  const rive = window.riveInstanceGlobal;
  if (!rive) return null;
  
  const snapshot = {
    timestamp: Date.now(),
    artboard: rive.artboard?.name,
    animations: rive.animationNames.map(name => {
      const anim = rive.animationByName(name);
      return {
        name,
        time: anim?.time,
        speed: anim?.speed,
        isPlaying: anim?.isPlaying
      };
    }),
    stateMachines: rive.stateMachineNames.map(name => {
      const inputs = rive.stateMachineInputs(name);
      return {
        name,
        inputs: inputs.map(input => ({
          name: input.name,
          value: input.value,
          type: input.type
        }))
      };
    })
  };
  
  console.log('State Snapshot:', snapshot);
  return snapshot;
}

// Compare snapshots
function compareSnapshots(snapshot1, snapshot2) {
  const differences = [];
  
  // Compare animations
  snapshot1.animations.forEach((anim1, index) => {
    const anim2 = snapshot2.animations[index];
    if (anim1.time !== anim2.time) {
      differences.push(`Animation ${anim1.name} time: ${anim1.time} → ${anim2.time}`);
    }
  });
  
  // Compare state machine inputs
  snapshot1.stateMachines.forEach((sm1, smIndex) => {
    const sm2 = snapshot2.stateMachines[smIndex];
    sm1.inputs.forEach((input1, inputIndex) => {
      const input2 = sm2.inputs[inputIndex];
      if (input1.value !== input2.value) {
        differences.push(`SM ${sm1.name}.${input1.name}: ${input1.value} → ${input2.value}`);
      }
    });
  });
  
  return differences;
}
```

This debugging guide provides comprehensive tools and techniques for troubleshooting and optimizing your Rive Playground experience. Use these tools to understand how your animations work, identify performance issues, and debug complex interactions. 