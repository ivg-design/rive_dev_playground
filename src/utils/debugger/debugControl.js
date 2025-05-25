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

/**
 * Creates and injects the debug control panel into the DOM
 */
export function initDebugControls() {
    // Don't initialize by default - wait for explicit enable call
    if (debugControlsEnabled) {
        createDebugControlsUI();
    }
    
    // Expose global helper
    window.debugHelper = {
        enable: enableDebugControls,
        disable: disableDebugControls,
        toggle: toggleDebugControls,
        isEnabled: () => debugControlsEnabled
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
}

/**
 * Disables and hides the debug controls
 */
function disableDebugControls() {
    debugControlsEnabled = false;
    if (debugControlsContainer) {
        debugControlsContainer.style.display = 'none';
    }
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
    });
    
    document.getElementById('debug-disable-all').addEventListener('click', () => {
        LoggerAPI.enable(false);
        updateStatus('Logging disabled globally');
    });
    
    document.getElementById('debug-set-all-level').addEventListener('click', () => {
        const level = parseInt(document.getElementById('debug-all-level').value);
        LoggerAPI.setAllLevels(level);
        updateStatus(`All modules set to ${getLevelName(level)}`);
    });
    
    // Module-specific controls
    MODULES.forEach(module => {
        document.getElementById(`debug-set-${module}`).addEventListener('click', () => {
            const level = parseInt(document.getElementById(`debug-level-${module}`).value);
            LoggerAPI.setModuleLevel(module, level);
            updateStatus(`Module '${module}' set to ${getLevelName(level)}`);
        });
    });
    
    // Set initial selected values based on current configuration
    // This would require accessing the internal state of the logger, which we don't expose
    // For simplicity, we'll just default to INFO for all dropdowns
    document.getElementById('debug-all-level').value = LogLevel.INFO;
    MODULES.forEach(module => {
        document.getElementById(`debug-level-${module}`).value = LogLevel.INFO;
    });
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