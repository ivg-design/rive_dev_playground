# Rive Tester

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

- **`base.css`** - Global styles, resets, restore bar
- **`golden-layout.css`** - Layout framework styles  
- **`json-editor.css`** - JSON Editor dark theme
- **`controls.css`** - Controls panel and form elements
- **`dynamic-controls.css`** - Dynamic controls and ViewModels
- **`canvas.css`** - Canvas container styles
- **`asset-manager.css`** - Asset Manager panel
- **`style.css`** - Legacy styles (minimal)

## 🚀 Development

### Prerequisites
- Modern web browser with WebGL2 support
- Node.js 16+ (for package management)
- Python 3.8+ (for documentation)

### Local Development
```bash
# Clone repository
git clone https://github.com/ivg-design/rive_dev_playground.git
cd rive_dev_playground

# Install dependencies
npm install

# Start development server
python -m http.server 8080
```

### 🏷️ Semantic Versioning

The project uses automated semantic versioning. Create releases using commit message flags:

```bash
# Quick version releases using npm scripts
npm run version:patch "fix: canvas clearing issue"
npm run version:minor "feat: add asset manager panel"  
npm run version:major "feat!: redesign control interface"

# Or use the helper script directly
./scripts/version.sh patch "fix: resolve status bar layout"
./scripts/version.sh minor "feat: add semantic versioning"
./scripts/version.sh major "feat!: breaking API changes"

# Push to trigger automated release
git push origin main
```

**[📚 Complete Versioning Guide →](https://ivg-design.github.io/rive_dev_playground/docs/development/versioning/)**

### Documentation Development
```bash
# Install documentation dependencies
pip install -r requirements.txt

# Serve documentation locally
python -m mkdocs serve

# Build documentation
python -m mkdocs build
```

## 🔧 Configuration

### Environment Variables
- `BASE_URL` - Base URL for the application (default: `/`)
- `DOCS_URL` - Documentation URL (auto-detected)

### Debug Configuration
```javascript
// Enable debug logging for specific modules
LoggerAPI.setModuleLevel('assetManager', LogLevel.DEBUG);
LoggerAPI.setModuleLevel('parser', LogLevel.INFO);

// Global debug access
const rive = window.riveInstanceGlobal;
const assetMap = rive.assetMap;
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and patterns
- Add documentation for new features
- Test across different browsers
- Update the changelog for significant changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Rive Team](https://rive.app)** - For the amazing Rive runtime and tools
- **[JSONEditor](https://github.com/josdejong/jsoneditor)** - For the JSON viewing component  
- **[Golden Layout](https://golden-layout.com/)** - For the professional layout system
- **[MkDocs Material](https://squidfunk.github.io/mkdocs-material/)** - For the documentation framework

## 🔗 Links

- **[Live Application](https://ivg-design.github.io/rive_dev_playground/)**
- **[Documentation](https://ivg-design.github.io/rive_dev_playground/docs/)**
- **[Rive.app](https://rive.app)**
- **[Rive Community](https://rive.app/community)**
- **[GitHub Issues](https://github.com/ivg-design/rive_dev_playground/issues)**

---

**Built with ❤️ by [IVG Design](https://github.com/ivg-design) for the Rive community**
