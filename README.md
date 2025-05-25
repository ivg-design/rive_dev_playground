# Rive Playground

> **Interactive Rive file parser, inspector, and debugging tool**

A professional web-based tool for parsing, inspecting, and debugging Rive animation files. Load `.riv` files, explore their structure, test animations with dynamic controls, analyze state machines, and inspect ViewModel properties in real-time.

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
npx http-server public -p 8080

# Open http://localhost:8080
```

## 📋 Table of Contents

### 📖 Documentation
- [**🎯 Features Overview**](#-features)
- [**⚡ Quick Start Guide**](#-quick-start)
- [**🏗️ Architecture Overview**](docs/ARCHITECTURE.md)
- [**🔧 API Reference**](docs/API.md)
- [**🐛 Debugging Guide**](docs/DEBUGGING.md)
- [**🎮 Runtime Controls**](docs/RUNTIME_CONTROLS.md)
- [**🚀 Deployment Guide**](docs/DEPLOYMENT.md)
- [**📄 GitHub Pages Setup**](docs/GITHUB_PAGES_SETUP.md)

### 🛠️ Development
- [**📁 Project Structure**](#-project-structure)
- [**🔨 Development Setup**](docs/DEVELOPMENT.md)
- [**🧪 Testing Guide**](docs/TESTING.md)
- [**🎨 UI Components**](docs/COMPONENTS.md)
- [**📦 Build Process**](docs/BUILD.md)

### 🔍 Advanced Usage
- [**🎛️ Golden Layout System**](docs/GOLDEN_LAYOUT.md)
- [**🔗 Rive Integration**](docs/RIVE_INTEGRATION.md)
- [**💾 State Management**](docs/STATE_MANAGEMENT.md)
- [**🎨 Theming & Styling**](docs/THEMING.md)

### 📚 Reference
- [**🔧 Configuration**](docs/CONFIGURATION.md)
- [**❓ FAQ**](docs/FAQ.md)
- [**🐛 Troubleshooting**](docs/TROUBLESHOOTING.md)
- [**📝 Changelog**](docs/CHANGELOG.md)
- [**🤝 Contributing**](docs/CONTRIBUTING.md)

## ✨ Features

### 🎮 Interactive Playground
- **File Loading**: Drag & drop or select local `.riv` files
- **Live Preview**: Real-time animation playback with controls
- **Multi-Layout**: Professional IDE-like interface with dockable panels
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### 🔍 Deep Inspection
- **Artboard Analysis**: Explore all artboards, animations, and timelines
- **State Machine Inspector**: Analyze state machines, inputs, and transitions
- **ViewModel Explorer**: Inspect ViewModel hierarchies and properties
- **Asset Viewer**: Browse images, fonts, and other embedded assets
- **Enum Definitions**: View global enum definitions and values

### 🎛️ Runtime Controls
- **Dynamic Controls**: Auto-generated UI controls for all ViewModel properties
- **State Machine Inputs**: Toggle boolean inputs, adjust numbers, trigger events
- **Animation Playback**: Play, pause, scrub timelines and state machines
- **Layout Controls**: Adjust fit modes, alignment, and scaling
- **Background Customization**: Change canvas background colors

### 🐛 Advanced Debugging
- **Global Access**: `window.riveInstanceGlobal` for console debugging
- **Modular Logging**: Configurable debug levels per module
- **Error Handling**: Comprehensive error reporting and recovery
- **Performance Monitoring**: Track loading times and render performance

## 🏗️ Project Structure

```
rive_dev_playground/
├── index.html                   # Main application entry point
├── 📁 src/                      # Source code
│   ├── 📁 components/           # Core application components
│   │   ├── goldenLayoutManager.js    # Layout system management
│   │   ├── parser.js                 # Rive file parsing logic
│   │   ├── riveParserHandler.js      # Main application controller
│   │   └── riveControlInterface.js   # Dynamic control generation
│   ├── 📁 styles/               # CSS and styling
│   │   └── style.css            # Main application styles
│   └── 📁 utils/                # Utility functions and helpers
│       └── debugger/            # Debug logging system
├── 📁 docs/                     # Documentation files
├── 📁 assets/                   # Static assets
│   ├── css/                     # Additional stylesheets
│   └── js/                      # Additional JavaScript
├── 📁 .github/                  # GitHub configuration
│   └── workflows/               # CI/CD workflows
├── 📁 scripts/                  # Build and utility scripts
├── package.json                 # Node.js dependencies
└── README.md                    # This file
```

## 🎯 Core Features Deep Dive

### 🎮 Rive File Parsing
- **Client-Side Processing**: No server required, runs entirely in browser
- **WebGL2 Runtime**: Uses official `@rive-app/webgl2` runtime
- **Comprehensive Extraction**: Artboards, animations, state machines, ViewModels, assets
- **Error Recovery**: Graceful handling of malformed or unsupported files

### 🎛️ Dynamic Control Generation
- **Auto-Discovery**: Automatically detects all controllable properties
- **Type-Aware**: Generates appropriate UI controls for each property type
- **Real-Time Updates**: Changes reflect immediately in the animation
- **Enum Support**: Smart dropdown population for enum properties

### 🔍 JSON Inspector
- **Interactive Tree View**: Explore parsed data with JSONEditor
- **Search & Filter**: Find specific properties or values quickly
- **Multiple View Modes**: Tree, code, text, and preview modes
- **Dark Theme**: Comfortable viewing with professional dark styling

## 🐛 Debugging Features

### Global Runtime Access
The application exposes the Rive instance globally for advanced debugging:

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
// Enable debug logging for specific modules
window.debugConfig = {
  parser: 'debug',
  controls: 'info',
  layout: 'warn'
};

// View current debug settings
console.log(window.getDebugSettings());

// Clear debug settings
window.clearDebugSettings();
```

### Error Handling
- **Graceful Degradation**: Application continues working even with errors
- **Detailed Error Reports**: Comprehensive error information for debugging
- **Recovery Mechanisms**: Automatic retry and fallback strategies

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
1. **Load a Rive file**: Click "Choose File" or drag & drop a `.riv` file
2. **Explore the interface**: Use the tabbed panels to inspect different aspects
3. **Try the controls**: Adjust properties in the Dynamic Controls panel
4. **Inspect the data**: Browse the parsed structure in the JSON Inspector

## 🔧 Configuration

### Environment Variables
```bash
# Development mode
NODE_ENV=development

# Debug level
DEBUG_LEVEL=info

# Canvas settings
CANVAS_BACKGROUND=#252525
```

### Runtime Configuration
```javascript
// Configure Rive instance
const config = {
  fit: 'contain',
  alignment: 'center',
  autoplay: true,
  artboard: 'Main'
};
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Quick Contribution Steps
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Rive Team**: For the amazing Rive runtime and tools
- **JSONEditor**: For the excellent JSON viewing component
- **Golden Layout**: For the professional layout system
- **Community**: For feedback, bug reports, and contributions

## 📞 Support

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/ivg-design/rive_dev_playground/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/ivg-design/rive_dev_playground/discussions)
- **📧 Contact**: [IVG Design](mailto:contact@ivg-design.com)
- **📚 Documentation**: [Full Documentation](docs/)

---

**Built with ❤️ by [IVG Design](https://github.com/ivg-design)** # Test deployment trigger
