## [1.3.0] - 2025-05-28
### Changes
- [minor]: improve JSON save filename format and fix event console initialization
## [1.2.6] - 2025-05-27
### Changes
- [fix]: enhance pymdownx.emoji configuration for improved emoji rendering with custom icons
## [1.2.5] - 2025-05-27
### Changes
- fix: simplify pymdownx.emoji configuration and update VSCode settings for GitHub Actions workflow [fix]
## [1.2.4] - 2025-05-27
### Changes
- fix: update documentation links and paths to reflect the new Rive Tester application structure and improve emoji rendering configuration[fix]
## [1.2.3] - 2025-05-27
### Changes
- fix: update documentation link in release-and-deploy workflow to point to the correct /docs/ directory [fix]
- chore: housekeeping [fix] remove outdated documentation and assets\n\n- Deleted various HTML, CSS, and JavaScript files related to documentation, including README, 404 pages, and guides for user management, installation, and debugging.\n- Cleaned up the repository to streamline the documentation structure and focus on essential content.
- [fix] update Rive app docs link to point to /docs/ for correct documentation location
## [1.2.2] - 2025-05-27
### Changes
- [fix] configure pymdownx.emoji for proper Material icon rendering in docs
- fix: deploy mkdocs_site as /docs in GitHub Pages workflow
## [1.2.1] - 2025-05-27
### Changes
- chore: remove outdated documentation files and assets from the repository[fix]\n\n- Deleted various markdown files related to user guides, debugging, runtime controls, asset management, installation, and quick start.\n- Removed associated CSS and HTML files for documentation.\n- Cleaned up the repository to streamline the documentation structure and focus on essential content.
- refactor: rename docs/ to source_docs and docs-html/ to mkdocs_site; updated all references in scripts, configs, and workflows; ensured MkDocs and deployment workflows use the new folder names; updated changelog accordingly
- chore: enforce consistent formatting and fix workflow input\n\n- Updated .editorconfig and .prettierrc to enforce tabs for code and spaces for YAML\n- Reformatted all files with Prettier\n- Fixed workflow_dispatch input for version_type in semantic-release.yml
## [1.2.0] - 2025-05-27

### Changes

-   - feat: Create unified release and deployment workflow to fix version synchronization issues [minor] - fix: Resolve deprecated GitHub Actions set-output commands with modern GITHUB_OUTPUT syntax - fix: Fix number input text visibility in layout scale controls - numbers now display properly - fix: Remove browser default number input spinners that were causing secondary popup buttons - refactor: Disable separate semantic-release and deploy workflows in favor of unified approach - fix: Ensure deployment always uses correct version from semantic release process - docs: Update workflow documentation and improve version management process

## [1.2.0] - 2025-05-27

### Changes

- feat: Create unified release and deployment workflow to fix version synchronization issues [minor]
- fix: Resolve deprecated GitHub Actions set-output commands with modern GITHUB_OUTPUT syntax
- fix: Fix number input text visibility in layout scale controls - numbers now display properly
- fix: Remove browser default number input spinners that were causing secondary popup buttons
- refactor: Disable separate semantic-release and deploy workflows in favor of unified approach
- fix: Ensure deployment always uses correct version from semantic release process
- docs: Update workflow documentation and improve version management process

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

## [Unreleased] - 2025-01-XX

### Added
- **JSON Editor Enhancements**
  - Added save functionality to JSON Inspector with downloadable JSON files
  - JSON files are saved with Rive filename in format: `{rivefilename}_parsed-data_{timestamp}.json`
  - Added professional header to JSON Inspector panel with save button
  - Implemented proper error handling for save operations
  - Enhanced filename detection from file input and UI display elements

- **Enhanced Debug Control System**
  - Added comprehensive console logging for all debug control actions
  - Implemented `debugHelper.test()` function to test all debug modules with sample messages
  - Added `debugHelper.currentSettings()` with enhanced status reporting showing actual vs UI state
  - Exposed `debugHelper.api` for direct access to LoggerAPI methods
  - Added real-time mismatch detection between UI settings and actual logger state
  - Implemented proper initialization logging with available commands list
  - Added global enabled state tracking and display

- **Debug Control Panel Improvements**
  - Enhanced Enable All/Disable All buttons with proper console feedback
  - Fixed "Set All Levels" functionality to properly update all module dropdowns
  - Added individual module setting with detailed console logging
  - Implemented proper state synchronization between UI and LoggerAPI
  - Added status messages in debug panel with auto-clear functionality

- **LoggerAPI Enhancements**
  - Added `isEnabled()` method to get current global enabled state
  - Added `getModuleLevel(moduleName)` to get current level for specific modules
  - Added `getAllLevels()` method to retrieve all current module levels
  - Enhanced module level setting with proper validation and logging
  - Improved global enable/disable functionality with immediate effect

- **Comprehensive Rive Event Logging System**
  - Added master toggle for enabling/disabling all event logging
  - Implemented separate toggles for different event categories:
    - Custom Events (user-defined events from Rive files)
    - State Change Events (state transitions, input changes, ViewModel properties)
    - Nested ViewModel Events (property changes in nested ViewModels)
    - Playback Events (Play, Pause, Stop, Loop)
    - System Events (Load, LoadError)
  - Event Console panel with terminal-style interface (black background, green text)
  - Real-time event streaming with latest messages on top
  - Event throttling and emergency shutdown to prevent browser crashes
  - Comprehensive event formatting with timestamps and detailed information
  - Help system with popup modal explaining all event types
  - Persistent settings saved to localStorage

- **Beautiful Toggle Switch UI**
  - Replaced checkboxes with modern red/green gradient toggle switches
  - Master toggle (larger) for main event logging control
  - Compact toggles for sub-options
  - Smooth animations with hover effects and accessibility support

- **Enhanced Event Console**
  - Terminal-style interface with monospaced font
  - Auto-scroll to keep latest events visible
  - Clear button functionality
  - Message limiting (100 entries) for performance
  - Styled scrollbar for better UX
  - Event console clears on page reload
  - Disabled/enabled status messages

- **Advanced ViewModel Event Monitoring**
  - Enhanced VM name detection with actual instance names and blueprint names
  - Support for nested ViewModel property change tracking
  - Full VM path tracking for complex nested structures
  - Context-aware event logging with VM metadata

- **Improved Control Interface**
  - All control panel sections (State Machine Controls, VM sections) start closed on load
  - Consistent styling across all Dynamic Controls sections
  - Better organization and visual hierarchy

### Fixed
- **Event Console Initialization**
  - Fixed event console flicker on initialization
  - Moved event console state initialization to Golden Layout component factory
  - Ensured proper initial message display based on saved settings
  - Removed conflicting initialization logic from riveControlInterface.js
  - Reduced initialization timeout from 100ms to 50ms for faster display

- **Debug Control System Issues**
  - Fixed Enable All/Disable All buttons not working properly
  - Fixed missing console logging for debug control actions
  - Fixed setting all levels to NONE not stopping debug messages
  - Fixed disconnect between UI state and actual LoggerAPI state
  - Fixed localStorage persistence for global enabled state
  - Fixed module level synchronization between UI dropdowns and actual settings
  - Fixed debug panel status messages not displaying properly

- **Debug System Functionality**
  - Fixed LoggerAPI global enable/disable not being properly tracked
  - Fixed module level getters not being available for status checking
  - Fixed debug controls initialization not providing user feedback
  - Fixed mismatch detection between saved settings and runtime state
  - Fixed test function import issues and error handling

- **Play Button Icons**
  - Play/pause/stop buttons now maintain persistent triangle (▶️) and stop (⏹️) icons
  - Button states properly synchronize with Rive playback events
  - Icons no longer get replaced with text during state changes
  - Proper event listener synchronization for timeline and state machine playback

- **Event Console Improvements**
  - Removed distracting blinking cursor from terminal interface
  - Event console properly clears on page reload
  - Clear button functionality works correctly
  - Latest events appear at top (newest pushes older events down)

- **Code Cleanup**
  - Removed all nested artboard event monitoring code (non-functional)
  - Removed nested artboard toggle switch from UI
  - Removed frame events toggle (high frequency events)
  - Removed nested artboard references from help popup
  - Cleaned up localStorage handling for removed features

### Improved
- **JSON Editor User Experience**
  - Reduced font size from 14px to 11px for more compact display
  - Reduced indentation from 2 to 1 space for more compact display
  - Better space utilization in JSON Inspector panel
  - Improved readability for large JSON structures

- **Event System Performance**
  - Added event throttling (100ms minimum between same event types)
  - Maximum 50 events per second limit
  - Emergency shutdown at 200 events to prevent browser crashes
  - Automatic recovery after emergency shutdown
  - Better memory management for event storage

- **User Experience**
  - Help system with professional popup modal design
  - Responsive design for help popup
  - Keyboard shortcuts (Escape to close popups)
  - Better visual feedback for all interactions
  - Improved accessibility with focus states

- **Developer Experience**
  - Enhanced debugging capabilities with structured event logging
  - Better error handling and recovery
  - Comprehensive event categorization and filtering
  - Detailed event metadata for troubleshooting

### Technical Improvements
- **Event Mapping System**
  - Complete event type mappings based on C++ bindings
  - Proper event categorization and color coding
  - Support for all Rive event types with proper formatting
  - Enhanced event data extraction and processing

- **State Management**
  - Improved localStorage persistence for all settings
  - Better state synchronization between UI and Rive runtime
  - Proper cleanup of event listeners and intervals
  - Enhanced error recovery and fallback handling
  - Better separation of concerns between Golden Layout and control interface
  - Eliminated race conditions in event console initialization

### Removed
- **Nested Artboard Event Monitoring**
  - Removed non-functional nested artboard event detection
  - Removed related UI toggles and help documentation
  - Cleaned up associated code and localStorage entries
  - Simplified event processing pipeline

- **Frame Events Toggle**
  - Removed high-frequency frame events toggle
  - Removed associated help documentation
  - Simplified event filtering logic
