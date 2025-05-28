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
- **[Event Mapper](https://ivg-design.github.io/rive_dev_playground/docs/advanced/event-mapper/)** - Comprehensive event logging and debugging
- **[API Reference](https://ivg-design.github.io/rive_dev_playground/docs/development/api-reference/)** - Technical documentation

## 🔧 Recent Updates

### Debugger System Overhaul
The debug control system has been completely overhauled with comprehensive fixes and improvements:

- **Fixed non-functional Enable All/Disable All buttons**
- **Added comprehensive console logging for all debug actions**
- **Enhanced state management with real-time synchronization**
- **Added mismatch detection between UI and actual logger state**
- **Improved localStorage persistence for debug settings**
- **Added testing and diagnostic functions**

See the [Debugger Fixes Documentation](source_docs/advanced/debugger-fixes.md) for complete details.

## ✨ Features

### 🎮 Interactive Playground

- Load local `.riv` files with real-time animation playback
- Professional IDE-like interface with dockable panels
- WebGL2 rendering for high-performance animations

### 🔍 Deep Inspection

- Analyze artboards, state machines, and ViewModels
- Interactive JSON tree view with search and filtering
- Complete Rive file structure exploration
- **Save JSON Data**: Export parsed data to downloadable JSON files with timestamps
- **Compact Display**: Optimized 11px font size for better space utilization
- **Professional Interface**: Clean header with integrated save functionality

### 🎛️ Runtime Controls

- Auto-generated UI controls for ViewModel properties
- Real-time property manipulation and testing
- Support for all property types (boolean, number, enum, etc.)

### 📦 Asset Manager

- View and inspect embedded assets (images, fonts)
- Replace assets with local files or URLs in real-time
- Asset metadata and status information

### 🐛 Debugging Tools

- **Event Console**: Professional terminal-style event logging with real-time monitoring
- **Event Mapper**: 100% accurate event type detection based on official Rive source code
- Global runtime access via `window.riveInstanceGlobal`
- Modular logging system with configurable levels
- Comprehensive error handling and debug information

### 🎨 Modern UI

- Dark theme with responsive design
- Modular CSS architecture for maintainability
- Professional Golden Layout panel system

## 🛠️ Technical Stack

| Component            | Description                        |
| -------------------- | ---------------------------------- |
| **@rive-app/webgl2** | Official Rive WebGL2 runtime       |
| **Golden Layout**    | Professional dockable panel system |
| **JSONEditor**       | Interactive JSON tree viewer       |
| **MkDocs Material**  | Documentation framework            |

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

- \*\*`base.css`

## Features

- **Rive File Parsing**: Upload and parse `.riv` files to extract detailed information about artboards, animations, state machines, and ViewModels
- **Interactive Controls**: Dynamically generated UI controls for live interaction with Rive animations
- **Asset Management**: View and manage embedded assets within Rive files
- **JSON Inspector**: Explore the parsed data structure in a comprehensive JSON editor
- **Multi-Panel Layout**: Resizable and customizable workspace with Golden Layout
- **Debug Tools**: Built-in logging system and debug controls for development
- **Event Monitoring**: Real-time display of Rive events in the status bar for debugging

## Debug Features

### Rive Event Logging
The application includes a comprehensive event logging system that allows you to monitor Rive events in real-time:

#### Event Console Panel
- **Dedicated Panel**: A terminal-style Event Console panel with black background and green monospaced text
- **Real-time Logging**: All events are streamed to the console with timestamps
- **Auto-scroll**: Console automatically scrolls to show the latest events
- **Clear Function**: Clear button to reset the console history

#### Event Logging Controls
1. **Enable Event Logging**: In the Dynamic Controls panel, expand the "Rive Event Logging" section and check "Enable Event Logging"
2. **Event Type Filtering**: Choose which types of events to log:
   - **Custom Events**: User-defined events from your Rive file (RiveEvent type)
   - **State Change Events**: System events like StateChanged and ValueChanged
3. **Event Display**: Events are shown in both the status bar and the Event Console panel
4. **Event Format**: Events display with proper formatting showing event name, type, and timestamp

#### Monitored Event Types
- **Custom Events**: User-defined events with General or OpenUrl types
- **StateChanged**: When state machine states change  
- **ValueChanged**: When input values change (Boolean, Number, Trigger types)
- **Play/Pause/Stop/Loop**: Animation playback events

#### Features
- **Persistence**: Your event logging preferences are saved across sessions
- **Type Detection**: Automatically detects and displays input types (Boolean, Number, Trigger)
- **Message Limiting**: Console keeps last 100 messages to prevent memory issues
- **Professional Formatting**: Clean, readable event format with timestamps

### JSON Inspector
The JSON Inspector provides comprehensive data exploration and export capabilities:

#### Data Visualization
- **Tree View**: Interactive JSON tree with expand/collapse functionality
- **Search & Filter**: Built-in search to quickly find specific data
- **Multiple View Modes**: Tree, code, and text viewing modes
- **Compact Display**: Optimized 11px font size for better readability of large datasets

#### Export Functionality
- **Save to File**: Click the "💾 Save JSON" button to download parsed data
- **Timestamped Files**: Automatic filename generation with timestamp (e.g., `rive-parsed-data-2025-01-15T10-30-45.json`)
- **Formatted Output**: Clean, properly indented JSON for easy reading
- **Error Handling**: Graceful error handling with user-friendly messages

#### Professional Interface
- **Clean Header**: Dedicated panel header with title and save button
- **Responsive Design**: Adapts to different panel sizes and layouts
- **Consistent Styling**: Matches the overall application theme
