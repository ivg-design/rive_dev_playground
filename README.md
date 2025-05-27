# Rive Tester

<!-- Version 1.1.0 deployed -->

[![Documentation](https://img.shields.io/badge/docs-mkdocs-blue.svg)](https://ivg-design.github.io/rive_dev_playground/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Rive](https://img.shields.io/badge/rive-compatible-orange.svg)](https://rive.app)

Interactive Rive file parser, inspector, and debugging tool built for the web.

## 🚀 Quick Start

### Online Version
**[Launch Rive Tester →](https://ivg-design.github.io/rive_dev_playground/)**

### Local Development
```bash
git clone https://github.com/ivg-design/rive_dev_playground.git
cd rive_dev_playground
python -m http.server 8080
```

Open `http://localhost:8080` in your browser.

## 📚 Documentation

**[Complete Documentation →](https://ivg-design.github.io/rive_dev_playground/docs/)**

- **[Quick Start Guide](https://ivg-design.github.io/rive_dev_playground/docs/guide/quick-start/)** - Get up and running in minutes
- **[User Guide](https://ivg-design.github.io/rive_dev_playground/docs/guide/interface/)** - Complete interface documentation
- **[Asset Manager](https://ivg-design.github.io/rive_dev_playground/docs/guide/asset-manager/)** - Replace embedded assets in real-time
- **[API Reference](https://ivg-design.github.io/rive_dev_playground/docs/development/api-reference/)** - Technical documentation

## ✨ Features

### 🎮 Interactive Playground
- Load local `.riv` files with real-time animation playback
- Professional IDE-like interface with dockable panels
- WebGL2 rendering for high-performance animations

### 🔍 Deep Inspection
- Analyze artboards, state machines, and ViewModels
- Interactive JSON tree view with search and filtering
- Complete Rive file structure exploration

### 🎛️ Runtime Controls
- Auto-generated UI controls for ViewModel properties
- Real-time property manipulation and testing
- Support for all property types (boolean, number, enum, etc.)

### 📦 Asset Manager
- View and inspect embedded assets (images, fonts)
- Replace assets with local files or URLs in real-time
- Asset metadata and status information

### 🐛 Debugging Tools
- Global runtime access via `window.riveInstanceGlobal`
- Modular logging system with configurable levels
- Comprehensive error handling and debug information

### 🎨 Modern UI
- Dark theme with responsive design
- Modular CSS architecture for maintainability
- Professional Golden Layout panel system

## 🛠️ Technical Stack

| Component | Description |
|-----------|-------------|
| **@rive-app/webgl2** | Official Rive WebGL2 runtime |
| **Golden Layout** | Professional dockable panel system |
| **JSONEditor** | Interactive JSON tree viewer |
| **MkDocs Material** | Documentation framework |

## 📁 Project Structure

```
rive_dev_playground/
├── index.html              # Main application entry point
├── src/                    # Source code
│   ├── components/         # Core application components
│   │   ├── goldenLayoutManager.js
│   │   ├── assetManager.js
│   │   ├── riveParserHandler.js
│   │   └── ...
│   ├── styles/            # Modular CSS architecture
│   │   ├── base.css
│   │   ├── asset-manager.css
│   │   ├── golden-layout.css
│   │   └── ...
│   └── utils/             # Utility functions and debugging
│       └── debugger/
├── docs/                  # MkDocs documentation source
│   ├── index.md
│   ├── guide/
│   ├── advanced/
│   └── development/
├── node_modules/          # Dependencies
├── package.json           # Node.js configuration
├── mkdocs.yml            # Documentation configuration
└── requirements.txt       # Python dependencies for docs
```

## 🎯 CSS Architecture

The project uses a modular CSS architecture for maintainability:

- **`base.css`