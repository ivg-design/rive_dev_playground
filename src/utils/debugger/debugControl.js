/**
 * @file debugControl.js
 * Provides a UI for controlling the debugging system.
 */

import { LoggerAPI, LogLevel } from './debugLogger.js';

// Module names that are available for debugging
const MODULES = [
    'parser',
    'parserHandler', 
    'controlInterface',
    'dataConnector'
];

// Log level names and values
const LOG_LEVELS = [
    { name: 'NONE', value: LogLevel.NONE },
    { name: 'ERROR', value: LogLevel.ERROR },
    { name: 'WARN', value: LogLevel.WARN },
    { name: 'INFO', value: LogLevel.INFO },
    { name: 'DEBUG', value: LogLevel.DEBUG },
    { name: 'TRACE', value: LogLevel.TRACE }
];

// Global state for debug controls
let debugControlsContainer = null;
let debugControlsEnabled = false;

// LocalStorage keys for persistence
const STORAGE_KEYS = {
    DEBUG_ENABLED: 'rive-tester-debug-enabled',
    DEBUG_LEVELS: 'rive-tester-debug-levels',
    DEBUG_GLOBAL_ENABLED: 'rive-tester-debug-global-enabled'
};

/**
 * Loads debug settings from localStorage
 */
function loadDebugSettings() {
    try {
        // Load debug controls visibility
        const savedEnabled = localStorage.getItem(STORAGE_KEYS.DEBUG_ENABLED);
        if (savedEnabled === 'true') {
            debugControlsEnabled = true;
        }
        
        // Load global debug state
        const globalEnabled = localStorage.getItem(STORAGE_KEYS.DEBUG_GLOBAL_ENABLED);
        if (globalEnabled !== null) {
            LoggerAPI.enable(globalEnabled === 'true');
        }
        
        // Load module-specific levels
        const savedLevels = localStorage.getItem(STORAGE_KEYS.DEBUG_LEVELS);
        if (savedLevels) {
            const levels = JSON.parse(savedLevels);
            Object.entries(levels).forEach(([module, level]) => {
                LoggerAPI.setModuleLevel(module, level);
            });
        }
    } catch (e) {
        console.warn('Failed to load debug settings from localStorage:', e);
    }
}

/**
 * Saves debug settings to localStorage
 */
function saveDebugSettings() {
    try {
        localStorage.setItem(STORAGE_KEYS.DEBUG_ENABLED, debugControlsEnabled.toString());
        
        // Save current module levels (we'll need to track these)
        const currentLevels = {};
        MODULES.forEach(module => {
            // We'll need to get current levels from the UI since LoggerAPI doesn't expose them
            const levelSelect = document.getElementById(`debug-level-${module}`);
            if (levelSelect) {
                currentLevels[module] = parseInt(levelSelect.value);
            }
        });
        localStorage.setItem(STORAGE_KEYS.DEBUG_LEVELS, JSON.stringify(currentLevels));
        
        // Save global enabled state (we'll track this separately)
        // For now, we'll assume it's enabled if any module is above NONE
        const globalLevelSelect = document.getElementById('debug-all-level');
        if (globalLevelSelect) {
            localStorage.setItem(STORAGE_KEYS.DEBUG_GLOBAL_ENABLED, 'true');
        }
    } catch (e) {
        console.warn('Failed to save debug settings to localStorage:', e);
    }
}

/**
 * Creates and injects the debug control panel into the DOM
 */
export function initDebugControls() {
    // Load saved settings first
    loadDebugSettings();
    
    // Initialize UI if it was enabled
    if (debugControlsEnabled) {
        createDebugControlsUI();
    }
    
    // Expose global helper
    window.debugHelper = {
        enable: enableDebugControls,
        disable: disableDebugControls,
        toggle: toggleDebugControls,
        isEnabled: () => debugControlsEnabled,
        clearSettings: clearDebugSettings
    };
}

/**
 * Enables and shows the debug controls
 */
function enableDebugControls() {
    debugControlsEnabled = true;
    if (!debugControlsContainer) {
        createDebugControlsUI();
    } else {
        debugControlsContainer.style.display = 'block';
    }
    saveDebugSettings();
}

/**
 * Disables and hides the debug controls
 */
function disableDebugControls() {
    debugControlsEnabled = false;
    if (debugControlsContainer) {
        debugControlsContainer.style.display = 'none';
    }
    saveDebugSettings();
}

/**
 * Toggles the debug controls visibility
 */
function toggleDebugControls() {
    if (debugControlsEnabled) {
        disableDebugControls();
    } else {
        enableDebugControls();
    }
}

/**
 * Creates the actual debug controls UI
 */
function createDebugControlsUI() {
    if (debugControlsContainer) {
        return; // Already created
    }
    
    debugControlsContainer = document.createElement('div');
    debugControlsContainer.id = 'debug-controls-panel';
    debugControlsContainer.style.cssText = `
        position: fixed;
        bottom: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 10px;
        border-top-left-radius: 8px;
        z-index: 9999;
        font-family: monospace;
        font-size: 12px;
        max-height: 300px;
        overflow-y: auto;
        transition: transform 0.3s;
        transform: translateY(calc(100% - 30px));
    `;
    
    // Title bar that stays visible
    const titleBar = document.createElement('div');
    titleBar.textContent = '🐛 Debug Controls';
    titleBar.style.cssText = `
        cursor: pointer;
        font-weight: bold;
        padding-bottom: 5px;
        border-bottom: 1px solid #555;
        user-select: none;
    `;
    debugControlsContainer.appendChild(titleBar);
    
    // Content container for all controls
    const content = document.createElement('div');
    content.style.cssText = `
        margin-top: 10px;
    `;
    debugControlsContainer.appendChild(content);
    
    // Global controls
    const globalControls = document.createElement('div');
    globalControls.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong>Global Controls</strong>
            <div style="display: flex; gap: 10px; margin-top: 5px;">
                <button id="debug-enable-all">Enable All</button>
                <button id="debug-disable-all">Disable All</button>
                <select id="debug-all-level">
                    ${LOG_LEVELS.map(level => `<option value="${level.value}">${level.name}</option>`).join('')}
                </select>
                <button id="debug-set-all-level">Set All Levels</button>
            </div>
        </div>
    `;
    content.appendChild(globalControls);
    
    // Module-specific controls
    const moduleControls = document.createElement('div');
    moduleControls.innerHTML = `
        <div>
            <strong>Module Controls</strong>
            <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
                <tr>
                    <th style="text-align: left; padding: 3px;">Module</th>
                    <th style="text-align: left; padding: 3px;">Level</th>
                    <th style="text-align: left; padding: 3px;">Actions</th>
                </tr>
                ${MODULES.map(module => `
                    <tr>
                        <td style="padding: 3px;">${module}</td>
                        <td style="padding: 3px;">
                            <select id="debug-level-${module}">
                                ${LOG_LEVELS.map(level => `<option value="${level.value}">${level.name}</option>`).join('')}
                            </select>
                        </td>
                        <td style="padding: 3px;">
                            <button id="debug-set-${module}">Set</button>
                        </td>
                    </tr>
                `).join('')}
            </table>
        </div>
    `;
    content.appendChild(moduleControls);
    
    // Status messages
    const statusArea = document.createElement('div');
    statusArea.id = 'debug-status';
    statusArea.style.cssText = `
        margin-top: 10px;
        padding-top: 5px;
        border-top: 1px solid #555;
        min-height: 20px;
        font-style: italic;
    `;
    content.appendChild(statusArea);
    
    // Add to DOM
    document.body.appendChild(debugControlsContainer);
    
    // Setup event handlers
    titleBar.addEventListener('click', () => {
        if (debugControlsContainer.style.transform === 'translateY(0px)') {
            debugControlsContainer.style.transform = 'translateY(calc(100% - 30px))';
        } else {
            debugControlsContainer.style.transform = 'translateY(0px)';
        }
    });
    
    // Global controls
    document.getElementById('debug-enable-all').addEventListener('click', () => {
        LoggerAPI.enable(true);
        updateStatus('Logging enabled globally');
        saveDebugSettings();
    });
    
    document.getElementById('debug-disable-all').addEventListener('click', () => {
        LoggerAPI.enable(false);
        updateStatus('Logging disabled globally');
        saveDebugSettings();
    });
    
    document.getElementById('debug-set-all-level').addEventListener('click', () => {
        const level = parseInt(document.getElementById('debug-all-level').value);
        LoggerAPI.setAllLevels(level);
        // Update all module dropdowns to reflect the change
        MODULES.forEach(module => {
            document.getElementById(`debug-level-${module}`).value = level;
        });
        updateStatus(`All modules set to ${getLevelName(level)}`);
        saveDebugSettings();
    });
    
    // Module-specific controls
    MODULES.forEach(module => {
        document.getElementById(`debug-set-${module}`).addEventListener('click', () => {
            const level = parseInt(document.getElementById(`debug-level-${module}`).value);
            LoggerAPI.setModuleLevel(module, level);
            updateStatus(`Module '${module}' set to ${getLevelName(level)}`);
            saveDebugSettings();
        });
    });
    
    // Set initial selected values based on saved configuration
    loadSavedUISettings();
}

/**
 * Updates the status message in the debug panel
 * @param {string} message - Status message to display
 */
function updateStatus(message) {
    const statusEl = document.getElementById('debug-status');
    if (statusEl) {
        statusEl.textContent = message;
        
        // Clear after 3 seconds
        setTimeout(() => {
            statusEl.textContent = '';
        }, 3000);
    }
}

/**
 * Gets the name of a log level from its value
 * @param {number} level - Log level value
 * @returns {string} Log level name
 */
function getLevelName(level) {
    const found = LOG_LEVELS.find(l => l.value === level);
    return found ? found.name : 'UNKNOWN';
}

/**
 * Loads saved UI settings and applies them to the dropdowns
 */
function loadSavedUISettings() {
    try {
        const savedLevels = localStorage.getItem(STORAGE_KEYS.DEBUG_LEVELS);
        if (savedLevels) {
            const levels = JSON.parse(savedLevels);
            
            // Set module-specific dropdowns
            MODULES.forEach(module => {
                const levelSelect = document.getElementById(`debug-level-${module}`);
                if (levelSelect && levels[module] !== undefined) {
                    levelSelect.value = levels[module];
                } else if (levelSelect) {
                    levelSelect.value = LogLevel.INFO; // Default
                }
            });
            
            // Set global dropdown to the most common level or INFO
            const globalSelect = document.getElementById('debug-all-level');
            if (globalSelect) {
                globalSelect.value = LogLevel.INFO; // Default
            }
        } else {
            // No saved settings, use defaults
            document.getElementById('debug-all-level').value = LogLevel.INFO;
            MODULES.forEach(module => {
                document.getElementById(`debug-level-${module}`).value = LogLevel.INFO;
            });
        }
    } catch (e) {
        console.warn('Failed to load saved UI settings:', e);
        // Fallback to defaults
        document.getElementById('debug-all-level').value = LogLevel.INFO;
        MODULES.forEach(module => {
            document.getElementById(`debug-level-${module}`).value = LogLevel.INFO;
        });
    }
}

/**
 * Clears all debug settings from localStorage
 */
function clearDebugSettings() {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        updateStatus('Debug settings cleared');
    } catch (e) {
        console.warn('Failed to clear debug settings:', e);
    }
}

// Initialize the debug controls when this module is imported
try {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initDebugControls();
    } else {
        document.addEventListener('DOMContentLoaded', initDebugControls);
    }
} catch (e) {
    console.error('Failed to initialize debug controls:', e);
} 