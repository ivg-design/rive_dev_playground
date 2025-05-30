# Advanced Debugging

The Rive Tester includes a comprehensive debugging system with live object inspection, automatic input discovery, and extensive testing capabilities. The system is designed to handle all types of Rive inputs and is fully extensible for future functionality.

## Quick Start

1. **Load a Rive file** with inputs (triggers, booleans, numbers, enums)
2. **Discover inputs**: `debugHelper.discoverInputs()`
3. **List available inputs**: `debugHelper.listInputs()`  
4. **Test specific input**: `debugHelper.testInput("input_name")`
5. **Test all inputs**: `debugHelper.testAllInputs()`

## debugHelper API Reference

The `debugHelper` is automatically available on `window` and provides comprehensive debugging capabilities:

### 📊 Log Level Shortcuts

Control debug output levels across all modules:

```javascript
debugHelper.verbose()          // Set all modules to TRACE (most detailed)
debugHelper.debug()            // Set all modules to DEBUG  
debugHelper.normal()           // Set all modules to INFO (recommended)
debugHelper.quiet()            // Set all modules to WARN (errors/warnings only)
debugHelper.silent()           // Set all modules to ERROR (errors only)
debugHelper.off()              // Disable all logging
debugHelper.traceSingle("parser") // Set specific module to TRACE
```

### 🎛️ Panel Controls

Control the visual debug panel:

```javascript
debugHelper.enable()           // Show debug controls panel
debugHelper.disable()          // Hide debug controls panel  
debugHelper.toggle()           // Toggle debug controls panel
debugHelper.isEnabled()        // Check if debug controls are enabled
```

### ⚙️ Settings & Status

Manage debug configuration:

```javascript
debugHelper.currentSettings()  // Show detailed current debug settings
debugHelper.clearSettings()    // Clear all saved debug settings  
debugHelper.test()             // Test all debug modules
```

### 🔍 Comprehensive Input Discovery & Testing

**NEW**: Discover and test all types of Rive inputs automatically:

```javascript
// Enable comprehensive input debugging
debugHelper.enableInputDebug()

// Discover all available inputs
debugHelper.discoverInputs()

// List all discovered inputs with details  
debugHelper.listInputs()        // or debugHelper.listAllInputs()

// Test specific input by name or window key
debugHelper.testInput("trigger_name")
debugHelper.testInput("boolean_Active")
debugHelper.testInput("enum_CTRL_States")

// Test all discovered inputs automatically (with delays)
debugHelper.testAllInputs()
```

#### Supported Input Types

The system automatically discovers and tests:

- **Triggers** (ViewModel & State Machine)
- **Boolean Inputs** (ViewModel & State Machine)  
- **Number Inputs** (ViewModel & State Machine)
- **Enum Inputs** (ViewModel)
- **Custom Types** (via extensibility system)

#### Auto-Exposed Window Objects

All discovered inputs are automatically exposed on `window` for easy console access:

- `window.trigger_*` - Trigger inputs
- `window.boolean_*` - Boolean inputs
- `window.number_*` - Number inputs  
- `window.enum_*` - Enum inputs
- `window.sm_*` - State Machine inputs

### 🔧 Extensibility & Development

Add support for new Rive input types as they become available:

```javascript
// View all available input type definitions
debugHelper.getInputTypes()

// Add new input type definition  
debugHelper.addInputType("myNewType", {
  displayName: "My New Input Type",
  windowPrefix: "mynew_",
  getFromVM: (vm) => {
    // Logic to discover inputs of this type from ViewModel
    const inputs = [];
    // ... discovery logic ...
    return inputs;
  },
  testInput: (input, name) => {
    // Logic to test this input type
    try {
      // ... test logic ...
      return { success: true, method: 'test_method', details: 'change info' };
    } catch (e) {
      return { success: false, reason: e.message };
    }
  }
});

// After adding new type, rediscover inputs
debugHelper.discoverInputs()
```

### 🔥 Legacy Trigger Debugging

**DEPRECATED**: These functions still work for backwards compatibility but use the new comprehensive system instead:

```javascript
debugHelper.enableTriggerDebug()  // Use enableInputDebug() instead
debugHelper.listTriggers()        // Use listInputs() instead  
debugHelper.testTrigger("name")   // Use testInput() instead
debugHelper.testAllTriggers()     // Use testAllInputs() instead
```

### 🔧 API Access

Direct access to the underlying logging API:

```javascript
debugHelper.api.setModuleLevel("module", level)  // Set specific module level
debugHelper.api.setAllLevels(level)              // Set all modules to level
debugHelper.api.enable(true/false)               // Enable/disable global logging
debugHelper.api.isEnabled()                      // Check global logging state
```

### 📖 Help & Commands

Get help and see all available commands:

```javascript
debugHelper.help()             // Show comprehensive help guide
debugHelper.commands()         // List all available commands with status
```

## Input Discovery Process

The discovery system automatically:

1. **Scans ViewModel inputs** (`window.vm` or `window.stageVM`)
   - Attempts to discover triggers, booleans, numbers, and enums
   - Uses common naming patterns and introspection

2. **Scans State Machine inputs** (`window.r`, `window.rive`, or `window.riveInstance`)
   - Discovers all inputs from state machine objects
   - Handles triggers, booleans, and numbers

3. **Exposes objects on window** for easy console access
   - Uses prefixed naming (e.g., `trigger_Listen`, `boolean_Active`)
   - Sanitizes names for valid JavaScript identifiers

4. **Provides unified testing interface**
   - Each input type has specific test methods
   - Graceful fallback to common patterns
   - Detailed success/failure reporting

## Error Handling and Troubleshooting

### No Inputs Found

If `debugHelper.discoverInputs()` finds no inputs:

1. **Verify Rive file is loaded** with inputs defined
2. **Check for ViewModel/State Machine objects**:
   - `window.vm` or `window.stageVM` for ViewModel
   - `window.r`, `window.rive`, or `window.riveInstance` for State Machine
3. **Enable detailed logging**: `debugHelper.enableInputDebug()`

### Input Testing Fails

If `debugHelper.testInput()` fails:

1. **Check input object exists**: `console.log(window.input_name)`
2. **Inspect available methods**: Available properties are logged on failure
3. **Use manual testing**: Access the object directly and try methods

### Discovery Issues

1. **Use verbose logging**: `debugHelper.verbose()` for detailed discovery logs
2. **Check object properties**: Use browser dev tools to inspect VM/State Machine objects
3. **Add custom discovery**: Use `addInputType()` for non-standard input patterns

## Advanced Techniques

### Custom Input Type Example

```javascript
// Add support for hypothetical "slider" input type
debugHelper.addInputType("sliders", {
  displayName: "Slider Inputs",
  windowPrefix: "slider_",
  getFromVM: (vm) => {
    const inputs = [];
    if (vm && typeof vm.slider === 'function') {
      ['Volume', 'Brightness', 'Speed'].forEach(name => {
        try {
          const slider = vm.slider(name);
          if (slider) inputs.push({ name, input: slider });
        } catch (e) {
          // Input doesn't exist
        }
      });
    }
    return inputs;
  },
  testInput: (input, name) => {
    try {
      const oldValue = input.value;
      const newValue = Math.min(1.0, oldValue + 0.1);
      input.value = newValue;
      return { 
        success: true, 
        method: 'value increment',
        details: `${oldValue.toFixed(2)} → ${newValue.toFixed(2)}`
      };
    } catch (e) {
      return { success: false, reason: e.message };
    }
  }
});

// Now discover and test the new type
debugHelper.discoverInputs();
debugHelper.testInput("slider_Volume");
```

### Batch Testing with Custom Delays

```javascript
// Test all inputs with custom timing
const discovered = debugHelper.discoverInputs();
const allInputs = Object.values(discovered.viewModel).flat();

allInputs.forEach((inputData, index) => {
  setTimeout(() => {
    const name = inputData.name || inputData;
    console.log(`Testing ${name}...`);
    debugHelper.testInput(`trigger_${name.replace(/[^a-zA-Z0-9_]/g, '_')}`);
  }, index * 1000); // 1 second delays
});
```

### Configuration Persistence

Debug settings are automatically saved to localStorage:

- **Panel visibility**: `rive-tester-debug-enabled`
- **Module levels**: `rive-tester-debug-levels`  
- **Global state**: `rive-tester-debug-global-enabled`

```javascript
// Clear all saved settings
debugHelper.clearSettings();

// View current settings
debugHelper.currentSettings();
```

## Complete Command Reference

Use `debugHelper.commands()` for a current list of all available commands with their status.

### Categories:

- **📊 Log Level Shortcuts**: `verbose()`, `debug()`, `normal()`, `quiet()`, `silent()`, `off()`, `traceSingle()`
- **🎛️ Panel Controls**: `enable()`, `disable()`, `toggle()`, `isEnabled()`
- **⚙️ Settings & Status**: `currentSettings()`, `clearSettings()`, `test()`
- **🔍 Input Discovery & Testing**: `enableInputDebug()`, `discoverInputs()`, `listInputs()`, `testInput()`, `testAllInputs()`
- **🔧 Extensibility**: `addInputType()`, `getInputTypes()`
- **🔥 Legacy**: `enableTriggerDebug()`, `listTriggers()`, `testTrigger()`, `testAllTriggers()`
- **🔧 API Access**: `api.*`
- **📖 Help**: `help()`, `commands()`

## Future Extensibility

The system is designed to grow with Rive's functionality:

1. **Add new input types** using `addInputType()`
2. **Extend discovery patterns** for new VM/State Machine APIs
3. **Customize test methods** for specific input behaviors
4. **Integrate with future Rive features** through the extensible architecture

This ensures the debugging system remains useful as Rive adds new input types and functionality. 