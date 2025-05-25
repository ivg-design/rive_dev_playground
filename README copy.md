# Rive File Parser & Inspector

## Project Overview

This project provides a client-side Rive file parser and inspector. It allows users to select a local `.riv` file, parses it using the Rive WebGL2 runtime, and then displays the extracted hierarchical data (artboards, animations, state machines, ViewModels, assets, etc.) in an interactive JSON viewer. This tool is designed to help developers and animators understand the internal structure of their Rive animations and inspect ViewModel properties and instances.

The primary goal is to offer a detailed look into the Rive file's composition without needing to run it within a larger application, aiding in debugging, learning, and verification of Rive setups.

## Features

*   **Client-Side Parsing:** Operates entirely in the browser using the official Rive WebGL2 runtime.
*   **File Selection:** Users can select local `.riv` files via a standard file input.
*   **Detailed Data Extraction:**
    *   Artboard names, animations (name, FPS, duration, work area).
    *   State Machine names and their inputs (with type information; includes a basic mechanism to help resolve numeric types to string representations like "Boolean", "Number", "Trigger" for initially bound state machines).
    *   ViewModel definitions (blueprints): names, properties (name, type).
    *   ViewModel instances: hierarchy, source blueprint, and live input property values.
    *   Image asset listing (names, types, CDN UUIDs if available).
    *   Global enum definitions.
*   **Robust ViewModel Property Access:** Accurately retrieves values for various property types (boolean, string, number, color, enum) from ViewModel instances.
*   **Interactive JSON Viewer:** Uses the `jsoneditor` library to display the parsed data in a user-friendly, explorable tree view.
    *   Dark theme for comfortable viewing.
    *   Search functionality.
    *   Multiple view modes (tree, code, etc.).
    *   Customized node name display in tree view for objects and arrays.
*   **WebGL2 Runtime:** Utilizes the `@rive-app/webgl2` runtime, which is expected to use the WebGL2 renderer for optimal performance where available.
*   **Dynamic Updates:** The JSON view updates automatically when a new file is parsed.

## File Structure

The core files of this project are:

*   `index.html`: The main HTML page that provides the user interface (file picker, Rive canvas, JSON viewer container).
*   `parser.js`: Contains the primary logic for parsing the Rive file (`runOriginalClientParser` function).
*   `main.js`: Handles UI interactions, initializes the Rive runtime and `jsoneditor`, and orchestrates the parsing process by calling `parser.js`.
*   `animations/`: (Directory) Intended to store local Rive files for easy access or default loading. (This directory is in `.gitignore` by default if you choose to add local example files).
*   `node_modules/`: (Directory) Contains installed npm packages, including `@rive-app/webgl2` and `jsoneditor`.
*   `package.json` / `package-lock.json`: Define project dependencies.
*   `.gitignore`: Specifies intentionally untracked files by Git.
*   `_archive/`: Contains older or unused files from previous development iterations.

## Setup and Installation

1.  **Clone the Repository (if applicable):**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
2.  **Install Dependencies:**
    This project uses `npm` to manage dependencies (`@rive-app/webgl2` for Rive rendering and `jsoneditor` for displaying the parsed data).
    ```bash
    npm install
    ```
3.  **Serve `index.html`:**
    Since the application loads Rive files and modules, it needs to be served by a local web server to avoid CORS issues and ensure correct module loading. Many simple HTTP servers can be used:
    *   Using `npx http-server .` (if you have Node.js/npm)
    *   Using Python's built-in server: `python -m http.server`
    *   Using VS Code's "Live Server" extension.
    Open the `index.html` file through the local server (e.g., `http://localhost:8080`).

## How it Works (High-Level)

1.  The user opens `index.html` in their browser.
2.  `main.js` initializes the `jsoneditor` instance with a placeholder message.
3.  The user selects a `.riv` file using the file input.
4.  The `change` event on the file input triggers `handleFileSelect` in `main.js`.
5.  `handleFileSelect` prepares the necessary Rive engine instance and canvas.
6.  It then calls `runOriginalClientParser` (from `parser.js`), passing the Rive engine, canvas, file path (or a blob URL for the local file), and a callback function.
7.  `parser.js` (`runOriginalClientParser`):
    *   Initializes a new Rive instance with the provided file.
    *   Uses an `assetLoader` to collect information about image assets.
    *   On successful load (`onLoad` callback):
        *   Resizes the Rive drawing surface.
        *   Extracts artboard details, animations, state machines (including calibrating input types if possible).
        *   Extracts ViewModel definitions (blueprints) and their properties.
        *   Parses the default ViewModel instance hierarchy for the main artboard using `parseViewModelInstanceRecursive`.
        *   Collects global enum definitions.
        *   Constructs a comprehensive `result` object.
        *   Calls the `finalCallback` (provided by `main.js`) with the `result` object.
8.  `main.js` (in the callback):
    *   Receives the parsed data (or an error).
    *   Calls `setupJsonEditor` to update the `jsoneditor` instance with the new data.
9.  The `jsoneditor` displays the structured Rive data.

## Detailed Explanation: `parser.js`

This file is responsible for the core Rive file parsing logic.

### `runOriginalClientParser(riveEngine, canvasElement, riveFilePathFromParam, callback)`

*   **Purpose:** The main orchestrator for parsing a Rive file.
*   **Parameters:**
    *   `riveEngine`: The Rive WebGL2 runtime object (e.g., `window.rive`).
    *   `canvasElement`: The `<canvas>` DOM element for Rive to render onto.
    *   `riveFilePathFromParam`: String path/URL to the `.riv` file, or a blob URL for local files. If `null`, a hardcoded default path within `parser.js` might be used (though `main.js` currently ensures a blob URL or null for the parser's internal default).
    *   `callback`: A function `(error, data)` called upon completion or error.
*   **Process:**
    1.  **Initialization:** Sets up a `finalCallback` wrapper. Validates `riveEngine` and `canvasElement`.
    2.  **Renderer Setup:** The parser uses the `@rive-app/webgl2` runtime, which is expected to select the WebGL2 renderer by default if supported by the browser. No explicit factory is set.
    3.  **Rive Instantiation:** Creates a new `riveToUse.Rive({...})` instance with:
        *   `src`: The Rive file path/URL.
        *   `canvas`: The canvas element.
        *   `autobind: true`, `autoplay: true` (can be configured if needed).
        *   `rendererFactory`: The chosen renderer factory.
        *   `assetLoader`: A callback that intercepts asset loading. For this parser, it collects metadata about image assets (`name`, `type`, `cdnUuid`) but returns `false` to indicate the parser isn't providing the asset bytes itself (Rive handles loading them from the `.riv` file).
    4.  **`onLoad` Callback (Core Parsing Logic):** This is where the bulk of the data extraction happens once the Rive file is successfully loaded by the instance.
        *   **`resizeDrawingSurfaceToCanvas()`**: Ensures rendering is crisp.
        *   **Result Object:** Initializes a `result` object to store all parsed data.
        *   **State Machine Input Type Calibration:** Contains a mechanism to help resolve numeric SM input type IDs to string representations (e.g., "Boolean", "Number", "Trigger"). This currently operates on any state machine that is active on the default artboard when the Rive instance is loaded (due to `autobind: true`). For more targeted calibration of arbitrary state machines, further UI integration to specify target artboards/SMs would be needed (the related UI inputs are currently commented out in `index.html`).
        *   **ViewModel Definition Parsing (Phase 1):**
            *   Iterates through all ViewModel definitions (blueprints) available in `riveInstance.file` (or `riveInstance`).
            *   For each definition, it extracts its `name`, `properties` (name and type of each property), `instanceNamesFromDefinition`, and `instanceCountFromDefinition`.
            *   Creates a `fingerprint` for each blueprint based on its sorted property names and types, which can help in matching instances to definitions if direct name matching fails for nested ViewModels.
            *   Stores this blueprint information in `result.allViewModelDefinitionsAndInstances`.
        *   **Default Artboard ViewModel Parsing (Phase 2):**
            *   Gets the default artboard (`riveInstance.artboard`).
            *   Gets its default ViewModel blueprint (`riveInstance.defaultViewModel()`).
            *   Gets the corresponding main ViewModel instance (`riveInstance.viewModelInstance` or `defaultVmBlueprint.defaultInstance()`).
            *   Calls `parseViewModelInstanceRecursive` to parse this main instance and its children. The result is added to the artboard's `viewModels` array in the `result` object.
        *   **Artboard & Animation Info Loop:**
            *   Iterates through all artboards in `riveFile.artboardByIndex(i)`.
            *   For each artboard, collects its `name`.
            *   Extracts all animations: `name`, `fps`, `duration`, `workStart`, `workEnd`.
            *   Extracts all state machines:
                *   `name`.
                *   Inputs: Attempts to get input `name` and `type` (as a string like "Boolean", "Number", "Trigger") by looking at `riveInstance.contents.artboards[artboardName].stateMachines[smName].inputs`. Uses the `DYNAMIC_SM_INPUT_TYPE_MAP` and hardcoded numeric type IDs (56, 58, 59) for SM input type resolution.
        *   **Global Enum Collection:** Retrieves global enum definitions using `riveInstance.enums()` or `riveFile.enums()`.
        *   **Callback Execution:** Calls `finalCallback(null, cleanResult)` with a "cleaned" result object (ensuring only expected top-level keys are present).
    5.  **`onError` Callback:** If Rive instantiation or loading fails, calls `finalCallback` with an error object.

### `parseViewModelInstanceRecursive(vmInstanceObj, instanceNameForOutput, sourceBlueprint)`

*   **Purpose:** Recursively traverses a ViewModel instance and its nested ViewModel properties to extract their structure and input values.
*   **Parameters:**
    *   `vmInstanceObj`: The Rive `ViewModelInstance` object to parse.
    *   `instanceNameForOutput`: The name to use for this instance in the output JSON.
    *   `sourceBlueprint`: The Rive `ViewModelDefinition` (blueprint) that this instance is based on.
*   **Returns:** An object representing the parsed ViewModel instance:
    ```json
    {
      "instanceName": "string",
      "sourceBlueprintName": "string",
      "inputs": [
        { "name": "propName", "type": "propType", "value": "actualValue" }
      ],
      "nestedViewModels": [ /* recursive calls for nested VM instances */ ]
    }
    ```
*   **Process:**
    1.  Initializes `currentViewModelInfo` for the current instance.
    2.  Iterates through properties defined in the `sourceBlueprint`.
    3.  **Nested ViewModels:** If a property is of `type: 'viewModel'`:
        *   Retrieves the nested `ViewModelInstance` using `vmInstanceObj.viewModel(propDecl.name)`.
        *   Attempts to find the blueprint for this nested instance (first by name, then by property fingerprint).
        *   Recursively calls `parseViewModelInstanceRecursive` for the nested instance.
    4.  **Primitive Inputs:** For other property types (number, string, boolean, enumType, color, trigger):
        *   Uses the Rive instance's accessor methods: `vmInstanceObj.number(propName)`, `vmInstanceObj.string(propName)`, etc., to get a "property input" object.
        *   Retrieves the actual value from the `.value` property of this input object (e.g., `propInput.value`).
        *   For `color` types, converts the ARGB numeric value to a HEX string using `argbToHex`.
        *   For `string` types, replaces escaped newlines `\\n` with actual newlines `\n`.
        *   Handles cases where property accessors or the `.value` might not be found, providing informative fallback strings.
        *   Stores the extracted `name`, `type`, and `value` in the `inputs` array.
    5.  Returns the populated `currentViewModelInfo`.

### `argbToHex(argbNumber)`

*   **Purpose:** Converts a 32-bit ARGB number (as used by Rive for colors) into a 6-character uppercase HEX string (e.g., "#RRGGBB"). Alpha is ignored.
*   **Parameters:**
    *   `argbNumber`: The numeric ARGB color value.
*   **Returns:** The HEX string, or an error message string if the input is not a number.

## Detailed Explanation: `main.js`

This file acts as the controller, connecting the UI (`index.html`) with the parsing logic (`parser.js`) and the JSON display library (`jsoneditor`).

### Global Variables

*   `jsonEditorInstance`: Holds the initialized instance of the `JSONEditor`.

### `setupJsonEditor(jsonData)`

*   **Purpose:** Initializes a new `JSONEditor` instance or updates an existing one with new data.
*   **Parameters:**
    *   `jsonData`: The JSON object to display (can be parsed Rive data, an error object, or a placeholder).
*   **Process:**
    1.  Defines `options` for `JSONEditor`:
        *   `mode: 'tree'` (initial view mode).
        *   `modes: ['tree', 'view', 'code', 'text', 'preview']` (available modes in the editor's menu).
        *   `search: true` (enables search functionality).
        *   `enableTransform: false` (disables the JMESPath transformation UI).
        *   `onNodeName`: A callback function to customize how node names (specifically summaries for objects/arrays) are displayed in the tree view. It shows the first string property's value for objects, or "Array [size]" for arrays, otherwise defaults to the editor's size display.
        *   `onError`: A callback to log errors from the `jsoneditor` itself.
    2.  If `jsonEditorInstance` exists, it calls `jsonEditorInstance.set(jsonData)` to update its content.
    3.  Otherwise, it creates a `new JSONEditor(outputDiv, options, jsonData)`, attaching it to the `<div id="output">`.

### `DOMContentLoaded` Listener

*   **Purpose:** Ensures that `setupJsonEditor` is called once the initial HTML DOM is fully loaded and parsed.
*   **Process:** Calls `setupJsonEditor` with an initial placeholder message.

### `handleFileSelect(event)`

*   **Purpose:** Triggered when the user selects a file in the `<input type="file">`. This is the main entry point for the parsing workflow.
*   **Process:**
    1.  Gets the selected `File` object.
    2.  Checks for `window.rive` (Rive runtime) availability.
    3.  Determines the Rive file source:
        *   If a file is selected, creates a blob URL (`URL.createObjectURL(file)`).
        *   If no file is selected, `riveSrcForOriginal` is `null`, prompting `parser.js` to use its internal default.
    4.  Updates the status message.
    5.  Retrieves the `<canvas>` element.
    6.  Calls `runOriginalClientParser` (from `parser.js`), passing the Rive engine, canvas, Rive source, and a callback function.
    7.  **Callback Logic:**
        *   **On Error:** Logs the error and calls `setupJsonEditor` to display an error object in the JSON viewer.
        *   **On Success (`parsedData`):** Updates the status message and calls `setupJsonEditor(parsedData)` to display the parsed Rive data.
        *   **No Data:** If the parser returns no data but no error, updates status and shows a "no data" message in the editor.

## Explanation: `index.html`

*   **Structure:**
    *   Standard HTML5 boilerplate.
    *   Links to `jsoneditor.min.css` and embeds custom dark theme CSS for `jsoneditor`.
    *   Includes general page dark theme styles.
    *   Defines a controls section (`<div id="controls">`) with a file input (`#riveFilePicker`). The parser choice UI and SM calibration inputs have been commented out but can be re-enabled if needed.
    *   Defines an output section (`<div id="outputContainer">`) using Flexbox to arrange:
        *   A `<canvas id="rive-canvas">` for Rive rendering (30vw width).
        *   A `<div id="output">` as the container for `jsoneditor` (70vw width).
    *   A status message paragraph (`<p id="statusMessage">`).
    *   Script inclusions at the end: Rive runtime (`@rive-app/webgl2/rive.js`), `jsoneditor.min.js`, `parser.js`, and `main.js` (as a module).
*   **CSS Styling:**
    *   A page-wide dark theme is applied to `body` and various elements.
    *   Specific styles for `jsoneditor` (and the embedded `darktheme.css`) are included to integrate its appearance.
    *   Flexbox is used for the main layout of controls, canvas, and JSON viewer.
    *   The `#output` div is styled to take the necessary width and height, with `overflow-y: auto` for scrolling its content (though `jsoneditor` often manages its internal scroll).
    *   CSS overrides are in place to ensure `jsoneditor`'s internal elements expand to full width.

## How to Use

1.  Ensure you have followed the Setup and Installation steps.
2.  Serve `index.html` using a local web server.
3.  Open the served page in your browser.
4.  Click the "Choose File" button and select a `.riv` file from your local system.
5.  The Rive animation will load and play on the canvas on the left (if it has autoplaying animations or state machines).
6.  The parsed data structure from the Rive file will appear in the `jsoneditor` view on the right.
7.  You can explore the JSON tree, use the editor's search, and switch between different view modes (Tree, Code, etc.) using the `jsoneditor` menu.
8.  The `onNodeName` customization will affect how object and array summaries are displayed in the tree view.

## Potential Future Enhancements / Known Limitations

*   **Advanced Dark Theming for JSONEditor:** The current dark theme is functional. Deeper integration or more specific theme overrides for all `jsoneditor` states could be explored.
*   **State Machine Instance Interaction:** Currently, the parser extracts SM definitions and input names. Interacting with live state machine inputs (changing their values and seeing the Rive animation update) is not implemented in this parser but is a common feature in Rive debugging tools (and was present in `exampleIndex.mjs` which this project draws inspiration from for VM parsing).
*   **ViewModel Property Editing:** Similar to SM inputs, allowing users to edit ViewModel property values in the UI and have those changes reflected in the Rive canvas would be a powerful addition.
*   **Error Handling in Parser:** While `parser.js` has some error checks, it could be made more resilient to unexpected Rive file structures or API changes.
*   **Performance with Extremely Large Files:** `jsoneditor` is generally performant, but very large and deeply nested Rive files might impact browser performance during parsing or rendering in the editor.
*   **Modular Parser Path:** The code in `main.js` related to a "modular parser" (using `parseRiveFile` from `parser_modules`) has been largely removed. If this path were to be reinstated, its integration with `jsoneditor` would need to be updated similarly to the "original parser" path.
*   **SM Input Calibration UI:** The UI elements in `index.html` for specifying an artboard and state machine name for targeted SM input type calibration are currently commented out. To enable user-driven calibration for specific state machines, these UI elements would need to be re-enabled, and their values passed to and utilized by `parser.js` to refine the `activeArtboardNameForCalibration` and `activeSMNameForCalibration` variables.

This README aims to be a comprehensive guide to the project. 