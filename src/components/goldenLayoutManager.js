/**
 * @file goldenLayoutManager.js
 * Manages the Golden Layout configuration and component registration
 */

import { createLogger } from '../utils/debugger/debugLogger.js';

// Create a logger for this module
const logger = createLogger('goldenLayout');

let goldenLayout = null;
let jsonEditorInstance = null;
let restoreMenuUpdateTimeout = null;

/**
 * Default Golden Layout configuration for v1.5.9
 */
const defaultLayoutConfig = {
    settings: {
        showPopoutIcon: false,
        showMaximiseIcon: true,
        showCloseIcon: false,
        responsiveMode: 'onload',
        tabOverlapAllowance: 0,
        reorderEnabled: true,
        tabControlOffset: 10
    },
    dimensions: {
        borderWidth: 5,
        minItemHeight: 200,
        minItemWidth: 350, // Minimum width to prevent controls clipping
        headerHeight: 30,
        dragProxyWidth: 300,
        dragProxyHeight: 200
    },
    labels: {
        close: 'close',
        maximise: 'maximise',
        minimise: 'minimise',
        popout: 'open in new window',
        popin: 'pop in',
        tabDropdown: 'additional tabs'
    },
    content: [{
        type: 'column',
        content: [{
            type: 'row',
            height: 30,
            content: [{
                type: 'component',
                componentName: 'controls',
                title: 'Controls',
                width: 50
            }, {
                type: 'component',
                componentName: 'jsonInspector',
                title: 'Rive Parser',
                width: 50
            }]
        }, {
            type: 'row',
            height: 70,
            content: [{
                type: 'component',
                componentName: 'canvas',
                title: 'Rive Canvas',
                width: 60
            }, {
                type: 'component',
                componentName: 'dynamicControls',
                title: 'Dynamic Controls',
                width: 20
            }, {
                type: 'component',
                componentName: 'assetManager',
                title: 'Asset Manager',
                width: 20
            }]
        }]
    }]
};

/**
 * Load layout configuration from localStorage or use default
 */
function getLayoutConfig() {
    try {
        const savedConfig = localStorage.getItem('goldenLayoutConfig');
        if (savedConfig) {
            const parsed = JSON.parse(savedConfig);
            logger.info('Loaded layout configuration from localStorage');
            return parsed;
        }
    } catch (error) {
        logger.warn('Error loading layout from localStorage:', error);
    }
    
    logger.info('Using default layout configuration');
    return defaultLayoutConfig;
}

/**
 * Save layout configuration to localStorage
 */
function saveLayoutConfig(config) {
    try {
        localStorage.setItem('goldenLayoutConfig', JSON.stringify(config));
        logger.debug('Layout configuration saved to localStorage');
    } catch (error) {
        logger.error('Error saving layout to localStorage:', error);
    }
}

/**
 * Component factory functions for Golden Layout v1.5.9
 */
const componentFactories = {
    controls: function(container, componentState) {
        try {
            const template = document.getElementById('controlsTemplate');
            if (!template) {
                logger.error('controlsTemplate not found');
                return;
            }
            
            const content = template.cloneNode(true);
            content.style.display = 'block';
            content.id = 'controls';
            
            // Get the DOM element from jQuery wrapper
            const element = container.getElement();
            if (element && element.length > 0) {
                element[0].appendChild(content);
            } else if (element && element.appendChild) {
                element.appendChild(content);
            }
            
            logger.info('Controls component created');
        } catch (error) {
            logger.error('Error creating controls component:', error);
        }
    },

    canvas: function(container, componentState) {
        try {
            const template = document.getElementById('canvasTemplate');
            if (!template) {
                logger.error('canvasTemplate not found');
                return;
            }
            
            const content = template.cloneNode(true);
            content.style.display = 'block';
            content.id = 'canvasComponent';
            
            // Get the DOM element from jQuery wrapper
            const element = container.getElement();
            if (element && element.length > 0) {
                element[0].appendChild(content);
            } else if (element && element.appendChild) {
                element.appendChild(content);
            }
            
                    // Ensure canvas fills the container and set initial background
        const canvas = content.querySelector('#rive-canvas');
        if (canvas) {
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            // Set initial background color
            canvas.style.backgroundColor = '#252525';
        }
            
            logger.info('Canvas component created');
        } catch (error) {
            logger.error('Error creating canvas component:', error);
        }
    },

    dynamicControls: function(container, componentState) {
        try {
            const template = document.getElementById('dynamicControlsTemplate');
            if (!template) {
                logger.error('dynamicControlsTemplate not found');
                return;
            }
            
            const content = template.cloneNode(true);
            content.style.display = 'block';
            content.id = 'dynamicControlsComponent';
            
            // Get the DOM element from jQuery wrapper
            const element = container.getElement();
            if (element && element.length > 0) {
                element[0].appendChild(content);
            } else if (element && element.appendChild) {
                element.appendChild(content);
            }
            
            logger.info('Dynamic Controls component created');
        } catch (error) {
            logger.error('Error creating dynamicControls component:', error);
        }
    },

    jsonInspector: function(container, componentState) {
        try {
            const template = document.getElementById('jsonInspectorTemplate');
            if (!template) {
                logger.error('jsonInspectorTemplate not found');
                return;
            }
            
            const content = template.cloneNode(true);
            content.style.display = 'block';
            content.id = 'jsonInspectorComponent';
            
            // Get the DOM element from jQuery wrapper
            const element = container.getElement();
            if (element && element.length > 0) {
                element[0].appendChild(content);
            } else if (element && element.appendChild) {
                element.appendChild(content);
            }
            
            // Initialize JSONEditor when component is created
            setTimeout(() => {
                const outputElement = content.querySelector('#output');
                if (outputElement) {
                    initializeJSONEditor(outputElement);
                }
            }, 100);
            
            logger.info('JSON Inspector component created');
        } catch (error) {
            logger.error('Error creating jsonInspector component:', error);
        }
    },

    assetManager: function(container, componentState) {
        try {
            const template = document.getElementById('assetManagerTemplate');
            if (!template) {
                logger.error('assetManagerTemplate not found');
                return;
            }
            
            const content = template.cloneNode(true);
            content.style.display = 'block';
            content.id = 'assetManagerComponent';
            
            // Get the DOM element from jQuery wrapper
            const element = container.getElement();
            if (element && element.length > 0) {
                element[0].appendChild(content);
                // Allow Golden Layout's lm_content to scroll if our component overflows
                element[0].style.overflow = 'auto'; 
            } else if (element && element.appendChild) {
                element.appendChild(content);
                // Allow Golden Layout's lm_content to scroll
                element.style.overflow = 'auto';
            }
            
            logger.info('Asset Manager component created and configured for scrolling');
        } catch (error) {
            logger.error('Error creating assetManager component:', error);
        }
    }
};

/**
 * Initialize Golden Layout v1.5.9
 */
export function initializeGoldenLayout() {
    const container = document.getElementById('goldenLayoutContainer');
    if (!container) {
        logger.error('Golden Layout container not found');
        return null;
    }

    // Check if required dependencies are loaded
    if (typeof window.GoldenLayout === 'undefined') {
        logger.error('GoldenLayout not found on window object');
        return null;
    }

    if (typeof $ === 'undefined') {
        logger.error('jQuery not found');
        return null;
    }

    try {
        const layoutConfig = getLayoutConfig();
        logger.info('Initializing Golden Layout with config:', layoutConfig);

        // Create Golden Layout instance (v1.5.9 API)
        goldenLayout = new window.GoldenLayout(layoutConfig, $(container));

        // Register component factories (v1.5.9 API)
        goldenLayout.registerComponent('controls', componentFactories.controls);
        goldenLayout.registerComponent('canvas', componentFactories.canvas);
        goldenLayout.registerComponent('dynamicControls', componentFactories.dynamicControls);
        goldenLayout.registerComponent('jsonInspector', componentFactories.jsonInspector);
        goldenLayout.registerComponent('assetManager', componentFactories.assetManager);
        
        logger.info('All components registered successfully');

        // Handle resize events and save layout changes
        goldenLayout.on('stateChanged', () => {
            // Save layout configuration to localStorage
            if (goldenLayout.isInitialised) {
                saveLayoutConfig(goldenLayout.toConfig());
            }
            
            // Trigger canvas resize when layout changes
            setTimeout(() => {
                // Trigger the aspect ratio aware resize
                if (window.resizeCanvasToAnimationAspectRatio) {
                    window.resizeCanvasToAnimationAspectRatio();
                } else {
                    // Fallback
                    const canvas = document.getElementById('rive-canvas');
                    if (canvas && window.riveInstanceGlobal) {
                        try {
                            window.riveInstanceGlobal.resizeDrawingSurfaceToCanvas();
                        } catch (error) {
                            logger.debug('Canvas resize triggered by layout change');
                        }
                    }
                }
            }, 100);
        });

        goldenLayout.on('initialised', () => {
            logger.info('Golden Layout initialized successfully');
            addRestoreMenu();
            
            // Set up window resize handler for Golden Layout
            let resizeTimeout;
            const handleResize = () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    if (goldenLayout && goldenLayout.updateSize) {
                        goldenLayout.updateSize();
                        logger.debug('Golden Layout size updated on window resize');
                    }
                }, 100);
            };
            
            window.addEventListener('resize', handleResize);
            
            // Store the resize handler for cleanup
            goldenLayout._resizeHandler = handleResize;
            
            // Set up constraints for controls panel
            setupControlsConstraints();
            
            // Set up periodic restore menu sync to catch any missed events
            const syncInterval = setInterval(() => {
                if (goldenLayout && goldenLayout.isInitialised) {
                    debouncedAddRestoreMenu();
                } else {
                    clearInterval(syncInterval);
                }
            }, 2000); // Check every 2 seconds
            
            // Store the interval for cleanup
            goldenLayout._syncInterval = syncInterval;
        });

        // Handle item destruction and creation to update restore menu
        goldenLayout.on('itemDestroyed', (item) => {
            logger.debug('Item destroyed:', item.config);
            debouncedAddRestoreMenu();
        });

        // Handle component creation to update restore menu
        goldenLayout.on('componentCreated', (component) => {
            logger.info('Component created:', component.config.componentName);
            debouncedAddRestoreMenu();
        });

        // Handle tab creation (when panels are restored)
        goldenLayout.on('tabCreated', (tab) => {
            logger.debug('Tab created:', tab.contentItem.config);
            debouncedAddRestoreMenu();
        });

        // Handle stack creation (when new panel containers are created)
        goldenLayout.on('stackCreated', (stack) => {
            logger.debug('Stack created');
            debouncedAddRestoreMenu();
        });

        // Handle item added events (broader than just components)
        goldenLayout.on('itemCreated', (item) => {
            if (item.config && item.config.componentName) {
                logger.debug('Item created with component:', item.config.componentName);
                debouncedAddRestoreMenu();
            }
        });

        // Initialize the layout
        goldenLayout.init();

        logger.info('Golden Layout v1.5.9 initialization complete');
        return goldenLayout;

    } catch (error) {
        logger.error('Error initializing Golden Layout:', error);
        console.error('Golden Layout error details:', error);
        return null;
    }
}

/**
 * Initialize JSONEditor in the specified container
 */
function initializeJSONEditor(container) {
    if (!container || jsonEditorInstance) {
        return;
    }

    // Ensure container has proper dimensions
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.minHeight = '300px';

    const options = {
        mode: 'tree',
        modes: ['tree', 'view', 'code', 'text', 'preview'],
        search: true,
        enableTransform: false,
        onNodeName: function({path, type, size, value}) {
            if (type === 'object') {
                if (value && typeof value === 'object' && size > 0) {
                    const keys = Object.keys(value);
                    if (keys.length > 0) {
                        const firstKey = keys[0];
                        const firstValue = value[firstKey];
                        if (typeof firstValue === 'string') {
                            const maxLength = 30; 
                            let previewString = firstValue.length > maxLength ? firstValue.substring(0, maxLength) + "..." : firstValue;
                            return `\"${previewString}\"`; 
                        }
                    }
                }
                return undefined; 
            }
            if (type === 'array') {
                return `Array [${size}]`;
            }
            return undefined; 
        },
        onError: function (err) {
            logger.error("JSONEditor Error:", err.toString());
        }
    };

    try {
        jsonEditorInstance = new JSONEditor(container, options, { message: "Please select a Rive file to parse." });
        
        // Force resize after initialization
        setTimeout(() => {
            if (jsonEditorInstance && typeof jsonEditorInstance.resize === 'function') {
                jsonEditorInstance.resize();
            }
        }, 100);
        
        logger.info('JSONEditor initialized in Golden Layout');
    } catch (error) {
        logger.error('Error initializing JSONEditor:', error);
    }
}

/**
 * Update JSONEditor content
 */
export function updateJSONEditor(data) {
    if (jsonEditorInstance) {
        try {
            jsonEditorInstance.set(data || {});
        } catch (error) {
            logger.error('Error updating JSONEditor:', error);
        }
    }
}

/**
 * Get the current Golden Layout instance
 */
export function getGoldenLayout() {
    return goldenLayout;
}

/**
 * Get the JSONEditor instance
 */
export function getJSONEditor() {
    return jsonEditorInstance;
}

/**
 * Debounced version of addRestoreMenu to prevent excessive updates
 */
function debouncedAddRestoreMenu() {
    if (restoreMenuUpdateTimeout) {
        clearTimeout(restoreMenuUpdateTimeout);
    }
    restoreMenuUpdateTimeout = setTimeout(addRestoreMenu, 150);
}

/**
 * Add restore bar for closed panels
 */
function addRestoreMenu() {
    // Remove existing restore bar
    const existingBar = document.getElementById('restoreBar');
    if (existingBar) {
        existingBar.remove();
    }

    if (!goldenLayout || !goldenLayout.isInitialised) {
        logger.debug('Golden Layout not ready for restore menu');
        return;
    }

    const allComponents = ['controls', 'canvas', 'dynamicControls', 'jsonInspector', 'assetManager'];
    const missingComponents = [];
    const foundComponents = [];

    // Check which components are missing
    allComponents.forEach(componentName => {
        const found = findComponentInLayout(goldenLayout.root, componentName);
        if (!found) {
            missingComponents.push(componentName);
            logger.debug(`Component ${componentName} is missing from layout`);
        } else {
            foundComponents.push(componentName);
            logger.trace(`Component ${componentName} found in layout`);
        }
    });

    logger.debug(`Restore menu update: Found ${foundComponents.length} components, Missing ${missingComponents.length} components`, {
        found: foundComponents,
        missing: missingComponents
    });

    // Always show the bar, but collapse it if no missing components
    const bar = document.createElement('div');
    bar.id = 'restoreBar';
    bar.className = `restore-bar ${missingComponents.length === 0 ? 'collapsed' : ''}`;
    
    if (missingComponents.length === 0) {
        bar.innerHTML = `
            <div class="restore-bar-collapsed">
                <span>All panels open</span>
                <button class="layout-reset-btn" id="layoutResetBtn">Reset Layout</button>
            </div>
        `;
    } else {
        bar.innerHTML = `
            <div class="restore-bar-content">
                <span class="restore-label">Restore:</span>
                ${missingComponents.map(comp => `
                    <button class="restore-btn" data-component="${comp}">
                        ${getComponentDisplayName(comp)}
                    </button>
                `).join('')}
            </div>
        `;

        // Add event listeners
        bar.querySelectorAll('.restore-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const componentName = e.target.dataset.component;
                restoreComponent(componentName);
            });
        });
    }

    // Add event listener for layout reset button
    const resetBtn = bar.querySelector('#layoutResetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetLayoutToDefault();
        });
    }

    // Insert at the top of the golden layout container
    const container = document.getElementById('goldenLayoutContainer');
    if (container) {
        container.insertBefore(bar, container.firstChild);
    }
}

/**
 * Find component in layout recursively
 */
function findComponentInLayout(item, componentName) {
    // Check if this item is the component we're looking for
    if (item.config && item.config.componentName === componentName) {
        logger.trace(`Found component ${componentName} in layout`);
        return true;
    }
    
    // Check if this item has the component type directly
    if (item.config && item.config.type === 'component' && item.config.componentName === componentName) {
        logger.trace(`Found component ${componentName} as direct component type`);
        return true;
    }
    
    // Recursively search in content items
    if (item.contentItems && Array.isArray(item.contentItems)) {
        for (let child of item.contentItems) {
            if (findComponentInLayout(child, componentName)) {
                return true;
            }
        }
    }
    
    // Also check if the item has a componentName property directly (for some Golden Layout versions)
    if (item.componentName === componentName) {
        logger.trace(`Found component ${componentName} via direct componentName property`);
        return true;
    }
    
    return false;
}

/**
 * Get display name for component
 */
function getComponentDisplayName(componentName) {
    const names = {
        'controls': 'Controls',
        'canvas': 'Canvas',
        'dynamicControls': 'Dynamic Controls',
        'jsonInspector': 'Rive Parser',
        'assetManager': 'Asset Manager'
    };
    return names[componentName] || componentName;
}

/**
 * Restore a missing component
 */
function restoreComponent(componentName) {
    if (!goldenLayout || !goldenLayout.isInitialised) {
        logger.error('Cannot restore component: Golden Layout not ready');
        return;
    }

    // Check if component already exists
    if (findComponentInLayout(goldenLayout.root, componentName)) {
        logger.warn(`Component ${componentName} already exists in layout`);
        debouncedAddRestoreMenu(); // Update menu to reflect current state
        return;
    }

    const newItemConfig = {
        type: 'component',
        componentName: componentName,
        title: getComponentDisplayName(componentName)
    };

    logger.info(`Attempting to restore component: ${componentName}`);

    try {
        // Find the best place to add the component
        let targetContainer = null;
        
        // Try to find a suitable container (stack, row, or column)
        const findSuitableContainer = (item) => {
            if (item.type === 'stack' && item.addChild) {
                return item;
            }
            if ((item.type === 'row' || item.type === 'column') && item.addChild) {
                return item;
            }
            if (item.contentItems) {
                for (let child of item.contentItems) {
                    const found = findSuitableContainer(child);
                    if (found) return found;
                }
            }
            return null;
        };

        targetContainer = findSuitableContainer(goldenLayout.root);
        
        if (targetContainer) {
            logger.debug(`Adding component ${componentName} to container type: ${targetContainer.type}`);
            targetContainer.addChild(newItemConfig);
            logger.info(`Successfully restored component: ${componentName}`);
        } else {
            // Fallback: try to add to root if it supports it
            if (goldenLayout.root.addChild) {
                goldenLayout.root.addChild(newItemConfig);
                logger.info(`Restored component ${componentName} to root`);
            } else {
                throw new Error('No suitable container found for component restoration');
            }
        }
        
        // Update menu after a delay to ensure the component is fully created
        setTimeout(debouncedAddRestoreMenu, 200);
        
    } catch (error) {
        logger.error(`Error restoring component ${componentName}:`, error);
        // Still update the menu in case of partial success
        debouncedAddRestoreMenu();
    }
}

/**
 * Set up constraints for the controls panel to prevent clipping
 */
function setupControlsConstraints() {
    if (!goldenLayout) return;
    
    try {
        // Find the controls component
        const findControlsComponent = (item) => {
            if (item.config && item.config.componentName === 'controls') {
                return item;
            }
            if (item.contentItems) {
                for (let child of item.contentItems) {
                    const found = findControlsComponent(child);
                    if (found) return found;
                }
            }
            return null;
        };
        
        const controlsComponent = findControlsComponent(goldenLayout.root);
        if (controlsComponent && controlsComponent.element) {
            // Set minimum width constraint
            const element = controlsComponent.element[0] || controlsComponent.element;
            if (element) {
                element.style.minWidth = '300px';
                element.style.maxWidth = '40vw';
                logger.debug('Controls constraints applied');
            }
        }
        
        // Add resize listener to maintain constraints
        goldenLayout.on('stateChanged', () => {
            const controlsComponent = findControlsComponent(goldenLayout.root);
            if (controlsComponent && controlsComponent.element) {
                const element = controlsComponent.element[0] || controlsComponent.element;
                if (element) {
                    const currentWidth = element.offsetWidth;
                    const maxWidth = window.innerWidth * 0.4; // 40% of viewport
                    
                    if (currentWidth < 300) {
                        element.style.width = '300px';
                    } else if (currentWidth > maxWidth) {
                        element.style.width = '40vw';
                    }
                }
            }
        });
        
    } catch (error) {
        logger.error('Error setting up controls constraints:', error);
    }
}

/**
 * Reset layout to default configuration
 */
export function resetLayoutToDefault() {
    try {
        localStorage.removeItem('goldenLayoutConfig');
        logger.info('Layout configuration reset to default');
        
        // Reload the page to apply default layout
        window.location.reload();
    } catch (error) {
        logger.error('Error resetting layout:', error);
    }
}

/**
 * Manually refresh the restore menu (useful for debugging or if events are missed)
 */
export function refreshRestoreMenu() {
    logger.debug('Manually refreshing restore menu');
    debouncedAddRestoreMenu();
}

/**
 * Destroy Golden Layout
 */
export function destroyGoldenLayout() {
    // Remove restore bar
    const existingBar = document.getElementById('restoreBar');
    if (existingBar) {
        existingBar.remove();
    }

    if (goldenLayout) {
        try {
            // Remove resize handler
            if (goldenLayout._resizeHandler) {
                window.removeEventListener('resize', goldenLayout._resizeHandler);
            }
            
            // Clear sync interval
            if (goldenLayout._syncInterval) {
                clearInterval(goldenLayout._syncInterval);
            }
            
            // Clear any pending restore menu updates
            if (restoreMenuUpdateTimeout) {
                clearTimeout(restoreMenuUpdateTimeout);
                restoreMenuUpdateTimeout = null;
            }
            
            goldenLayout.destroy();
            goldenLayout = null;
            jsonEditorInstance = null;
            logger.info('Golden Layout destroyed');
        } catch (error) {
            logger.error('Error destroying Golden Layout:', error);
        }
    }
} 