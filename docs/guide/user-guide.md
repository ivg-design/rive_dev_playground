# User Guide

Complete guide to using the Rive Tester interface

## 🎯 Interface Overview

Rive Tester features a professional IDE-like interface with dockable panels powered by Golden Layout. The interface is designed for efficient workflow and comprehensive Rive file analysis.

### Main Panels

| Panel | Description |
|-------|-------------|
| 🎛️ **Controls Panel** | File loading, playback controls, and global settings |
| 🖼️ **Canvas Panel** | Live animation preview with real-time rendering |
| 🔍 **JSON Inspector** | Interactive tree view of parsed Rive data |
| ⚡ **Dynamic Controls** | Auto-generated UI for ViewModel properties |
| 📦 **Asset Manager** | View and replace embedded assets |

## 📁 Loading Rive Files

Getting started with Rive Tester is simple. Follow these steps to load and analyze your Rive files:

### Quick Start Process

1. **Choose File**: Click the "Choose File" button in the Controls panel to select a `.riv` file from your computer.

2. **Automatic Parsing**: The file is automatically parsed and analyzed. You'll see the animation appear in the Canvas panel.

3. **Explore Data**: Use the JSON Inspector to explore the parsed data structure and the Dynamic Controls to interact with properties.

## 🎛️ Controls Panel

The Controls panel is your main interface for file management and global settings.

### File Management
- **File Input**: Select local `.riv` files for analysis
- **File Info**: View file size, name, and loading status
- **Clear**: Reset the application state

### Animation Controls
- **Artboard Selector**: Choose from available artboards in the file
- **Timeline Selector**: Select timeline animations for playback
- **State Machine Selector**: Choose state machines to activate
- **Play/Pause**: Control timeline animation playback
- **Pause**: Pause timeline animations (⏸ button)

### Display Settings
- **Background Color**: Customize canvas background color with color picker
- **Fit Mode**: Choose how animations fit in the canvas (Contain, Cover, Fill, Fit Width, Fit Height, Scale Down, None, Layout)
- **Alignment**: Set animation alignment (Center, Top Left, Top Center, Top Right, Center Left, Center Right, Bottom Left, Bottom Center, Bottom Right)
- **Layout Scale**: Adjust animation scale (0.1 to 5.0)

## 🖼️ Canvas Panel

The Canvas panel displays your Rive animation with real-time rendering and interactive controls.

### Features
- **WebGL2 Rendering**: High-performance animation playback using `@rive-app/webgl2`
- **Responsive Sizing**: Automatically adjusts to panel size
- **Aspect Ratio Preservation**: Maintains animation proportions
- **Interactive Elements**: Mouse events are passed to the animation

### Canvas Behavior
- **Auto-resize**: Canvas automatically resizes when panel dimensions change
- **Background Control**: Background color controlled via Controls panel
- **Mouse Interaction**: Hover and click events are passed to the animation

## 🔍 JSON Inspector

The JSON Inspector provides a comprehensive view of your Rive file's internal structure using an interactive tree interface.

### View Modes
- **Tree View**: Hierarchical display with expand/collapse functionality
- **View Mode**: Read-only formatted view
- **Code View**: Raw JSON with syntax highlighting
- **Text View**: Plain text representation
- **Preview**: Formatted preview with type information

### Navigation Features
- **Search**: Find specific properties or values using built-in search
- **Expand All/Collapse All**: Quick navigation controls
- **Node Preview**: Object previews show first property values
- **Array Display**: Arrays show element count

## ⚡ Dynamic Controls

The Dynamic Controls panel automatically generates UI controls for your Rive animation's interactive properties.

### Supported Property Types
- **Boolean**: Checkbox controls for true/false values
- **Number**: Number input fields for numeric values
- **String**: Textarea controls for text content (supports newlines)
- **Color**: Color picker controls for ARGB color values
- **Enum**: Dropdown menus for enumerated values with smart matching
- **Trigger**: Buttons for triggering events

### State Machine Controls
- **Boolean Inputs**: Checkbox controls for boolean state machine inputs
- **Number Inputs**: Number input fields for numeric inputs
- **Trigger Inputs**: Fire buttons for trigger inputs

### Real-time Updates
All changes made in the Dynamic Controls panel are immediately reflected in the animation, allowing for real-time experimentation and testing.

## 📦 Asset Manager

The Asset Manager allows you to inspect and replace embedded assets in your Rive files.

### Asset Types Supported
- **Images**: PNG, JPG, WebP, SVG files
- **Fonts**: TTF, OTF, WOFF, WOFF2 files

### Asset Information Display
Each asset shows detailed metadata including:
- Asset name and type
- Unique ID and CDN UUID (when available)
- File extension and format
- Current status (embedded, replaced, error)

### Replacement Options
- **Local Files**: Upload replacement assets from your computer using file picker
- **URLs**: Replace with assets from web URLs by entering URL and clicking Apply
- **Reset**: Restore original embedded assets (planned feature)

### Asset Management Features
- **Click to Expand**: Click asset headers to expand/collapse details
- **Status Indicators**: Visual indicators show asset status
- **Error Handling**: Clear error messages for failed replacements
- **Scrollable Interface**: Asset list scrolls when many assets are present

## 🔧 Layout Management

Rive Tester uses Golden Layout for professional panel management with full customization capabilities.

### Panel Operations
- **Drag & Drop**: Rearrange panels by dragging tabs
- **Resize**: Adjust panel sizes by dragging borders
- **Stack**: Create tabbed panel groups by dropping panels on each other
- **Split**: Create new rows and columns by dropping panels on edges
- **Close**: Close panels using the X button (restore via restore bar)

### Restore Bar
When panels are closed, a restore bar appears at the top with options to:
- **Restore Panels**: Click buttons to restore closed panels
- **View Documentation**: Access this documentation site
- **Reset Layout**: Return to default panel arrangement

### Layout Persistence
Your panel arrangement is automatically saved to localStorage and restored when you reload the application.

## 🐛 Debugging Features

Rive Tester includes comprehensive debugging tools for developers and advanced users.

### Global Access
Access the Rive instance globally for console debugging:

```javascript
// Access the current Rive instance
const rive = window.riveInstanceGlobal;

// Inspect artboards
console.log(rive.artboardNames);

// Access ViewModels
const vm = rive.viewModelInstance;
console.log(vm.properties);
```

### Debug Logging
Modular logging system with configurable levels:

```javascript
// Configure logging levels per module
window.debugConfig = {
  parser: 'debug',
  controls: 'info',
  layout: 'warn',
  rive: 'debug',
  ui: 'info'
};
window.applyDebugConfig();
```

### Available Debug Modules
- `parser`: Rive file parsing and data extraction
- `controls`: Dynamic control generation and updates
- `layout`: Golden Layout system management
- `rive`: Rive runtime interactions and events
- `ui`: User interface updates and interactions

---

**Related**: [Debugging](../advanced/debugging.md) | [Runtime Controls](../advanced/runtime-controls.md) | [Asset Manager](asset-manager.md) 