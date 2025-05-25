# Rive Playground

> **Interactive Rive file parser, inspector, and debugging tool**

A web-based tool for parsing, inspecting, and debugging Rive animation files. Load `.riv` files, explore their structure, test animations with dynamic controls, and analyze state machines and ViewModel properties.

## 🚀 Quick Start

### Live Demo
- **🌐 Rive Playground**: [https://ivg-design.github.io/rive_dev_playground/rive-playground/](https://ivg-design.github.io/rive_dev_playground/rive-playground/)
- **📚 Documentation Hub**: [https://ivg-design.github.io/rive_dev_playground/](https://ivg-design.github.io/rive_dev_playground/)

### Local Development
```bash
# Clone the repository
git clone https://github.com/ivg-design/rive_dev_playground.git
cd rive_dev_playground

# Install dependencies
npm install

# Start local development server
npm run dev
# or
npx http-server . -p 8080

# Open http://localhost:8080
```

## 📋 Table of Contents

### 📖 Documentation
- [**🎯 Features Overview**](#-features)
- [**⚡ Quick Start Guide**](#-quick-start)
- [**🐛 Debugging Guide**](docs/DEBUGGING.md)
- [**🎮 Runtime Controls**](docs/RUNTIME_CONTROLS.md)
- [**🚀 Deployment Guide**](docs/DEPLOYMENT.md)
- [**📄 GitHub Pages Setup**](docs/GITHUB_PAGES_SETUP.md)

### 🛠️ Development
- [**📁 Project Structure**](#-project-structure)

## ✨ Features

### 🎮 Interactive Playground
- **File Loading**: Select local `.riv` files via file input
- **Live Preview**: Real-time animation playback with controls
- **Multi-Layout**: Professional IDE-like interface with dockable panels using Golden Layout
- **Responsive Design**: Works on desktop browsers

### 🔍 Deep Inspection
- **Artboard Analysis**: Explore all artboards, animations, and timelines
- **State Machine Inspector**: Analyze state machines, inputs, and transitions
- **ViewModel Explorer**: Inspect ViewModel hierarchies and properties
- **Asset Manager**: View, inspect, and replace embedded assets (images, fonts, etc.)
- **JSON Inspector**: Interactive tree view of parsed Rive data using JSONEditor

### 🎛️ Runtime Controls
- **Dynamic Controls**: Auto-generated UI controls for ViewModel properties
- **State Machine Inputs**: Toggle boolean inputs, adjust numbers, trigger events
- **Animation Playback**: Play, pause, stop timelines and state machines
- **Layout Controls**: Adjust fit modes, alignment, and scaling
- **Background Customization**: Change canvas background colors
- **Asset Replacement**: Replace embedded assets with local files or URLs in real-time

### 🐛 Debugging Features
- **Global Access**: `window.riveInstanceGlobal` for console debugging
- **Modular Logging**: Configurable debug levels per module
- **Error Handling**: Basic error reporting and recovery

## 🏗️ Project Structure

```
rive_dev_playground/
├── index.html                   # Main application entry point
├── src/                         # Source code
│   ├── components/              # Core application components
│   │   ├── goldenLayoutManager.js    # Layout system management
│   │   ├── parser.js                 # Rive file parsing logic
│   │   ├── riveParserHandler.js      # Main application controller
│   │   ├── riveControlInterface.js   # Dynamic control generation
│   │   └── dataToControlConnector.js # Data processing bridge
│   ├── styles/                  # CSS and styling
│   │   └── style.css            # Main application styles
│   └── utils/                   # Utility functions and helpers
│       └── debugger/            # Debug logging system
├── docs/                        # Documentation files
│   ├── DEBUGGING.md             # Debugging guide
│   ├── RUNTIME_CONTROLS.md      # Runtime controls documentation
│   ├── DEPLOYMENT.md            # Deployment instructions
│   └── GITHUB_PAGES_SETUP.md    # GitHub Pages setup guide
├── assets/                      # Static assets
│   ├── css/                     # Additional stylesheets
│   └── js/                      # Additional JavaScript
├── scripts/                     # Build and utility scripts
│   └── test-deployment.js       # Deployment testing script
├── .github/                     # GitHub configuration
│   └── workflows/               # CI/CD workflows
├── package.json                 # Node.js dependencies
└── README.md                    # This file
```

## 🎯 Core Features

### 🎮 Rive File Parsing
- **Client-Side Processing**: No server required, runs entirely in browser
- **WebGL2 Runtime**: Uses official `@rive-app/webgl2` runtime
- **Comprehensive Extraction**: Artboards, animations, state machines, ViewModels, assets
- **Error Recovery**: Basic handling of malformed or unsupported files

### 🎛️ Dynamic Control Generation
- **Auto-Discovery**: Automatically detects controllable properties
- **Type-Aware**: Generates appropriate UI controls for each property type
- **Real-Time Updates**: Changes reflect immediately in the animation
- **Enum Support**: Dropdown population for enum properties

### 🔍 JSON Inspector
- **Interactive Tree View**: Explore parsed data with JSONEditor
- **Search & Filter**: Find specific properties or values
- **Multiple View Modes**: Tree, code, text, and preview modes
- **Dark Theme**: Professional dark styling

## 🐛 Debugging Features

### Global Runtime Access
The application exposes the Rive instance globally for debugging:

```javascript
// Access the current Rive instance
const rive = window.riveInstanceGlobal;

// Inspect artboards
console.log(rive.artboardNames);

// Access ViewModels
const vm = rive.viewModelInstance;
console.log(vm.properties);

// Control state machines
const sm = rive.stateMachineInputs('StateMachineName');
sm.forEach(input => console.log(input.name, input.value));
```

### Debug Logging System
Modular logging with configurable levels:

```javascript
// Import the logger
import { createLogger, LogLevel, LoggerAPI } from './src/utils/debugger/debugLogger.js';

// Create a logger for your module
const logger = createLogger('myModule');

// Use different log levels
logger.debug('Detailed debug information');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error message');

// Configure logging levels
LoggerAPI.setModuleLevel('parser', LogLevel.DEBUG);
LoggerAPI.setAllLevels(LogLevel.INFO);
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser with WebGL2 support
- Node.js 16+ (for development)
- Local web server (for file loading)

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/ivg-design/rive_dev_playground.git
   cd rive_dev_playground
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   # Option 1: Using npm script
   npm run dev
   
   # Option 2: Using http-server
   npx http-server . -p 8080
   
   # Option 3: Using Python
   python -m http.server 8080
   ```

4. **Open in browser**:
   Navigate to `http://localhost:8080`

### First Steps
1. **Load a Rive file**: Click "Choose File" to select a `.riv` file
2. **Explore the interface**: Use the dockable panels to inspect different aspects
3. **Try the controls**: Adjust properties in the Dynamic Controls panel
4. **Inspect the data**: Browse the parsed structure in the JSON Inspector

## 🔧 Technical Details

### Dependencies
- **@rive-app/webgl2**: Official Rive WebGL2 runtime
- **jsoneditor**: JSON tree view and editor
- **golden-layout**: Professional layout system for dockable panels
- **jQuery**: Required by Golden Layout

### Browser Support
- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

Requires WebGL2 support for Rive animations.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Rive Team**: For the Rive runtime and tools
- **JSONEditor**: For the JSON viewing component
- **Golden Layout**: For the layout system

## 📞 Support

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/ivg-design/rive_dev_playground/issues)
- **📧 Contact**: [IVG Design](mailto:contact@ivg-design.com)

---

**Built by [IVG Design](https://github.com/ivg-design)**
