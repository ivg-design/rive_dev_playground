## [1.1.2] - 2025-05-27

### Changes
- fix: fix scale control functionality to RiveControlInterface and RiveParserHandler [fix]

## [1.1.1] - 2025-05-27

### Changes
- fix: add null checks for classList operations and ensure version updates on all deployments [fix]
- fix: improve error handling in Golden Layout controls state check
- docs: trigger deployment for version 1.1.0

## [1.1.0] - 2025-05-27

### Changes
- chore: Update project name and enhance dependencies for Rive Playground [minor]

# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2025-05-27

### Changes
- refactor: Update documentation structure and links for improved navigation
- feat: Integrate documentation build process into deployment workflow
- feat: Enhance Rive Tester UI and functionality with dynamic controls and improved asset management
- refactor: Modularize CSS and enhance README documentation for improved maintainability
- fix: Resolve CSS conflict hiding main file input button
- feat: Add Asset Manager component for viewing and replacing embedded assets
- Fix README: Remove non-existent features and documentation links
- Test: Trigger GitHub Pages deployment
- Remove deprecated files and restructure project for Rive Playground. Deleted obsolete README copy and diagram files, updated index.html to reflect new file paths for styles and scripts, and modified package.json to change the project name and description. Enhanced deployment workflow to accommodate new directory structure and added comprehensive debugging documentation.
- Update deployment workflow and enhance index.html for Rive Playground. Changed deployment directory from 'rive-tester' to 'rive-playground' and updated file copying commands accordingly. Revamped index.html to improve layout and styling, introducing a new header and tools grid for better user engagement. Enhanced CSS for responsiveness and visual appeal, including new styles for tool cards and buttons.
- Refactor UI layout and enhance functionality for Rive file parsing. Updated index.html to streamline file controls and animation settings, improving user experience. Enhanced CSS for better styling and responsiveness, including new styles for file selection and layout controls. Updated riveParserHandler.js to manage file selection UI and layout changes, ensuring a cohesive interaction with Rive files.
- Integrate Golden Layout for enhanced UI management in Rive file parser. Updated index.html to include Golden Layout CSS and JS, restructured HTML for dynamic controls, and improved event handling in riveParserHandler.js. Enhanced CSS for better layout and responsiveness, including new styles for Golden Layout components. Updated package.json and package-lock.json to include Golden Layout as a dependency.
- Refactor UI layout and enhance functionality for Rive file parsing. Updated index.html to improve header structure and added controls for canvas background color in both live and inspector views. Enhanced CSS for better styling and responsiveness. Updated riveParserHandler.js to support dual file pickers and synchronize their states, along with improved event handling for background color changes.
- Add GitHub Pages deployment
- Enhance nested ViewModel control processing in dataToControlConnector.js. Updated buildNestedVMControls function to accept parsedData for improved property handling and added detailed debug logging for property access and enum type lookups. This enhances error visibility and ensures better handling of nested properties during data processing.
- Implement smart enum matching in riveControlInterface.js and enhance debug controls. Added findSmartEnumMatches function for improved enum type lookup based on word similarity. Updated debugControl.js to extend the global debugHelper with currentSettings functionality, allowing retrieval of current debug settings. Enhanced logging for better visibility of debug states and settings.
- Refactor Rive control handling and enhance application state management. Updated riveControlInterface.js to improve enum type lookup strategies with enhanced debugging logs. Introduced resetApplicationState function in riveParserHandler.js to clear global state when a new file is selected, ensuring a clean initialization. Enhanced debugControl.js to manage debug settings persistence in localStorage, improving user experience for debugging configurations.
- Enhance logging and debugging capabilities across Rive integration. Updated dataToControlConnector.js to include detailed debug logs for enumTypeName handling and fallback mechanisms. Improved parser.js with enhanced logging for property definitions and added comprehensive property inspections. Refactored riveControlInterface.js to replace console logs with structured logger calls, ensuring consistent logging practices. Introduced debug control panel in debugControl.js and debugQuickSet.js for dynamic log level adjustments, improving developer experience during runtime.
- Refactor playback controls and UI elements in Rive integration. Updated index.html to replace animation selectors with timeline selectors, enhancing clarity. Modified CSS for improved button states and transitions. Streamlined event handling in riveParserHandler.js for timeline and state machine controls, ensuring better user experience and functionality.
- Refactor index.html and enhance UI for Rive controls. Updated layout for dynamic controls, including artboard and state machine selectors. Improved CSS styles for better user experience and streamlined event handling in riveParserHandler.js. Enhanced README with detailed setup instructions for runtime control system and added examples for programmatic animation control.
- Enhance ViewModel property handling and enum type determination in data processing. Updated processDataForControls to include detailed enumTypeName extraction for properties and improved error logging for property access. Refactored parser.js to remove hardcoded state machine names and streamline state machine discovery. Enhanced control creation in riveControlInterface.js to support dynamic property paths and improve UI responsiveness with debounced resize handling.
- Integrate logging system and enhance ViewModel controls in Rive parser. Added new scripts for debugging and logging functionality in index.html. Expanded CSS styles for direct ViewModel access and improved UI elements. Refactored parser.js to utilize a structured logging approach and enhance error handling. Updated riveControlInterface.js to streamline dynamic control creation for ViewModel properties, ensuring better integration with the Rive instance.
- Enhance styling and functionality for Rive controls and ViewModel integration. Added new CSS styles for play buttons, activation sections, and error/info notes. Updated parser.js to improve logging and handle default state machine names. Expanded riveControlInterface.js to create dynamic controls for ViewModel properties, including nested ViewModels, and improved error handling. Updated riveParserHandler.js to utilize default elements for better user experience during Rive file parsing.
- Refactor index.html to integrate JSONEditor and enhance user interface. Removed legacy code and main.js, streamlining the project structure. Updated to use a custom stylesheet for improved styling and added dynamic controls for Rive file parsing. Adjusted script loading order for better functionality.
- Refactor parser.js and update README for improved clarity and functionality. Removed the explicit WebGL2 renderer factory setup in parser.js, relying on the default behavior of the @rive-app/webgl2 runtime. Expanded README to provide a comprehensive overview of the project, detailing features, setup instructions, and file structure for better user guidance.
- Update .gitignore to include animations/ and .cursor/ directories
- Stop tracking animations/ and .cursor/ directories
- Remove deprecated files and refactor project structure for improved maintainability. Deleted unused parser modules, including asset, state machine, and ViewModel instance parsers. Updated index.html to integrate JSONEditor for enhanced data visualization and removed legacy code. Refactored main.js to streamline Rive file handling and improve error reporting. Updated package dependencies to include JSONEditor and remove unnecessary libraries. reverted to using original parser.js instead of modular approach
- MOSTLY WORKING VERSION - Refactor parser modules for improved ViewModel handling and error reporting. Updated processInputProperty to streamline value extraction and enhance fallback mechanisms. Enhanced processNestedViewModel to clarify blueprint determination and error handling. Refactored riveParserOrchestrator to better manage ViewModel instances and parsing logic. Improved vmBlueprintAnalyzer to include detailed nested ViewModel properties. Updated vmInstanceParserRecursive to ensure accurate instance naming and prevent duplicates in the global instance list.
- Enhance index.html layout and parser.js functionality. Updated index.html to improve user interface with additional controls for Rive file parsing, including file selection and calibration inputs. Refactored parser.js to introduce a new runOriginalClientParser function for better handling of Rive instances and file paths. Improved error handling and logging throughout the parser modules for enhanced debugging and maintainability.
- Refactor vmBlueprintAnalyzer and vmInstancePropertyValueExtractor for improved property analysis and value extraction. Enhanced analyzeBlueprintFromDefinition to include nested ViewModel properties and added generateBlueprintFingerprint function. Updated extractVmInstancePropertyValue to utilize dedicated value getters for better clarity and maintainability.
- initial commit for a rive parser and testing environment

