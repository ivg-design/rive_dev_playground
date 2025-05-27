# Quick Start

Get up and running with Rive Tester in just a few minutes!

## :rocket: Launch the Application

=== "Online Version"

    The easiest way to get started is to use the online version:

    [:octicons-rocket-24: Launch Rive Tester](https://ivg-design.github.io/rive_dev_playground/){ .md-button .md-button--primary }

=== "Local Development"

    For local development, see the [Installation Guide](installation.md).

## :one: Load a Rive File

1. **Click "Choose File"** in the Controls panel
2. **Select a `.riv` file** from your computer
3. **Watch the magic happen** - your animation will appear in the Canvas panel

!!! tip "Don't have a Rive file?"
You can download sample files from the [Rive Community](https://rive.app/community) or create your own using [Rive Editor](https://rive.app).

## :two: Explore the Interface

The Rive Tester interface consists of five main panels:

### :control_knobs: Controls Panel

- File loading and management
- Playback controls (play, pause, stop)
- Display settings (fit mode, alignment, background)

### :art: Canvas Panel

- Live animation preview
- Real-time rendering with WebGL2
- Interactive elements and mouse events

### :mag: JSON Inspector

- Complete Rive file structure
- Interactive tree view with search
- Multiple view modes (tree, code, text)

### :zap: Dynamic Controls

- Auto-generated UI for ViewModel properties
- Real-time property manipulation
- Support for all property types (boolean, number, enum, etc.)

### :package: Asset Manager

- View embedded assets (images, fonts)
- Replace assets with local files or URLs
- Asset metadata and status information

## :three: Start Exploring

### Basic Operations

- **Play/Pause**: Use the play button in the Controls Panel
- **Change Properties**: Use the Dynamic Controls panel
- **Inspect Data**: Browse the JSON Inspector

### Advanced Features

- **Replace Assets**: Use the Asset Manager to swap images or fonts
- **Debug Console**: Access `window.riveInstanceGlobal` in browser console
- **Layout Customization**: Drag and resize panels to your preference

## :bulb: Pro Tips

!!! info "Panel Management"
    - **Drag tabs** to rearrange panels
    - **Resize panels** by dragging borders
    - **Close panels** and restore them via the restore bar
    - **Reset layout** using the reset button

!!! warning "Browser Compatibility"
Rive Tester requires a modern browser with WebGL2 support. Chrome, Firefox, Safari, and Edge are all supported.

## :question: Need Help?

- :books: [User Guide](user-guide.md) - Complete interface documentation
- :bug: [Debugging Guide](../advanced/debugging.md) - Troubleshooting and debug tools
- :octicons-mark-github-24: [GitHub Issues](https://github.com/ivg-design/rive_dev_playground/issues) - Report bugs or request features

---

**Next Steps**: [User Guide](user-guide.md) | [Asset Manager](asset-manager.md)
